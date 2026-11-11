import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('sign-in page sends users to the password setup flow and routes invitation tokens to it', () => {
  const page = read('../public/index.html');
  const api = read('../netlify/functions/acceptance.mjs');
  assert.match(page, /id="vh-password-recovery"/);
  assert.match(page, /reset-password\.html/);
  assert.match(page, /params\.get\('access_token'\).*authError/);
  assert.match(page, /params\.has\('error_code'\)/);
  assert.match(page, /sessionStorage\.setItem\('vh-password-setup-email',address\)/);
  assert.match(api, /auth\/v1\/recover\?redirect_to=/);
  assert.match(api, /new URL\('\/reset-password\.html',request\.url\)/);
});

test('password setup supports invitation, recovery and email-request steps through to sign-in', () => {
  const page = read('../public/reset-password.html');
  assert.match(page, /\['recovery', 'invite', 'signup'\]\.includes\(recoveryType\)/);
  assert.match(page, /Accept invitation and set password/);
  assert.match(page, /request-form/);
  assert.match(page, /Open the email link to return here/);
  assert.match(page, /This setup link has expired or was already used/);
  assert.match(page, /vh-password-setup-email/);
  assert.match(page, /Continue to sign in/);
});

test('administrator-only user management supports invites, reset links and reversible deactivation', () => {
  const api = read('../netlify/functions/acceptance.mjs');
  const edge = read('../supabase/functions/vh-user-admin/index.ts');
  const page = read('../public/admin-users.html');
  const client = read('../public/admin-users.js');
  assert.match(api, /functions\/v1\/vh-user-admin/);
  assert.match(edge, /role=eq\.administrator/);
  assert.match(edge, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(edge, /last active administrator cannot be deactivated/i);
  assert.match(edge, /ban_duration: op === "deactivate" \? "876000h" : "none"/);
  assert.match(page, /id="invite-form"/);
  assert.match(client, /'resend_setup'/);
  assert.match(client, /'deactivate'/);
  assert.match(client, /'reactivate'/);
  assert.doesNotMatch(client, /SUPABASE_SERVICE_ROLE_KEY/);
});
