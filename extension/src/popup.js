(function () {
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;

  function fmtTimeAgo(ts) {
    if (!ts) return 'nunca';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `há ${hrs} h`;
    const days = Math.floor(hrs / 24);
    return `há ${days} dias`;
  }

  chrome.runtime.sendMessage({ action: 'rataria:status' }, (res) => {
    const statusEl = document.getElementById('status');
    const dotEl = document.getElementById('status-dot');
    const titleEl = document.getElementById('status-title');
    const subEl = document.getElementById('status-sub');
    const toolsEl = document.getElementById('tools-list');

    if (!res?.ok) {
      statusEl.classList.add('empty');
      titleEl.textContent = 'Sem sincronização';
      subEl.textContent = 'Abra o painel pra começar';
      return;
    }

    const synced = res.syncedAt;
    const stale = synced && Date.now() - synced > 23 * 60 * 60 * 1000; // alerta perto da expiração 24h
    if (!synced) {
      statusEl.classList.add('empty');
      titleEl.textContent = 'Sem sincronização';
      subEl.textContent = 'Abra o painel pra começar';
    } else if (stale) {
      statusEl.classList.add('stale');
      titleEl.textContent = 'Sincronização antiga';
      subEl.textContent = `Última: ${fmtTimeAgo(synced)} — reabra o painel`;
    } else {
      statusEl.classList.add('synced');
      titleEl.textContent = 'Conectado';
      subEl.textContent = `Sincronizado ${fmtTimeAgo(synced)}`;
    }

    if (res.tools?.length) {
      toolsEl.innerHTML = res.tools
        .map(
          (t) => `<div class="tool-row"><strong>${t}</strong><span>ativo</span></div>`
        )
        .join('');
    }
  });
})();
