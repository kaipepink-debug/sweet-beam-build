import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retorna data atual em Brasília no formato YYYY-MM-DD
function todayBR(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

// Converte um ISO/Date string para data YYYY-MM-DD em Brasília
function toBRDate(input: string | number | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function determineStatus(sub: any): string {
  // Check expiration date first
  if (sub.expiresAt) {
    const expires = new Date(sub.expiresAt);
    const now = new Date();
    if (expires < now) return "Cancelada";
  }
  // Then check isActive flag from Naut
  if (sub.isActive) return "Ativa";
  if (sub.status === "canceled" || sub.status === "expired") return "Cancelada";
  if (sub.status === "pending") return "Pendente";
  return "Cancelada";
}

// Infer price from plan name when Naut doesn't return it
function inferPriceFromPlan(planName: string | null | undefined): number {
  if (!planName) return 0;
  const p = planName.toLowerCase();
  if (p.includes("semestral")) return 497;
  if (p.includes("mensal") || p === "naut") return 67;
  if (p.includes("semanal")) return 39.99;
  return 0;
}

// Infer plan + price from duration (in days) between created and expires.
// Used when Naut returns a generic planName like "Principal" or the product name.
function inferPlanFromDuration(createdAt: string | Date | null | undefined, expiresAt: string | Date | null | undefined): { plan: string; price: number } | null {
  if (!createdAt || !expiresAt) return null;
  const c = new Date(createdAt).getTime();
  const e = new Date(expiresAt).getTime();
  if (!c || !e || e <= c) return null;
  const days = Math.round((e - c) / (1000 * 60 * 60 * 24));
  if (days >= 160 && days <= 200) return { plan: "Semestral", price: 497 };
  if (days >= 25 && days <= 35) return { plan: "Mensal", price: 67 };
  if (days >= 5 && days <= 10) return { plan: "Semanal", price: 39.99 };
  return null;
}

// Decide if a Naut planName is generic/non-informative and should be replaced
function isGenericPlan(planName: string | null | undefined, productName: string | null | undefined): boolean {
  if (!planName) return true;
  const p = planName.toLowerCase().trim();
  if (p === "principal" || p === "naut" || p === "default" || p === "padrão" || p === "padrao") return true;
  if (productName && p === productName.toLowerCase().trim()) return true;
  // If it doesn't match any known cycle keyword, treat as generic
  if (!p.includes("mensal") && !p.includes("semanal") && !p.includes("semestral") && !p.includes("anual") && !p.includes("trimestr")) return true;
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NAUT_PUBLIC_KEY = Deno.env.get('NAUT_PUBLIC_KEY');
    const NAUT_SECRET_KEY = Deno.env.get('NAUT_SECRET_KEY');

    if (!NAUT_PUBLIC_KEY || !NAUT_SECRET_KEY) {
      throw new Error('Naut API keys not configured');
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try Naut API with retry to handle race condition (recent purchase
    // not yet propagated). We retry up to 3 times with a 2s delay if Naut
    // returns "active: false" with no subscriptions but recognizes the email.
    const callNaut = async () => {
      const r = await fetch('https://navenaut.com/api/public/v1/subscriptions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Public-Key': NAUT_PUBLIC_KEY,
          'X-Secret-Key': NAUT_SECRET_KEY,
        },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      return { r, d };
    };

    let response: Response;
    let data: any;
    {
      const first = await callNaut();
      response = first.r;
      data = first.d;

      // Retry only when Naut returned a known customer (has name) but
      // no active subscriptions yet — likely a just-finished purchase.
      const looksLikeRace = response.ok
        && data?.success
        && data?.data?.active === false
        && (!data?.data?.subscriptions || data.data.subscriptions.length === 0)
        && !!data?.data?.name;

      if (looksLikeRace) {
        for (let i = 0; i < 2; i++) {
          await new Promise((res) => setTimeout(res, 2000));
          const next = await callNaut();
          if (
            next.d?.success
            && (next.d?.data?.active === true
              || (next.d?.data?.subscriptions && next.d.data.subscriptions.length > 0))
          ) {
            response = next.r;
            data = next.d;
            break;
          }
          response = next.r;
          data = next.d;
        }
      }
    }

    // If Naut says the customer is active but returns no subscription detail,
    // grant access using a synthesized subscription (handles cases where Naut
    // confirmed the purchase but hasn't populated the subscriptions array yet).
    if (response.ok && data?.success && data?.data?.active === true && (!data?.data?.subscriptions || data.data.subscriptions.length === 0)) {
      const nautEmail = data.data.email || email.trim();
      const nautName = data.data.name || nautEmail;

      // Default expiration: 31 days from now (covers monthly plans by default)
      const expiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

      // Best-effort sync to local table so the subscriber appears in the dashboard
      try {
        const { data: existing } = await supabaseAdmin
          .from("assinantes")
          .select("id")
          .eq("email", nautEmail)
          .eq("produto", "RatarIA")
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabaseAdmin.from("assinantes").insert({
            email: nautEmail,
            nome: nautName,
            produto: "RatarIA",
            plano: "Mensal",
            status: "Ativa",
            valor: 67,
            meio_pagamento: "Naut",
            data_criacao: todayBR(),
            data_renovacao: toBRDate(expiresAt),
            proxima_cobranca: toBRDate(expiresAt),
            created_by: "00000000-0000-0000-0000-000000000000",
          });
        } else {
          await supabaseAdmin
            .from("assinantes")
            .update({ status: "Ativa", nome: nautName })
            .eq("id", existing[0].id);
        }
      } catch (syncErr) {
        console.error("Error syncing active-without-subs subscriber:", syncErr);
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            email: nautEmail,
            name: nautName,
            subscriptions: [{
              productName: "RatarIA",
              planName: "Naut",
              isActive: true,
              expiresAt,
              status: "active",
            }],
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If Naut returns subscriptions, sync ALL to local table
    if (response.ok && data?.success && data?.data?.subscriptions?.length) {
      const nautEmail = data.data.email || email.trim();
      const nautName = data.data.name || email.trim();

      for (const sub of data.data.subscriptions) {
        try {
          const status = determineStatus(sub);
          const expiresAt = sub.expiresAt ? toBRDate(sub.expiresAt) : null;
          const createdAt = sub.createdAt ? toBRDate(sub.createdAt) : todayBR();
          const productName = sub.productName || "RatarIA";
          const rawPlan = sub.planName || "Mensal";
          const rawPrice = Number(sub.price ?? sub.amount ?? 0);

          // Always prefer duration-based inference (Naut frequently returns
          // an incorrect planName like "Mensal" for what is actually a
          // Semanal/Semestral cycle). Fall back to the raw plan only when
          // we can't infer from duration.
          let planName = rawPlan;
          let price = rawPrice > 0 ? rawPrice : 0;
          const inferred = inferPlanFromDuration(sub.createdAt, sub.expiresAt);
          if (inferred) {
            planName = inferred.plan;
            // Override price too — the price returned by Naut is often the
            // generic product price (R$ 67) regardless of the real cycle.
            price = inferred.price;
          } else if (isGenericPlan(rawPlan, productName)) {
            // No duration info and plan is generic → keep rawPlan as-is
          }
          if (price <= 0) price = inferPriceFromPlan(planName);

          const paymentMethod = sub.paymentMethod || "Naut";

          // Look up ALL records of this email+product to detect renewals.
          // We treat each record as one billing cycle. A new cycle is detected
          // when Naut's createdAt is strictly newer than every existing
          // data_criacao for this email+product (different purchase event).
          const { data: existingRows } = await supabaseAdmin
            .from("assinantes")
            .select("id, valor, data_criacao, data_renovacao, plano")
            .eq("email", nautEmail)
            .eq("produto", productName)
            .order("data_criacao", { ascending: false });

          const cycleCount = existingRows?.length ?? 0;
          const latest = existingRows?.[0];

          // Detect a NEW billing cycle by checking if the expiration date
          // advanced significantly compared to the latest stored record.
          // We do NOT trust Naut's `createdAt` because it can change on
          // re-access/login events (returning customers were getting
          // duplicated rows with today's data_criacao).
          // A new cycle requires expiresAt to extend by at least 3 days
          // beyond the latest data_renovacao.
          let isNewerCycle = false;
          if (latest && expiresAt && latest.data_renovacao) {
            const prevExp = new Date(String(latest.data_renovacao)).getTime();
            const newExp = new Date(expiresAt).getTime();
            if (prevExp && newExp && (newExp - prevExp) > 3 * 24 * 60 * 60 * 1000) {
              isNewerCycle = true;
            }
          }

          // Strip any previous "(Nª renovação)" suffix from the plan label
          const stripRenewalTag = (p: string) => p.replace(/\s*\(\d+ª\s*renovação\)\s*$/i, "").trim();
          const cleanPlan = stripRenewalTag(planName);

          if (cycleCount === 0) {
            // First time seeing this subscriber — insert as the first cycle
            await supabaseAdmin.from("assinantes").insert({
              email: nautEmail,
              nome: nautName,
              produto: productName,
              plano: cleanPlan,
              status,
              valor: price,
              meio_pagamento: paymentMethod,
              data_criacao: createdAt,
              data_renovacao: expiresAt,
              proxima_cobranca: expiresAt,
              created_by: "00000000-0000-0000-0000-000000000000",
            });
          } else if (isNewerCycle) {
            // New billing event detected → insert a renewal row with a tag.
            // cycleCount already counts previous cycles, so the new one is N+1.
            const renewalNumber = cycleCount + 1; // 2 = 2ª renovação, 3 = 3ª, ...
            const planWithTag = `${cleanPlan} (${renewalNumber}ª renovação)`;
            await supabaseAdmin.from("assinantes").insert({
              email: nautEmail,
              nome: nautName,
              produto: productName,
              plano: planWithTag,
              status,
              valor: price,
              meio_pagamento: paymentMethod,
              data_criacao: createdAt,
              data_renovacao: expiresAt,
              proxima_cobranca: expiresAt,
              created_by: "00000000-0000-0000-0000-000000000000",
            });
          } else {
            // Same cycle as the latest record → just keep it up to date
            const finalPrice = price > 0 ? price : Number(latest!.valor || 0) || inferPriceFromPlan(cleanPlan);
            // Preserve existing renewal tag if any, otherwise use clean plan
            const existingPlan = String(latest!.plano || "");
            const keepTag = /\(\d+ª\s*renovação\)/i.test(existingPlan);
            await supabaseAdmin
              .from("assinantes")
              .update({
                status,
                nome: nautName,
                plano: keepTag ? existingPlan : cleanPlan,
                valor: finalPrice,
                data_renovacao: expiresAt,
                proxima_cobranca: expiresAt,
                meio_pagamento: paymentMethod,
              })
              .eq("id", latest!.id);
          }
        } catch (syncErr) {
          console.error("Error syncing subscription:", syncErr);
        }
      }

      // Return Naut response
      const hasActive = data.data.subscriptions.some((s: any) => {
        if (s.expiresAt) {
          return new Date(s.expiresAt) >= new Date() && s.isActive;
        }
        return s.isActive;
      });

      if (hasActive) {
        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fallback: check local assinantes table
    const { data: localSubs } = await supabaseAdmin
      .from("assinantes")
      .select("*")
      .ilike("email", email.trim())
      .eq("status", "Ativa");

    // Helper: compute precise expiresAt for a local subscriber row
    const computeLocalExpiresAt = (sub: any): string | null => {
      // Temporary 30-minute logins use created_at + 30 minutes
      if (sub.meio_pagamento === "Temporário" && sub.created_at) {
        return new Date(new Date(sub.created_at).getTime() + 30 * 60 * 1000).toISOString();
      }
      if (sub.data_renovacao) return new Date(sub.data_renovacao).toISOString();
      if (sub.proxima_cobranca) return new Date(sub.proxima_cobranca).toISOString();
      return null;
    };

    if (localSubs && localSubs.length > 0) {
      const now = new Date();
      const activeSub = localSubs.find(sub => {
        const exp = computeLocalExpiresAt(sub);
        if (exp) return new Date(exp) >= now;
        return true;
      });

      if (activeSub) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              email: activeSub.email,
              name: activeSub.nome,
              subscriptions: [{
                productName: activeSub.produto,
                planName: activeSub.plano,
                isActive: true,
                expiresAt: computeLocalExpiresAt(activeSub),
                status: "active",
              }],
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Expired local - update status
      for (const sub of localSubs) {
        const exp = computeLocalExpiresAt(sub);
        if (exp && new Date(exp) < now) {
          await supabaseAdmin.from("assinantes").update({ status: "Cancelada" }).eq("id", sub.id);
        }
      }
    }

    // Check for any expired local subs to show
    const { data: allLocalSubs } = await supabaseAdmin
      .from("assinantes")
      .select("*")
      .ilike("email", email.trim())
      .order("created_at", { ascending: false })
      .limit(1);

    if (allLocalSubs && allLocalSubs.length > 0) {
      const lastSub = allLocalSubs[0];
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            email: lastSub.email,
            name: lastSub.nome,
            subscriptions: [{
              productName: lastSub.produto,
              planName: lastSub.plano,
              isActive: false,
              expiresAt: lastSub.data_renovacao || lastSub.proxima_cobranca,
              status: "expired",
            }],
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If Naut returned data (even expired), return that
    if (response.ok && data?.success) {
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No subscription found
    return new Response(
      JSON.stringify({ success: true, data: { email, name: null, subscriptions: [] } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-subscription:', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
