import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('sign-in page provides a password setup link and requests recovery with the entered work email', () => {
  const page = read('../public/index.html');
  const api = read('../netlify/functions/acceptance.mjs');
  assert.match(page, /id="vh-password-recovery"/);
  assert.match(page, /op:'password_recovery',email:address/);
  assert.match(api, /auth\/v1\/recover\?redirect_to=/);
  assert.match(api, /new URL\('\/reset-password\.html',request\.url\)/);
});

test('password setup accepts invitation, signup and recovery links', () => {
  const page = read('../public/reset-password.html');
  assert.match(page, /\['recovery', 'invite', 'signup'\]\.includes\(recoveryType\)/);
  assert.match(page, /Invitation verified\. Choose a password/);
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
