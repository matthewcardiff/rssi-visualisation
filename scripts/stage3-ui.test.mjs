import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const autosave = readFileSync(new URL('../public/autosave.js', import.meta.url), 'utf8');

test('department report does not show background-load diagnostics after the report is ready', () => {
  assert.match(html, /Report loaded in '\+\(\(performance\.now\(\)-startedAt\)\/1000\)/);
  assert.ok(autosave.includes("Report loaded in [\\d.]+s\\. Loading pipeline, actions and finance in the background"));
  assert.match(autosave, /reportStatus\.textContent = ''/);
  assert.match(autosave, /#vh26-report-status:empty\{display:none!important\}/);
});

test('Action Log hides duplicate period subtitle and silent loading status while retaining its week selector', () => {
  assert.match(autosave, /vh26-action-view-active\.vh26-workspace-active #vh26-account\{display:none!important\}/);
  assert.match(autosave, /vh26-action-view-active\.vh26-workspace-active #vh26-actions-summary:empty\{display:none!important\}/);
  assert.match(html, /document\.getElementById\('vh26-workspace-title'\)\.textContent='Meeting actions'/);
  assert.match(html, /id="vh26-week"/);
  assert.match(autosave, /actionsSummary\?\.textContent\.trim\(\) === 'Loading actions\.\.\.'/);
  assert.match(autosave, /actionsSummary\.textContent = ''/);
  assert.match(html, /Actions unavailable: '\+e\.message/);
});

test('pipeline action buttons have breathing room and matching outlined styling', () => {
  assert.match(autosave, /\.vh26-pipeline-actions\{gap:16px!important;margin-top:20px!important\}/);
  assert.match(autosave, /\.vh26-pipeline-actions button:first-child\{border-color:#cbd6de!important;background:#fff!important;color:#173448!important\}/);
  assert.match(autosave, /\.vh26-pipeline-actions button:hover:not\(:disabled\)\{border-color:#004d71!important;background:#f5f9fb!important;filter:none!important\}/);
});

test('opportunity action dialog separates and styles Cancel and Save controls', () => {
  assert.match(html, /<div><button type="button" data-cancel>Cancel<\/button><button type="submit">Save<\/button><\/div>/);
  assert.match(autosave, /\.vh26-presenter-dialog form>div:last-child\{display:flex!important;justify-content:flex-end!important;gap:14px!important;margin-top:14px!important\}/);
  assert.match(autosave, /form>div:last-child button\[type="submit"\]\{border:1px solid #ff6b00!important;background:#ff6b00!important;color:#173448!important\}/);
});
