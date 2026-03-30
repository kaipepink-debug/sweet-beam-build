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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    // If Naut returns subscriptions, sync them to local table
    if (response.ok && data?.success && data?.data?.subscriptions?.length) {
      // Sync each subscription to local assinantes table
      for (const sub of data.data.subscriptions) {
        try {
          // Check if already exists by email + product
          const { data: existing } = await supabaseAdmin
            .from("assinantes")
            .select("id, status, data_renovacao")
            .eq("email", data.data.email || email.trim())
            .eq("produto", sub.productName || "RatarIA")
            .limit(1);

          const nautStatus = sub.isActive ? "Ativa" : "Cancelada";
          const expiresAt = sub.expiresAt ? new Date(sub.expiresAt).toISOString().split("T")[0] : null;
          const createdAt = sub.createdAt ? new Date(sub.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

          if (existing && existing.length > 0) {
            // Update existing record with latest data from Naut
            await supabaseAdmin
              .from("assinantes")
              .update({
                status: nautStatus,
                data_renovacao: expiresAt,
                proxima_cobranca: expiresAt,
                nome: data.data.name || existing[0].nome || email.trim(),
                plano: sub.planName || "N/A",
              })
              .eq("id", existing[0].id);
          } else {
            // Insert new record synced from Naut
            await supabaseAdmin
              .from("assinantes")
              .insert({
                email: data.data.email || email.trim(),
                nome: data.data.name || email.trim(),
                produto: sub.productName || "RatarIA",
                plano: sub.planName || "N/A",
                status: nautStatus,
                valor: sub.price || 0,
                meio_pagamento: "Naut",
                data_criacao: createdAt,
                data_renovacao: expiresAt,
                proxima_cobranca: expiresAt,
                created_by: "00000000-0000-0000-0000-000000000000",
              });
          }
        } catch (syncErr) {
          console.error("Error syncing subscription to local table:", syncErr);
          // Don't fail the main request if sync fails
        }
      }

      const hasActive = data.data.subscriptions.some((s: any) => s.isActive);
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

    if (localSubs && localSubs.length > 0) {
      const now = new Date();
      const activeSub = localSubs.find(sub => {
        if (sub.data_renovacao) {
          return new Date(sub.data_renovacao) >= now;
        }
        if (sub.proxima_cobranca) {
          return new Date(sub.proxima_cobranca) >= now;
        }
        return true;
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
      const lastSub = localSubs[0];
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
