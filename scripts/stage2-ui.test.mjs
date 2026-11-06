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
  assert.match(autosave, /notes\.value = \[existing, \.\.\.additions\]/);
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
  assert.match(autosave, /document\.head\.append\(brandFix\)/);
});

test('department chooser uses the modern RSSI card layout at desktop and mobile sizes', () => {
  assert.match(autosave, /function installDepartmentChooserStyle\(\)/);
  assert.match(autosave, /vh26-department-chooser-polish/);
  assert.match(autosave, /max-width:1320px/);
  assert.match(autosave, /grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,255px\),1fr\)\)/);
  assert.match(autosave, /dept-card:hover\{transform:translateY\(-2px\)/);
  assert.match(autosave, /content:"→"/);
  assert.match(autosave, /@media\(max-width:540px\)/);
  assert.match(autosave, /prefers-reduced-motion:reduce/);
});

test('report heading aligns with the week selector and keeps the orange section progress bar visible', () => {
  assert.match(autosave, /vh26-workspace-active #vh26-report-intro\{width:100%!important;max-width:1000px!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important/);
  assert.match(html, /class="vh26-stage-progress"/);
  assert.match(autosave, /vh26-workspace-active #vh26-stage-progress-fill\{display:block!important;height:100%;background:#ff6b00/);
});

test('pipeline fields use a single Build 050 row with coordinated buttons below', () => {
  assert.match(autosave, /id = 'vh26-pipeline-layout'/);
  assert.match(autosave, /grid-template-columns:1\.2fr 1\.2fr \.85fr 1fr 1fr/);
  assert.match(autosave, /\.vh26-pipeline-actions\{display:grid!important;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(autosave, /background:#fafbfc!important;color:#163247!important;font:400 15px/);
  assert.match(autosave, /background:#004d71!important;color:#fff!important/);
  assert.match(autosave, /background:#ff6b00!important;color:#173448!important;font:600 14px/);
  assert.match(autosave, /@media\(max-width:560px\)/);
});

test('department report has one persistent week selector and confirms period changes', () => {
  assert.equal((html.match(/id="vh26-week"/g) || []).length, 1);
  assert.match(autosave, /vh26-reporting-week-guard/);
  assert.match(autosave, /position:sticky!important/);
  assert.match(html, /Switch the department report from /);
  assert.match(html, /The selected week will be used for all further entries and automatic saves/);
  assert.doesNotMatch(html, /Opportunities for this department/);
  assert.doesNotMatch(html, /Report: '\+c\.report\.status/);
  assert.match(html, /introEyebrow\.textContent='YOUR WEEKLY REPORT'/);
  assert.match(html, /Weekly department report';/);
});

test('department reporting sections share the wider Build 050 form styling', () => {
  assert.match(autosave, /vh26-report-form-consistency/);
  assert.match(autosave, /max-width:1100px!important/);
  assert.match(autosave, /#vh26-report-workspace #vh26-native-report\{box-sizing:border-box!important;width:100%!important;max-width:1066px!important/);
  assert.match(autosave, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
  assert.match(autosave, /\.vh26-entry>button\{justify-self:start!important;align-self:end!important;width:max-content!important;min-width:0!important;min-height:42px/);
  assert.match(autosave, /border-radius:12px!important;background:#fafbfc!important;color:#163247!important;font:400 15px/);
  assert.match(autosave, /#vh26-hsqe-fields\[hidden\]\{display:none!important\}/);
  assert.match(autosave, /@media\(max-width:560px\)/);
});

test('spellchecking covers dynamically added UK English text fields only', () => {
  assert.match(autosave, /function applyReportingSpellcheck\(root\)/);
  assert.match(autosave, /textarea, input:not\(\[type\]\), input\[type="text"\]/);
  assert.match(autosave, /setAttribute\('spellcheck', 'true'\)/);
  assert.match(autosave, /setAttribute\('lang', 'en-GB'\)/);
  assert.match(autosave, /applyReportingSpellcheck\(root\)/);
});

test('finance history list is hidden in preview because it offers no review action', () => {
  assert.match(autosave, /vh26-finance-view-active #vh26-finance-review\{display:none!important\}/);
  assert.match(html, /async function financeReviewRefresh\(\)/);
  assert.match(html, /dataApi\('finance_review'\)/);
});

test('finance upload retains the Build 050 weekly-budget reader and submits its extracted budget field', () => {
  assert.match(html, /async function vhFinanceExtract\(file,selectedWeek\)/);
  assert.match(html, /const budgetWeek=weeks\.find\(x=>x\.week===financePeriod\.managementWeek\)/);
  assert.match(html, /\['weekly_budget',record\.bv\]/);
  assert.match(html, /const financeReader=window\.vhFinanceExtract/);
});
