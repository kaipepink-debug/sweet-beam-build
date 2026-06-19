// RatarIA Extension — Fluxo de login do Gemini (via Google Accounts)

(function () {
  const runner = window.__RatarIA?.runner;
  if (!runner) {
    console.warn('[RatarIA] flow-runner não carregado antes do fluxo Gemini');
    return;
  }

  runner.run({
    ferramenta: 'gemini',
    toolName: 'Gemini',
    steps: [
      { key: 'email', label: 'Preenchendo e-mail Google' },
      { key: 'senha', label: 'Preenchendo senha' },
      { key: 'concluir', label: 'Abrindo Gemini' },
    ],
    async execute({ creds, steps, helpers }) {
      const { waitForAny, typeInto, submitForm, sleep, log, warn } = helpers;

      log('URL inicial:', location.href);

      // Se cair na tela de "Choose an account" (porque ainda tem conta logada apesar do logout)
      // a gente clica em "Use another account"
      try {
        const useAnother = await waitForAny(
          [
            'div[data-identifier]:has(div:contains("Use another account"))',
            'li:has-text("Use another account")',
            'div[role="link"]:has-text("Usar outra conta")',
            'div[role="link"]:has-text("Use another account")',
          ],
          { timeout: 1500 }
        );
        log('Tela de seleção de conta detectada — clicando "Usar outra conta"');
        useAnother.el.click();
        await sleep(800);
      } catch {
        // Não tava na tela de seleção, ok
      }

      // ETAPA 1 — E-mail
      steps.set('email', 'active');
      const emailField = await waitForAny(
        [
          'input[type="email"]',
          'input#identifierId',
          'input[name="identifier"]',
          'input[autocomplete="username"]',
        ],
        { timeout: 25000 }
      );
      log(`Campo e-mail Google via: ${emailField.selector}`);
      await typeInto(emailField.el, creds.login, { delayMs: 22 });
      await sleep(400);

      let nextBtn = null;
      try {
        const found = await waitForAny(
          [
            '#identifierNext button',
            '#identifierNext [role="button"]',
            'button[jsname="LgbsSe"]',
            'div#identifierNext',
          ],
          { timeout: 4000 }
        );
        nextBtn = found.el;
      } catch {
        warn('Botão Next do email não encontrado — vou tentar Enter');
      }

      await submitForm(emailField.el, { button: nextBtn, name: 'email-google' });
      steps.set('email', 'done');

      // ETAPA 2 — Senha (com animação delicada do Google)
      steps.set('senha', 'active');
      // O Google leva ~1-2s pra animar a transição
      await sleep(800);

      const passwordField = await waitForAny(
        [
          'input[type="password"][name="Passwd"]',
          'input[type="password"][name="password"]',
          'input[type="password"]',
          'input[autocomplete="current-password"]',
        ],
        { timeout: 25000 }
      );
      log(`Campo senha Google via: ${passwordField.selector}`);
      // Garante que o campo está visível e clicável (Google às vezes anima o foco)
      await sleep(600);
      await typeInto(passwordField.el, creds.senha, { delayMs: 22 });
      await sleep(400);

      let passwordNext = null;
      try {
        const found = await waitForAny(
          [
            '#passwordNext button',
            '#passwordNext [role="button"]',
            'button[jsname="LgbsSe"]',
            'div#passwordNext',
          ],
          { timeout: 4000 }
        );
        passwordNext = found.el;
      } catch {
        warn('Botão Next da senha não encontrado — Enter como fallback');
      }

      await submitForm(passwordField.el, { button: passwordNext, name: 'senha-google' });
      steps.set('senha', 'done');

      // ETAPA 3 — Espera chegar no Gemini
      steps.set('concluir', 'active');
      const start = Date.now();
      while (Date.now() - start < 60000) {
        if (location.hostname.includes('gemini.google.com')) {
          log('Gemini carregado:', location.href);
          steps.set('concluir', 'done');
          return;
        }

        if (
          document.querySelector('input[name="totpPin"], input[autocomplete="one-time-code"]') ||
          /challenge|signin\/v2\/challenge|signin\/challenge/.test(location.pathname)
        ) {
          throw new Error('Verificação extra do Google detectada — finalize manualmente');
        }

        const errBanner = document.querySelector('[jsname="B34EJ"], [role="alert"]');
        if (errBanner && errBanner.textContent.trim()) {
          throw new Error(`Google rejeitou: ${errBanner.textContent.trim().slice(0, 100)}`);
        }
        await sleep(500);
      }
      throw new Error('Timeout aguardando carregamento do Gemini');
    },
  });
})();
