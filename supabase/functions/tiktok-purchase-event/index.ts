import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pixel_id, access_token, value, order_id } = await req.json();

    if (!pixel_id || !access_token) {
      return new Response(JSON.stringify({ error: "pixel_id e access_token são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = {
      event_source: "web",
      event_source_id: pixel_id,
      data: [
        {
          event: "CompletePayment",
          event_time: Math.floor(Date.now() / 1000),
          event_id: order_id || `evt_${Date.now()}`,
          user: {
            external_id: "test_user_manual",
          },
          properties: {
            contents: [
              {
                content_id: "test_product",
                content_type: "product",
                content_name: "Teste Manual",
                quantity: 1,
                price: value || 0,
              },
            ],
            content_type: "product",
            currency: "BRL",
            value: value || 0,
            order_id: order_id || `TST-${Date.now()}`,
          },
        },
      ],
    };

    const response = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/event/track/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": access_token,
        },
        body: JSON.stringify(event),
      }
    );

    const result = await response.json();

    if (result.code !== 0) {
      return new Response(JSON.stringify({ error: result.message || "Erro na API do TikTok", details: result }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
