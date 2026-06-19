// RatarIA Extension — Background Service Worker
// Recebe mensagens do painel (via panel-bridge) e orquestra a abertura
// de novas abas com as credenciais que o flow-runner injetará.

const ALLOWED_ORIGINS = [
  'https://rataria.io',
  'https://www.rataria.io',
  'http://localhost',
  'https://lovable.app',
  'https://lovableproject.com',
];

// Pra Gemini, navegamos primeiro pelo /Logout do Google — ele desloga TODAS as contas
// da sessão e em seguida redireciona pra tela de login limpa.
const GEMINI_LOGIN = 'https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fgemini.google.com%2Fapp';
const GEMINI_LOGOUT_THEN_LOGIN =
  'https://accounts.google.com/Logout?continue=' + encodeURIComponent(GEMINI_LOGIN);

const TOOLS = {
  chatgpt: {
    name: 'ChatGPT',
    loginUrl: 'https://chatgpt.com/auth/login',
    successUrl: 'https://chatgpt.com/',
    flowKey: 'chatgpt',
  },
  gemini: {
    name: 'Gemini',
    loginUrl: GEMINI_LOGOUT_THEN_LOGIN,
    successUrl: 'https://gemini.google.com/',
    flowKey: 'gemini',
  },
};

function isOriginAllowed(url) {
  try {
    const origin = new URL(url).origin;
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed || origin.endsWith(allowed.replace('https://', '.')));
  } catch {
    return false;
  }
}

async function openToolWithCredentials({ ferramenta, login, senha, totpSecret }) {
  const tool = TOOLS[ferramenta];
  if (!tool) {
    throw new Error(`Ferramenta desconhecida: ${ferramenta}`);
  }

  // Guarda as credenciais em sessionStorage da extensão (não persistente entre reinícios)
  // associadas à ferramenta, pra o content script pegar quando a página carregar.
  await chrome.storage.session.set({
    [`creds:${ferramenta}`]: {
      login,
      senha,
      totpSecret: totpSecret || null,
      timestamp: Date.now(),
    },
  });

  // Limpa cookies da ferramenta antes de abrir (garante login limpo da conta de hoje)
  await clearToolCookies(ferramenta);

  // Abre a nova aba
  const tab = await chrome.tabs.create({ url: tool.loginUrl, active: true });

  // Limpa as credenciais depois de 5 minutos por segurança
  setTimeout(() => {
    chrome.storage.session.remove(`creds:${ferramenta}`);
  }, 5 * 60 * 1000);

  return { ok: true, tabId: tab.id };
}

async function clearToolCookies(ferramenta) {
  const domains = {
    chatgpt: ['chatgpt.com', 'openai.com', 'auth.openai.com'],
    gemini: ['google.com', 'accounts.google.com', 'gemini.google.com', 'mail.google.com', 'myaccount.google.com'],
  };
  const targets = domains[ferramenta] || [];
  let removed = 0;
  let failed = 0;

  for (const domain of targets) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      for (const cookie of cookies) {
        const cleanDomain = cookie.domain.replace(/^\./, '');
        const url = `${cookie.secure ? 'https' : 'http'}://${cleanDomain}${cookie.path}`;
        try {
          await chrome.cookies.remove({ url, name: cookie.name, storeId: cookie.storeId });
          removed++;
        } catch (e) {
          failed++;
        }
      }
    } catch (e) {
      console.warn(`[RatarIA] Falha ao listar cookies de ${domain}:`, e);
    }
  }
  console.log(`[RatarIA] Cookies limpos pra ${ferramenta}: ${removed} removidos, ${failed} falharam`);
}

// Mensagens vindas dos content scripts (panel-bridge ou flow-runner)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      // Validação de origem: só aceita do nosso painel
      if (msg?.action === 'rataria:open-tool') {
        if (sender.tab && !isOriginAllowed(sender.tab.url)) {
          throw new Error('Origem não autorizada');
        }
        const result = await openToolWithCredentials({
          ferramenta: msg.ferramenta,
          login: msg.login,
          senha: msg.senha,
          totpSecret: msg.totpSecret,
        });
        sendResponse(result);
        return;
      }

      // Content script da ferramenta pedindo credenciais
      if (msg?.action === 'rataria:get-credentials') {
        const data = await chrome.storage.session.get(`creds:${msg.ferramenta}`);
        const creds = data[`creds:${msg.ferramenta}`];
        if (!creds) {
          sendResponse({ ok: false, error: 'sem credenciais armazenadas' });
          return;
        }
        sendResponse({ ok: true, creds });
        return;
      }

      // Ping pra detectar extensão instalada
      if (msg?.action === 'rataria:ping') {
        sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
        return;
      }

      sendResponse({ ok: false, error: 'ação desconhecida' });
    } catch (e) {
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true; // resposta assíncrona
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[RatarIA] Extensão instalada/atualizada.');
});
