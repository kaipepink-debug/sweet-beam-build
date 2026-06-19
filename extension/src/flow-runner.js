// RatarIA Extension — Flow Runner
// Utilitários compartilhados pelos fluxos de login.

window.__RatarIA = window.__RatarIA || {};

window.__RatarIA.runner = (function () {
  const OVERLAY_ID = '__rataria_overlay__';
  const LOG_PREFIX = '[RatarIA]';

  function log(...args) { console.log(LOG_PREFIX, ...args); }
  function warn(...args) { console.warn(LOG_PREFIX, ...args); }
  function err(...args) { console.error(LOG_PREFIX, ...args); }

  function createOverlay() {
    if (document.getElementById(OVERLAY_ID)) return document.getElementById(OVERLAY_ID);
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="rataria-card">
        <div class="rataria-logo">
          <div class="rataria-spinner"></div>
          <span>RatarIA</span>
        </div>
        <div class="rataria-title" id="__rataria_title">Conectando...</div>
        <ul class="rataria-steps" id="__rataria_steps"></ul>
        <button class="rataria-close" id="__rataria_close" title="Fechar">×</button>
      </div>
    `;
    document.documentElement.appendChild(overlay);
    document.getElementById('__rataria_close').addEventListener('click', () => overlay.remove());
    return overlay;
  }

  function setSteps(steps) {
    const ul = document.getElementById('__rataria_steps');
    if (!ul) return;
    ul.innerHTML = '';
    steps.forEach((s) => {
      const li = document.createElement('li');
      li.dataset.key = s.key;
      li.innerHTML = `<span class="rataria-bullet">○</span><span>${s.label}</span>`;
      ul.appendChild(li);
    });
  }

  function updateStep(key, state) {
    const li = document.querySelector(`#__rataria_steps li[data-key="${key}"]`);
    if (!li) return;
    const bullet = li.querySelector('.rataria-bullet');
    li.classList.remove('done', 'active', 'error');
    if (state === 'active') {
      li.classList.add('active');
      bullet.textContent = '◌';
    } else if (state === 'done') {
      li.classList.add('done');
      bullet.textContent = '✓';
    } else if (state === 'error') {
      li.classList.add('error');
      bullet.textContent = '✕';
    }
  }

  function setTitle(text) {
    const el = document.getElementById('__rataria_title');
    if (el) el.textContent = text;
  }

  function dismiss(delayMs = 1500) {
    setTimeout(() => {
      const el = document.getElementById(OVERLAY_ID);
      if (el) el.remove();
    }, delayMs);
  }

  // ---------- DOM helpers ----------
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Verifica se elemento está visível (não display:none, não dimensão zero)
  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  async function waitFor(selector, { timeout = 15000, root = document, visible = true } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = root.querySelector(selector);
      if (el && (!visible || isVisible(el))) return el;
      await sleep(150);
    }
    throw new Error(`Timeout esperando ${selector} (visible=${visible})`);
  }

  async function waitForAny(selectors, opts = {}) {
    const start = Date.now();
    const timeout = opts.timeout || 15000;
    const visible = opts.visible !== false;
    while (Date.now() - start < timeout) {
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (!visible || isVisible(el)) return { el, selector: sel };
        }
      }
      await sleep(150);
    }
    throw new Error(`Timeout esperando qualquer de: ${selectors.join(', ')}`);
  }

  // Seta valor em campo controlado por React/Vue/etc. usando os triggers nativos.
  // Necessário porque frameworks rastreiam internamente o valor.
  function setNativeValue(input, value) {
    const proto = Object.getPrototypeOf(input);
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }
  }

  // Simula uma digitação real: foca, limpa, digita caractere por caractere
  // disparando keydown/keypress/input/keyup. Funciona melhor em frameworks SPA.
  async function typeHumanLike(input, value, { delayMs = 12, clearFirst = true } = {}) {
    input.focus();
    input.click();
    await sleep(60);

    if (clearFirst && input.value) {
      // Seleciona tudo + delete
      input.select?.();
      setNativeValue(input, '');
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    }

    // Estratégia 1: setar via descriptor + disparar eventos sintéticos
    setNativeValue(input, value);
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Estratégia 2: também simula key events pra cada char (alguns sites detectam só assim)
    for (const ch of value) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keypress', { key: ch, bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
      if (delayMs) await sleep(delayMs);
    }

    // Garante que o blur dispare (alguns forms validam só no blur)
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    input.focus(); // restaura foco
  }

  async function typeInto(selector, value, opts = {}) {
    const input = typeof selector === 'string' ? await waitFor(selector, opts) : selector;
    log(`Preenchendo "${selector}" com valor de ${value.length} chars`);
    await typeHumanLike(input, value, opts);
    return input;
  }

  // Tenta múltiplas estratégias de submit:
  // 1. Clicar no botão (se passado)
  // 2. Pressionar Enter no input ativo
  // 3. Submit do form pai
  async function submitForm(input, { button, name } = {}) {
    log(`Tentando submit (${name || 'form'})`);

    if (button) {
      try {
        button.scrollIntoView({ block: 'center' });
        button.focus();
        button.click();
        log('Submit via click no botão OK');
        await sleep(400);
        return true;
      } catch (e) {
        warn('Click no botão falhou:', e.message);
      }
    }

    // Fallback 1: Enter no input
    if (input) {
      try {
        input.focus();
        ['keydown', 'keypress', 'keyup'].forEach((type) => {
          input.dispatchEvent(
            new KeyboardEvent(type, {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true,
            })
          );
        });
        log('Submit via Enter OK');
        await sleep(400);
        return true;
      } catch (e) {
        warn('Enter falhou:', e.message);
      }
    }

    // Fallback 2: form.requestSubmit() ou .submit()
    const form = input?.closest('form');
    if (form) {
      try {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.submit();
        }
        log('Submit via form OK');
        await sleep(400);
        return true;
      } catch (e) {
        warn('form.submit falhou:', e.message);
      }
    }

    throw new Error('Nenhuma estratégia de submit funcionou');
  }

  async function click(selector, opts = {}) {
    const btn = await waitFor(selector, opts);
    btn.scrollIntoView({ block: 'center' });
    btn.click();
    return btn;
  }

  async function getCredentials(ferramenta) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          { action: 'rataria:get-credentials', ferramenta },
          (res) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            if (!res?.ok) {
              reject(new Error(res?.error || 'sem credenciais'));
              return;
            }
            resolve(res.creds);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  async function run(config) {
    const { ferramenta, steps, execute } = config;
    let creds;
    try {
      creds = await getCredentials(ferramenta);
    } catch (e) {
      log(`Sem credenciais armazenadas pra ${ferramenta} — abertura manual, abortando overlay.`);
      return;
    }

    log(`Iniciando fluxo de ${config.toolName} (URL atual: ${location.href})`);
    createOverlay();
    setTitle(`Conectando ao ${config.toolName}...`);
    setSteps(steps);

    try {
      await execute({
        creds,
        steps: {
          set: updateStep,
          title: setTitle,
        },
        helpers: {
          waitFor, waitForAny, typeInto, click, sleep,
          setNativeValue, typeHumanLike, submitForm,
          log, warn, isVisible,
        },
      });
      log(`Fluxo ${config.toolName} concluído com sucesso`);
      setTitle(`Conectado ao ${config.toolName}!`);
      dismiss(1800);
    } catch (e) {
      err(`Fluxo ${config.toolName} falhou:`, e);
      setTitle(`Erro: ${e.message}`);
      const active = document.querySelector('#__rataria_steps li.active');
      if (active) {
        active.classList.remove('active');
        active.classList.add('error');
        active.querySelector('.rataria-bullet').textContent = '✕';
      }
    }
  }

  return {
    run, waitFor, waitForAny, typeInto, click, sleep,
    setNativeValue, typeHumanLike, submitForm, isVisible,
  };
})();
