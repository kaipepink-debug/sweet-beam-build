import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, images } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Build multimodal parts
    const parts: any[] = [{ text: prompt }];
    
    // Add any base64 images
    if (images && Array.isArray(images)) {
      for (const img of images) {
        parts.push({
          inline_data: {
            mime_type: img.mimeType || "image/png",
            data: img.data, // base64
          },
        });
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            responseMimeType: "image/png",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Erro na API Gemini", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract image from response
    const candidate = data.candidates?.[0];
    const responseParts = candidate?.content?.parts || [];
    
    let imageBase64 = null;
    let textResponse = "";
    
    for (const part of responseParts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
      } else if (part.text) {
        textResponse = part.text;
      }
    }

    if (!imageBase64) {
      // Fallback: try Lovable AI gateway
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        const lovableResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (lovableResp.ok) {
          const lovableData = await lovableResp.json();
          const imgUrl = lovableData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imgUrl && imgUrl.startsWith("data:image")) {
            imageBase64 = imgUrl.split(",")[1];
          }
        }
      }
    }

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Não foi possível gerar a imagem. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: imageBase64, text: textResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-banner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
