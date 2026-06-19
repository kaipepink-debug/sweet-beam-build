// RatarIA Extension — Fluxo de login do Gemini (via Google Accounts)
// O Gemini usa autenticação Google em accounts.google.com.

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
      const { waitForAny, typeInto, click, sleep } = helpers;

      // Etapa 1 — Email
      steps.set('email', 'active');
      const emailField = await waitForAny(
        ['input[type="email"]', 'input#identifierId', 'input[name="identifier"]'],
        { timeout: 15000 }
      );
      await typeInto(emailField.selector, creds.login);
      await sleep(250);

      const nextBtn = await waitForAny(
        ['#identifierNext button', 'button[jsname="LgbsSe"]', 'div#identifierNext'],
        { timeout: 6000 }
      );
      nextBtn.el.click();
      steps.set('email', 'done');

      // Etapa 2 — Senha
      steps.set('senha', 'active');
      const passwordField = await waitForAny(
        ['input[type="password"][name="Passwd"]', 'input[type="password"]', 'input[name="password"]'],
        { timeout: 15000 }
      );
      // espera animação aparecer o campo
      await sleep(400);
      await typeInto(passwordField.selector, creds.senha);
      await sleep(300);

      const passwordNext = await waitForAny(
        ['#passwordNext button', 'div#passwordNext', 'button[jsname="LgbsSe"]'],
        { timeout: 6000 }
      );
      passwordNext.el.click();
      steps.set('senha', 'done');

      // Etapa 3 — Aguarda chegar no Gemini
      steps.set('concluir', 'active');
      const start = Date.now();
      while (Date.now() - start < 45000) {
        if (location.hostname.includes('gemini.google.com')) {
          steps.set('concluir', 'done');
          return;
        }
        // 2FA / desafios
        if (
          document.querySelector('input[name="totpPin"], input[autocomplete="one-time-code"]') ||
          /challenge|signin\/v2\/challenge/.test(location.pathname)
        ) {
          throw new Error('Verificação extra do Google detectada — finalize manualmente');
        }
        await sleep(500);
      }
      steps.set('concluir', 'done');
    },
  });
})();
