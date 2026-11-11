import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import handler from '../netlify/functions/acceptance.mjs';

const id='11111111-1111-4111-8111-111111111111';
process.env.SUPABASE_URL='https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY='fixture-public-key';
delete process.env.VH_FINANCE_WRITES_ACCEPTED;
delete process.env.VH_FINANCE_STAGING_WRITES;
const token='local-test-session-not-a-secret-value';
test('a stale session restore cannot erase a newer sign-in session',()=>{const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');assert.match(html,/async function restore\(\)\{const raw=sessionStorage\.getItem\(key\);if\(!raw\)return;let session;try\{session=JSON\.parse\(raw\);await enterConnected\(session\)\}catch\{if\(sessionStorage\.getItem\(key\)!==raw\)return;/);assert.match(html,/catch\{if\(sessionStorage\.getItem\(key\)===raw\)sessionStorage\.removeItem\(key\);message\('Session expired\. Sign in again\.'\)\}\}\}/);});
async function request(op,extra,responses){
  const previous=globalThis.fetch, calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    const routeIndex=responses.findIndex(response=>response.match&&url.includes(response.match));
    const next=routeIndex>=0?responses.splice(routeIndex,1)[0]:responses.shift();
    assert.ok(next,'Unexpected upstream request: '+url);
    return new Response(JSON.stringify(next.body),{status:next.status??200,headers:{'content-type':'application/json'}});
  };
  try{
    const response=await handler(new Request('https://fixture.example/api/acceptance',{method:'POST',body:JSON.stringify({op,access_token:token,...extra})}));
    return {status:response.status,body:await response.json(),calls};
  }finally{globalThis.fetch=previous}
}
test('next reporting week is host-only and uses the next chronological rail calendar period',async()=>{
  const previous='22222222-2222-4222-8222-222222222222',next='33333333-3333-4333-8333-333333333333';
  const out=await request('create_week',{},[
    {body:{id}},
    {body:[{role:'meeting_host'}]},
    {body:[{rail_period_id:previous}]},
    {body:[{id:previous,start_date:'2026-10-24',end_date:'2026-10-30'},{id:next,start_date:'2026-10-31',end_date:'2026-11-06'}]},
    {body:[{id,rail_period_id:next,status:'open'}]}
  ]);
  assert.equal(out.status,200);
  assert.equal(out.body.items[0].rail_period_id,next);
  assert.equal(out.calls.at(-1).options.headers.authorization,'Bearer '+token);
  assert.deepEqual(JSON.parse(out.calls.at(-1).options.body),{rail_period_id:next,status:'open',creation_method:'manual'});
});
test('reporting week creation is denied before calendar lookup for non-host roles',async()=>{
  const out=await request('create_week',{},[{body:{id}},{body:[]}]);
  assert.equal(out.status,403);
  assert.equal(out.calls.length,2);
});
test('shared rail calendar import is host-authorised and sent to the atomic database function',async()=>{
  const periods=[{week_number:40,start_date:'2027-12-25',end_date:'2027-12-31'}];
  const out=await request('calendar_import',{periods},[
    {body:{id}},
    {body:[{role:'meeting_host'}]},
    {body:{inserted_periods:1,rows_checked:1}}
  ]);
  assert.equal(out.status,200);
  assert.match(out.calls.at(-1).url,/rpc\/vh_import_rail_calendar$/);
  assert.equal(out.calls.at(-1).options.headers.authorization,'Bearer '+token);
  assert.deepEqual(JSON.parse(out.calls.at(-1).options.body),{p_periods:periods});
});
test('shared rail calendar import is denied before database mutation for non-host roles',async()=>{
  const out=await request('calendar_import',{periods:[{week_number:40,start_date:'2027-12-25',end_date:'2027-12-31'}]},[
    {body:{id}},
    {body:[]}
  ]);
  assert.equal(out.status,403);
  assert.equal(out.calls.length,2);
});
test('weeks lookup returns all rail periods for selected-week finance validation',async()=>{
  const out=await request('weeks',{},[
    {body:{id}},
    {body:[{id,rail_period_id:id,status:'open'}]},
    {body:[{id,start_date:'2026-10-17',end_date:'2026-10-23'},{id:'33333333-3333-4333-8333-333333333333',start_date:'2026-10-31',end_date:'2026-11-06'}]}
  ]);
  assert.equal(out.status,200);
  assert.equal(out.body.items.length,1);
  assert.equal(out.body.periods.length,2);
  assert.equal(out.calls.length,3);
  assert.equal(out.calls[2].options.headers.authorization,'Bearer '+token);
});
test('a zero-row RLS-filtered section PATCH is reported as failure',async()=>{
  const out=await request('save_section',{report_id:id,section_key:'delivery',content:{notes:'Update'}},[{body:{id}},{body:[{id}]},{body:[]}]);
  assert.equal(out.status,409);assert.match(out.body.error,/not saved/);
});
test('a persisted section PATCH succeeds and uses the caller JWT',async()=>{
  const out=await request('save_section',{report_id:id,section_key:'delivery',content:{notes:'Update'}},[{body:{id}},{body:[{id}]},{body:[{id,content:{notes:'Update'}}]}]);
  assert.equal(out.status,200);assert.equal(out.body.items[0].content.notes,'Update');
  assert.equal(out.calls.at(-1).options.headers.authorization,'Bearer '+token);
});
test('a department manager can create an action only for their own department',async()=>{
  const out=await request('create_action',{department_id:id,reporting_week_id:id,description:'Pipeline follow-up',owner_text:'RS',required_by:'2026-11-13',support_text:''},[
    {body:{id}},{body:[]},{body:[{department_id:id}]},{body:[{id,description:'Pipeline follow-up'}]}
  ]);
  assert.equal(out.status,200);assert.match(out.calls[1].url,/role=in\.\(meeting_host,administrator,executive\)/);assert.match(out.calls[2].url,/department_memberships/);assert.equal(out.calls[3].options.method,'POST');
});
test('a department manager cannot create an action for another department',async()=>{
  const out=await request('create_action',{department_id:id,reporting_week_id:id,description:'Out of scope',owner_text:'RS',required_by:'2026-11-13',support_text:''},[
    {body:{id}},{body:[]},{body:[]}
  ]);
  assert.equal(out.status,403);assert.equal(out.calls.length,3);
});
test('incomplete reports can only be reopened through an authenticated status update',async()=>{
  const out=await request('reopen_report',{report_id:id},[{body:{id}},{body:[{id,status:'reopened'}]}]);
  assert.equal(out.status,200);assert.match(out.calls[1].url,/department_reports.*status=eq.submitted/);assert.equal(out.calls[1].options.method,'PATCH');assert.equal(out.calls[1].options.headers.authorization,'Bearer '+token);assert.equal(JSON.parse(out.calls[1].options.body).status,'reopened');
});
test('submission checks every saved report section before locking and does not query finance',async()=>{
  const sections=['pipeline','delivery','programme','risks','resources'].map(section_key=>({section_key,content:{notes:'Completed '+section_key}}));
  const out=await request('submit_report',{report_id:id},[{body:{id}},{body:[{id,department_id:id,status:'reopened',departments:{code:'managed-environments'}}]},{body:sections},{body:[]},{body:[{id,status:'submitted'}]}]);
  assert.equal(out.status,200);assert.match(out.calls[1].url,/status=in\.\(draft,reopened\)/);
  assert.equal(out.calls.length,5);assert.ok(out.calls.every(x=>!x.url.includes('finance')));assert.match(out.calls[3].url,/pipeline_opportunities/);
  assert.match(out.calls[2].url,/report_sections/);assert.match(out.calls[4].url,/status=in\.\(draft,reopened\)/);
});
test('submission rejects an incomplete report before changing its status',async()=>{
  const out=await request('submit_report',{report_id:id},[{body:{id}},{body:[{id,department_id:id,status:'draft',departments:{code:'managed-environments'}}]},{body:[{section_key:'pipeline',content:{notes:'Only one section'}}]},{body:[]}]);
  assert.equal(out.status,422);assert.match(out.body.error,/every required report section/);assert.equal(out.calls.length,4);
});
test('submitted, inaccessible or concurrently changed report is not falsely submitted',async()=>{
  const out=await request('submit_report',{report_id:id},[{body:{id}},{body:[]}]);assert.equal(out.status,409);
});
test('finance import and reconciliation are disabled unless all deploy-scoped write gates are unset',async()=>{
  const priorWrites=process.env.VH_FINANCE_STAGING_WRITES,priorProductionWrites=process.env.VH_FINANCE_PRODUCTION_WRITES,priorReconciliation=process.env.VH_FINANCE_RECONCILIATION_ENABLED;
  delete process.env.VH_FINANCE_STAGING_WRITES;delete process.env.VH_FINANCE_PRODUCTION_WRITES;delete process.env.VH_FINANCE_RECONCILIATION_ENABLED;
  try{for(const op of ['finance_import','finance_reconcile']){
    const out=await request(op,{},[{body:{id}}]);
    const expectedCode={finance_import:'FINANCE_STAGING_WRITES_DISABLED',finance_reconcile:'FINANCE_RECONCILIATION_DISABLED'}[op];
    assert.equal(out.status,503);assert.equal(out.body.code,expectedCode);assert.equal(out.calls.length,1);
  }}finally{if(priorWrites===undefined)delete process.env.VH_FINANCE_STAGING_WRITES;else process.env.VH_FINANCE_STAGING_WRITES=priorWrites;if(priorProductionWrites===undefined)delete process.env.VH_FINANCE_PRODUCTION_WRITES;else process.env.VH_FINANCE_PRODUCTION_WRITES=priorProductionWrites;if(priorReconciliation===undefined)delete process.env.VH_FINANCE_RECONCILIATION_ENABLED;else process.env.VH_FINANCE_RECONCILIATION_ENABLED=priorReconciliation}
});
test('finance Apply requires acknowledgement and sends workbook findings to the atomic staging RPC',async()=>{
  const prior=process.env.VH_FINANCE_STAGING_WRITES;process.env.VH_FINANCE_STAGING_WRITES='enabled';
  const period='44444444-4444-4444-8444-444444444444',source=period,department='66666666-6666-4666-8666-666666666666';
  const rows=['weekly_budget','weekly_revenue','ytd_budget','ytd_revenue'].map(metric_key=>({reporting_week_id:period,department_id:department,metric_key,amount:metric_key.includes('revenue')?null:125,input_state:metric_key.includes('revenue')?'missing':'value',source_period_id:source}));
  const references=[
    {body:{id}}, {body:[{role:'finance'}]},
    {match:'/departments?select=id,code,display_name,active',body:[{id:department,code:'tws',display_name:'Track Warning Systems',active:true}]},
    {match:'/rail_calendar_periods?select=id,rail_week,start_date,end_date',body:[{id:period,rail_week:32,start_date:'2026-11-07',end_date:'2026-11-13'}]},
    {match:'/reporting_weeks?select=id,rail_period_id',body:[{id:period,rail_period_id:period}]}
  ];
  try{
    const unacknowledged=await request('finance_import',{rows,file_name:'week32.xlsx',findings:['HS2: YTD revenue incomplete/unverified']},references.slice());
    assert.equal(unacknowledged.status,422);assert.equal(unacknowledged.body.committed,false);assert.match(unacknowledged.body.error,/acknowledge/);assert.equal(unacknowledged.calls.length,5);
    const applied=await request('finance_import',{rows,file_name:'week32.xlsx',findings:['HS2: YTD revenue incomplete/unverified'],findings_acknowledged:true},[...references,{body:{import_id:'88888888-8888-4888-8888-888888888888',imported_rows:4}}]);
    assert.equal(applied.status,200);
    const rpc=applied.calls.at(-1),body=JSON.parse(rpc.options.body);
    assert.match(rpc.url,/\/rpc\/vh_finance_stage_import$/);assert.equal(body.p_file_name,'week32.xlsx');assert.equal(body.p_reporting_week_id,period);
    assert.deepEqual(body.p_findings,['HS2: YTD revenue incomplete/unverified']);assert.equal(body.p_findings_acknowledged,true);assert.equal(body.p_metrics.length,4);
    assert.equal(body.p_metrics.find(row=>row.metric_key==='weekly_revenue').input_state,'missing');assert.equal(body.p_metrics.find(row=>row.metric_key==='weekly_revenue').amount,null);
    assert.equal(rpc.options.headers.authorization,'Bearer '+token);
  }finally{if(prior===undefined)delete process.env.VH_FINANCE_STAGING_WRITES;else process.env.VH_FINANCE_STAGING_WRITES=prior}
});
test('finance staging permission alone does not enable reconciliation before findings are persisted',async()=>{
  const prior=process.env.VH_FINANCE_STAGING_WRITES;process.env.VH_FINANCE_STAGING_WRITES='enabled';delete process.env.VH_FINANCE_RECONCILIATION_ENABLED;
  try{const out=await request('finance_reconcile',{import_id:id,confirm:true,comment:'Acceptance test reconciliation'},[{body:{id}}]);assert.equal(out.status,503);assert.equal(out.body.code,'FINANCE_RECONCILIATION_DISABLED');assert.equal(out.calls.length,1)}
  finally{if(prior===undefined)delete process.env.VH_FINANCE_STAGING_WRITES;else process.env.VH_FINANCE_STAGING_WRITES=prior}
});
test('enabled finance reconciliation authorises the administrator and preserves the caller JWT',async()=>{
  const prior=process.env.VH_FINANCE_STAGING_WRITES,priorRecon=process.env.VH_FINANCE_RECONCILIATION_ENABLED;process.env.VH_FINANCE_STAGING_WRITES='enabled';process.env.VH_FINANCE_RECONCILIATION_ENABLED='enabled';
  try{
    const out=await request('finance_reconcile',{import_id:id,confirm:true,comment:'Acceptance test reconciliation'},[
      {body:{id}},
      {body:[{role:'administrator'}]},
      {body:{reconciled:true,import_id:id}}
    ]);
    assert.equal(out.status,200);assert.equal(out.body.reconciled,true);
    const rpcCall=out.calls.at(-1);
    assert.match(rpcCall.url,/\/rpc\/vh_finance_reconcile$/);
    assert.equal(rpcCall.options.headers.authorization,'Bearer '+token);
  }finally{if(prior===undefined)delete process.env.VH_FINANCE_STAGING_WRITES;else process.env.VH_FINANCE_STAGING_WRITES=prior;if(priorRecon===undefined)delete process.env.VH_FINANCE_RECONCILIATION_ENABLED;else process.env.VH_FINANCE_RECONCILIATION_ENABLED=priorRecon}
});
test('finance staging gate does not grant the department manager finance RPC access',async()=>{
  const prior=process.env.VH_FINANCE_STAGING_WRITES,priorRecon=process.env.VH_FINANCE_RECONCILIATION_ENABLED;process.env.VH_FINANCE_STAGING_WRITES='enabled';process.env.VH_FINANCE_RECONCILIATION_ENABLED='enabled';
  try{
    const out=await request('finance_reconcile',{import_id:id,confirm:true,comment:'Manager denial acceptance test'},[
      {body:{id}},
      {body:[{role:'department_manager'}]}
    ]);
    assert.equal(out.status,403);assert.equal(out.calls.length,2);
  }finally{if(prior===undefined)delete process.env.VH_FINANCE_STAGING_WRITES;else process.env.VH_FINANCE_STAGING_WRITES=prior;if(priorRecon===undefined)delete process.env.VH_FINANCE_RECONCILIATION_ENABLED;else process.env.VH_FINANCE_RECONCILIATION_ENABLED=priorRecon}
});
test('finance publication stays server-gated even when staging imports are enabled',async()=>{
  const prior=process.env.VH_FINANCE_STAGING_WRITES;process.env.VH_FINANCE_STAGING_WRITES='enabled';
  const priorPublication=process.env.VH_FINANCE_PUBLICATION_ENABLED;delete process.env.VH_FINANCE_PUBLICATION_ENABLED;
  try{
  const out=await request('finance_publish',{import_id:id,confirm:true,comment:'Test only'},[{body:{id}}]);
  assert.equal(out.status,503);assert.equal(out.body.code,'FINANCE_PUBLICATION_DISABLED');assert.equal(out.calls.length,1);
  }finally{if(prior===undefined)delete process.env.VH_FINANCE_STAGING_WRITES;else process.env.VH_FINANCE_STAGING_WRITES=prior;if(priorPublication===undefined)delete process.env.VH_FINANCE_PUBLICATION_ENABLED;else process.env.VH_FINANCE_PUBLICATION_ENABLED=priorPublication}
});
test('finance review metadata stays backend-only while the upload flow publishes figures',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const financeFlow=html.slice(html.indexOf("const financeFile=document.getElementById('vh26-finance-file')"),html.indexOf('async function financeReviewRefresh()'));
  assert.doesNotMatch(html,/id="vh26-finance-review"/);
  assert.match(html,/async function financeReviewRefresh\(\)[\s\S]*?dataApi\('finance_review'\)/);
  assert.match(financeFlow,/dataApi\('finance_reconcile'/);
  assert.match(financeFlow,/dataApi\('finance_publish'/);
});
test('finance review allows only acknowledged missing-value warnings through to separate reconciliation',async()=>{
  const period='44444444-4444-4444-8444-444444444444',source='77777777-7777-4777-8777-777777777777',department='66666666-6666-4666-8666-666666666666';
  const importId='88888888-8888-4888-8888-888888888888';
  const metricRows=['weekly_budget','weekly_revenue','ytd_budget','ytd_revenue'].map(metric_key=>({finance_import_id:importId,department_id:department,reporting_week_id:period,metric_key,amount:metric_key.includes('revenue')?null:125,input_state:metric_key.includes('revenue')?'missing':'value',source_period_id:source,mapping_status:'pending',issues:[]}));
  const out=await request('finance_review',{},[
    {body:{id}},{body:[{role:'administrator'}]},
    {body:[{id:importId,file_name:'week32.xlsx',reporting_week_id:period,reconciliation_status:'pending',findings:['HS2: Weekly revenue missing or unverified','HS2: YTD revenue incomplete/unverified'],findings_acknowledged_by:id,findings_acknowledged_at:'2026-11-06T12:00:00Z'}]},
    {body:metricRows},{body:[]},
    {body:[{id:period,rail_period_id:'77777777-7777-4777-8777-777777777777'}]},
    {body:[{id:source,rail_week:30,start_date:'2026-10-10'},{id:'99999999-9999-4999-8999-999999999999',rail_week:31,start_date:'2026-10-24'},{id:'77777777-7777-4777-8777-777777777777',rail_week:32,start_date:'2026-11-07'}]},
    {body:[{id:department,display_name:'HS2'}]},{body:[]}
  ]);
  assert.equal(out.status,200);assert.equal(out.body.imports[0].can_reconcile,true);
  assert.deepEqual(out.body.imports[0].warnings,['HS2: Weekly revenue missing or unverified','HS2: YTD revenue incomplete/unverified']);
});
test('enabled finance publication requires finance role, rationale and database RPC approval',async()=>{
  const prior=process.env.VH_FINANCE_PUBLICATION_ENABLED;process.env.VH_FINANCE_PUBLICATION_ENABLED='enabled';
  try{
    const denied=await request('finance_publish',{import_id:id,confirm:true,comment:'Acceptance publication rationale'},[
      {body:{id}},{body:[{role:'department_manager'}]}
    ]);
    assert.equal(denied.status,403);assert.equal(denied.calls.length,2);
    const out=await request('finance_publish',{import_id:id,confirm:true,comment:'Acceptance publication rationale'},[
      {body:{id}},{body:[{role:'finance'}]},{body:{published:true}}
    ]);
    assert.equal(out.status,200);assert.equal(out.body.published,true);
    const rpcCall=out.calls.at(-1);
    assert.match(rpcCall.url,/\/rpc\/vh_finance_publish$/);
    assert.deepEqual(JSON.parse(rpcCall.options.body),{p_import_id:id,p_comment:'Acceptance publication rationale'});
    assert.equal(rpcCall.options.headers.authorization,'Bearer '+token);
  }finally{if(prior===undefined)delete process.env.VH_FINANCE_PUBLICATION_ENABLED;else process.env.VH_FINANCE_PUBLICATION_ENABLED=prior}
});
test('connected API requests time out with an actionable status',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('request=(async()=>{const response=await fetch'));
  assert.ok(html.includes('body=await response.json()'));
  assert.ok(html.includes('Promise.race([request,deadline])'));
  assert.ok(html.includes('controller.abort()'));
  assert.ok(html.includes('Staging service timed out. Check finance history before retrying.'));
});
test('legacy observers preserve locked authentication globals without throwing',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf("  // The connected authentication gate deliberately locks these globals.");
  const end=html.indexOf('\n  sync();',start);assert.ok(start>0&&end>start);
  const window={},original=()=>false;for(const name of ['enter','logout'])Object.defineProperty(window,name,{value:original,writable:false,configurable:false});
  vm.runInNewContext('"use strict";'+html.slice(start,end),{window,sync(){throw Error('Unexpected hook')}});
  assert.equal(window.enter,original);assert.equal(window.logout,original);
});
test('native submit control enables reopened manager reports and locks submitted reports',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf("document.getElementById('vh26-submit-report').addEventListener('click'");
  const end=html.indexOf("document.getElementById('vh26-submit-review').addEventListener('click'",start);
  assert.ok(start>=0&&end>start);
  const submit=html.slice(start,end);
  assert.ok(html.includes("['draft','reopened'].includes(c.report?.status)"));
  assert.ok(submit.includes("await dataApi('submit_report',{report_id:c.report.id})"));
  assert.ok(submit.includes('Report submitted and locked'));
});
test('Presenter department cards use the five saved reporting sections and an empty-state label',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const renderer=readFileSync(new URL('../public/vh26-reporting.js',import.meta.url),'utf8');
  assert.match(html,/const labels=\[\['pipeline','Pipeline'\],\['delivery','Delivery'\],\['programme','Programme'\],\['risks','Risks'\],\['resources','Resources'\]\]/);
  assert.match(renderer,/Not reported for this week/);
  assert.match(html,/vh26-presenter-pager\{position:fixed!important/);
  assert.match(html,/vh26-presenter-department-label\{display:none!important\}/);
});
test('Presenter keeps saved department report content available for the demo',()=>{
  const renderer=readFileSync(new URL('../public/vh26-reporting.js',import.meta.url),'utf8');
  assert.match(renderer,/presenterApi\('sections'\)/);
  assert.match(renderer,/content\.demo/);
  assert.doesNotMatch(renderer,/suppressSyntheticPresenterCards|synthetic content hidden/);
});
test('manager submission blocks incomplete saved sections and restores Build 050 action/support controls',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/function reportComplete\(\)\{return currentReportKeys\(\)\.slice\(0,-1\)\.every\(reportSectionComplete\)\}/);
  assert.match(html,/Complete and save every required section before submission/);
  assert.match(html,/textContent='Create action'/);assert.match(html,/textContent='Support \('\+supportCount\+' outstanding\)'/);
  assert.match(html,/vh26-reopen-report/);assert.match(html,/function enable\(\).*message\(''\)/);
});
test('Presenter Mode uses the embedded Build 050 logo and renders authorised departments before opening',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const logo=readFileSync(new URL('../public/rssi-logo.png',import.meta.url));
  assert.equal(logo.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.match(html,/id="vh26-presenter-logo" src="\/rssi-logo\.png"/);
  assert.match(html,/function syncPresenterDepartments\(\)/);
  assert.match(html,/syncPresenterDepartments\(\);const tabs=document\.getElementById\('vh26-presenter-tabs'\)/);
  assert.match(html,/presenterDepartments\.forEach\(\(d,i\)=>add/);
  assert.match(html,/No authorised departments were returned for this account/);
});
test('Presenter Mode opens on Finance & Commercial while readiness loads, and clears stale department tabs',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.ok(html.includes("document.getElementById('vh26-presenter-launch').addEventListener('click',()=>openPresenterMode())"));
  assert.match(html,/openPresenterMode=function\(\)\{if\(!hostDashboardAllowed\(\)\)return;const mode=document\.getElementById\('vh26-presenter-mode'\);mode\.hidden=false;presenterModeView='finance';presenterDepartmentIndex=0;syncPresenterDepartments\(\);renderPresenterTabs\(\);renderPresenterSlide\(\);Promise\.resolve\(loadHostReadiness\(\)\)/);
  assert.match(html,/add\('Finance & Commercial','finance'\);presenterDepartments\.forEach/);
  assert.match(html,/const financeDepartments=presenterDepartments\.filter\(d=>!\['hsqe','bids-rfqs'\]\.includes\(String\(d\.code\|\|''\)\.toLowerCase\(\)\)\)/);
  assert.match(html,/presenterDepartments=resolved/);
  assert.match(html,/function presenterDepartmentLabel\(department\)/);
  for(const [source,label] of [['Civils & Construction','Civils'],['Signalling','S&T'],['Track Warning Systems','TWS'],['Midland Metro','MMA']])assert.ok(html.includes(`['${source}','${label}']`));
});
test('Finance navigation opens its own week and workbook view without first opening a department report',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf("side.addEventListener('click',event=>{const button=event.target.closest('[data-connected-nav=\"finance\"]')");
  const end=html.indexOf("side.querySelector('#vh26-sidebar-signout')",start);
  assert.ok(start>0&&end>start);
  const route=html.slice(start,end);
  assert.match(route,/true\);async function openFinanceDirect\(\)/);
  assert.match(route,/await dataApi\('weeks'\)/);
  assert.match(route,/loadPublishedFinance\(\),financeReviewRefresh\(\)/);
  assert.doesNotMatch(route,/openDepartment\(/);
  assert.match(route,/visible\[0\]\|\|departments\.find\(x=>x\.active!==false\)/);
});
test('Reporting Weeks resolves independently, times out visibly and can be retried',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const load=html.indexOf('let hostReadinessGeneration=0;loadHostReadiness=async function(retry=0)');
  const weeks=html.indexOf("const result=await request('weeks')",load);
  const reports=html.indexOf("const names=['reports','sections','pipeline','actions'],results=await Promise.allSettled(names.map(request))",load);
  assert.ok(load>0&&weeks>load&&reports>weeks);
  assert.match(html,/syncPresenterDepartments\(\);const request=async op=>/);
  assert.match(html,/hostData=\{weeks:\[\],reports:\[\],sections:\[\],pipeline:\[\],loading:\{weeks:true,reports:true,sections:true,pipeline:true,actions:true\}/);
  assert.match(html,/const names=\['reports','sections','pipeline','actions'\],results=await Promise\.allSettled\(names\.map\(request\)\)/);
  assert.match(html,/if\(name==='actions'\)presenterActions=items;else hostData\[name\]=items/);
  assert.match(html,/request timed out after 8 seconds/);
  assert.match(html,/Retry loading weeks/);
  assert.match(html,/Reporting weeks unavailable:/);
});
test('host Action Log buttons use the shared compact control size',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/#vh26-connected-dashboard\.vh26-host-layout-active #vh26-presenter-actions button\{box-sizing:border-box;min-height:36px;padding:8px 12px!important/);
});
test('finance import endpoint accepts the approved xlsx workbook extension',()=>{
  const api=readFileSync(new URL('../netlify/functions/acceptance.mjs',import.meta.url),'utf8');
  assert.ok(api.includes('\\.(?:csv|xlsx)$/i.test(data.file_name)'));
  assert.match(api,/Valid Excel workbook or CSV file name required/);
  for(const migration of ['../database/finance_atomic_import.sql','../database/finance_rpc_only_review.sql']){
    const sql=readFileSync(new URL(migration,import.meta.url),'utf8');
    assert.ok(sql.includes('\\.(csv|xlsx)$'));
  }
});

test('Report Absence opens the Build 052 screen and linked staging form',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const nav=html.indexOf("side.querySelector('[data-connected-nav=\"absence\"]')");
  const navEnd=html.indexOf("side.querySelector('#vh26-sidebar-signout')",nav);
  assert.ok(nav>0&&navEnd>nav);
  const handler=html.slice(nav,navEnd);
  assert.match(handler,/vh26-absence-view-active/);
  assert.doesNotMatch(handler,/unavailable for this connected account/);
  assert.match(html,/id='vh26-absence-workspace'/);
  assert.match(html,/window\.vhOpenAttendance\(\)/);
  assert.match(html,/vh26-absence-view-active #vh26-absence-workspace/);
});

test('absence reasons are not stored in browser local storage',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/vh-absence-draft/);
  assert.match(html,/No absence details are stored in this browser/);
});

test('leaving Report Absence hides its card and restores the target page heading',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/const closeAbsenceView=\(\)=>\{const absencePanel=document\.getElementById\('vh26-absence-workspace'\);if\(absencePanel\)absencePanel\.hidden=true/);
  for(const route of ['departments','report','actions','finance']){
    const start=html.indexOf("side.querySelector('[data-connected-nav=\""+route+"\"]')");
    assert.ok(start>0,route+' route exists');
    const end=html.indexOf("side.querySelector('[data-connected-nav=",start+40);
    const handler=html.slice(start,end>start?end:start+1200);
    assert.match(handler,/closeAbsenceView\(\)/,route+' clears absence view');
  }
  const render=html.slice(html.indexOf('function renderSection(){'),html.indexOf('async function loadPublishedFinance'));
  assert.match(render,/absenceView\?'Report absence':isBids\?'Bids \/ RFQs':'Department report'/);
  assert.match(html,/title\.textContent='Department report'/);
});

test('HSQE uses its five specialist sections plus review and saves fields in the supported schema',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  for(const key of ['hsqe_accidents','hsqe_close_calls','hsqe_assurance','hsqe_events','hsqe_documents'])assert.ok(html.includes("key:'"+key+"'"));
  assert.match(html,/function currentReportKeys\(\)\{return selectedDepartment\?\.code==='hsqe'\?\[\.\.\.hsqeReportSections\.map\(x=>x\.key\),'review'\]/);
  assert.match(html,/selectedDepartment\.code==='hsqe'\)\{const fields=Object\.fromEntries\(\[\.\.\.document\.querySelectorAll\('#vh26-hsqe-fields \[data-hsqe-field\]'\)/);
  assert.match(html,/section_key:selectedSection,content\}/);
  assert.doesNotMatch(html,/HSQE rolling registers|vh26-hsqe-register-link/);
  assert.match(html,/const aiReviewButton=document\.getElementById\('vh26-ai-review'\);if\(aiReviewButton\)aiReviewButton\.hidden=isHsqe/);
  assert.match(html,/#vh26-hsqe-fields\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\);gap:22px 26px/);
  assert.match(html,/Spelling check · UK English:/);
  assert.match(html,/vhFindSpellingIssues\(original\)/);
});

test('Bids/RFQs bypasses the generic report and links from the Build 052 workspace to Bid Hub',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/department\.code==='bids-rfqs'\)renderSection\(\);else loadNative\(\)/);
  assert.match(html,/id="vh26-bids-workspace"/);
  assert.match(html,/https:\/\/rssi-bid-hub-staging2\.netlify\.app\/#\/tracker/);
  assert.match(html,/vh26-connected-dashboard\.vh26-bids-active #vh26-native-report\{display:none!important\}/);
});

test('Bids/RFQs workspace state clears before switching to other connected routes',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/dash\.classList\.remove\('vh26-action-view-active','vh26-finance-view-active','vh26-absence-view-active','vh26-bids-active'\)/);
  assert.match(html,/function closeBidsView=|const closeBidsView=\(\)=>\{dash\.classList\.remove\('vh26-bids-active'\)/);
  for(const route of ['departments','report','actions','finance','absence']){
    const start=html.indexOf("side.querySelector('[data-connected-nav=\""+route+"\"]')");
    assert.ok(start>0,route+' route exists');
    const end=html.indexOf("side.querySelector('[data-connected-nav=",start+40);
    assert.ok(html.slice(start,end>start?end:start+1200).includes('closeBidsView()'),route+' clears Bid Hub content');
  }
  assert.match(html,/classList\.remove\('vh26-workspace-active','vh26-bids-active'\)/);
});

test('meeting host view is role-gated and supplies live readiness plus read-only Presenter Mode',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/function hostDashboardAllowed\(identity=verifiedIdentity\)\{return !!identity\?\.roles\?\.some\(r=>\['meeting_host','executive','administrator'\]\.includes\(r\.role\)\)\}/);
  assert.match(html,/hostData\.reports\.filter\(r=>r\.reporting_week_id===week\.id&&r\.status==='submitted'&&departments\.includes\(r\.department_id\)&&hostReportComplete\(r\)/);
  assert.match(html,/const departments=presenterDepartments\.map\(d=>d\.id\),submitted=new Set\(\(hostData\.reports\|\|\[\]\)\.filter\(r=>r\.reporting_week_id===week\.id&&r\.status==='submitted'&&departments\.includes\(r\.department_id\)&&hostReportComplete\(r\)\)/);
  assert.match(html,/id="vh26-host-submitted"/);
  assert.match(html,/id="vh26-host-awaiting"/);
  assert.match(html,/id="vh26-host-open-actions"/);
  assert.match(html,/id="vh26-presenter-launch"/);
  assert.match(html,/id="vh26-presenter-mode"/);
  for(const id of ['vh26-host-week','vh26-host-submitted','vh26-host-awaiting','vh26-host-open-actions'])assert.equal([...html.matchAll(new RegExp('id="'+id+'"','g'))].length,1,`${id} is unique from the hidden legacy interface`);
  assert.match(html,/getElementById\('vh26-host-submitted'\)\.textContent=String\(submitted\.size\)/);
  assert.match(html,/if\(!week\)\{status\.textContent='No open reporting week is available to calculate readiness\.';for\(const id of \['vh26-host-submitted','vh26-host-awaiting'\]\)/);
  assert.doesNotMatch(html,/for\(const id of \['hubSubmittedCount','hubAttentionCount'\]\)document\.getElementById\(id\)\.textContent/);
  assert.match(html,/function canHostActions\(\)\{return !!verifiedIdentity\?\.roles\?\.some\(r=>\['meeting_host','administrator','executive'\]\.includes\(r\.role\)\)\}/);
  assert.match(html,/function canManageDepartmentActions\(\)\{return canHostActions\(\)\|\|canManage\(\)\}/);
});

test('host dashboard and action register are hidden while navigating to other workspaces',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/function setHostHomeVisible\(visible\)\{const active=!!\(visible&&hostDashboardAllowed\(\)\)/);
  assert.match(html,/dash\.classList\.toggle\('vh26-host-layout-active',active\)/);
  assert.match(html,/presenterRoot\.hidden=true/);
  assert.ok(html.includes('function openDepartment(department,initialWeekId=null){if(!confirmReportingLeave())return;setHostHomeVisible(false);'));
  const home=html.slice(html.indexOf("side.querySelector('[data-connected-nav=\"departments\"]')"),html.indexOf("side.querySelector('[data-connected-nav=\"report\"]')"));
  assert.ok(home.includes('setHostHomeVisible(false)'), 'Home / Departments must leave the host-only layout');
  const absence=html.slice(html.indexOf("side.querySelector('[data-connected-nav=\"absence\"]')"),html.indexOf("side.querySelector('#vh26-sidebar-signout')"));
  assert.ok(absence.includes('setHostHomeVisible(false)'));
});

test('Build 050 Reporting Weeks restores department filtering, report counts, view and next-week controls',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/vh26-host-weeks-department/);
  assert.match(html,/Department reports started/);
  assert.match(html,/hostData\.loading\?\.reports\?'Loading…':hostData\.errors\?\.reports\?'Unavailable'/);
  assert.match(html,/started\.size\+' \/ '\+presenterDepartments\.length/);
  assert.match(html,/function addNextHostWeek\(status\)/);
  assert.match(html,/dataApi\('create_week'\)/);
  assert.match(html,/openDepartment\(d,week\.id\)/);
  assert.match(html,/Download calendar CSV/);
  assert.match(html,/vh26-host-calendar-controls/);
});

test('Presenter full-window fallback keeps fullscreen control usable without the Fullscreen API',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/typeof presenterMode\.requestFullscreen!=='function'/);
  assert.match(html,/vh26-pseudo-fullscreen/);
  assert.match(html,/document\.body\.style\.overflow='hidden'/);
  assert.match(html,/vh26-presenter-fullscreen/);
});

test('administrator lands in the department workspace and retains an explicit Meeting Overview route',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/const host=hostDashboardAllowed\(identity\),administrator=\(identity\.roles\|\|\[\]\)\.some\(r=>r\.role==='administrator'\);[\s\S]{0,260}setHostHomeVisible\(host&&!administrator\)/);
  assert.match(html,/hostDashboardAllowed\(identity\)\?'<button type="button" data-connected-nav="host">Meeting overview<\/button>':''/);
  assert.match(html,/side\.querySelector\('\[data-connected-nav="host"\]'\)\?\.addEventListener\('click'/);
});

test('Build 052 host dashboard restores responsive chrome, week selection and connected navigation',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/<h1>Visualisation <span class="hub-orange-word">Hub<\/span><\/h1>/);
  assert.match(html,/id="vh26-host-week-select" aria-label="Reporting Rail Week"/);
  for(const view of ['overview','actions','weeks','settings'])assert.match(html,new RegExp('data-host-view="'+view+'"'));
  assert.match(html,/function orderedHostWeeks\(\)\{return \[\.\.\.\(hostData\?\.weeks\|\|\[\]\)\]/);
  assert.match(html,/function setHostDashboardView\(view\)/);
  assert.match(html,/Session expired\. Select Sign out, then sign in again to load live readiness\./);
  assert.match(html,/vh26-host-session-error/);
  assert.match(html,/\.choose-head\{display:flex!important;position:relative!important;inset:auto!important;width:100%;height:46px!important;min-height:46px!important;box-sizing:border-box!important/);
  assert.match(html,/vh26-connected-dashboard\.vh26-host-layout-active \.vh26-host-welcome\{height:362px/);
  assert.match(html,/vh26-connected-dashboard\.vh26-host-layout-active \.vh26-host-nav\{display:flex/);
  assert.match(html,/renderHostWeeksList\(\)/);
});

test('department reporting is outside the host-only visibility container',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const host=html.indexOf('<section id="vh26-meeting-host"');
  const actions=html.indexOf('<section id="vh26-presenter-actions"');
  const departments=html.indexOf('id="vh26-department-grid"');
  const report=html.indexOf('<section id="vh26-report-workspace"');
  assert.ok(host>0&&actions>host&&departments>actions&&report>departments);
  assert.match(html.slice(host,actions),/id="vh26-presenter-mode"/);
  assert.doesNotMatch(html.slice(host,actions),/id="vh26-report-workspace"/);
  assert.doesNotMatch(html.slice(host,actions),/id="vh26-department-grid"/);
});

test('Home / Departments restores its heading and subtitle',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf("side.querySelector('[data-connected-nav=\"departments\"]')");
  const end=html.indexOf("side.querySelector('[data-connected-nav=",start+40);
  assert.ok(start>0&&end>start);
  const handler=html.slice(start,end);
  assert.match(handler,/closeAbsenceView\(\)/);
  assert.match(handler,/title\.textContent='Choose a department'/);
  assert.match(handler,/sub\.textContent='Select a department to view its weekly report'/);
  assert.match(handler,/vh26-back-departments/);
});

test('absence reporting includes the complete departmental list',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf('const depts=');
  const end=html.indexOf(';',start);
  const declaration=html.slice(start,end);
  for(const department of ['Managed Environments','Civils','Rail Operations','S&T','TWS','Welding','MMA','Montel','HS2 Bird Deterrant','HS2 Fencing','HSQE','Bids/RFQs'])assert.ok(declaration.includes(`'${department}'`),department+' is available');
});

test('planned reporting weeks lock Pipeline controls and reject save attempts in the UI',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf('function renderPipeline()');
  const end=html.indexOf('async function loadPipeline()',start);
  const pipeline=html.slice(start,end);
  assert.match(pipeline,/const c=context\(\),editable=c\.editable/);
  assert.match(pipeline,/const c=context\(\);if\(!c\.editable\)return/);
  assert.match(pipeline,/c\.week\?\.status==='planned'\?'This reporting week is planned/);
  assert.match(html,/document\.getElementById\('vh26-pipeline-add'\)\.addEventListener\('click',\(\)=>\{if\(!context\(\)\.editable\)return;/);
});

test('Finance & Commercial mirrors the selected-week matrix and signed variance rules',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf('function renderFinance(){'),end=html.indexOf('const oldEnter=window.enter;',start),finance=html.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.match(finance,/Finance figures for the same week/);
  assert.match(finance,/Weekly gap to close/);
  assert.match(finance,/YTD variance %/);
  assert.match(finance,/variance:yb===null\|\|yr===null\?null:yr-yb/);
  assert.match(finance,/totalValue\('ytdBudget'\)-totalValue\('ytdRevenue'\)/);
  assert.match(finance,/financeReports=reports\.filter\(\(\{d\}\)=>!\['HSQE','Bids\/RFQs'\]\.includes\(d\)\)/);
  assert.doesNotMatch(finance,/two-rail-week lag|two-week lag/i);
});

test('Finance week changes refresh the selected-week overview and discard stale finance responses',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf('let publishedFinanceLoadGeneration=0;');
  const end=html.indexOf('\nasync function loadNative()',start);
  const loader=html.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.match(loader,/requestedWeek=selectedWeek/);
  assert.match(loader,/generation!==publishedFinanceLoadGeneration\|\|selectedWeek!==requestedWeek/);
  assert.doesNotMatch(loader,/reporting_week_id===selectedWeek/);
  const weekStart=html.indexOf("document.getElementById('vh26-week').addEventListener('change',()=>{",end);
  const weekEnd=html.indexOf('\n});',weekStart);
  const financeWeekChange=html.slice(weekStart,weekEnd);
  assert.match(financeWeekChange,/selectedWeek=nextWeek/);
  assert.match(financeWeekChange,/void loadPublishedFinance\(\);void financeReviewRefresh\(\)/);
  const settledWeekSync=html.slice(weekEnd+4,html.indexOf('financeCheckButton.addEventListener',weekEnd));
  assert.match(settledWeekSync,/document\.addEventListener\('change',event=>\{/);
  assert.match(settledWeekSync,/queueMicrotask\(\(\)=>\{/);
  assert.match(settledWeekSync,/selectedWeek=select\.value;void loadPublishedFinance\(\);void financeReviewRefresh\(\)/);
  assert.doesNotMatch(settledWeekSync,/selectedWeek===select\.value/);
});

test('Finance week selection bypasses department-report navigation replay',()=>{
  const reporting=readFileSync(new URL('../public/vh26-reporting.js',import.meta.url),'utf8');
  const start=reporting.indexOf("dashboard?.addEventListener('change', event => {");
  const end=reporting.indexOf("root.addEventListener('input'",start);
  const handler=reporting.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.match(handler,/dashboard\.classList\.contains\('vh26-finance-view-active'\)/);
  assert.ok(handler.indexOf("contains('vh26-finance-view-active')")<handler.indexOf('runNavigation({ kind: \'week\''));
});

test('The native department week handler leaves Finance week changes to Finance',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf("document.getElementById('vh26-week').addEventListener('change',e=>{");
  const end=html.indexOf("document.getElementById('vh26-refresh').addEventListener",start);
  const handler=html.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.match(handler,/classList\.contains\('vh26-finance-view-active'\)\)return/);
  assert.ok(handler.indexOf("contains('vh26-finance-view-active')")<handler.indexOf('renderSection()'));
});

test('Finance review resolves explicitly mapped department codes and canonicalises their ids',()=>{
  const api=readFileSync(new URL('../netlify/functions/acceptance.mjs',import.meta.url),'utf8');
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(api,/r\.department_code\?departments\.find\(d=>normalizeCode\(d\.code\)===normalizeCode\(r\.department_code\)\):null/);
  assert.match(html,/record\.departmentId=dept\.id;record\.departmentCode=dept\.code;return metricValues\(record\)/);
  assert.match(html,/department_id:record\.departmentId/);
});
