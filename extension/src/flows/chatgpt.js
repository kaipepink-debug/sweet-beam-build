// RatarIA Extension — Fluxo de login do ChatGPT
// Cobre auth.openai.com e variações de tela do chatgpt.com/auth/login

(function () {
  const runner = window.__RatarIA?.runner;
  if (!runner) {
    console.warn('[RatarIA] flow-runner não carregado antes do fluxo ChatGPT');
    return;
  }

  runner.run({
    ferramenta: 'chatgpt',
    toolName: 'ChatGPT',
    steps: [
      { key: 'inicio', label: 'Abrindo formulário de login' },
      { key: 'email', label: 'Preenchendo e-mail' },
      { key: 'senha', label: 'Preenchendo senha' },
      { key: 'concluir', label: 'Finalizando login' },
    ],
    async execute({ creds, steps, helpers }) {
      const { waitForAny, typeInto, submitForm, sleep, log, warn } = helpers;

      // ETAPA 0 — Algumas vezes chega numa tela de "Welcome / Continue" antes do form
      steps.set('inicio', 'active');
      log('URL inicial:', location.href);

      // Botão "Log in" / "Sign in" da tela inicial (se houver)
      try {
        const startBtn = await waitForAny(
          [
            'button[data-testid="login-button"]',
            'a[data-testid="login-button"]',
            'a[href*="/login"]',
            'button[data-testid="mobile-login-button"]',
          ],
          { timeout: 2500 }
        );
        log('Tela de boas-vindas detectada — clicando entrar');
        startBtn.el.click();
        await sleep(800);
      } catch {
        // Já estamos direto no form. Tudo bem.
      }
      steps.set('inicio', 'done');

      // ETAPA 1 — E-mail (auth.openai.com / Auth0)
      steps.set('email', 'active');
      const emailField = await waitForAny(
        [
          'input[name="username"]',
          'input[type="email"]',
          'input#email-input',
          'input[autocomplete="email"]',
          'input[autocomplete="username"]',
          'input[name="email"]',
        ],
        { timeout: 20000 }
      );
      log(`Campo e-mail encontrado via seletor: ${emailField.selector}`);
      await typeInto(emailField.el, creds.login, { delayMs: 18 });
      await sleep(300);

      // Botão "Continue" — várias variações
      let continueBtn = null;
      try {
        const found = await waitForAny(
          [
            'button[type="submit"]:not([disabled])',
            'button[name="intent"][value="email"]',
            'button[data-action-button-primary="true"]',
            'button.continue-btn',
            'button[name="action"][value="default"]',
          ],
          { timeout: 4000 }
        );
        continueBtn = found.el;
        log(`Botão continuar encontrado via: ${found.selector}`);
      } catch (e) {
        warn('Botão continuar não localizado — vou tentar Enter');
      }

      await submitForm(emailField.el, { button: continueBtn, name: 'email' });
      steps.set('email', 'done');

      // ETAPA 2 — Senha
      steps.set('senha', 'active');
      const passwordField = await waitForAny(
        [
          'input[name="password"]',
          'input[type="password"]',
          'input#password',
          'input[autocomplete="current-password"]',
        ],
        { timeout: 20000 }
      );
      log(`Campo senha encontrado via: ${passwordField.selector}`);
      await typeInto(passwordField.el, creds.senha, { delayMs: 18 });
      await sleep(300);

      let submitPwd = null;
      try {
        const found = await waitForAny(
          [
            'button[type="submit"]:not([disabled])',
            'button[data-action-button-primary="true"]',
            'button[name="action"][value="default"]',
            'button[name="intent"][value="password"]',
          ],
          { timeout: 4000 }
        );
        submitPwd = found.el;
        log(`Botão senha encontrado via: ${found.selector}`);
      } catch {
        warn('Botão de submit da senha não encontrado — usando Enter');
      }

      await submitForm(passwordField.el, { button: submitPwd, name: 'senha' });
      steps.set('senha', 'done');

      // ETAPA 3 — Espera redirect
      steps.set('concluir', 'active');
      const start = Date.now();
      while (Date.now() - start < 45000) {
        // 2FA / verificações extras
        if (
          document.querySelector('input[name="code"], input[autocomplete="one-time-code"], input[name="totp"]')
        ) {
          throw new Error('2FA detectado — finalize manualmente nessa aba');
        }

        // Tela de erro do Auth0
        const errorBanner = document.querySelector('[role="alert"], .ulp-error, .auth0-error, .error-message');
        if (errorBanner && errorBanner.textContent.trim()) {
          throw new Error(`Login rejeitado: ${errorBanner.textContent.trim().slice(0, 100)}`);
        }

        if (location.hostname.includes('chatgpt.com') && !location.pathname.startsWith('/auth') && !location.pathname.startsWith('/login')) {
          log('Login concluído — redirecionado pra', location.href);
          steps.set('concluir', 'done');
          return;
        }
        await sleep(500);
      }
      throw new Error('Timeout aguardando redirect pro chatgpt.com');
    },
  });
})();
