import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const autosave = readFileSync(new URL('../public/autosave.js', import.meta.url), 'utf8');
const financeUi = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const financeFlow = financeUi.slice(financeUi.indexOf("const financeFile=document.getElementById('vh26-finance-file')"), financeUi.indexOf('async function financeReviewRefresh()'));

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

test('finance checks and import history are readable without an inner results scrollbar', () => {
  assert.match(autosave, /vh26-finance-preview-results\{display:flex!important;flex-direction:column!important;max-height:none!important;overflow:visible!important\}/);
  assert.match(autosave, /vh26-finance-preview-results \.vh26-finance-warning\{order:0!important/);
  assert.match(autosave, /function polishFinanceHistory\(\)/);
  assert.match(autosave, /if \(importId && seen\.has\(importId\)\)/);
  assert.match(autosave, /Finance files for review/);
  assert.match(autosave, /Only approved figures appear in reports/);
  assert.match(autosave, /waiting for review/);
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
