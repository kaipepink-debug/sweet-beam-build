// RatarIA Extension — Popup (estilo Proton Pass)
// Detecta a aba ativa, mostra credenciais da ferramenta detectada,
// permite copiar e-mail/senha/TOTP e disparar preenchimento na aba.

(function () {
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;
  document.getElementById('open-panel-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://rataria.io/acessar-ferramentas' });
  });

  // ===== Helpers =====
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
      // Gemini abre via Logout pra forçar tela limpa
      openUrl:
        'https://accounts.google.com/Logout?continue=' +
        encodeURIComponent('https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fgemini.google.com%2Fapp'),
    },
  };

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
    return `há ${Math.floor(h / 24)} dias`;
  }

  function daysUntil(iso) {
    if (!iso) return null;
    return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
  }

  // ===== TOTP (RFC 6238) =====
  // Implementação inline sem dependência externa
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
      const cryptoKey = await crypto.subtle.importKey(
        'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
      );
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buf));
      const offset = sig[sig.length - 1] & 0x0f;
      const code = ((sig[offset] & 0x7f) << 24) |
        ((sig[offset + 1] & 0xff) << 16) |
        ((sig[offset + 2] & 0xff) << 8) |
        (sig[offset + 3] & 0xff);
      return String(code % Math.pow(10, digits)).padStart(digits, '0');
    } catch (e) {
      console.warn('[RatarIA] TOTP error:', e);
      return null;
    }
  }

  function totpRemaining(period = 30) {
    return period - (Math.floor(Date.now() / 1000) % period);
  }

  // ===== Sync status pill =====
  async function loadStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'rataria:status' }, resolve);
    });
  }

  function renderSyncPill(status) {
    const pill = document.getElementById('sync-pill');
    const text = document.getElementById('sync-text');
    pill.classList.remove('synced', 'stale', 'empty');

    if (!status?.ok || !status.syncedAt) {
      pill.classList.add('empty');
      text.textContent = 'Sem sincronização — abra o painel';
      return;
    }
    const ageMs = Date.now() - status.syncedAt;
    if (ageMs > 23 * 3600 * 1000) {
      pill.classList.add('stale');
      text.textContent = `Sincronização antiga (${fmtTimeAgo(status.syncedAt)})`;
    } else {
      pill.classList.add('synced');
      text.textContent = `Sincronizado ${fmtTimeAgo(status.syncedAt)}`;
    }
  }

  // ===== Aba ativa =====
  function getActiveTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs?.[0] || null);
      });
    });
  }

  // ===== Render =====
  const content = document.getElementById('content');

  function clearContent() { content.innerHTML = ''; }

  function showNoTool() {
    clearContent();
    const tpl = document.getElementById('tpl-no-tool').content.cloneNode(true);
    tpl.getElementById('no-tool-list').textContent = Object.values(TOOL_META).map(t => t.name).join(' ou ');
    content.appendChild(tpl);
  }

  function showNoCreds(ferramenta, reason) {
    clearContent();
    const tpl = document.getElementById('tpl-no-creds').content.cloneNode(true);
    tpl.getElementById('no-creds-tool').textContent = TOOL_META[ferramenta]?.name || ferramenta;
    if (reason) tpl.getElementById('no-creds-msg').textContent = reason;
    content.appendChild(tpl);
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

    // E-mail
    const loginField = card.querySelector('[data-field="login"]');
    const loginSpan = loginField.querySelector('.cred-value-login');
    loginSpan.textContent = loginValue || '— sem e-mail cadastrado —';
    if (!loginValue) loginSpan.style.color = 'rgba(255,255,255,0.4)';
    loginField.querySelector('.cred-copy').addEventListener('click', (e) => {
      if (loginValue) copyText(loginValue, e.currentTarget);
    });

    // Senha
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

    // TOTP
    const totpField = card.querySelector('[data-field="totp"]');
    if (totpSecret) {
      totpField.hidden = false;
      const totpSpan = totpField.querySelector('.cred-value-totp');
      const totpProgress = totpField.querySelector('.cred-totp-progress');

      async function updateTotp() {
        const code = await totp(totpSecret);
        if (!code) {
          totpField.hidden = true;
          return;
        }
        totpSpan.textContent = code.replace(/(\d{3})(\d{3})/, '$1 $2');
        const remaining = totpRemaining();
        totpProgress.style.setProperty('--pct', `${(remaining / 30) * 100}%`);
        totpProgress.title = `Expira em ${remaining}s`;
      }
      updateTotp();
      const interval = setInterval(updateTotp, 1000);
      // Limpa interval se popup fechar
      window.addEventListener('beforeunload', () => clearInterval(interval), { once: true });

      totpField.querySelector('.cred-copy').addEventListener('click', async (e) => {
        const code = await totp(totpSecret);
        if (code) copyText(code, e.currentTarget);
      });
    }

    // Botão Preencher na aba ativa
    const fillBtn = card.querySelector('.cred-fill-btn');
    fillBtn.addEventListener('click', async () => {
      fillBtn.disabled = true;
      fillBtn.textContent = 'Preenchendo...';
      try {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error('sem aba ativa');
        const fillPayload = {
          login: loginValue,
          senha,
          totpCode: totpSecret ? await totp(totpSecret) : null,
        };
        await chrome.tabs.sendMessage(tab.id, {
          action: 'rataria:fill-now',
          payload: fillPayload,
        });
        fillBtn.textContent = 'Preenchido ✓';
        setTimeout(() => {
          fillBtn.textContent = 'Preencher';
          fillBtn.disabled = false;
        }, 1400);
      } catch (e) {
        console.error('[RatarIA] erro ao preencher:', e);
        fillBtn.textContent = 'Erro — tente o ícone';
        setTimeout(() => {
          fillBtn.textContent = 'Preencher';
          fillBtn.disabled = false;
        }, 2200);
      }
    });

    // Footer (expiração)
    const expiresIn = daysUntil(cred.data_expiracao);
    const foot = card.querySelector('.cred-foot-expiry');
    if (expiresIn != null) {
      foot.textContent = `Expira em ${expiresIn} ${expiresIn === 1 ? 'dia' : 'dias'}`;
      if (expiresIn <= 1) foot.style.color = 'rgba(251, 146, 60, 0.85)';
    }

    return card;
  }

  function renderCards(ferramenta, creds) {
    clearContent();
    creds.forEach((c) => {
      content.appendChild(buildCard(ferramenta, c));
    });
  }

  // ===== Tool launcher =====
  function renderToolLauncher(activeFerramenta) {
    const nav = document.getElementById('tool-launcher');
    nav.innerHTML = '';
    for (const [key, meta] of Object.entries(TOOL_META)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tool-chip' + (key === activeFerramenta ? ' active' : '');
      chip.innerHTML = `
        <img class="tool-chip-logo" src="${meta.logo}" alt="${meta.name}" />
        <span class="tool-chip-name">${meta.name}</span>
        ${key === activeFerramenta ? '<span class="tool-chip-active-dot" title="aba atual"></span>' : ''}
      `;
      chip.addEventListener('click', async () => {
        // Se já tá na ferramenta, foca a aba ativa em vez de abrir nova
        if (key === activeFerramenta) {
          window.close();
          return;
        }
        await chrome.tabs.create({ url: meta.openUrl });
        window.close();
      });
      nav.appendChild(chip);
    }
  }

  // ===== Boot =====
  (async () => {
    const status = await loadStatus();
    renderSyncPill(status);

    const tab = await getActiveTab();
    const host = tab?.url ? new URL(tab.url).hostname : null;
    const ferramenta = detectToolFromHost(host);

    renderToolLauncher(ferramenta);

    if (!ferramenta) {
      showNoTool();
      return;
    }

    const credsRes = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'rataria:get-credentials-for-tool', ferramenta },
        resolve
      );
    });

    if (!credsRes?.ok || !credsRes.creds?.length) {
      showNoCreds(ferramenta, credsRes?.error);
      return;
    }

    renderCards(ferramenta, credsRes.creds);
  })();
})();
