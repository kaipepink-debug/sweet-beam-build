import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NAUT_BASE = "https://navenaut.com/api/public/v1";

function todayBR(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
function toBRDate(input: string | number | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}
function inferPlanFromDuration(c: any, e: any) {
  if (!c || !e) return null;
  const days = Math.round((new Date(e).getTime() - new Date(c).getTime()) / 86400000);
  if (days >= 160 && days <= 200) return { plan: "Semestral", price: 497 };
  if (days >= 25 && days <= 35) return { plan: "Mensal", price: 67 };
  if (days >= 5 && days <= 10) return { plan: "Semanal", price: 39.99 };
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("naut webhook", JSON.stringify(body));

    const paymentId =
      body?.data?.paymentId || body?.paymentId || body?.data?.id || body?.id;
    const statusRaw = body?.data?.status || body?.status || body?.event;
    const status = String(statusRaw || "").toLowerCase();

    const isPaid = ["paid", "approved", "completed", "succeeded", "payment.paid", "payment.approved", "subscription.created", "subscription.renewed"].some(s => status.includes(s));
    if (!isPaid) {
      return new Response(JSON.stringify({ ok: true, status }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Compra de limite (afiliado) — paymentId existe em limite_compras
    if (paymentId) {
      const { data: compra } = await admin
        .from("limite_compras")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (compra) {
        if (compra.processed) {
          return new Response(JSON.stringify({ ok: true, alreadyProcessed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const { data: perms } = await admin
          .from("team_permissions")
          .select("max_assinaturas")
          .eq("user_id", compra.user_id)
          .maybeSingle();

        const novo = (perms?.max_assinaturas ?? 0) + compra.qty;
        await admin.from("team_permissions").update({ max_assinaturas: novo }).eq("user_id", compra.user_id);
        await admin.from("limite_compras").update({
          status: "paid",
          paid_at: new Date().toISOString(),
          processed: true,
        }).eq("id", compra.id);

        await admin.from("afiliado_limite_historico").insert({
          afiliado_id: compra.user_id,
          quantidade: compra.qty,
          valor_unitario: compra.valor_unitario,
          valor_total: compra.valor_total,
          created_by: compra.user_id,
        });
        return new Response(JSON.stringify({ ok: true, type: "limite", processed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // 2. Assinatura RatarIA — extrair email + dados e sincronizar tabela assinantes
    const root = body?.data || body || {};
    const customer = root.customer || root.customerData || root.user || {};
    const email = (root.email || customer.email || customer.customerEmail || "").toString().trim().toLowerCase();
    if (!email) {
      console.log("webhook ignored: no email");
      return new Response(JSON.stringify({ ok: true, ignored: "no-email" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const nome = (customer.name || customer.fullName || root.name || email).toString();
    const phone = (customer.phone || customer.whatsapp || customer.phoneNumber || root.phone || null);
    const paymentMethod = (root.paymentMethod || root.method || body?.paymentMethod || "Cartão").toString();

    // tentar enriquecer com a API Naut: buscar assinaturas do email
    let plano = "Mensal";
    let valor = 67;
    let createdAt: string | null = null;
    let expiresAt: string | null = null;

    try {
      const PK = Deno.env.get("NAUT_PUBLIC_KEY");
      const SK = Deno.env.get("NAUT_SECRET_KEY");
      if (PK && SK) {
        const r = await fetch(`${NAUT_BASE}/subscriptions/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Public-Key": PK, "X-Secret-Key": SK },
          body: JSON.stringify({ email }),
        });
        const d = await r.json();
        const sub = d?.data?.subscriptions?.[0];
        if (sub) {
          createdAt = sub.createdAt || null;
          expiresAt = sub.expiresAt || null;
          const inferred = inferPlanFromDuration(createdAt, expiresAt);
          if (inferred) { plano = inferred.plan; valor = inferred.price; }
          else if (sub.planName) plano = sub.planName;
        }
      }
    } catch (e) {
      console.error("naut enrich error", e);
    }

    if (!expiresAt) expiresAt = new Date(Date.now() + 31 * 86400000).toISOString();
    if (!createdAt) createdAt = new Date().toISOString();

    const dataCriacao = toBRDate(createdAt);
    const dataRenovacao = toBRDate(expiresAt);

    const { data: existing } = await admin
      .from("assinantes")
      .select("id, data_renovacao")
      .eq("email", email)
      .order("data_criacao", { ascending: false })
      .limit(1);

    if (!existing || existing.length === 0) {
      await admin.from("assinantes").insert({
        email,
        nome,
        whatsapp: phone,
        produto: "RatarIA",
        plano,
        status: "Ativa",
        valor,
        meio_pagamento: paymentMethod,
        data_criacao: dataCriacao,
        data_renovacao: dataRenovacao,
        proxima_cobranca: dataRenovacao,
        created_by: "00000000-0000-0000-0000-000000000000",
      });
      console.log("assinante criado via webhook", email);
    } else {
      const prevExp = existing[0].data_renovacao ? new Date(String(existing[0].data_renovacao)).getTime() : 0;
      const newExp = new Date(expiresAt).getTime();
      const isRenewal = newExp - prevExp > 3 * 86400000;
      if (isRenewal) {
        await admin.from("assinantes").insert({
          email, nome, whatsapp: phone, produto: "RatarIA",
          plano: `${plano} (renovação)`, status: "Ativa", valor,
          meio_pagamento: paymentMethod,
          data_criacao: dataCriacao, data_renovacao: dataRenovacao, proxima_cobranca: dataRenovacao,
          created_by: "00000000-0000-0000-0000-000000000000",
        });
      } else {
        await admin.from("assinantes").update({
          status: "Ativa", nome,
          ...(phone ? { whatsapp: phone } : {}),
          data_renovacao: dataRenovacao, proxima_cobranca: dataRenovacao,
          meio_pagamento: paymentMethod,
        }).eq("id", existing[0].id);
      }
      console.log("assinante atualizado via webhook", email);
    }

    return new Response(JSON.stringify({ ok: true, type: "assinatura", email }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
