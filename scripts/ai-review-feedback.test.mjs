import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');

test('AI review feedback clears when the report text changes or the section rerenders',()=>{
  assert.match(html,/function renderSection\(\)\{const aiFeedback=document\.getElementById\('vh26-ai-feedback'\);if\(aiFeedback\)aiFeedback\.textContent='';const keys=/);
  assert.match(html,/const clearStaleReview=\(\)=>\{const feedback=document\.getElementById\('vh26-ai-feedback'\);if\(feedback\)feedback\.textContent=''\};document\.getElementById\('vh26-section-notes'\)\?\.addEventListener\('input',clearStaleReview\)/);
});
