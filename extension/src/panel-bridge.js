// RatarIA Extension — Panel Bridge
// Roda no painel da RatarIA. Faz a ponte entre window.postMessage do site
// e chrome.runtime do background.

(function () {
  // Marcador pra o painel detectar a extensão
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
  const moMarker = new MutationObserver(injectMarker);
  if (document.documentElement) {
    moMarker.observe(document.documentElement, { childList: true, subtree: false });
  }

  function send(action, payload) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, ...payload }, (response) => {
        resolve(response || { ok: false, error: chrome.runtime.lastError?.message });
      });
    });
  }

  function reply(requestId, action, response) {
    window.postMessage(
      { source: 'rataria-extension', action, requestId, response },
      window.location.origin
    );
  }

  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== 'rataria-panel') return;

    const requestId = data.requestId;

    if (data.action === 'ping') {
      reply(requestId, 'pong', { version: chrome.runtime.getManifest().version });
      return;
    }

    if (data.action === 'sync-credentials') {
      const res = await send('rataria:sync-credentials', { credentials: data.credentials });
      reply(requestId, 'sync-response', res);
      return;
    }

    if (data.action === 'open-tool') {
      const res = await send('rataria:open-tool', {
        ferramenta: data.ferramenta,
        clearCookies: data.clearCookies,
      });
      reply(requestId, 'open-tool-response', res);
      return;
    }

    if (data.action === 'status') {
      const res = await send('rataria:status', {});
      reply(requestId, 'status-response', res);
      return;
    }
  });
})();
