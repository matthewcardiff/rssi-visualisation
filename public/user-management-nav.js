(() => {
  const key = 'vh-stage20-session';
  const dashboard = document.getElementById('vh26-connected-dashboard');
  if (!dashboard) return;
  let checking = false;
  const addLink = async () => {
    const nav = dashboard.querySelector('.vh26-sidebar nav');
    if (!nav || nav.querySelector('[data-user-admin-link]') || checking) return;
    let session;
    try { session = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { session = null; }
    if (!session?.access_token) return;
    checking = true;
    try {
      const response = await fetch('/api/acceptance', { method: 'POST', headers: { 'content-type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ op: 'whoami', access_token: session.access_token }) });
      if (!response.ok) return;
      const identity = await response.json();
      if (!identity.profiles?.some(profile => profile.active) || !identity.roles?.some(role => role.role === 'administrator')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.userAdminLink = 'true';
      button.textContent = '♙ User management';
      button.addEventListener('click', () => { window.location.href = '/admin-users.html'; });
      nav.append(button);
    } catch { /* The dashboard remains available if this optional navigation check fails. */ }
    finally { checking = false; }
  };
  const observer = new MutationObserver(addLink);
  observer.observe(dashboard, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  addLink();
})();
