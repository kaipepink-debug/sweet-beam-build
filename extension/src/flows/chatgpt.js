// RatarIA Extension — Fluxo de login do ChatGPT
// Detecta as etapas do auth.openai.com / chatgpt.com/auth/login

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
      { key: 'email', label: 'Preenchendo e-mail' },
      { key: 'senha', label: 'Preenchendo senha' },
      { key: 'concluir', label: 'Finalizando login' },
    ],
    async execute({ creds, steps, helpers }) {
      const { waitForAny, typeInto, click, sleep } = helpers;

      // Etapa 1 — Email
      steps.set('email', 'active');
      // Tela do ChatGPT pode mostrar primeiro um botão "Entrar" antes do form
      try {
        const continueBtn = await waitForAny(
          ['button[data-testid="login-button"]', 'a[data-testid="login-button"]'],
          { timeout: 3000 }
        );
        continueBtn.el.click();
      } catch {
        // sem botão de entrar — já estamos no form
      }

      // Form de email (auth.openai.com)
      const emailField = await waitForAny(
        ['input[name="username"]', 'input[type="email"]', 'input#email-input'],
        { timeout: 15000 }
      );
      await typeInto(emailField.selector, creds.login);
      await sleep(200);

      // Botão "Continuar"
      const continueEmail = await waitForAny(
        [
          'button[type="submit"]',
          'button[name="intent"][value="email"]',
          'button:has(span:text-is("Continue"))',
          'button[data-action-button-primary="true"]',
        ],
        { timeout: 6000 }
      );
      continueEmail.el.click();
      steps.set('email', 'done');

      // Etapa 2 — Senha
      steps.set('senha', 'active');
      const passwordField = await waitForAny(
        ['input[name="password"]', 'input[type="password"]'],
        { timeout: 15000 }
      );
      await typeInto(passwordField.selector, creds.senha);
      await sleep(200);

      const submitPwd = await waitForAny(
        [
          'button[type="submit"]',
          'button[data-action-button-primary="true"]',
          'button[name="action"][value="default"]',
        ],
        { timeout: 6000 }
      );
      submitPwd.el.click();
      steps.set('senha', 'done');

      // Etapa 3 — Aguarda redirect pra chatgpt.com
      steps.set('concluir', 'active');
      const start = Date.now();
      while (Date.now() - start < 30000) {
        if (location.hostname.includes('chatgpt.com') && !location.pathname.startsWith('/auth')) {
          steps.set('concluir', 'done');
          return;
        }
        // Se aparecer 2FA, paramos aqui — futuro: integrar com edge function de IMAP
        if (document.querySelector('input[name="code"], input[autocomplete="one-time-code"]')) {
          throw new Error('2FA detectado — preencha manualmente por enquanto');
        }
        await sleep(500);
      }
      steps.set('concluir', 'done');
    },
  });
})();
