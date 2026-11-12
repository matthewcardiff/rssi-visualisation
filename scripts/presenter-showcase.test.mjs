import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/vh26-reporting.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('Presenter uses saved staging reports instead of an illustrative overlay', () => {
  assert.doesNotMatch(source, /Show illustrative examples|Hide illustrative examples|presenterShowcase|ILLUSTRATIVE EXAMPLE/);
  assert.doesNotMatch(source, /suppressSyntheticPresenterCards/);
  assert.match(source, /presenterApi\('sections'\)/);
  assert.match(source, /content\.demo/);
});

test('finance overview excludes non-finance departments and filters all table rows', () => {
  assert.match(source, /new Set\(\['HSQE','Bids\/RFQs'\]\)/);
  assert.match(source, /slide\.querySelectorAll\('table tr'\)/);
  assert.match(source, /label === 'Department'/);
  assert.match(source, /of 10 finance departments reported/);
  assert.match(source, /vh26-presenter-finance-source-caption/);
});

test('HSQE and Bids/RFQs use their agreed presenter content', () => {
  for (const key of ['hsqe_accidents', 'hsqe_close_calls', 'hsqe_assurance', 'hsqe_events', 'hsqe_documents']) {
    assert.ok(source.includes(key), `HSQE presenter includes ${key}`);
  }
  assert.match(source, /https:\/\/rssi-bid-hub-staging2\.netlify\.app\/#\/tracker/);
  assert.match(source, /presenterDepartmentForName/);
});

const presenterPage = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('Meeting readiness loads actions before displaying the open-action total', () => {
  assert.ok(presenterPage.includes("const names=['reports','sections','pipeline','actions']"));
  assert.ok(presenterPage.includes("if(name==='actions')presenterActions=items;else hostData[name]=items"));
  assert.ok(presenterPage.includes("if(hostData?.loading?.actions||errors.actions)actionsNode.textContent='—'"));
});

test('Presenter Mode company overview uses green for favourable gaps and keeps adverse gaps red', () => {
  assert.ok(presenterPage.includes('number.className=\'vh26-finance-variance-\'+(value<=0?\'favourable\':\'adverse\')'));
  assert.ok(presenterPage.includes('.vh26-presenter-company-overview article strong.vh26-finance-variance-favourable{color:#17633c!important}'));
  assert.ok(presenterPage.includes('.vh26-presenter-company-overview article strong.vh26-finance-variance-adverse{color:#a12a16!important}'));
});

test('Presenter Safety Moment sends and remembers recent generated topics', () => {
  assert.match(indexSource, /category:cat\.value,recent:/);
  assert.match(indexSource, /weeklyportal-safety-moment-generated-history/);
  assert.match(indexSource, /presenterSafetyDraft=\{\.\.\.data,category:cat\.value,week:week\?\.id\}/);
});
