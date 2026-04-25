import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PixelConfig {
  platform: string;
  pixel_id: string;
  api_token: string;
  enabled: boolean;
}

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

export default function PixelScripts() {
  const [pixels, setPixels] = useState<PixelConfig[]>([]);
  const location = useLocation();
  const initializedRef = useRef(false);

  useEffect(() => {
    supabase
      .from("pixels")
      .select("platform, pixel_id, api_token, enabled")
      .eq("enabled", true)
      .then(({ data }) => {
        if (data) setPixels(data.filter((p) => p.pixel_id.trim() !== ""));
      });
  }, []);

  // Install pixels once when loaded
  useEffect(() => {
    if (pixels.length === 0 || initializedRef.current) return;
    initializedRef.current = true;

    pixels.forEach((pixel) => {
      if (pixel.platform === "facebook" && pixel.pixel_id) {
        installFacebookPixel(pixel.pixel_id);
      }
      if (pixel.platform === "tiktok" && pixel.pixel_id) {
        installTikTokPixel(pixel.pixel_id);
      }
    });
  }, [pixels]);

  // Track PageView on every route change (SPA navigation)
  useEffect(() => {
    if (!initializedRef.current) return;

    const fbPixels = pixels.filter((p) => p.platform === "facebook" && p.pixel_id);
    if (window.fbq && fbPixels.length > 0) {
      fbPixels.forEach((p) => {
        try {
          window.fbq("trackSingle", p.pixel_id, "PageView");
        } catch (e) {
          console.warn("[FB Pixel] PageView track failed", e);
        }
      });
    }

    const ttPixels = pixels.filter((p) => p.platform === "tiktok" && p.pixel_id);
    if (window.ttq && ttPixels.length > 0) {
      try {
        window.ttq.page();
      } catch (e) {
        console.warn("[TT Pixel] page track failed", e);
      }
    }
  }, [location.pathname, location.search, pixels]);

  return null;
}

function installFacebookPixel(pixelId: string) {
  // Initialize the base SDK stub if not present (synchronous — fbq is available immediately after this)
  if (!window.fbq) {
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments as any)
          : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  // Avoid double-init for the same pixel id
  const initFlag = `__fb_init_${pixelId}`;
  if ((window as any)[initFlag]) return;
  (window as any)[initFlag] = true;

  try {
    window.fbq("init", pixelId);
    window.fbq("trackSingle", pixelId, "PageView");
  } catch (e) {
    console.warn("[FB Pixel] init failed", e);
  }

  // noscript fallback (must be in body, not head)
  const noscript = document.createElement("noscript");
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
  document.body.appendChild(noscript);
}

function installTikTokPixel(pixelId: string) {
  const scriptId = `tt-pixel-script-${pixelId}`;
  if (document.getElementById(scriptId)) return;

  // If first TT pixel, install the base SDK
  if (!document.getElementById("tt-pixel-sdk")) {
    const sdkScript = document.createElement("script");
    sdkScript.id = "tt-pixel-sdk";
    sdkScript.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var s=document.createElement("script");s.type="text/javascript",s.async=!0,s.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
      }(window, document, 'ttq');
    `;
    document.head.appendChild(sdkScript);
  }

  const script = document.createElement("script");
  script.id = scriptId;
  script.innerHTML = `
    ttq.load('${pixelId}');
    ttq.page();
  `;
  document.head.appendChild(script);
}
