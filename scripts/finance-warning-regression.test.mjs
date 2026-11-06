import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const autosave = readFileSync(new URL('../public/autosave.js', import.meta.url), 'utf8');

function installFinanceCheckCorrection(result) {
  const window = { vhFinanceExtract: async () => structuredClone(result) };
  const document = {
    createElement: () => ({ textContent: '', style: { setProperty() {} } }),
    head: { append() {} },
    querySelectorAll: () => [],
    readyState: 'loading',
    addEventListener() {}
  };
  vm.runInNewContext(autosave, { window, document, setTimeout, clearTimeout });
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
