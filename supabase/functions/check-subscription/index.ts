import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // First try Naut API
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

    // If Naut returns an active subscription, use it
    if (response.ok && data?.success && data?.data?.subscriptions?.length) {
      const hasActive = data.data.subscriptions.some((s: any) => s.isActive);
      if (hasActive) {
        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fallback: check local assinantes table
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: localSubs } = await supabaseAdmin
      .from("assinantes")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .eq("status", "Ativa");

    // Also check with original case
    const { data: localSubsOriginal } = await supabaseAdmin
      .from("assinantes")
      .select("*")
      .eq("email", email.trim())
      .eq("status", "Ativa");

    const allLocal = [...(localSubs || []), ...(localSubsOriginal || [])];
    // Deduplicate by id
    const uniqueLocal = allLocal.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    if (uniqueLocal.length > 0) {
      // Check if any local subscription is still valid
      const now = new Date();
      const activeSub = uniqueLocal.find(sub => {
        if (sub.data_renovacao) {
          return new Date(sub.data_renovacao) >= now;
        }
        if (sub.proxima_cobranca) {
          return new Date(sub.proxima_cobranca) >= now;
        }
        return true; // No expiration set, consider active
      });

      if (activeSub) {
        const expiresAt = activeSub.data_renovacao || activeSub.proxima_cobranca || null;
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
                expiresAt: expiresAt,
                status: "active",
              }],
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Local subscription expired
      const lastSub = uniqueLocal[0];
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
    if (response.ok) {
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No subscription found anywhere
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
