// RatarIA Extension — Flow Runner
// Utilitários compartilhados por todos os fluxos de login.
// Mostra um overlay de progresso e expõe funções de espera/preenchimento.

window.__RatarIA = window.__RatarIA || {};

window.__RatarIA.runner = (function () {
  const OVERLAY_ID = '__rataria_overlay__';

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

  async function waitFor(selector, { timeout = 15000, root = document } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = root.querySelector(selector);
      if (el) return el;
      await sleep(150);
    }
    throw new Error(`Timeout esperando ${selector}`);
  }

  async function waitForAny(selectors, opts = {}) {
    const start = Date.now();
    const timeout = opts.timeout || 15000;
    while (Date.now() - start < timeout) {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return { el, selector: sel };
      }
      await sleep(150);
    }
    throw new Error(`Timeout esperando qualquer de: ${selectors.join(', ')}`);
  }

  function setReactValue(input, value) {
    // O React rastreia o valor internamente; setar via descriptor força o evento.
    const proto = Object.getPrototypeOf(input);
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function typeInto(selector, value, opts = {}) {
    const input = await waitFor(selector, opts);
    input.focus();
    setReactValue(input, value);
    return input;
  }

  async function click(selector, opts = {}) {
    const btn = await waitFor(selector, opts);
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
      console.log('[RatarIA] Sem credenciais armazenadas — usuário deve ter aberto manualmente. Abortando overlay.');
      return;
    }

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
        helpers: { waitFor, waitForAny, typeInto, click, sleep, setReactValue },
      });
      setTitle(`Conectado ao ${config.toolName}!`);
      dismiss(1800);
    } catch (e) {
      console.error('[RatarIA] Fluxo falhou:', e);
      setTitle(`Erro: ${e.message}`);
      const active = document.querySelector('#__rataria_steps li.active');
      if (active) {
        active.classList.remove('active');
        active.classList.add('error');
        active.querySelector('.rataria-bullet').textContent = '✕';
      }
    }
  }

  return { run, waitFor, waitForAny, typeInto, click, sleep, setReactValue };
})();
