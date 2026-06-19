// RatarIA Extension — Popup com layout 2-colunas (sidebar + content).
// Sidebar: lista de ferramentas + status de sync + banner do proxy.
// Content: credenciais da ferramenta selecionada.
// Proxy é controlado SÓ pelo painel admin (extensão recebe via sync).

(function () {
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;
  document.getElementById('open-panel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://rataria.io/acessar-ferramentas' });
  });

  const TOOL_BY_HOST = {
    'chatgpt.com': 'chatgpt',
    'auth.openai.com': 'chatgpt',
    'chat.openai.com': 'chatgpt',
    'accounts.google.com': 'gemini',
    'gemini.google.com': 'gemini',
  };

  const TOOL_META = {
    chatgpt: {
      name: 'ChatGPT',
      logo: '../icons/tools/chatgpt.png',
      openUrl: 'https://chatgpt.com/auth/login',
    },
    gemini: {
      name: 'Gemini',
      logo: '../icons/tools/gemini.png',
      openUrl:
        'https://accounts.google.com/Logout?continue=' +
        encodeURIComponent('https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fgemini.google.com%2Fapp'),
    },
  };

  // ===== Helpers =====
  function detectToolFromHost(host) {
    if (!host) return null;
    if (TOOL_BY_HOST[host]) return TOOL_BY_HOST[host];
    for (const h of Object.keys(TOOL_BY_HOST)) {
      if (host.endsWith('.' + h) || host === h) return TOOL_BY_HOST[h];
    }
    return null;
  }

  function pickLogin(c) {
    const candidates = [c?.login, c?.email_cliente, c?.email, c?.username];
    for (const v of candidates) {
      if (v && typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  }

  function fmtTimeAgo(ts) {
    if (!ts) return 'nunca';
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `há ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h} h`;
    return `há ${Math.floor(h / 24)}d`;
  }

  function daysUntil(iso) {
    if (!iso) return null;
    return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
  }

  function getActiveTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs?.[0] || null));
    });
  }

  function send(action, payload = {}) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, ...payload }, resolve);
    });
  }

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      const original = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = original;
      }, 1100);
    } catch (e) {
      console.error('[RatarIA] clipboard error:', e);
    }
  }

  // ===== TOTP RFC 6238 =====
  const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  function base32Decode(str) {
    if (!str) return null;
    const clean = String(str).replace(/[\s-]/g, '').toUpperCase();
    let bits = '';
    for (const ch of clean) {
      const idx = BASE32.indexOf(ch);
      if (idx < 0) continue;
      bits += idx.toString(2).padStart(5, '0');
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    return bytes;
  }
  async function totp(secret, period = 30, digits = 6) {
    try {
      const key = base32Decode(secret);
      if (!key || !key.length) return null;
      const counter = Math.floor(Date.now() / 1000 / period);
      const buf = new ArrayBuffer(8);
      const view = new DataView(buf);
      view.setUint32(4, counter);
      const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buf));
      const offset = sig[sig.length - 1] & 0x0f;
      const code = ((sig[offset] & 0x7f) << 24) | ((sig[offset + 1] & 0xff) << 16) | ((sig[offset + 2] & 0xff) << 8) | (sig[offset + 3] & 0xff);
      return String(code % Math.pow(10, digits)).padStart(digits, '0');
    } catch { return null; }
  }
  function totpRemaining(period = 30) { return period - (Math.floor(Date.now() / 1000) % period); }

  // ===== Render: sync mini-pill =====
  async function renderSync() {
    const status = await send('rataria:status');
    const root = document.getElementById('sync-mini');
    const txt = document.getElementById('sync-text');
    root.classList.remove('synced', 'empty');
    if (!status?.ok || !status.syncedAt) {
      root.classList.add('empty');
      txt.textContent = 'sem sync';
      return;
    }
    root.classList.add('synced');
    txt.textContent = `sincronizado ${fmtTimeAgo(status.syncedAt)}`;
  }

  // ===== Render: proxy banner =====
  async function renderProxyBanner() {
    const banner = document.getElementById('proxy-banner');
    const info = document.getElementById('proxy-banner-info');
    const proxy = await send('rataria:get-proxy');
    if (proxy?.config && proxy.config.enabled && proxy.config.host) {
      banner.hidden = false;
      info.textContent = `${proxy.config.host}:${proxy.config.port}`;
    } else {
      banner.hidden = true;
    }
  }

  // ===== Sidebar: lista de ferramentas =====
  let selectedTool = null;

  function renderToolList(currentTabTool) {
    const list = document.getElementById('tool-list');
    list.innerHTML = '';
    for (const [key, meta] of Object.entries(TOOL_META)) {
      const tpl = document.getElementById('tpl-tool-item').content.cloneNode(true);
      const btn = tpl.querySelector('.tool-item');
      tpl.querySelector('.tool-item-logo').src = meta.logo;
      tpl.querySelector('.tool-item-logo').alt = meta.name;
      tpl.querySelector('.tool-item-name').textContent = meta.name;
      btn.dataset.tool = key;
      btn.addEventListener('click', () => selectTool(key));
      list.appendChild(tpl);
    }
    // Marca tool inicial: tab atual ou primeiro da lista
    const initial = currentTabTool || Object.keys(TOOL_META)[0];
    selectTool(initial, { skipRefocus: true });
  }

  function selectTool(toolKey, opts = {}) {
    selectedTool = toolKey;
    // Atualiza highlights
    document.querySelectorAll('.tool-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.tool === toolKey);
    });
    renderCredsView(toolKey);
  }

  // ===== Content: credenciais =====
  function buildCard(ferramenta, cred) {
    const tpl = document.getElementById('tpl-credential-card').content.cloneNode(true);
    const card = tpl.querySelector('.cred-card');
    const meta = TOOL_META[ferramenta] || { name: ferramenta, logo: '../icons/icon-48.png' };
    const loginValue = pickLogin(cred);
    const senha = cred.senha || '';
    const totpSecret = cred.totp_secret;

    card.querySelector('.cred-tool-logo').src = meta.logo;
    card.querySelector('.cred-tool-logo').alt = meta.name;
    card.querySelector('.cred-tool-name').textContent = meta.name;

    const loginField = card.querySelector('[data-field="login"]');
    const loginSpan = loginField.querySelector('.cred-value-login');
    loginSpan.textContent = loginValue || '— sem e-mail cadastrado —';
    if (!loginValue) loginSpan.style.color = 'rgba(255,255,255,0.4)';
    loginField.querySelector('.cred-copy').addEventListener('click', (e) => {
      if (loginValue) copyText(loginValue, e.currentTarget);
    });

    const senhaField = card.querySelector('[data-field="senha"]');
    const senhaSpan = senhaField.querySelector('.cred-value-senha');
    senhaSpan.textContent = senha ? '•'.repeat(Math.min(senha.length, 16)) : '—';
    let revealed = false;
    const revealBtn = senhaField.querySelector('.cred-reveal');
    revealBtn.addEventListener('click', () => {
      revealed = !revealed;
      senhaSpan.textContent = revealed ? senha : '•'.repeat(Math.min(senha.length, 16));
      senhaSpan.classList.toggle('cred-masked', !revealed);
      revealBtn.textContent = revealed ? '●' : '○';
    });
    senhaField.querySelector('.cred-copy').addEventListener('click', (e) => {
      if (senha) copyText(senha, e.currentTarget);
    });

    const totpField = card.querySelector('[data-field="totp"]');
    if (totpSecret) {
      totpField.hidden = false;
      const totpSpan = totpField.querySelector('.cred-value-totp');
      const totpProgress = totpField.querySelector('.cred-totp-progress');
      async function updateTotp() {
        const code = await totp(totpSecret);
        if (!code) { totpField.hidden = true; return; }
        totpSpan.textContent = code.replace(/(\d{3})(\d{3})/, '$1 $2');
        const remaining = totpRemaining();
        totpProgress.style.setProperty('--pct', `${(remaining / 30) * 100}%`);
        totpProgress.title = `${remaining}s`;
      }
      updateTotp();
      const interval = setInterval(updateTotp, 1000);
      window.addEventListener('beforeunload', () => clearInterval(interval), { once: true });
      totpField.querySelector('.cred-copy').addEventListener('click', async (e) => {
        const code = await totp(totpSecret);
        if (code) copyText(code, e.currentTarget);
      });
    }

    const fillBtn = card.querySelector('.cred-fill-btn');
    fillBtn.addEventListener('click', async () => {
      fillBtn.disabled = true;
      fillBtn.textContent = 'Preenchendo...';
      try {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error('sem aba');
        await chrome.tabs.sendMessage(tab.id, {
          action: 'rataria:fill-now',
          payload: {
            login: loginValue,
            senha,
            totpCode: totpSecret ? await totp(totpSecret) : null,
          },
        });
        fillBtn.textContent = '✓ Preenchido';
        setTimeout(() => { fillBtn.textContent = 'Preencher'; fillBtn.disabled = false; }, 1400);
      } catch {
        fillBtn.textContent = 'Abra a ferramenta primeiro';
        setTimeout(() => { fillBtn.textContent = 'Preencher'; fillBtn.disabled = false; }, 2200);
      }
    });

    const expiresIn = daysUntil(cred.data_expiracao);
    if (expiresIn != null) {
      const foot = card.querySelector('.cred-foot-expiry');
      foot.textContent = `Expira em ${expiresIn} ${expiresIn === 1 ? 'dia' : 'dias'}`;
      if (expiresIn <= 1) foot.style.color = 'rgba(251, 146, 60, 0.85)';
    }

    return card;
  }

  async function renderCredsView(ferramenta) {
    const body = document.getElementById('content-body');
    body.innerHTML = '';

    if (!ferramenta) {
      const tpl = document.getElementById('tpl-empty').content.cloneNode(true);
      body.appendChild(tpl);
      return;
    }

    const meta = TOOL_META[ferramenta];
    document.getElementById('content-title').textContent = 'Seus logins';
    document.getElementById('content-sub').textContent = `${meta?.name || ferramenta} — gerencie seus acessos`;

    // Botão "Abrir ferramenta" na content head se ainda não tem credenciais? Não.
    // Em vez disso, se não tem credenciais, mostra empty state com botão de abrir.

    const res = await send('rataria:get-credentials-for-tool', { ferramenta });
    if (!res?.ok || !res.creds?.length) {
      const tpl = document.getElementById('tpl-empty').content.cloneNode(true);
      tpl.getElementById('empty-title').textContent = `Sem contas pra ${meta?.name || ferramenta}`;
      tpl.getElementById('empty-msg').textContent = res?.error || 'Abra o painel da RatarIA pra sincronizar.';
      body.appendChild(tpl);

      // Botão de abrir site direto da ferramenta
      const btn = document.createElement('button');
      btn.className = 'cred-fill-btn';
      btn.style.marginTop = '10px';
      btn.style.alignSelf = 'center';
      btn.textContent = `Abrir ${meta?.name || ferramenta}`;
      btn.addEventListener('click', () => {
        if (meta?.openUrl) {
          chrome.tabs.create({ url: meta.openUrl });
          window.close();
        }
      });
      body.appendChild(btn);
      return;
    }

    res.creds.forEach((c) => body.appendChild(buildCard(ferramenta, c)));

    // Botão "Abrir [ferramenta]" no fim
    const openBtn = document.createElement('button');
    openBtn.className = 'cred-fill-btn';
    openBtn.style.marginTop = '4px';
    openBtn.style.alignSelf = 'center';
    openBtn.textContent = `Abrir ${meta?.name || ferramenta}`;
    openBtn.addEventListener('click', () => {
      if (meta?.openUrl) {
        chrome.tabs.create({ url: meta.openUrl });
        window.close();
      }
    });
    body.appendChild(openBtn);
  }

  // ===== Boot =====
  (async () => {
    await renderSync();
    await renderProxyBanner();

    const tab = await getActiveTab();
    const host = tab?.url ? (() => { try { return new URL(tab.url).hostname; } catch { return null; } })() : null;
    const currentTool = detectToolFromHost(host);

    renderToolList(currentTool);
  })();
})();
