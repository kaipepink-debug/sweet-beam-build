// Sincroniza credenciais + proxy ativo com a extensão RatarIA.
// Usado tanto pelo painel do cliente (/acessar-ferramentas) quanto pelo admin
// (/dashboard-ferramentas/[toolId]). Funciona em qualquer página em domínio
// autorizado pela extensão (rataria.io, lovable, localhost).

import { supabase } from "@/integrations/supabase/client";

// Mantém em sync com extension/src/login-injector.js e popup.js
export const SUPPORTED_TOOLS = ["chatgpt", "gemini"] as const;
export type ToolKey = typeof SUPPORTED_TOOLS[number];

export type SyncResult = {
  ok: boolean;
  error?: string;
  credentialsCount?: Record<ToolKey, number>;
  proxyApplied?: boolean;
};

type CredentialPayload = {
  login: string | null;
  email_cliente: string | null;
  senha: string;
  data_expiracao: string;
  totp_secret: string | null;
};

function detectExtensionMarker(): boolean {
  return !!document.getElementById("__rataria_extension_installed__");
}

function postToExtension<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
  expectedAction?: string,
  timeoutMs = 5000
): Promise<T | null> {
  return new Promise((resolve) => {
    const requestId = `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window) return;
      const d = e.data as { source?: string; action?: string; requestId?: string; response?: T };
      if (
        d?.source === "rataria-extension" &&
        (!expectedAction || d.action === expectedAction) &&
        d.requestId === requestId
      ) {
        window.removeEventListener("message", onMessage);
        resolve(d.response ?? null);
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "rataria-panel", action, requestId, ...payload }, window.location.origin);
    setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(null);
    }, timeoutMs);
  });
}

export async function isExtensionInstalled(timeoutMs = 1500): Promise<boolean> {
  if (detectExtensionMarker()) return true;
  const res = await postToExtension<{ version?: string }>("ping", {}, "pong", timeoutMs);
  return !!res;
}

export async function syncExtension(): Promise<SyncResult> {
  if (!(await isExtensionInstalled())) {
    return { ok: false, error: "extensão não detectada" };
  }

  // Busca acessos válidos das ferramentas suportadas
  const { data: acessos, error: accErr } = await supabase
    .from("acessos")
    .select("id, ferramenta, login, senha, email_cliente, data_expiracao, totp_secret")
    .in("ferramenta", SUPPORTED_TOOLS as readonly string[])
    .gt("data_expiracao", new Date().toISOString())
    .order("data_expiracao", { ascending: false });

  if (accErr) {
    return { ok: false, error: `falha ao ler acessos: ${accErr.message}` };
  }

  // Agrupa por ferramenta
  const credentials: Record<string, CredentialPayload[]> = {};
  for (const key of SUPPORTED_TOOLS) credentials[key] = [];
  for (const a of acessos || []) {
    const tool = a.ferramenta as ToolKey;
    if (!SUPPORTED_TOOLS.includes(tool)) continue;
    credentials[tool].push({
      login: a.login,
      email_cliente: a.email_cliente,
      senha: a.senha,
      data_expiracao: a.data_expiracao,
      totp_secret: a.totp_secret ?? null,
    });
  }

  // Busca proxy ativo (o primeiro)
  let proxy: {
    protocol: string;
    host: string;
    port: number;
    username: string | null;
    password: string | null;
    enabled: boolean;
  } | null = null;

  try {
    const { data: proxyRow } = await supabase
      .from("proxies")
      .select("protocol, host, port, username, password, ativo")
      .eq("ativo", true)
      .limit(1)
      .maybeSingle();
    if (proxyRow) {
      proxy = {
        protocol: proxyRow.protocol,
        host: proxyRow.host,
        port: proxyRow.port,
        username: proxyRow.username,
        password: proxyRow.password,
        enabled: true,
      };
    }
  } catch (e) {
    console.warn("[RatarIA] erro ao buscar proxy:", e);
  }

  const res = await postToExtension<{ ok: boolean; error?: string }>(
    "sync-credentials",
    { credentials, proxy },
    "sync-response"
  );

  if (!res?.ok) {
    return { ok: false, error: res?.error || "extensão não respondeu" };
  }

  const counts = Object.fromEntries(
    SUPPORTED_TOOLS.map((k) => [k, credentials[k]?.length || 0])
  ) as Record<ToolKey, number>;

  return {
    ok: true,
    credentialsCount: counts,
    proxyApplied: !!proxy,
  };
}
