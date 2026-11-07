import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const autosave = readFileSync(new URL('../public/vh26-reporting.js', import.meta.url), 'utf8');
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

test('finance import ignores historical dashboard mismatches but retains real missing-source findings', async () => {
  const records = Array.from({ length: 9 }, (_, index) => ({
    name: 'Department ' + index,
    bv: 100 + index,
    rv: null,
    revenueInputState: 'blank',
    ytdBudget: 1000 + index,
    ytdRevenue: 900 + index,
    cachedBudget: 1,
    cachedRevenue: 2,
    issues: []
  }));
  records[0].issues = [
    'WK30!AL11 budget does not match BUDGET!E6',
    'WK30!AL12 revenue does not match REVENUE!E6',
    'Weekly sheet shows calculated £0 from blank revenue source — NOT a confirmed zero',
    'Weekly revenue formula source row must be checked: AL12',
    'YTD revenue incomplete/unverified'
  ];
  records[7].issues = ['YTD revenue incomplete/unverified'];
  const window = installFinanceCheckCorrection({
    financialSourceWeek: 30,
    weekFound: true,
    acceptanceReady: false,
    warnings: [
      'Montel is absent from historical WK30 department dashboard; verified against finance source rows only',
      'Company overview unavailable: Missing WK32 worksheet',
      'Duplicate reporting week 30 appears 2 times in workbook headers.'
    ],
    records
  });

  const result = await window.vhFinanceExtract({}, 'week32');
  assert.deepEqual(Array.from(result.warnings), ['Duplicate reporting week 30 appears 2 times in workbook headers.']);
  assert.deepEqual(Array.from(result.records[0].issues), ['YTD revenue incomplete/unverified']);
  assert.deepEqual(Array.from(result.records[7].issues), ['YTD revenue incomplete/unverified']);
  assert.equal(result.records[0].bv, 100);
  assert.equal(result.records[0].revenueInputState, 'blank');
  assert.equal(result.records[0].cachedBudget, null);
  assert.equal(result.acceptanceReady, false);
});

test('finance import is ready when nine source-mapped departments have no remaining findings', async () => {
  const result = {
    financialSourceWeek: 30,
    weekFound: true,
    acceptanceReady: false,
    warnings: [],
    records: Array.from({ length: 9 }, (_, index) => ({
      name: 'Department ' + index,
      bv: 100 + index,
      rv: null,
      revenueInputState: 'blank',
      ytdBudget: 1000 + index,
      ytdRevenue: 900 + index,
      issues: []
    }))
  };
  const window = installFinanceCheckCorrection(result);
  const reviewed = await window.vhFinanceExtract({}, 'week32');
  assert.equal(reviewed.acceptanceReady, true);
  assert.equal(reviewed.records[0].rv, null);
  assert.equal(reviewed.records[0].revenueInputState, 'blank');
});

test('finance extraction applies the workbook two-week cutoff to budget, revenue and YTD', () => {
  const extractor = financeUi.slice(financeUi.indexOf('async function vhFinanceExtract(file,selectedWeek)'), financeUi.indexOf('window.vhFinanceExtract=vhFinanceExtract'));
  assert.match(extractor, /weekly and YTD formulas use management week - 2/);
  assert.match(extractor, /budgetWeek=budgetCalendar\.weeks\.find\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /revenueWeek=revenueCalendar\.weeks\.find\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /budgetIndex=budgetCalendar\.weeks\.findIndex\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /revenueIndex=revenueCalendar\.weeks\.findIndex\(x=>x\.week===financePeriod\?\.sourceWeek\)/);
  assert.match(extractor, /YTD values run through that same source week/);
  assert.match(extractor, /for\(let col=1;col<=52;col\+\+\).*index:col-1/);
  assert.match(extractor, /vhFinCol\(1\)\+row\+':'\+vhFinCol\(52\)\+row/);
  assert.doesNotMatch(extractor, /blank inputs sum to £0/);
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
  assert.match(financeUi, /Green ↑ means revenue is above budget; red ↓ means it is below/);
  assert.match(financeUi, /revenue minus budget/);
  assert.match(financeUi, /presenterRenderFinance/);
  assert.match(financeUi, /Applied figures appear here after finance review and publication/);
  assert.match(financeUi, /vh26-finance-review-table/);
  assert.match(autosave, /\['Weekly budget', presenterMoney\(weeklyBudget\)\]/);
  assert.match(autosave, /\['Weekly gap to close', presenterVariance\(weeklyRevenue, weeklyBudget\)\]/);
  assert.match(autosave, /\['YTD gap to close', presenterVariance\(ytdRevenue, ytdBudget\)\]/);
  assert.match(autosave, /function presenterVariance\(revenue, budget\)/);
  assert.match(autosave, /variance = Number\(revenue\) - Number\(budget\)/);
  assert.match(autosave, /presenterFinanceCard\(slide, context\)/);
  assert.match(autosave, /DEPARTMENT FINANCIAL OVERVIEW/);
  assert.match(autosave, /No published finance figures are available for this department and week/);
  assert.match(autosave, /Finance source NRW WK/);
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
  const presenter = financeUi.slice(financeUi.indexOf('async function presenterRenderFinance(root)'), financeUi.indexOf('const renderConnectedPresenterDepartment=renderPresenterSlide'));
  assert.match(presenter, /textContent='Refresh figures'/);
  assert.match(presenter, /presenterPublishedFinance=await dataApi\('finance_published'\)/);
  assert.doesNotMatch(presenter, /vhGetPresenterFinanceCache/);
  assert.match(presenter, /presenterPublishedFinanceWeekId=week\?\.id/);
  assert.match(presenter, /refresh\.addEventListener\('click',\(\)=>\{window\.vhInvalidatePresenterFinanceCache\?\.\(\);presenterPublishedFinance=null;presenterPublishedFinanceWeekId=null;renderPresenterSlide\(\)\}\)/);
  assert.match(presenter, /if\(!pubs\.length\)status\.textContent=/);
  assert.doesNotMatch(presenter, /if\(!pubs\.length\)\{status\.textContent=[^}]+return\}/);
  assert.match(presenter, /for\(const dep of financeDepartments\)/);
  assert.match(presenter,/Finance source week: NRW WK/);
  assert.match(presenter,/managementPeriodIndex>=2\?financePeriods\[managementPeriodIndex-2\]:null/);
  assert.match(presenter, /const companyAggregate=key=>/);
  assert.match(presenter, /Partial total · \$\{result\.reported\} of \$\{result\.total\} departments reported/);
  assert.match(presenter, /const companyVariance=\(revenueKey,budgetKey\)=>/);
  assert.match(autosave, /window\.vhInvalidatePresenterFinanceCache = \(\) => presenterApiCache\.finance\.clear\(\)/);
  assert.match(financeUi, /window\.vhInvalidatePresenterFinanceCache\?\.\(\)/);
  assert.match(autosave, /signal: AbortSignal\.timeout\(20000\)/);
  assert.match(autosave, /Presenter request timed out\. Use Refresh to try again\./);
  assert.match(autosave, /if \(op === 'finance_published'\) presenterApiCache\.finance\.clear\(\)/);
});

test('a late finance response cannot overwrite a department Presenter slide', () => {
  const start = financeUi.indexOf('async function presenterRenderFinance(root)');
  const end = financeUi.indexOf('const renderConnectedPresenterDepartment=renderPresenterSlide', start);
  assert.ok(start >= 0 && end > start);
  const presenter = financeUi.slice(start, end);
  assert.match(presenter, /if\(!presenterPublishedFinance\)\{[\s\S]*?presenterPublishedFinance=await dataApi\('finance_published'\);[\s\S]*?if\(root\.querySelector\(':scope > h1'\)\?\.textContent\.trim\(\)!=='Finance & Commercial'\|\|document\.querySelector\('#vh26-presenter-tabs button\.selected'\)\?\.textContent\.trim\(\)!=='Finance & Commercial'\)return;/);
});
test('connected finance summary resolves the database aliases for TWS, Midland Metro and Signalling',()=>{
  assert.match(financeUi,/const financeAliases=\{TWS:\['TRACKWARNINGSYSTEMS'\],'MMA':\['MIDLANDMETRO'\],'S&T':\['SIGNALLING'\]\}/);
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
