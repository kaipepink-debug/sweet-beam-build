import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NAUT_BASE = "https://navenaut.com/api/public/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = userData.user.id;

    const { paymentId } = await req.json();
    if (!paymentId) {
      return new Response(JSON.stringify({ error: "paymentId obrigatório" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: compra } = await admin
      .from("limite_compras")
      .select("*")
      .eq("payment_id", paymentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!compra) {
      return new Response(JSON.stringify({ error: "Compra não encontrada" }), { status: 404, headers: corsHeaders });
    }

    if (compra.processed) {
      return new Response(JSON.stringify({ status: "paid", processed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const PK = Deno.env.get("NAUT_PUBLIC_KEY_PIX");
    const SK = Deno.env.get("NAUT_SECRET_KEY_PIX");

    const nautRes = await fetch(`${NAUT_BASE}/payments/${paymentId}`, {
      headers: { "X-Public-Key": PK!, "X-Secret-Key": SK! },
    });
    const nautData = await nautRes.json();
    const status = nautData?.data?.status || compra.status;
    const isPaid = ["paid", "approved", "completed", "succeeded"].includes(String(status).toLowerCase());

    if (!isPaid) {
      await admin.from("limite_compras").update({ status }).eq("id", compra.id);
      return new Response(JSON.stringify({ status }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // pagamento aprovado: incrementar limite
    const { data: perms } = await admin
      .from("team_permissions")
      .select("max_assinaturas")
      .eq("user_id", userId)
      .maybeSingle();

    const current = perms?.max_assinaturas ?? 0;
    const novo = current + compra.qty;

    await admin.from("team_permissions").update({ max_assinaturas: novo }).eq("user_id", userId);
    await admin.from("limite_compras").update({
      status: "paid",
      paid_at: new Date().toISOString(),
      processed: true,
    }).eq("id", compra.id);

    // histórico
    await admin.from("afiliado_limite_historico").insert({
      afiliado_id: userId,
      quantidade: compra.qty,
      valor_unitario: compra.valor_unitario,
      valor_total: compra.valor_total,
      created_by: userId,
    });

    return new Response(JSON.stringify({ status: "paid", processed: true, novoLimite: novo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
