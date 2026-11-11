import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const autosave = readFileSync(new URL('../public/vh26-reporting.js', import.meta.url), 'utf8');

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

test('Reporting week choices are chronological and searchable for long calendars', () => {
  assert.match(html, /id="vh26-week-search" type="search" list="vh26-week-options"/);
  assert.match(html, /id="vh26-host-week-search" type="search" list="vh26-host-week-options"/);
  assert.match(html, /placeholder="Search by week number or date"/);
  assert.match(html, /function orderedRailWeeks\(weeks\)/);
  assert.match(html, /start_date\|\|a\?\.start_date/);
  assert.match(html, /function orderedHostWeeks\(\)\{return \[\.\.\.\(hostData\?\.weeks\|\|\[\]\)\]\.sort\(\(a,b\)=>String\(a\.rail_calendar_periods\?\.start_date\|\|''\)\.localeCompare\(String\(b\.rail_calendar_periods\?\.start_date\|\|''\)\)\)\}/);
  assert.match(html, /function hostWeek\(\)\{const weeks=orderedHostWeeks\(\);return weeks\.find\(w=>w\.id===selectedHostWeekId\)\|\|weeks\.find\(w=>w\.status==='open'\)\|\|weeks\.at\(-1\)\|\|null\}/);
  assert.match(html, /vh26-host-week-search'\)\.addEventListener\('change'/);
  assert.match(html, /function populateWeekPicker\(select,weeks\)/);
  assert.match(html, /weekSearch\?\.addEventListener\('change'/);
  assert.match(html, /weekSelect\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/);
});

test('Presenter Mode week search finds unique week numbers and dates and uses the live week control', () => {
  assert.match(autosave, /function weekLabels\(\)/);
  assert.match(autosave, /querySelectorAll\('#vh26-host-week-select option'\)/);
  assert.match(autosave, /function refreshHostWeekOptions\(\)/);
  assert.match(autosave, /new MutationObserver\(refreshHostWeekOptions\)\.observe\(hostWeekSelect/);
  assert.match(autosave, /function matchWeekLabel\(value\)/);
  assert.match(autosave, /vh26-presenter-week-search/);
  assert.match(autosave, /vh26-host-week-search/);
  assert.match(autosave, /currentHostInput\.value = match/);
  assert.match(autosave, /currentHostInput\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/);
  assert.match(autosave, /input\.addEventListener\('input', event =>/);
  assert.match(autosave, /Include a date if a week number appears more than once/);
});

test('administrator keeps the Department Report navigation item after verified sign-in', () => {
  assert.doesNotMatch(autosave, /installAdminDepartmentReportGuard/);
  assert.match(html, /function isAdminUser\(identity=verifiedIdentity\)/);
  assert.match(html, /data-connected-nav=\"report\"/);
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

test('report entry textarea sits below evenly sized single-line fields at desktop and mobile widths', () => {
  assert.match(autosave, /grid-template-areas:"title owner support" "required remove \." "update update update"!important/);
  assert.match(autosave, /label:has\(textarea\[data-prop="update"\]\)\{grid-area:update!important\}/);
  assert.match(autosave, /@media\(max-width:850px\)[\s\S]*grid-template-areas:"title owner" "support required" "update update" "remove remove"!important/);
  assert.match(autosave, /@media\(max-width:560px\)[\s\S]*grid-template-areas:"title" "owner" "support" "required" "update" "remove"!important/);
  assert.match(autosave, /#vh26-connected-dashboard\.vh26-workspace-active #vh26-add-entry\{margin-top:18px!important\}/);
});

test('sidebar navigation waits for the current autosave and retries the selected route', () => {
  assert.match(autosave, /let reportingDirty = false;\s*let reportingBusy = false;/);
  assert.match(autosave, /async function flushSectionSave\(\)/);
  assert.match(autosave, /window\.vhFlushReportingSave = flushSectionSave/);
  assert.match(autosave, /\.vh26-sidebar nav button\[data-connected-nav\], #vh26-section-tabs button, \.vh26-report-step-controls button/);
  assert.match(autosave, /reportingDirty \|\| reportingBusy \|\| appDirtyNeedsClearing/);
  assert.match(autosave, /event\.stopImmediatePropagation\(\)/);
  assert.match(autosave, /async function saveCurrentSectionForNavigation\(root\)/);
  assert.match(autosave, /Draft saved to Supabase/);
  assert.match(autosave, /navigationReplay = true/);
  assert.match(autosave, /savedEditVersion/);
  assert.match(autosave, /Complete the pipeline opportunity or remove it before changing section/);
  assert.match(autosave, /dashboard\?\.addEventListener\('change'/);
  assert.match(autosave, /event\.target\.matches\('#vh26-week'\)/);
  assert.match(autosave, /lastSelectedWeek/);
  assert.match(autosave, /next\.dispatchEvent\(new Event\('change', \{ bubbles: true \}\)\)/);
});

test('reporting forms are wider and narrative sections use notes instead of entry cards', () => {
  assert.match(autosave, /#vh26-report-workspace #vh26-report-intro[\s\S]*max-width:1066px!important/);
  assert.match(autosave, /function simplifyNarrativeEntries\(root\)/);
  assert.match(autosave, /notes\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/);
  assert.match(autosave, /entries\.replaceChildren\(\)/);
  assert.match(autosave, /#vh26-section-editor:not\(\[hidden\]\) #vh26-generic-section-editor:not\(\[hidden\]\) #vh26-add-entry\{display:none!important\}/);
  assert.match(autosave, /function applyReportingSpellcheck\(root\)[\s\S]*field\.setAttribute\('lang', 'en-GB'\)/);
  assert.match(autosave, /vh26-pipeline-workspace/);
});

test('Presenter Mode follows the Build 050 centered meeting layout and navigation', () => {
  assert.match(autosave, /vh26-presenter-restoration-style/);
  assert.match(autosave, /linear-gradient\(120deg,#00354e,#075675\)/);
  assert.match(autosave, /vh26-presenter-heading/);
  assert.match(autosave, /max-width:780px/);
  assert.match(autosave, /context\.departmentNumber \+ ' OF ' \+ context\.departmentCount/);
  assert.match(autosave, /vh26-presenter-finance-card/);
  assert.match(autosave, /finance_published/);
  assert.match(autosave, /\['Weekly budget', presenterMoney\(weeklyBudget\)\]/);
  assert.match(autosave, /\['Weekly revenue', presenterMoney\(weeklyRevenue\)\]/);
  assert.match(autosave, /YTD gap to close/);
  assert.doesNotMatch(autosave, /two.?week lag/i);
  assert.match(autosave, /Not reported/);
  assert.match(autosave, /vh26-presenter-actions-card/);
  assert.match(autosave, /Action \/ decision/);
  assert.match(autosave, /presenterApi\('actions'\)/);
  assert.match(autosave, /presenterApi\('update_action'/);
  assert.match(autosave, /presenterApi\('create_action'/);
  assert.match(autosave, /\['administrator','meeting_host','executive'\]/);
  assert.match(autosave, /vh26-presenter-create-action-toggle/);
  assert.match(autosave, /const desired = \[heading, \.\.\.\(revenue \? \[revenue\] : \[\]\), actions, \.\.\.reportCards\]/);
  assert.match(autosave, /anchor\.after\(actions\); anchor = actions/);
  assert.match(autosave, /if \(panel\.dataset\.signature === signature\) return panel/);
  assert.match(autosave, /vh26-presenter-pager/);
  assert.match(autosave, /vh26-presenter-pager\{position:fixed/);
  assert.match(autosave, /vh26-presenter-pager\{[^}]*left:0!important;right:0!important;bottom:0!important/);
  assert.match(autosave, /function presenterTextElement\(tag, text\)/);
  assert.match(autosave, /slideTitle === 'Meeting readiness' \? 'all'/);
  assert.match(autosave, /if \(viewKind === 'all'\)[\s\S]*vh26-presenter-kpis/);
  assert.match(autosave, /@media\(max-width:560px\)[\s\S]*vh26-presenter-revenue-grid\{grid-template-columns:1fr/);
  assert.match(autosave, /#vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide\{display:flex!important;flex-direction:column!important/);
  assert.match(autosave, /#vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide>\.vh26-presenter-finance-card\{display:block!important;height:auto!important/);
});

test('Safety Moment separates practical reminders from distinct discussion questions', () => {
  assert.match(autosave, /rename\('points', 'Practical reminders'/);
  assert.match(autosave, /rename\('questions', 'Discussion questions'/);
  assert.match(autosave, /safetyQuestionIsDuplicate\(question, reminders\)/);
  assert.match(autosave, /section\('Practical reminders', reminders, true\)/);
  assert.match(autosave, /Discussion question/);
  assert.match(autosave, /vh26-presenter-safety-content/);
});

test('Safety Moment generation sends a persisted rolling history to the novelty check', () => {
  assert.match(html, /weeklyportal-safety-moment-generated-history/);
  assert.match(html, /const recent=\[\.\.\.generationHistory\(\),\.\.\.\(valid\(r\)\?\[r\]:\[\]\)\]\.slice\(-12\)/);
  assert.match(html, /JSON\.stringify\(\{category:select\.value,recent\}\)/);
  assert.match(html, /rememberGenerated\(generated\)/);
  assert.match(html, /recent Safety Moments to the AI service to avoid repeats/);
});
