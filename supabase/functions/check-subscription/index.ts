import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Try Naut API
    const response = await fetch('https://navenaut.com/api/public/v1/subscriptions/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': NAUT_PUBLIC_KEY,
        'X-Secret-Key': NAUT_SECRET_KEY,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

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
            plano: "Naut",
            status: "Ativa",
            valor: 0,
            meio_pagamento: "Naut",
            data_criacao: new Date().toISOString().split("T")[0],
            data_renovacao: expiresAt.split("T")[0],
            proxima_cobranca: expiresAt.split("T")[0],
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
          const expiresAt = sub.expiresAt ? new Date(sub.expiresAt).toISOString().split("T")[0] : null;
          const createdAt = sub.createdAt ? new Date(sub.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          const productName = sub.productName || "RatarIA";
          const planName = sub.planName || "N/A";
          const price = sub.price || sub.amount || 0;
          const paymentMethod = sub.paymentMethod || "Naut";

          // Check if already exists
          const { data: existing } = await supabaseAdmin
            .from("assinantes")
            .select("id")
            .eq("email", nautEmail)
            .eq("produto", productName)
            .limit(1);

          if (existing && existing.length > 0) {
            // Update with latest Naut data + recalculated status
            await supabaseAdmin
              .from("assinantes")
              .update({
                status,
                nome: nautName,
                plano: planName,
                valor: price,
                data_renovacao: expiresAt,
                proxima_cobranca: expiresAt,
                meio_pagamento: paymentMethod,
              })
              .eq("id", existing[0].id);
          } else {
            // Insert new subscriber from Naut
            await supabaseAdmin
              .from("assinantes")
              .insert({
                email: nautEmail,
                nome: nautName,
                produto: productName,
                plano: planName,
                status,
                valor: price,
                meio_pagamento: paymentMethod,
                data_criacao: createdAt,
                data_renovacao: expiresAt,
                proxima_cobranca: expiresAt,
                created_by: "00000000-0000-0000-0000-000000000000",
              });
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
