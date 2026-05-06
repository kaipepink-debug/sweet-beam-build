import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NAUT_BASE = "https://navenaut.com/api/public/v1";

function priceFor(qty: number): { unit: number; total: number } {
  const unit = qty > 10 ? 40 : 45;
  return { unit, total: unit * qty };
}

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
    const email = userData.user.email!;

    const body = await req.json();
    const qty = parseInt(body.qty);
    const cpf = String(body.cpf || "").replace(/\D/g, "");
    const nome = String(body.nome || "").trim();

    if (!qty || qty < 1 || qty > 1000) {
      return new Response(JSON.stringify({ error: "Quantidade inválida" }), { status: 400, headers: corsHeaders });
    }
    if (cpf.length !== 11) {
      return new Response(JSON.stringify({ error: "CPF inválido" }), { status: 400, headers: corsHeaders });
    }
    if (!nome) {
      return new Response(JSON.stringify({ error: "Nome obrigatório" }), { status: 400, headers: corsHeaders });
    }

    const { unit, total } = priceFor(qty);
    const amountCents = Math.round(total * 100);

    const PK = Deno.env.get("NAUT_PUBLIC_KEY_PIX");
    const SK = Deno.env.get("NAUT_SECRET_KEY_PIX");
    if (!PK || !SK) {
      return new Response(JSON.stringify({ error: "Chaves PIX não configuradas" }), { status: 500, headers: corsHeaders });
    }

    const nautRes = await fetch(`${NAUT_BASE}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Public-Key": PK,
        "X-Secret-Key": SK,
      },
      body: JSON.stringify({
        paymentMethod: "pix",
        amount: amountCents,
        customerData: { email, name: nome, document: cpf },
      }),
    });

    const nautData = await nautRes.json();
    if (!nautRes.ok || !nautData.success) {
      console.error("Naut error", nautData);
      return new Response(JSON.stringify({ error: nautData?.error?.message || "Erro ao gerar PIX" }), { status: 502, headers: corsHeaders });
    }

    const d = nautData.data;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // salva CPF no perfil
    await admin.from("profiles").update({ cpf }).eq("user_id", userId);

    const { error: insErr } = await admin.from("limite_compras").insert({
      user_id: userId,
      qty,
      valor_unitario: unit,
      valor_total: total,
      payment_id: d.paymentId,
      qr_code: d.paymentDetails?.qrCode || null,
      copy_paste_code: d.paymentDetails?.copyPasteCode || null,
      status: "pending",
      expires_at: d.paymentDetails?.expiresAt || null,
    });
    if (insErr) console.error("insert err", insErr);

    return new Response(JSON.stringify({
      success: true,
      paymentId: d.paymentId,
      qrCode: d.paymentDetails?.qrCode,
      copyPasteCode: d.paymentDetails?.copyPasteCode,
      expiresAt: d.paymentDetails?.expiresAt,
      amount: total,
      qty,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
