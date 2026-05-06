import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("naut webhook", JSON.stringify(body));

    // tenta extrair paymentId e status de formatos comuns
    const paymentId =
      body?.data?.paymentId || body?.paymentId || body?.data?.id || body?.id;
    const statusRaw = body?.data?.status || body?.status || body?.event;
    const status = String(statusRaw || "").toLowerCase();

    if (!paymentId) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const isPaid = ["paid", "approved", "completed", "succeeded", "payment.paid", "payment.approved"].some(s => status.includes(s));
    if (!isPaid) {
      return new Response(JSON.stringify({ ok: true, status }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: compra } = await admin
      .from("limite_compras")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (!compra || compra.processed) {
      return new Response(JSON.stringify({ ok: true, processed: !!compra?.processed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    return new Response(JSON.stringify({ ok: true, processed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
