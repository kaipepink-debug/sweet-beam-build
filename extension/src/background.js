// RatarIA Extension — Background Service Worker
// Gerencia o sync de credenciais vindo do painel e responde aos content scripts
// de páginas de login com a lista de contas disponíveis pra cada ferramenta.

const STORAGE_KEY = 'rataria_credentials_v1';
const SYNC_TS_KEY = 'rataria_synced_at';
const SYNC_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const PROXY_KEY = 'rataria_proxy_v1';

const ALLOWED_ORIGIN_HOSTS = [
  'rataria.io',
  'www.rataria.io',
  'localhost',
  '127.0.0.1',
];

function isOriginAllowed(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (ALLOWED_ORIGIN_HOSTS.includes(u.hostname)) return true;
    if (u.hostname.endsWith('.lovable.app')) return true;
    if (u.hostname.endsWith('.lovableproject.com')) return true;
    if (u.hostname.endsWith('.lovable.dev')) return true;
    return false;
  } catch {
    return false;
  }
}

const TOOL_DOMAINS = {
  chatgpt: ['chatgpt.com', 'openai.com', 'auth.openai.com', 'chat.openai.com'],
  gemini: ['google.com', 'accounts.google.com', 'gemini.google.com', 'mail.google.com', 'myaccount.google.com'],
};

const TOOL_OPEN_URL = {
  chatgpt: 'https://chatgpt.com/auth/login',
  // Gemini: passa pelo Logout primeiro pra forçar tela limpa
  gemini:
    'https://accounts.google.com/Logout?continue=' +
    encodeURIComponent('https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fgemini.google.com%2Fapp'),
};

async function syncCredentials(payload) {
  // payload = { credentials: { chatgpt: [...], gemini: [...] } }
  const credentials = payload?.credentials || {};
  await chrome.storage.local.set({
    [STORAGE_KEY]: credentials,
    [SYNC_TS_KEY]: Date.now(),
  });
  const totals = Object.entries(credentials).map(([k, v]) => `${k}=${v?.length || 0}`).join(' ');
  console.log(`[RatarIA] Credenciais sincronizadas (${totals})`);
  return { ok: true, totals };
}

async function getCredentialsForTool(ferramenta) {
  const data = await chrome.storage.local.get([STORAGE_KEY, SYNC_TS_KEY]);
  const syncedAt = data[SYNC_TS_KEY] || 0;
  if (!syncedAt) {
    return { ok: false, error: 'Abra o painel da RatarIA pra sincronizar suas contas.', creds: [] };
  }
  if (Date.now() - syncedAt > SYNC_TTL_MS) {
    return { ok: false, error: 'Suas contas expiraram. Abra o painel pra sincronizar.', creds: [] };
  }
  const all = data[STORAGE_KEY] || {};
  const creds = all[ferramenta] || [];
  return { ok: true, creds };
}

async function clearToolCookies(ferramenta) {
  const targets = TOOL_DOMAINS[ferramenta] || [];
  let removed = 0;
  for (const domain of targets) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      for (const cookie of cookies) {
        const cleanDomain = cookie.domain.replace(/^\./, '');
        const url = `${cookie.secure ? 'https' : 'http'}://${cleanDomain}${cookie.path}`;
        try {
          await chrome.cookies.remove({ url, name: cookie.name, storeId: cookie.storeId });
          removed++;
        } catch {}
      }
    } catch {}
  }
  console.log(`[RatarIA] ${removed} cookies removidos pra ${ferramenta}`);
}

async function openTool(ferramenta, { clearCookies = false } = {}) {
  const url = TOOL_OPEN_URL[ferramenta];
  if (!url) throw new Error(`Ferramenta desconhecida: ${ferramenta}`);
  if (clearCookies) await clearToolCookies(ferramenta);
  const tab = await chrome.tabs.create({ url, active: true });
  return { ok: true, tabId: tab.id };
}

// ============== PROXY ==============
// Roteia tráfego das ferramentas (chatgpt, gemini) pelo proxy. Demais sites
// continuam acessando direto. Implementado via PAC script.

const PROXY_DOMAINS_PAC = [
  'chatgpt.com', 'openai.com',
  'google.com', 'gemini.google.com', 'accounts.google.com',
  'gstatic.com', 'googleapis.com',
];

function buildPacScript(config) {
  const scheme = config.protocol === 'socks5' ? 'SOCKS5'
    : config.protocol === 'https' ? 'HTTPS'
    : 'PROXY';
  const proxyLine = `${scheme} ${config.host}:${config.port}`;
  const domains = JSON.stringify(PROXY_DOMAINS_PAC);
  return `
function FindProxyForURL(url, host) {
  var TARGETS = ${domains};
  for (var i = 0; i < TARGETS.length; i++) {
    var t = TARGETS[i];
    if (host === t || host.endsWith('.' + t)) {
      return "${proxyLine}";
    }
  }
  return "DIRECT";
}
`.trim();
}

async function getProxyConfig() {
  const data = await chrome.storage.local.get(PROXY_KEY);
  return data[PROXY_KEY] || null;
}

async function applyProxy(config) {
  // Salva em storage
  await chrome.storage.local.set({ [PROXY_KEY]: config });

  if (!config || !config.enabled || !config.host || !config.port) {
    // Limpa configuração de proxy
    await chrome.proxy.settings.clear({ scope: 'regular' });
    console.log('[RatarIA] Proxy desativado');
    return { ok: true };
  }

  const pacScript = buildPacScript(config);
  await chrome.proxy.settings.set({
    scope: 'regular',
    value: {
      mode: 'pac_script',
      pacScript: { data: pacScript },
    },
  });
  console.log(`[RatarIA] Proxy ativado: ${config.protocol}://${config.host}:${config.port}`);
  return { ok: true };
}

// Auth do proxy: o Chrome chama esse listener quando o proxy pede credenciais.
// Importante: webRequestAuthProvider permission é necessária no manifest.
if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
  chrome.webRequest.onAuthRequired.addListener(
    (details, asyncCallback) => {
      if (!details.isProxy) {
        asyncCallback({ cancel: false });
        return;
      }
      (async () => {
        const cfg = await getProxyConfig();
        if (cfg?.enabled && cfg.username) {
          asyncCallback({
            authCredentials: {
              username: cfg.username,
              password: cfg.password || '',
            },
          });
        } else {
          asyncCallback({ cancel: false });
        }
      })();
    },
    { urls: ['<all_urls>'] },
    ['asyncBlocking']
  );
}

// Reaplica proxy ao iniciar o service worker
(async () => {
  try {
    const cfg = await getProxyConfig();
    if (cfg?.enabled) {
      await applyProxy(cfg);
    }
  } catch (e) {
    console.warn('[RatarIA] não consegui reaplicar proxy no startup:', e);
  }
})();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      // SYNC vindo do painel
      if (msg?.action === 'rataria:sync-credentials') {
        if (sender.tab && !isOriginAllowed(sender.tab.url)) {
          sendResponse({ ok: false, error: 'origem não autorizada' });
          return;
        }
        const result = await syncCredentials(msg);
        sendResponse(result);
        return;
      }

      // PING (painel detecta a extensão)
      if (msg?.action === 'rataria:ping') {
        sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
        return;
      }

      // OPEN tool vindo do painel
      if (msg?.action === 'rataria:open-tool') {
        if (sender.tab && !isOriginAllowed(sender.tab.url)) {
          sendResponse({ ok: false, error: 'origem não autorizada' });
          return;
        }
        const result = await openTool(msg.ferramenta, { clearCookies: msg.clearCookies !== false });
        sendResponse(result);
        return;
      }

      // GET vindo do content script de login pages
      if (msg?.action === 'rataria:get-credentials-for-tool') {
        const result = await getCredentialsForTool(msg.ferramenta);
        sendResponse(result);
        return;
      }

      // Last sync info (debug)
      if (msg?.action === 'rataria:status') {
        const data = await chrome.storage.local.get([STORAGE_KEY, SYNC_TS_KEY]);
        sendResponse({
          ok: true,
          version: chrome.runtime.getManifest().version,
          syncedAt: data[SYNC_TS_KEY] || null,
          tools: Object.keys(data[STORAGE_KEY] || {}),
        });
        return;
      }

      // Proxy: ler
      if (msg?.action === 'rataria:get-proxy') {
        const config = await getProxyConfig();
        sendResponse({ ok: true, config });
        return;
      }

      // Proxy: salvar e aplicar
      if (msg?.action === 'rataria:set-proxy') {
        const result = await applyProxy(msg.config);
        sendResponse(result);
        return;
      }

      sendResponse({ ok: false, error: 'ação desconhecida: ' + msg?.action });
    } catch (e) {
      console.error('[RatarIA] erro no background:', e);
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[RatarIA] Extensão instalada/atualizada');
});
