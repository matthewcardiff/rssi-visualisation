(() => {
  const sessionKey = 'vh-stage20-session';
  const $ = id => document.getElementById(id);
  let session = null;
  let users = [];
  let departments = [];
  let busy = false;
  const setStatus = (id, message, error = false) => { $(id).textContent = message; $(id).classList.toggle('error', error); };
  const readSession = () => { try { return JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { return null; } };
  const request = async (op, extra = {}) => {
    if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
    const response = await fetch('/api/acceptance', { method: 'POST', headers: { 'content-type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ op, access_token: session.access_token, ...extra }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'The request could not be completed');
    return result;
  };
  const admin = async (admin_op, extra = {}) => request('user_admin', { admin_op, ...extra });
  const roleLabel = role => ({ administrator: 'Administrator', executive: 'Executive', meeting_host: 'Meeting host', finance: 'Finance', department_manager: 'Department manager', department_contributor: 'Department contributor' }[role] || role);
  const makeButton = (label, className, action) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'button' + (className ? ' ' + className : ''); button.textContent = label; button.addEventListener('click', action); return button; };
  const selectedDepartments = () => [...$('departments').selectedOptions].map(option => option.value);
  function renderUsers() {
    const body = $('users-body');
    body.replaceChildren();
    const needle = $('search-users').value.trim().toLowerCase();
    const shown = users.filter(user => [user.email, user.display_name, ...(user.departments || [])].join(' ').toLowerCase().includes(needle));
    if (!shown.length) { const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 6; cell.className = 'empty'; cell.textContent = 'No matching users.'; row.append(cell); body.append(row); return; }
    shown.forEach(user => {
      const row = document.createElement('tr');
      const identity = document.createElement('td'); const name = document.createElement('strong'); name.textContent = user.display_name || 'Name not set'; const email = document.createElement('div'); email.textContent = user.email; email.className = 'help'; identity.append(name, email);
      const roleCell = document.createElement('td'); (user.roles || []).forEach(role => { const pill = document.createElement('span'); pill.className = 'pill'; pill.textContent = roleLabel(role); roleCell.append(pill); });
      const departmentCell = document.createElement('td'); departmentCell.textContent = (user.departments || []).join(', ') || 'All departments';
      const state = document.createElement('td'); const status = document.createElement('span'); status.className = 'pill' + (!user.active ? ' inactive' : !user.confirmed ? ' pending' : ''); status.textContent = !user.active ? 'Disabled' : !user.confirmed ? 'Awaiting email verification' : 'Active'; state.append(status);
      const lastSignIn = document.createElement('td'); lastSignIn.textContent = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-GB') : 'Never';
      const actions = document.createElement('td');
      actions.append(makeButton(user.confirmed ? 'Send password reset' : 'Resend setup email', '', async button => { void button; }));
      const resetButton = actions.lastElementChild;
      resetButton.addEventListener('click', async () => {
        resetButton.disabled = true;
        try { const result = await admin(user.confirmed ? 'reset' : 'resend_setup', { user_id: user.id }); setStatus('users-status', `${result.message || 'Email sent'} · ${user.email}`); }
        catch (error) { setStatus('users-status', error.message, true); }
        finally { resetButton.disabled = false; }
      });
      if (user.active) actions.append(makeButton('Deactivate access', 'danger', async () => {
        if (!window.confirm(`Disable Visualisation Hub access for ${user.email}? Their reports and history will be retained.`)) return;
        const button = actions.lastElementChild; button.disabled = true;
        try { await admin('deactivate', { user_id: user.id }); await loadUsers(); setStatus('users-status', `Access disabled for ${user.email}.`); }
        catch (error) { setStatus('users-status', error.message, true); button.disabled = false; }
      }));
      else actions.append(makeButton('Restore access', '', async () => {
        const button = actions.lastElementChild; button.disabled = true;
        try { await admin('reactivate', { user_id: user.id }); await loadUsers(); setStatus('users-status', `Access restored for ${user.email}.`); }
        catch (error) { setStatus('users-status', error.message, true); button.disabled = false; }
      }));
      row.append(identity, roleCell, departmentCell, state, lastSignIn, actions); body.append(row);
    });
  }
  async function loadUsers() {
    if (busy) return;
    busy = true; $('refresh-users').disabled = true; setStatus('users-status', 'Loading user accounts…');
    try { const result = await admin('list'); users = result.users || []; departments = result.departments || departments; renderUsers(); setStatus('users-status', `${users.length} accounts · updated just now`); }
    catch (error) { setStatus('users-status', error.message, true); if (/administrator|session|sign in/i.test(error.message)) setTimeout(() => { window.location.href = '/'; }, 1400); }
    finally { busy = false; $('refresh-users').disabled = false; }
  }
  async function boot() {
    session = readSession();
    if (!session?.access_token) { setStatus('users-status', 'Sign in with an administrator account to manage users. Returning to sign-in…', true); setTimeout(() => { window.location.href = '/'; }, 1600); return; }
    try {
      let identity;
      try { identity = await request('whoami'); }
      catch { const fresh = await request('refresh', { refresh_token: session.refresh_token }); session = fresh; sessionStorage.setItem(sessionKey, JSON.stringify(session)); identity = await request('whoami'); }
      if (!identity.profiles?.some(profile => profile.active) || !identity.roles?.some(role => role.role === 'administrator')) throw new Error('Administrator access required. Returning to sign-in…');
      const form = $('invite-form');
      const departmentsResult = await admin('departments'); departments = departmentsResult.departments || [];
      departments.forEach(department => { const option = document.createElement('option'); option.value = department.id; option.textContent = department.display_name; $('departments').append(option); });
      const toggleDepartments = () => { const required = $('role').value === 'department_manager' || $('role').value === 'department_contributor'; $('department-field').hidden = !required; $('departments').required = required; };
      $('role').addEventListener('change', toggleDepartments); toggleDepartments();
      form.addEventListener('submit', async event => {
        event.preventDefault(); const submit = $('invite-submit'); submit.disabled = true; setStatus('invite-status', 'Creating account and sending invitation…');
        try {
          const result = await admin('invite', { email: $('email').value.trim(), display_name: $('display-name').value.trim(), role: $('role').value, department_ids: selectedDepartments() });
          form.reset(); toggleDepartments(); setStatus('invite-status', `Invitation sent to ${result.email}. The link opens the password setup page.`); await loadUsers();
        } catch (error) { setStatus('invite-status', error.message, true); }
        finally { submit.disabled = false; }
      });
      $('search-users').addEventListener('input', renderUsers); $('refresh-users').addEventListener('click', loadUsers); await loadUsers();
    } catch (error) { setStatus('users-status', error.message, true); setTimeout(() => { window.location.href = '/'; }, 1800); }
  }
  boot();
})();
