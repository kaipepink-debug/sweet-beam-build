// RatarIA Extension — Panel Bridge
// Roda no painel da RatarIA (rataria.io, lovable preview, etc.).
// Faz a ponte entre window.postMessage do painel e chrome.runtime do background.

(function () {
  // Marca presença pra o painel detectar que a extensão tá instalada.
  const marker = document.createElement('div');
  marker.id = '__rataria_extension_installed__';
  marker.dataset.version = chrome.runtime.getManifest().version;
  marker.style.display = 'none';

  function injectMarker() {
    if (!document.documentElement) return;
    if (!document.getElementById(marker.id)) {
      document.documentElement.appendChild(marker);
    }
  }

  injectMarker();
  // Re-injeta após navegação SPA caso o React limpe o DOM
  const observer = new MutationObserver(injectMarker);
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: false });
  }

  // Escuta mensagens do painel
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== 'rataria-panel') return;

    if (data.action === 'open-tool') {
      chrome.runtime.sendMessage(
        {
          action: 'rataria:open-tool',
          ferramenta: data.ferramenta,
          login: data.login,
          senha: data.senha,
          totpSecret: data.totpSecret,
        },
        (response) => {
          window.postMessage(
            {
              source: 'rataria-extension',
              action: 'open-tool-response',
              requestId: data.requestId,
              response: response || { ok: false, error: 'sem resposta' },
            },
            window.location.origin
          );
        }
      );
    }

    if (data.action === 'ping') {
      window.postMessage(
        {
          source: 'rataria-extension',
          action: 'pong',
          version: chrome.runtime.getManifest().version,
          requestId: data.requestId,
        },
        window.location.origin
      );
    }
  });
})();
