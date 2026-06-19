// RatarIA Extension — Popup com 3 views: Home (ferramentas), Credenciais, Proxy.

(function () {
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;

  // ===== Constantes =====
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
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
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
    } catch {
      return null;
    }
  }
  function totpRemaining(period = 30) { return period - (Math.floor(Date.now() / 1000) % period); }

  // ===== Navegação entre views =====
  const VIEWS = ['home', 'creds', 'proxy'];

  function setView(view) {
    for (const v of VIEWS) {
      document.getElementById(`view-${v}`).hidden = v !== view;
      document.getElementById(`nav-${v}`).classList.toggle('active', v === view);
    }
    document.getElementById('title').textContent = {
      home: 'Acesso Rápido',
      creds: 'Conta atual',
      proxy: 'Configuração de proxy',
    }[view] || 'Acesso Rápido';
  }

  for (const v of VIEWS) {
    document.getElementById(`nav-${v}`).addEventListener('click', () => setView(v));
  }

  // ===== Status pills =====
  async function renderSyncPill() {
    const status = await send('rataria:status');
    const pill = document.getElementById('sync-pill');
    const text = document.getElementById('sync-text');
    pill.classList.remove('synced', 'stale', 'empty');
    if (!status?.ok || !status.syncedAt) {
      pill.classList.add('empty');
      text.textContent = 'Sem sincronização';
      return;
    }
    const ageMs = Date.now() - status.syncedAt;
    if (ageMs > 23 * 3600 * 1000) {
      pill.classList.add('stale');
      text.textContent = `Sync antigo (${fmtTimeAgo(status.syncedAt)})`;
    } else {
      pill.classList.add('synced');
      text.textContent = `Sync ${fmtTimeAgo(status.syncedAt)}`;
    }
  }

  async function renderProxyPill() {
    const pill = document.getElementById('proxy-pill');
    const text = document.getElementById('proxy-text');
    pill.classList.remove('on', 'error');
    const proxy = await send('rataria:get-proxy');
    if (proxy?.config && proxy.config.enabled) {
      pill.classList.add('on');
      text.textContent = `Proxy on · ${proxy.config.host || '?'}`;
    } else {
      text.textContent = 'Proxy off';
    }
  }

  // ===== Home view (lista de ferramentas) =====
  function renderHome(currentTool) {
    const grid = document.getElementById('tool-grid');
    grid.innerHTML = '';
    for (const [key, meta] of Object.entries(TOOL_META)) {
      const tpl = document.getElementById('tpl-tool-card').content.cloneNode(true);
      const btn = tpl.querySelector('.tool-card');
      tpl.querySelector('.tool-card-logo').src = meta.logo;
      tpl.querySelector('.tool-card-logo').alt = meta.name;
      tpl.querySelector('.tool-card-name').textContent = meta.name;
      btn.addEventListener('click', () => {
        chrome.tabs.create({ url: meta.openUrl });
        window.close();
      });
      grid.appendChild(tpl);
    }
  }

  // ===== Creds view =====
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
      } catch (e) {
        fillBtn.textContent = 'Erro — use o ícone';
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

  async function renderCredsView(currentTool) {
    const body = document.getElementById('creds-body');
    body.innerHTML = '';

    if (!currentTool) {
      const tpl = document.getElementById('tpl-no-tool').content.cloneNode(true);
      body.appendChild(tpl);
      body.querySelector('#go-home-btn')?.addEventListener('click', () => setView('home'));
      return;
    }

    const res = await send('rataria:get-credentials-for-tool', { ferramenta: currentTool });
    if (!res?.ok || !res.creds?.length) {
      const tpl = document.getElementById('tpl-no-creds').content.cloneNode(true);
      tpl.getElementById('no-creds-tool').textContent = TOOL_META[currentTool]?.name || currentTool;
      if (res?.error) tpl.getElementById('no-creds-msg').textContent = res.error;
      body.appendChild(tpl);
      return;
    }

    res.creds.forEach((c) => body.appendChild(buildCard(currentTool, c)));
  }

  // ===== Proxy view =====
  async function loadProxy() {
    const res = await send('rataria:get-proxy');
    const cfg = res?.config || {};
    const form = document.getElementById('proxy-form');
    if (cfg.host) form.host.value = cfg.host;
    if (cfg.port) form.port.value = cfg.port;
    if (cfg.username) form.username.value = cfg.username;
    if (cfg.password) form.password.value = cfg.password;
    if (cfg.protocol) {
      const radio = form.querySelector(`input[name="protocol"][value="${cfg.protocol}"]`);
      if (radio) radio.checked = true;
    }
    document.getElementById('proxy-enabled').checked = !!cfg.enabled;
  }

  function showProxyHelper(msg, kind) {
    const el = document.getElementById('proxy-helper');
    el.textContent = msg;
    el.className = `proxy-helper show ${kind}`;
    setTimeout(() => el.classList.remove('show'), 4500);
  }

  async function saveProxy(activate) {
    const form = document.getElementById('proxy-form');
    const data = new FormData(form);
    const config = {
      protocol: data.get('protocol') || 'http',
      host: (data.get('host') || '').toString().trim(),
      port: parseInt(data.get('port') || '0', 10) || 0,
      username: (data.get('username') || '').toString().trim(),
      password: (data.get('password') || '').toString(),
      enabled: activate,
    };
    if (!config.host || !config.port) {
      showProxyHelper('Preencha host e porta.', 'error');
      return false;
    }
    const res = await send('rataria:set-proxy', { config });
    if (res?.ok) {
      showProxyHelper(activate ? 'Proxy ativado.' : 'Proxy salvo (desativado).', 'success');
      renderProxyPill();
      return true;
    } else {
      showProxyHelper(`Erro: ${res?.error || 'desconhecido'}`, 'error');
      return false;
    }
  }

  document.getElementById('proxy-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const enabled = document.getElementById('proxy-enabled').checked;
    await saveProxy(enabled);
  });

  document.getElementById('proxy-enabled').addEventListener('change', async (e) => {
    await saveProxy(e.target.checked);
  });

  document.getElementById('proxy-test-btn').addEventListener('click', async () => {
    const out = document.getElementById('proxy-test-result');
    out.textContent = 'Consultando...';
    try {
      const r = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      const data = await r.json();
      out.textContent = `IP visto: ${data.ip}`;
    } catch (e) {
      out.textContent = `Erro: ${e.message}`;
    }
  });

  // ===== Boot =====
  (async () => {
    await renderSyncPill();
    await renderProxyPill();

    const tab = await getActiveTab();
    const host = tab?.url ? (() => { try { return new URL(tab.url).hostname; } catch { return null; } })() : null;
    const currentTool = detectToolFromHost(host);

    renderHome(currentTool);
    await renderCredsView(currentTool);
    await loadProxy();

    // Se tá numa ferramenta conhecida, abre direto na view "creds". Senão, "home".
    setView(currentTool ? 'creds' : 'home');
  })();
})();
