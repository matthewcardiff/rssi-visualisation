import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const autosave = readFileSync(new URL('../public/autosave.js', import.meta.url), 'utf8');

test('department report autosaves through the existing authenticated Supabase operation', () => {
  assert.match(html, /<script defer src="\/autosave\.js"><\/script>/);
  assert.match(autosave, /context\(\)\.editable/);
  assert.match(autosave, /dataApi\('save_section'/);
  assert.match(autosave, /dataApi\('create_report'/);
  assert.match(autosave, /Saved automatically to Supabase/);
  assert.match(autosave, /Automatic save failed:/);
  assert.match(autosave, /#vh26-section-notes/);
  assert.match(autosave, /#vh26-entries \[data-prop\]/);
  assert.match(autosave, /#vh26-hsqe-fields \[data-hsqe-field\]/);
  assert.doesNotMatch(html, /Connected staging report · Changes save to Supabase when you select Save draft/);
});

test('autosave protects in-progress edits while preserving the Submit report workflow', () => {
  assert.match(html, /id="vh26-submit-report"/);
  assert.match(html, /dataApi\('submit_report'/);
  assert.match(html, /Wait for the saved status before changing section/);
  assert.match(autosave, /reportingDirty = true/);
  assert.match(autosave, /reportingDirty = false/);
  assert.doesNotMatch(autosave, /\.value\s*=/);
});

test('department chooser, static week selector, aligned heading and one-column Presenter use Build 050 styling', () => {
  assert.match(html, /vh26-stage2-fixes/);
  assert.match(html, /max-width:1440px/);
  assert.match(html, /position:static!important;inset:auto!important/);
  assert.match(html, /#vh26-report-intro,#vh26-connected-dashboard #vh26-native-report\{width:100%;max-width:1000px/);
  assert.match(html, /#vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide\{grid-template-columns:minmax\(0,1fr\)!important\}/);
  assert.ok(existsSync(new URL('../public/rssi-logo.png', import.meta.url)));
  assert.match(autosave, /#login \.brand \.rss-logo,#chooser \.choose-head \.rss-logo\{display:block!important\}/);
  assert.match(autosave, /setProperty\('display', 'block', 'important'\)/);
  assert.match(autosave, /#vh26-connected-dashboard\.vh26-workspace-active #vh26-report-intro\{max-width:750px!important\}/);
  assert.match(html, /#login \.brand \.rss-logo,#chooser \.choose-head \.rss-logo\{display:block!important\}/);
});

test('finance upload retains the Build 050 weekly-budget reader and submits its extracted budget field', () => {
  assert.match(html, /async function vhFinanceExtract\(file,selectedWeek\)/);
  assert.match(html, /const budgetWeek=weeks\.find\(x=>x\.week===financePeriod\.managementWeek\)/);
  assert.match(html, /\['weekly_budget',record\.bv\]/);
  assert.match(html, /const financeReader=window\.vhFinanceExtract/);
});
