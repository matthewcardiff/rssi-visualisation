import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const autosave = readFileSync(new URL('../public/vh26-reporting.js', import.meta.url), 'utf8');
const autosaveScript = readFileSync(new URL('../public/autosave.js', import.meta.url), 'utf8');
const financeUi = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const financeFlow = financeUi.slice(financeUi.indexOf("const financeFile=document.getElementById('vh26-finance-file')"), financeUi.indexOf('async function financeReviewRefresh()'));

test('finance import, reconciliation and publication are enabled only on the named staging branch', () => {
  const netlifyConfig = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.match(netlifyConfig, /\[context\."build052-visual-restoration"\.environment\]/);
  for (const flag of ['VH_FINANCE_STAGING_WRITES', 'VH_FINANCE_RECONCILIATION_ENABLED', 'VH_FINANCE_PUBLICATION_ENABLED']) {
    assert.match(netlifyConfig, new RegExp(`${flag} = "enabled"`));
  }
  assert.doesNotMatch(netlifyConfig, /\[context\.production\.environment\]/);
  assert.doesNotMatch(netlifyConfig, /\[context\.deploy-preview\.environment\]/);
});

function installFinanceCheckCorrection(result) {
  const window = { vhFinanceExtract: async () => structuredClone(result) };
  const document = {
    createElement: () => ({ textContent: '', style: { setProperty() {} } }),
    head: { append() {} },
    querySelectorAll: () => [],
    documentElement: {},
    readyState: 'loading',
    addEventListener() {}
  };
  class TestMutationObserver {
    constructor(callback) { this.callback = callback; }
    observe() {}
  }
  vm.runInNewContext(autosave, { window, document, MutationObserver: TestMutationObserver, setTimeout, clearTimeout });
  return window;
}

test('finance matrix mismatches remain blocking and cannot be filtered from validation', () => {
  assert.match(financeUi, /matrix total/);
  assert.match(financeUi, /blockingWarnings:warnings\.filter/);
  assert.match(financeUi, /Company matrix mismatch blocks Apply figures/);
  assert.match(financeUi, /blockingWarnings\|\|\[\]\)\.length/);
  assert.match(readFileSync(new URL('../netlify/functions/acceptance.mjs', import.meta.url), 'utf8'), /Company matrix reconciliation failed/);
  assert.doesNotMatch(autosave, /Finance workbook rows are authoritative for their mapped periods/);
});

test('finance extraction uses the selected reporting week for budget, revenue and YTD', () => {
  const extractor = financeUi.slice(financeUi.indexOf('async function vhFinanceExtract(file,selectedWeek)'), financeUi.indexOf('window.vhFinanceExtract=vhFinanceExtract'));
  const period = financeUi.slice(financeUi.indexOf('function vhFinancialSourcePeriod'), financeUi.indexOf('window.vhFinancialSourcePeriod'));
  assert.match(period, /sourcePeriodId:management\.id/);
  assert.match(extractor, /budgetWeek=budgetCalendar\.weeks\.find\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /revenueWeek=revenueCalendar\.weeks\.find\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /budgetIndex=budgetCalendar\.weeks\.findIndex\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /revenueIndex=revenueCalendar\.weeks\.findIndex\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /if\(dashboard&&financePeriod&&sheetWeek===directWeek\)/);
  assert.match(extractor, /dashboardName='WK'\+Number\(management\?\.railWeek/);
  assert.match(extractor, /toLocaleLowerCase\('en-GB'\).*String\(name\|\|''\).*toLocaleLowerCase\('en-GB'\)/);
  assert.match(extractor, /const sourceBlocks=\[\.\.\.dashboard\.map\.entries\(\)\]/);
  assert.doesNotMatch(extractor, /const sourceBlocks=\[\['B','F'\]/);
  assert.match(extractor, /sourcePolicy:'Values come only from the selected WK sheet/);
  assert.match(extractor, /budgetIndex=budgetCalendar\.weeks\.findIndex\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /matrix total/);
  assert.match(extractor, /weeklyBudget:'G2',weeklyRevenue:'G3',weeklyGap:'G4',ytdBudget:'J2',ytdRevenue:'J3',ytdGap:'J4'/);
  assert.match(extractor, /for\(const key of \['weeklyBudget','weeklyRevenue','ytdBudget','ytdRevenue'\]\)/);
  assert.match(extractor, /Math\.abs\(Math\.abs\(expected\)-Math\.abs\(actual\)\)>0\.01/);
  assert.match(extractor, /source matrix reverses the gap sign for this week/);
  assert.match(extractor, /Math\.abs\(Number\(expected\)-Number\(actual\)\)>0\.01/);
  assert.match(extractor, /weeklyGap:totals\.weeklyBudget===null\|\|totals\.weeklyRevenue===null\?null:totals\.weeklyBudget-totals\.weeklyRevenue/);
  assert.match(extractor, /ytdGap:totals\.ytdBudget===null\|\|totals\.ytdRevenue===null\?null:totals\.ytdBudget-totals\.ytdRevenue/);
  assert.match(extractor, /if\(!dashboard\|\|!financePeriod\|\|sheetWeek!==directWeek\)[\s\S]*?no other worksheet will be read as a fallback[\s\S]*?return \{companyOverview[\s\S]*?acceptanceReady:false/);
  assert.match(extractor, /duplicates the mapped department/);
  assert.match(extractor, /else if\(match\)directRecords\.set\(match\[0\],record\)/);
  assert.match(extractor, /if\(directWeek===29\)[\s\S]*?ytdRevenue:1363438,ytdGap:33719,variancePercent:2/);
  assert.match(extractor, /Math\.round\(confirmedValues\[key\]\)!==confirmed\[key\]/);
  assert.match(extractor, /WK29 confirmed variance is 2%/);
  assert.match(extractor, /confirmed .*Correct the WK29 source/);
  assert.match(extractor, /blockingWarnings:warnings\.filter/);
  assert.match(extractor, /for\(let col=1;col<=52;col\+\+\).*index:col-1/);
  assert.match(extractor, /vhFinCol\(1\)\+row\+':'\+vhFinCol\(52\)\+row/);
  assert.doesNotMatch(extractor, /blank inputs sum to £0/);
  assert.doesNotMatch(financeUi, /two.?week|two rail weeks|minus two/i);
});

test('selected WK sheets discover mapped department blocks dynamically', () => {
  const extractor = financeUi.slice(financeUi.indexOf('async function vhFinanceExtract(file,selectedWeek)'), financeUi.indexOf('window.vhFinanceExtract=vhFinanceExtract'));
  const blockSource = extractor.slice(extractor.indexOf('const columnNumber='), extractor.indexOf('const directRecords='));
  const vhFinCol = n => { let value=''; for (n++; n; n=Math.floor((n-1)/26)) value=String.fromCharCode(65+(n-1)%26)+value; return value; };
  const context = {dashboard:{map:new Map([['B7',{value:'MANAGED ENVIRONMENTS'}],['BF7',{value:'HS2'}],['BL7',{value:'MONTEL'}],['A7',{value:'VISUALISATION MATRIX'}],['BL8',{value:'not a department label'}]])},vhFinCol};
  const blocks = vm.runInNewContext(`${blockSource}; sourceBlocks`,context);
  assert.equal(JSON.stringify(blocks),JSON.stringify([['B','F'],['BF','BJ'],['BL','BP']]));
});

test('weekly finance header scan includes the first source-week column', () => {
  const extractor = financeUi.slice(financeUi.indexOf('async function vhFinanceExtract(file,selectedWeek)'), financeUi.indexOf('window.vhFinanceExtract=vhFinanceExtract'));
  const headerSource = extractor.slice(extractor.indexOf('function weekHeaders(map,expectedRow,tab)'), extractor.indexOf('const budgetCalendar=weekHeaders'));
  const warnings = [];
  const normLabel = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  function vhFinCol(n) { let result = ''; for (n++; n; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + (n - 1) % 26) + result; return result; }
  const weekHeaders = vm.runInNewContext(`${headerSource}; weekHeaders`, { warnings, normLabel, vhFinCol });
  const map = new Map([
    ['A5', { value: 'BUSINESS UNIT' }],
    ['B5', { value: 27 }], ['C5', { value: 28 }], ['D5', { value: 29 }], ['E5', { value: 30 }]
  ]);
  const result = weekHeaders(map, 5, 'BUDGET');
  assert.deepEqual(Array.from(result.weeks, ({ week, col, index }) => ({ week, col, index })), [
    { week: 27, col: 'B', index: 0 },
    { week: 28, col: 'C', index: 1 },
    { week: 29, col: 'D', index: 2 },
    { week: 30, col: 'E', index: 3 }
  ]);
  const sourceIndex = result.weeks.findIndex(period => period.week === 29);
  assert.deepEqual(Array.from(result.weeks.slice(0, sourceIndex + 1), period => period.week), [27, 28, 29]);
});

test('finance checks and import history are readable without an inner results scrollbar', () => {
  assert.match(autosave, /vh26-finance-preview-results\{display:flex!important;flex-direction:column!important;max-height:none!important;overflow:visible!important\}/);
  assert.match(autosave, /vh26-finance-preview-results \.vh26-finance-warning\{order:0!important/);
  assert.match(autosave, /function polishFinanceHistory\(\)/);
  assert.match(autosave, /if \(importId && seen\.has\(importId\)\)/);
  assert.match(autosave, /Finance files for review/);
  assert.match(autosave, /Only approved and published figures appear in reports/);
  assert.match(autosave, /finance import.*in the register/);
  assert.match(autosave, /They are not approved and are not shown in reports/);
});

test('finance import action is described as applying validated figures', () => {
  assert.match(financeUi, /3 · Apply figures/);
  assert.match(financeUi, /Apply figures/);
  assert.match(financeUi, /before applying/);
  assert.match(financeUi, /Apply only the validated department figures/);
  assert.match(financeUi, /Applying saves figures for finance review/);
  assert.doesNotMatch(financeUi, /Stage validated figures|3 · Stage figures/);
});

test('finance review and presenters expose all six budget, revenue and gap values', () => {
  assert.match(financeUi, /Weekly gap to close/);
  assert.match(financeUi, /YTD gap to close/);
  assert.match(financeUi, /Gap to close = budget minus revenue/);
  assert.match(financeUi, /Department YTD variance = revenue minus budget/);
  assert.match(financeUi, /presenterRenderFinance/);
  assert.match(financeUi, /Applied figures appear here after finance review and publication/);
  assert.match(financeUi, /vh26-finance-review-table/);
  assert.match(financeFlow, /const sourceWeek=managementPeriod\?\.start_date\?\{id:managementPeriod\.start_date\}:null/);
  assert.match(financeFlow, /Company finance overview/);
  assert.match(financeFlow, /Finance period NRW WK/);
  assert.match(financeFlow, /selectedOptions\?\.\[0\]\?\.textContent\?\.trim\(\)/);
  assert.match(financeFlow, /Weekly gap to close/);
  assert.match(financeFlow, /YTD gap to close/);
  assert.match(financeUi, /Company finance overview · Reporting week/);
  assert.match(financeUi, /\['Weekly gap to close',gap\('weekly_budget','weekly_revenue'\)\]/);
  assert.match(financeUi, /\['YTD gap to close',gap\('ytd_budget','ytd_revenue'\)\]/);
  assert.match(financeUi, /YTD gap to close \(budget less revenue\)/);
  assert.match(autosave, /\['Weekly budget', presenterMoney\(weeklyBudget\)\]/);
  assert.match(autosave, /\['Weekly gap to close', presenterVariance\(weeklyRevenue, weeklyBudget\)\]/);
  assert.match(autosave, /\['YTD gap to close', presenterVariance\(ytdRevenue, ytdBudget\)\]/);
  assert.match(autosave, /function presenterVariance\(revenue, budget\)/);
  assert.match(autosave, /variance = Number\(budget\) - Number\(revenue\)/);
  assert.match(autosave, /presenterFinanceCard\(slide, context\)/);
  assert.match(autosave, /DEPARTMENT FINANCIAL OVERVIEW/);
  assert.match(autosave, /No published finance figures are available for this department and week/);
  assert.match(autosave, /Finance period NRW WK/);
  assert.ok(autosave.includes('function cachedPresenterRequest(cache, key, create)'));
  assert.ok(autosave.includes('if (cache.get(key) === request) cache.delete(key)'));
  assert.ok(autosave.includes('else if (cache[key] === request) cache[key] = null'));
  assert.match(autosave, /Finance figures could not load:/);
  assert.match(autosave, /Actions could not load:/);
});

test('Safety Moment endpoint failures expose HTTP and content-type diagnostics in Presenter Mode',()=>{
  assert.match(autosave,/function installSafetyMomentDiagnostics\(\)/);
  assert.match(autosave,/Safety Moment function returned HTTP/);
  assert.match(autosave,/Safety Moment function returned an invalid response/);
  assert.match(autosave,/installSafetyMomentDiagnostics\(\);/);
});

test('finance Presenter shows all departments, partial company totals and refreshes after publication', () => {
  const presenterStart = financeUi.indexOf('async function presenterRenderFinance(root');
  const presenter = financeUi.slice(presenterStart, financeUi.indexOf('const renderConnectedPresenterDepartment=renderPresenterSlide', presenterStart));
  assert.match(presenter, /textContent='Refresh figures'/);
  assert.match(presenter, /presenterPublishedFinance=await presenterLoadPublishedFinance\(week\?\.id\)/);
  assert.match(financeUi, /function presenterLoadPublishedFinance\(weekId\)\{[\s\S]*?if\(presenterFinanceRequest&&presenterFinanceRequestWeekId===weekId\)return presenterFinanceRequest;[\s\S]*?dataApi\('finance_published'\)[\s\S]*?presenterFinanceRequest=null;presenterFinanceRequestWeekId=null/);
  assert.doesNotMatch(presenter, /vhGetPresenterFinanceCache/);
  assert.match(financeUi, /const generation=\+\+presenterSlideRenderGeneration,week=hostWeek\(\)/);
  assert.match(presenter, /renderGeneration!==presenterSlideRenderGeneration\|\|presenterModeView!=='finance'\|\|hostWeek\(\)\?\.id!==week\?\.id/);
  assert.match(financeUi, /presenterPublishedFinance=data;presenterPublishedFinanceWeekId=weekId/);
  assert.match(presenter, /refresh\.addEventListener\('click',\(\)=>\{window\.vhInvalidatePresenterFinanceCache\?\.\(\);presenterPublishedFinance=null;presenterPublishedFinanceWeekId=null;presenterFinanceRequest=null;presenterFinanceRequestWeekId=null;renderPresenterSlide\(\)\}\)/);
  assert.match(presenter, /if\(!pubs\.length\)status\.textContent=/);
  assert.doesNotMatch(presenter, /if\(!pubs\.length\)\{status\.textContent=[^}]+return\}/);
  assert.match(presenter, /for\(const dep of financeDepartments\)/);
  assert.match(presenter,/Finance period: NRW WK/);
  assert.match(presenter,/managementPeriodIndex>=0\?financePeriods\[managementPeriodIndex\]:null/);
  assert.match(presenter, /const companyAggregate=key=>/);
  assert.match(presenter, /Partial total · \$\{result\.reported\} of \$\{result\.total\} finance lines reported/);
  assert.match(presenter, /const companyVariance=\(revenueKey,budgetKey\)=>/);
  assert.match(autosave, /window\.vhInvalidatePresenterFinanceCache = \(\) => presenterApiCache\.finance\.clear\(\)/);
  assert.match(financeUi, /window\.vhInvalidatePresenterFinanceCache\?\.\(\)/);
  assert.match(autosave, /signal: AbortSignal\.timeout\(20000\)/);
  assert.match(autosave, /Presenter request timed out\. Use Refresh to try again\./);
  assert.match(autosave, /if \(op === 'finance_published'\) presenterApiCache\.finance\.clear\(\)/);
});

test('Presenter finance refreshes on host week changes and withholds other-period values', () => {
  assert.match(financeUi, /selectedHostWeekId=event\.target\.value;renderHostReadiness\(\);if\(!document\.getElementById\('vh26-presenter-mode'\)\?\.hidden\)renderPresenterSlide\(\)/);
  const presenter = financeUi.slice(financeUi.indexOf('async function presenterRenderFinance'), financeUi.indexOf('const renderConnectedPresenterDepartment'));
  assert.match(presenter, /v\.source_period_id===financeSourcePeriod\?\.id/);
  assert.match(presenter, /Published figures for another finance period are withheld/);
  assert.match(autosave, /v\.source_period_id === reportPeriod\?\.id/);
  assert.match(autosave, /Published figures do not match this reporting week\. Figures are withheld\./);
});

test('finance Presenter shows YTD variance percent and keeps legacy finance period data guarded', () => {
  assert.match(autosave, /function enhanceFinanceCompanyOverview\(slide\)/);
  assert.match(autosave, /const percentValue = ytdBudget\.value !== null && ytdRevenue\.value !== null/);
  assert.match(autosave, /Math\.abs\(percentValue\)\.toLocaleString\('en-GB', \{ maximumFractionDigits: 0 \}\) \+ '%'/);
  assert.match(autosave, /Historical HS2 \(legacy\)/);
  assert.match(autosave, /if \(!unchanged\) legacyRow\.replaceChildren/);
  assert.match(autosave, /YTD variance %/);
  assert.match(autosave, /vh26-presenter-finance-active/);
  assert.match(autosave, /max-width:1240px/);
});
test('legacy HS2 reconciliation reads the full finance table, not the variance table', () => {
  assert.match(autosave, /const table = \[\.\.\.slide\.querySelectorAll\(\'\.vh26-presenter-finance-table\'\)\]\.find\(candidate => \{\s*const headers = \[\.\.\.candidate\.querySelectorAll\(\'tr:first-child th\'\)\]\.map\(cell => cell\.textContent\.trim\(\)\);\s*return headers\.includes\(\'Weekly budget\'\) && headers\.includes\(\'YTD revenue\'\) && headers\.includes\(\'YTD gap to close\'\);/);
  assert.match(autosave, /const aggregate = \[null, metric\(\'Weekly budget\'\)\.value, metric\(\'Weekly revenue\'\)\.value/);
  assert.match(autosave, /if \(!columns\.some\(index => aggregate\[index\] !== null && aggregate\[index\] !== 0\)\) \{ legacyRow\?\.remove\(\); return; \}/);
});
test('concurrent Presenter redraws share one finance request and failed requests can retry', async () => {
  const helperStart = financeUi.indexOf('function presenterLoadPublishedFinance(weekId)');
  const helperEnd = financeUi.indexOf('function presenterSetView(', helperStart);
  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  const helper = financeUi.slice(helperStart, helperEnd);
  let resolveRequest;
  let requests = 0;
  const successful = { publications: [], values: [], periods: [] };
  const shared = vm.createContext({ dataApi: () => { requests++; return new Promise(resolve => { resolveRequest = resolve; }); }, Promise });
  vm.runInContext(`let presenterPublishedFinance=null,presenterPublishedFinanceWeekId=null,presenterFinanceRequest=null,presenterFinanceRequestWeekId=null;${helper};this.presenterLoadPublishedFinance=presenterLoadPublishedFinance`, shared);
  const first = shared.presenterLoadPublishedFinance('week-32');
  const second = shared.presenterLoadPublishedFinance('week-32');
  assert.equal(requests, 1);
  resolveRequest(successful);
  const [firstResult, secondResult] = await Promise.all([first, second]);
  assert.equal(firstResult, successful);
  assert.equal(secondResult, successful);

  let attempts = 0;
  const retryable = vm.createContext({ dataApi: () => ++attempts === 1 ? Promise.reject(new Error('temporary outage')) : Promise.resolve(successful), Promise });
  vm.runInContext(`let presenterPublishedFinance=null,presenterPublishedFinanceWeekId=null,presenterFinanceRequest=null,presenterFinanceRequestWeekId=null;${helper};this.presenterLoadPublishedFinance=presenterLoadPublishedFinance`, retryable);
  await assert.rejects(retryable.presenterLoadPublishedFinance('week-32'), /temporary outage/);
  assert.equal(await retryable.presenterLoadPublishedFinance('week-32'), successful);
  assert.equal(attempts, 2);
});

test('a late finance response cannot overwrite a department Presenter slide', () => {
  const start = financeUi.indexOf('async function presenterRenderFinance(root,renderGeneration=presenterSlideRenderGeneration)');
  const end = financeUi.indexOf('const renderConnectedPresenterDepartment=renderPresenterSlide', start);
  assert.ok(start >= 0 && end > start);
  const presenter = financeUi.slice(start, end);
  assert.match(presenter, /presenterPublishedFinance=await presenterLoadPublishedFinance\(week\?\.id\);[\s\S]*?if\(renderGeneration!==presenterSlideRenderGeneration\|\|presenterModeView!=='finance'\|\|hostWeek\(\)\?\.id!==week\?\.id\)return;/);
});
test('reloading Presenter readiness preserves the host selected reporting week',()=>{
  assert.match(financeUi,/retainedWeekId=selectedHostWeekId/);
  assert.match(financeUi,/hostData\.weeks=result\.items\|\|\[\];if\(retainedWeekId&&hostData\.weeks\.some\(w=>w\.id===retainedWeekId\)\)selectedHostWeekId=retainedWeekId/);
});
test('connected finance summary resolves the database aliases for TWS, Midland Metro and Signalling',()=>{
  assert.match(financeUi,/const financeAliases=\{TWS:\['TRACKWARNINGSYSTEMS'\],'MMA':\['MIDLANDMETRO'\],'S&T':\['SIGNALLING'\],'HS2 Bird Deterrant':\['BIRDDETERRENT','BIRDDETERENT'\]\}/);
  assert.match(financeUi,/\[d\.display_name,d\.code,d\.name\]\.some\(value=>wanted\.includes\(normalise\(value\)\)\)/);
  assert.match(financeUi,/window\.vhFinDepartments\|\|\[\['TWS'\]/);
});

test('finance flow shows one next action and advances to Apply after checks are acknowledged', () => {
  assert.match(financeUi, /id="vh26-finance-check" disabled/);
  assert.match(financeUi, /id="vh26-finance-import" hidden disabled>Apply figures/);
  assert.match(financeFlow, /function financeSetStep\(step\)/);
  assert.match(financeFlow, /financeSetStep\(check\.checked\?3:2\)/);
  assert.match(financeFlow, /financeSetActions\('apply'\)/);
  assert.match(financeFlow, /Reporting week changed\. Review the workbook again before applying/);
  assert.match(financeFlow, /no weekly revenue recorded in source NRW WK/);
  assert.doesNotMatch(financeFlow, /if\(!confirm\(/);
});

