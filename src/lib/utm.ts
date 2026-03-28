const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "src"];
const STORAGE_KEY = "utm_params";

export function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  UTM_PARAMS.forEach((key) => {
    const val = params.get(key);
    if (val) utms[key] = val;
  });
  if (Object.keys(utms).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
  }
}

export function appendUtmToUrl(url: string): string {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return url;
  try {
    const utms: Record<string, string> = JSON.parse(stored);
    const u = new URL(url);
    Object.entries(utms).forEach(([k, v]) => {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    });
    return u.toString();
  } catch {
    return url;
  }
}
