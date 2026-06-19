// RatarIA Extension — Login Injector (modelo Proton Pass)
// Detecta campos de login em ferramentas conhecidas, injeta ícone flutuante
// e abre dropdown com credenciais armazenadas. Preenchimento acontece em
// gesture de usuário (resolve qualquer problema de React/Vue state sync).

(function () {
  if (window.__RatarIA_loginInjected) return;
  window.__RatarIA_loginInjected = true;

  const LOG = '[RatarIA]';
  const ICON_URL = chrome.runtime.getURL('icons/icon-48.png');

  // Mapeia hostname → ferramenta lógica + metadados visuais
  const TOOL_BY_HOST = {
    'chatgpt.com': 'chatgpt',
    'auth.openai.com': 'chatgpt',
    'chat.openai.com': 'chatgpt',
    'accounts.google.com': 'gemini',
    'gemini.google.com': 'gemini',
  };

  const TOOL_META = {
    chatgpt: { name: 'ChatGPT', logo: chrome.runtime.getURL('icons/tools/chatgpt.png'), accent: '#10a37f' },
    gemini: { name: 'Gemini', logo: chrome.runtime.getURL('icons/tools/gemini.png'), accent: '#4285f4' },
  };

  // Escolhe o melhor "identificador" pra exibir/usar como login.
  // Prioriza 'login' (campo do form admin) e cai pra 'email_cliente' se vazio.
  function pickLogin(c) {
    const candidates = [c?.login, c?.email_cliente, c?.email, c?.username];
    for (const v of candidates) {
      if (v && typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  }

  function detectTool() {
    const host = location.hostname;
    if (TOOL_BY_HOST[host]) return TOOL_BY_HOST[host];
    // Fallback subdomain check
    for (const h of Object.keys(TOOL_BY_HOST)) {
      if (host.endsWith('.' + h) || host === h) return TOOL_BY_HOST[h];
    }
    return null;
  }

  const ferramenta = detectTool();
  if (!ferramenta) {
    console.log(LOG, 'host não corresponde a ferramenta conhecida, abortando.');
    return;
  }
  console.log(LOG, `login-injector ativo em ${location.hostname} (ferramenta=${ferramenta})`);

  // ---------- DOM helpers ----------
  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && +style.opacity > 0;
  }

  function findEmailInputs() {
    const selectors = [
      'input[type="email"]',
      'input[name="username"]',
      'input[name="identifier"]',
      'input[name="email"]',
      'input#identifierId',
      'input#email-input',
      'input[autocomplete="email"]',
      'input[autocomplete="username"]',
      'input[placeholder*="mail" i]',
    ];
    const found = new Set();
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        if (isVisible(el) && !el.dataset.rataria) found.add(el);
      });
    }
    return [...found];
  }

  function findPasswordInputs() {
    const found = new Set();
    document.querySelectorAll('input[type="password"]').forEach((el) => {
      if (isVisible(el) && !el.dataset.rataria) found.add(el);
    });
    return [...found];
  }

  // ---------- Preenchimento (3 estratégias em cascata) ----------
  function setNativeValue(input, value) {
    const proto = Object.getPrototypeOf(input);
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor?.set) descriptor.set.call(input, value);
    else input.value = value;
  }

  function clearInput(input) {
    input.focus();
    input.click();
    if (input.setSelectionRange) {
      try { input.setSelectionRange(0, input.value?.length || 0); } catch {}
    }
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    if (input.value) {
      setNativeValue(input, '');
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    }
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  // Preenche um único input com cascata de estratégias e VERIFICA visualmente.
  async function fillInput(input, value) {
    if (!input || !value) return false;

    input.scrollIntoView({ block: 'center' });
    input.focus();
    input.click();
    await sleep(50);
    clearInput(input);
    await sleep(50);

    const verifyFilled = () => (input.value || '').trim() === value.trim();

    // A — execCommand (mais confiável em user gesture)
    try {
      input.focus();
      input.click();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, value);
      await sleep(80);
      if (verifyFilled()) { console.log(LOG, 'fill OK via execCommand'); finalize(input); return true; }
    } catch (e) { console.warn(LOG, 'execCommand falhou:', e); }

    // B — Native setter + InputEvent
    try {
      setNativeValue(input, value);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(80);
      if (verifyFilled()) { console.log(LOG, 'fill OK via native setter'); finalize(input); return true; }
    } catch (e) { console.warn(LOG, 'native setter falhou:', e); }

    // C — char-por-char com KeyboardEvent
    try {
      clearInput(input);
      await sleep(40);
      for (const ch of value) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
        setNativeValue(input, (input.value || '') + ch);
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
        await sleep(15);
      }
      if (verifyFilled()) { console.log(LOG, 'fill OK via char-por-char'); finalize(input); return true; }
    } catch (e) { console.warn(LOG, 'char-por-char falhou:', e); }

    console.error(LOG, `Não consegui preencher input. Valor atual: "${input.value}", esperado: "${value}"`);
    return false;
  }

  function finalize(input) {
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    input.focus();
  }

  // ---------- Comunicação com background ----------
  function getCredentials() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'rataria:get-credentials-for-tool', ferramenta },
        (res) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message, creds: [] });
            return;
          }
          resolve(res || { ok: false, error: 'sem resposta', creds: [] });
        }
      );
    });
  }

  // ---------- UI: ícone + dropdown ----------
  function createIcon(input) {
    // Marca input
    input.dataset.rataria = '1';

    const wrapper = document.createElement('div');
    wrapper.className = 'rataria-icon-wrapper';
    wrapper.setAttribute('aria-label', 'Entrar com RatarIA');
    wrapper.innerHTML = `
      <button type="button" class="rataria-icon-btn" tabindex="-1">
        <img src="${ICON_URL}" alt="RatarIA" />
        <span class="rataria-icon-tooltip">Entrar com RatarIA</span>
      </button>
    `;

    // Posiciona absoluto à direita do input
    document.body.appendChild(wrapper);
    function reposition() {
      const rect = input.getBoundingClientRect();
      const size = Math.max(20, Math.min(28, rect.height - 12));
      wrapper.style.width = size + 'px';
      wrapper.style.height = size + 'px';
      wrapper.style.position = 'fixed';
      wrapper.style.top = rect.top + rect.height / 2 - size / 2 + 'px';
      wrapper.style.left = rect.right - size - 8 + 'px';
      wrapper.style.zIndex = '2147483646';
    }
    reposition();

    // Reposiciona em scroll/resize
    const onUpdate = () => reposition();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    // ResizeObserver no input
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(onUpdate);
      ro.observe(input);
      wrapper._rataria_ro = ro;
    }
    // MutationObserver no body (caso o input seja desmontado)
    const mo = new MutationObserver(() => {
      if (!document.contains(input)) {
        wrapper.remove();
        cleanup();
      } else {
        reposition();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    function cleanup() {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
      wrapper._rataria_ro?.disconnect();
      mo.disconnect();
    }

    // Adiciona padding-right no input pra não sobrepor o texto
    const currentPaddingRight = parseInt(getComputedStyle(input).paddingRight) || 0;
    if (currentPaddingRight < 36) {
      input.style.paddingRight = '36px';
    }

    wrapper.querySelector('.rataria-icon-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await showDropdown(input, wrapper);
    });

    return wrapper;
  }

  let currentDropdown = null;

  async function showDropdown(input, anchor) {
    if (currentDropdown) {
      currentDropdown.remove();
      currentDropdown = null;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'rataria-dropdown';
    dropdown.innerHTML = `
      <div class="rataria-dropdown-header">
        <img src="${ICON_URL}" class="rataria-dd-logo" alt="" />
        <div class="rataria-dd-title">
          <strong>RatarIA</strong>
          <span>Escolha uma conta</span>
        </div>
      </div>
      <div class="rataria-dropdown-body" id="__rataria_dd_body">
        <div class="rataria-dd-loading">
          <div class="rataria-dd-spinner"></div>
          <span>Buscando contas...</span>
        </div>
      </div>
      <div class="rataria-dropdown-footer">
        <span class="rataria-dd-foot-label">${chrome.runtime.getManifest().name}</span>
        <span class="rataria-dd-foot-version">v${chrome.runtime.getManifest().version}</span>
      </div>
    `;
    document.body.appendChild(dropdown);
    currentDropdown = dropdown;

    function position() {
      const rect = input.getBoundingClientRect();
      const ddRect = dropdown.getBoundingClientRect();
      const width = Math.max(rect.width, 300);
      const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left));
      const top = rect.bottom + 6;
      const willOverflow = top + ddRect.height > window.innerHeight - 8;
      dropdown.style.position = 'fixed';
      dropdown.style.left = left + 'px';
      dropdown.style.width = width + 'px';
      dropdown.style.zIndex = '2147483647';
      if (willOverflow) {
        dropdown.style.top = (rect.top - ddRect.height - 6) + 'px';
      } else {
        dropdown.style.top = top + 'px';
      }
    }
    position();
    requestAnimationFrame(position);

    const onClickOutside = (e) => {
      if (!dropdown.contains(e.target) && !anchor.contains(e.target)) {
        closeDropdown();
      }
    };
    const onEsc = (e) => { if (e.key === 'Escape') closeDropdown(); };
    setTimeout(() => {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onEsc);
    }, 0);

    function closeDropdown() {
      dropdown.classList.add('rataria-dd-leaving');
      setTimeout(() => dropdown.remove(), 150);
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
      if (currentDropdown === dropdown) currentDropdown = null;
    }

    const res = await getCredentials();
    const body = dropdown.querySelector('#__rataria_dd_body');

    if (!res.ok || !res.creds?.length) {
      const reason = res.error || 'Nenhuma conta disponível';
      const isUnsync = /expir|sync|painel/i.test(reason);
      body.innerHTML = `
        <div class="rataria-dd-empty">
          <div class="rataria-dd-empty-icon">${isUnsync ? '⟳' : '⚠'}</div>
          <div class="rataria-dd-empty-text">${isUnsync ? 'Suas contas ainda não sincronizaram' : 'Nenhuma conta cadastrada'}</div>
          <div class="rataria-dd-empty-hint">${isUnsync ? 'Abra o painel da RatarIA e volte aqui' : 'Fale com a equipe pelo WhatsApp'}</div>
        </div>
      `;
      return;
    }

    body.innerHTML = '';
    const meta = TOOL_META[ferramenta] || { name: ferramenta, logo: ICON_URL };
    res.creds.forEach((c, i) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'rataria-dd-item';
      const loginValue = pickLogin(c);
      const expiresIn = c.data_expiracao ? daysUntil(c.data_expiracao) : null;
      const fallbackLetter = (loginValue || meta.name || '?').charAt(0).toUpperCase();
      item.innerHTML = `
        <div class="rataria-dd-item-avatar">
          <img src="${meta.logo}" alt="${meta.name}" onerror="this.replaceWith(Object.assign(document.createElement('span'), {textContent:'${fallbackLetter}'}))" />
        </div>
        <div class="rataria-dd-item-content">
          <div class="rataria-dd-item-tool">${meta.name} <span class="rataria-dd-item-badge">ativo</span></div>
          <div class="rataria-dd-item-login">${loginValue ? maskLogin(loginValue) : '<em style="color:rgba(255,255,255,0.4)">sem e-mail cadastrado</em>'}</div>
        </div>
        <div class="rataria-dd-item-arrow">›</div>
      `;
      // Meta (expiração) na linha de baixo
      if (expiresIn != null) {
        const meta = document.createElement('div');
        meta.className = 'rataria-dd-item-meta-row';
        meta.textContent = `Expira em ${expiresIn} ${expiresIn === 1 ? 'dia' : 'dias'}`;
        item.querySelector('.rataria-dd-item-content').appendChild(meta);
      }
      item.addEventListener('click', async () => {
        if (!loginValue) {
          showToast('Essa conta está sem e-mail cadastrado no admin. Avise a equipe.', 'error');
          return;
        }
        item.classList.add('rataria-dd-item-loading');
        await fillCredential(input, { ...c, _loginToUse: loginValue });
        closeDropdown();
      });
      body.appendChild(item);
    });
    position();
  }

  function daysUntil(iso) {
    const ms = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  }

  function maskLogin(login) {
    if (!login) return '?';
    const [user, domain] = login.split('@');
    if (!domain) return login;
    const shown = user.slice(0, Math.min(3, user.length));
    const hidden = '•'.repeat(Math.max(2, user.length - shown.length));
    return `${shown}${hidden}@${domain}`;
  }

  async function fillCredential(emailInput, cred) {
    const loginValue = cred._loginToUse || pickLogin(cred);
    if (!loginValue) {
      showToast('Conta sem e-mail cadastrado. Avise a equipe.', 'error');
      return;
    }
    if (!cred.senha) {
      showToast('Conta sem senha cadastrada. Avise a equipe.', 'error');
      return;
    }
    console.log(LOG, `Preenchendo credencial: ${loginValue}`);
    const ok1 = await fillInput(emailInput, loginValue);
    if (!ok1) {
      showToast('Falha ao preencher o e-mail. Tente clicar de novo.', 'error');
      return;
    }
    await sleep(120);

    // Procura senha (pode não estar na mesma tela)
    const pwd = findPasswordInputs()[0];
    if (pwd) {
      const ok2 = await fillInput(pwd, cred.senha);
      if (!ok2) {
        showToast('E-mail preenchido. Não consegui preencher a senha.', 'warning');
        return;
      }
      showToast('Conta preenchida. Clique em Continuar.', 'success');
    } else {
      showToast('E-mail preenchido. Clique em Continuar e eu preencho a senha na próxima tela.', 'success');
      // Armazena temporariamente pro próximo passo (quando aparecer campo de senha)
      window.__RatarIA_pendingPwd = cred.senha;
    }
  }

  function showToast(message, kind = 'success') {
    const toast = document.createElement('div');
    toast.className = `rataria-toast rataria-toast-${kind}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('rataria-toast-in'));
    setTimeout(() => {
      toast.classList.remove('rataria-toast-in');
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  // ---------- Scan + observador de mutações ----------
  function scanAndInject() {
    findEmailInputs().forEach(createIcon);
    findPasswordInputs().forEach((pwd) => {
      // Se temos senha pendente, autopreenche
      if (window.__RatarIA_pendingPwd && !pwd.dataset.rataria) {
        pwd.dataset.rataria = '1';
        fillInput(pwd, window.__RatarIA_pendingPwd).then((ok) => {
          if (ok) {
            showToast('Senha preenchida. Clique em Continuar.', 'success');
            window.__RatarIA_pendingPwd = null;
          }
        });
      } else if (!pwd.dataset.rataria) {
        createIcon(pwd);
      }
    });
    // TOTP pendente
    if (window.__RatarIA_pendingTotp) {
      const totp = document.querySelector('input[autocomplete="one-time-code"], input[name="code"], input[name="totp"], input[name="totpPin"]');
      if (totp && isVisible(totp) && !totp.dataset.rataria) {
        totp.dataset.rataria = '1';
        fillInput(totp, window.__RatarIA_pendingTotp).then((ok) => {
          if (ok) {
            showToast('Código 2FA preenchido.', 'success');
            window.__RatarIA_pendingTotp = null;
          }
        });
      }
    }
  }

  // Listener pra mensagem vinda do popup: "preenche agora"
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.action !== 'rataria:fill-now') return;
    (async () => {
      const payload = msg.payload || {};
      const emails = findEmailInputs();
      const pwds = findPasswordInputs();
      let filledAny = false;
      if (emails[0] && payload.login) {
        filledAny = (await fillInput(emails[0], payload.login)) || filledAny;
      }
      if (pwds[0] && payload.senha) {
        filledAny = (await fillInput(pwds[0], payload.senha)) || filledAny;
      } else if (payload.senha) {
        // Senha vai ser preenchida quando aparecer
        window.__RatarIA_pendingPwd = payload.senha;
      }
      // Se tiver código TOTP, tenta preencher input com autocomplete one-time-code
      if (payload.totpCode) {
        const totpInput = document.querySelector('input[autocomplete="one-time-code"], input[name="code"], input[name="totp"], input[name="totpPin"]');
        if (totpInput && isVisible(totpInput)) {
          await fillInput(totpInput, payload.totpCode);
        } else {
          window.__RatarIA_pendingTotp = payload.totpCode;
        }
      }
      sendResponse({ ok: filledAny });
    })();
    return true;
  });

  scanAndInject();

  const mo = new MutationObserver(() => scanAndInject());
  mo.observe(document.body || document.documentElement, { childList: true, subtree: true });

  // Re-scan periódico nos primeiros segundos (SPAs)
  let scans = 0;
  const periodic = setInterval(() => {
    scanAndInject();
    scans++;
    if (scans >= 20) clearInterval(periodic);
  }, 500);
})();
