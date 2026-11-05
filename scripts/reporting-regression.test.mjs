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
const token='test-only-access-token-with-at-least-thirty-characters';
test('a stale session restore cannot erase a newer sign-in session',()=>{const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');assert.match(html,/async function restore\(\)\{const raw=sessionStorage\.getItem\(key\);if\(!raw\)return;let session;try\{session=JSON\.parse\(raw\);await enterConnected\(session\)\}catch\{if\(sessionStorage\.getItem\(key\)!==raw\)return;/);assert.match(html,/catch\{if\(sessionStorage\.getItem\(key\)===raw\)sessionStorage\.removeItem\(key\);message\('Session expired\. Sign in again\.'\)\}\}\}/);});
async function request(op,extra,responses){
  const previous=globalThis.fetch, calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    const next=responses.shift();
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
test('weeks lookup returns all rail periods for lagged finance source validation',async()=>{
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
test('finance import and reconciliation are disabled unless the deploy-scoped staging gate is set',async()=>{
  for(const op of ['finance_import','finance_reconcile']){
    const out=await request(op,{},[{body:{id}}]);
    assert.equal(out.status,503);assert.equal(out.body.code,op==='finance_reconcile'?'FINANCE_RECONCILIATION_DISABLED':'FINANCE_STAGING_WRITES_DISABLED');assert.equal(out.calls.length,1);
  }
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
    assert.match(out.calls[2].url,/\/rpc\/vh_finance_reconcile$/);
    assert.equal(out.calls[2].options.headers.authorization,'Bearer '+token);
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
test('finance register exposes only per-import reconciled and publish actions when enabled',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/item\.can_reconcile&&data\.reconciliation_enabled\)action\('Reconcile validated import','finance_reconcile'\)/);
  assert.match(html,/item\.can_publish&&data\.publication_enabled\)action\('Publish finance figures','finance_publish'\)/);
  assert.match(html,/Reconciliation stays disabled until the workbook warning and formula checks are stored with this import/);
  assert.match(html,/Enter the review rationale \(at least 8 characters\)/);
  assert.match(html,/const data=await dataApi\('finance_review'\);const imports=data\.imports\|\|\[\]/);
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
    assert.match(out.calls[2].url,/\/rpc\/vh_finance_publish$/);
    assert.deepEqual(JSON.parse(out.calls[2].options.body),{p_import_id:id,p_comment:'Acceptance publication rationale'});
    assert.equal(out.calls[2].options.headers.authorization,'Bearer '+token);
  }finally{if(prior===undefined)delete process.env.VH_FINANCE_PUBLICATION_ENABLED;else process.env.VH_FINANCE_PUBLICATION_ENABLED=prior}
});
test('connected API requests time out with an actionable status',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('request=(async()=>{const response=await fetch'));
  assert.ok(html.includes('body=await response.json()'));
  assert.ok(html.includes('Promise.race([request,deadline])'));
  assert.ok(html.includes('controller.abort()'));
  assert.ok(html.includes('Staging service timed out. Try again.'));
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
  const fn=html.indexOf('function renderSection(){');
  const end=html.indexOf('\nasync function loadPublishedFinance',fn);
  assert.ok(fn>0&&end>fn);
  for(const [status,editable,manager,disabled] of [['reopened',true,true,false],['draft',true,true,false],['submitted',false,true,true],['reopened',true,false,true]]){
    const nodes=new Map();
    const make=()=>({hidden:false,disabled:false,value:'',textContent:'',style:{},classList:{contains(){return false},toggle(){}},querySelector(){return null},replaceChildren(){},querySelectorAll(){return []},append(){},setAttribute(){},addEventListener(){}});
    const document={getElementById(id){if(!nodes.has(id))nodes.set(id,make());return nodes.get(id)},querySelector(){return make()},querySelectorAll(){return []},createElement:make};
    const source=html.slice(fn,end).replace(/function renderHsqeFields\([\s\S]*?\n(?=function renderSection)/,'');
    vm.runInNewContext(source+';renderSection();',{document,selectedDepartment:{id:'dept',code:'department',display_name:'Department'},selectedSection:'delivery',selectedWeek:'week',nativeData:{sections:[],weeks:[],reports:[]},context:()=>({report:{id:'report',status},editable}),canManage:()=>manager,currentReportKeys:()=>['pipeline','delivery','programme','risks','resources','review'],currentReportLabels:()=>['Pipeline','Delivery','Programme','Risks','Resources','Review & submit'],renderPipeline(){},renderReview(){},reportSectionComplete:()=>true,reportComplete:()=>true,reportMessage(){},addEntry(){},confirmReportingLeave:()=>true});
    assert.equal(nodes.get('vh26-submit-report').disabled,disabled,`${status}, manager=${manager}`);
  }
});
test('connected Action Log uses a dedicated view and the Build 052 table layout',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const nav=html.indexOf("side.querySelector('[data-connected-nav=\"actions\"]')");
  const navEnd=html.indexOf("side.querySelector('[data-connected-nav=\"finance\"]')",nav);
  assert.ok(nav>0&&navEnd>nav);
  const handler=html.slice(nav,navEnd);
  assert.match(handler,/vh26-action-view-active/);
  assert.doesNotMatch(handler,/scrollIntoView/);
  const renderer=html.slice(html.indexOf('function renderActions(){'),html.indexOf('\nasync function loadActions'));
  for(const heading of ['Department','Action','Owner','Due date','Status','Created in','Completed'])assert.ok(renderer.includes(heading));
  assert.match(html,/vh26-visual-restoration-routes/);
  assert.match(html,/vh26-workspace-active:not\(\.vh26-action-view-active\):not\(\.vh26-finance-view-active\).*#vh26-finance-preview/);
});
test('department report reveals core content before background finance and action loads finish',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const load=html.slice(html.indexOf('async function loadNative(){'),html.indexOf('\nfunction openDepartment('));
  assert.ok(load.indexOf('renderSection();')<load.indexOf('loading.hidden=true'));
  assert.ok(load.indexOf('loading.hidden=true')<load.indexOf('Promise.allSettled(secondary)'));
  assert.match(load,/reportLoadGeneration/);
});
test('manager Action Log shares Presenter Mode controls and navigation has one active route',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/vh26-action-view-active #vh26-actions-workspace\{display:block!important;max-width:1100px/);
  assert.match(html,/vh26-action-view-active \.vh26-integration-notice\{display:none!important/);
  assert.match(html,/vh26-action-view-active\.vh26-workspace-active #vh26-native-report\{box-sizing:border-box;width:100%;max-width:1100px!important/);
  assert.match(html,/button\[aria-current="page"\]/);
  assert.match(html,/setConnectedNavActive=route=>/);
  assert.match(html,/vh26-action-view-active \.vh26-sidebar nav button\[data-connected-nav="report"\]\{background:transparent!important/);
  assert.match(html,/#vh26-connected-dashboard \.vh26-brand img\{display:none!important\}/);
  assert.match(html,/id="vh26-presenter-logo" src="\/rssi-logo\.png"/);
});
test('shared calendar upload remains host-gated and appends only via the atomic calendar RPC',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const api=readFileSync(new URL('../netlify/functions/acceptance.mjs',import.meta.url),'utf8');
  const sql=readFileSync(new URL('../database/rail_calendar_import.sql',import.meta.url),'utf8');
  assert.match(html,/Upload official rail calendar CSV/);
  assert.match(html,/Validate and add future weeks/);
  assert.match(api,/calendar_import/);
  assert.match(api,/rpc\/vh_import_rail_calendar/);
  assert.match(sql,/SECURITY DEFINER/);
  assert.match(sql,/existing periods are preserved/i);
  assert.match(sql,/role IN \('meeting_host', 'administrator'\)/);
});
test('published finance has its own view while import controls remain role-gated',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/pending reconciliation is staged only and will not appear/);
  assert.match(html,/intentional two-week reporting lag/);
  assert.match(html,/const financeRole=roles\.some\(r=>\['finance','finance_admin','administrator'\]\.includes\(r\.role\)\)/);
  assert.ok(html.includes('<button type="button" data-connected-nav="finance">£ Finance</button>'));
  assert.match(html,/vh26-finance-preview'\)\.hidden=!roles\.some/);
  assert.match(html,/vh26-finance-review'\)\.hidden=!financeRole/);
  assert.ok(html.includes("[data-connected-nav=\"finance\"]')?.addEventListener"));
});

test('Build 052 finance workbook layout stages XLSX through the authenticated finance API',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/Excel financial workbook/);
  assert.match(html,/accept="\.xlsx,application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet"/);
  assert.match(html,/window\.vhFinanceExtract=vhFinanceExtract;\s*function vhFinancePreview/);
  assert.match(html,/const financeReader=window\.vhFinanceExtract;if\(typeof financeReader!==\x27function\x27\)/);
  assert.match(html,/await financeReader\(file,sourceWeek\.id\)/);
  assert.match(html,/window\.vhFinDepartments=vhFinDepartments/);
  assert.match(html,/window\.vhFinDepartments\|\|\[\[\x27TWS\x27\]/);
  assert.match(html,/nativeData=\{weeks,periods:response\.periods\|\|\[\],reports:\[\],sections:\[\],departments:verifiedIdentity\?\.departments\|\|\[\]\}/);
  assert.match(html,/nativeData\?\.periods\|\|\[\]/);
  assert.match(html,/input_state,source_period_id/);
  assert.match(html,/dataApi\('finance_preview',\{rows\}\)/);
  assert.match(html,/dataApi\('finance_import',\{rows:v\.rows,file_name:v\.file_name\}\)/);
  assert.match(html,/vh26-finance-review-table/);
  assert.match(html,/workbookWarnings\.length>0/);
  assert.match(html,/if\(!v\.acknowledged\)/);
  assert.match(html,/amount=blank\?null:Number\(value\),input_state=blank\?'missing'/);
  assert.match(html,/hasValue\?total:null/);
  assert.match(html,/finance publication stays server-gated|finance_publish/);
  assert.match(html,/Approval &amp; publication/);
  assert.match(html,/Departments with finance figures/);
  assert.match(html,/byDepartment\.length===9&&byDepartment\.every\(x=>x\.values\[metric\]!==null\)/);
  assert.match(html,/vh26-finance-department-list/);
});

test('Build 050 Presenter Mode restores Safety Moment, finance and department tabs with rounded controls',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  for(const text of ['Safety Moment','Finance & Commercial','vh26-presenter-all','vh26-presenter-tabs','Generate Safety Moment','Write a Safety Moment','Save for this meeting','Create action'])assert.ok(html.includes(text),`Missing presenter control: ${text}`);
  assert.match(html,/function presenterRenderSafety\(root\)/);
  assert.match(html,/fetch\('\/.netlify\/functions\/safety-moment'/);
  assert.match(html,/dataApi\('finance_published'\)/);
  assert.match(html,/border-radius:999px/);
  assert.match(html,/vh26-presenter-mode:fullscreen/);
  assert.match(html,/id="vh26-session-loading"[\s\S]{0,500}Loading current workspace/);
  assert.match(html,/async function enterConnected\(session\)\{const loader=document\.getElementById\('vh26-session-loading'\)/);
});
test('Presenter reads separate pipeline opportunities and omits false status and duplicate department headings',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/\['weeks','reports','sections','pipeline'\]/);
  const renderer=html.slice(html.indexOf('function renderPresenterSlide(){'),html.indexOf('function openPresenterMode()'));
  assert.match(renderer,/hostData\?\.pipeline/);assert.match(renderer,/item\.customer/);assert.doesNotMatch(renderer,/Report status:/);
  assert.match(renderer,/const labels=\[\['pipeline','Pipeline'\],\['delivery','Delivery'\],\['programme','Programme'\],\['risks','Risks'\],\['resources','Resources'\]\]/);
  assert.match(renderer,/Not reported for this week/);assert.match(renderer,/vh26-presenter-card/);
  assert.match(html,/vh26-presenter-pager\{position:fixed!important/);assert.match(html,/vh26-presenter-slide\{display:grid!important/);
  assert.match(html,/vh26-presenter-department-label\{display:none!important\}/);
});
test('manager submission blocks incomplete saved sections and restores Build 050 action/support controls',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/function reportComplete\(\)\{return currentReportKeys\(\)\.slice\(0,-1\)\.every\(reportSectionComplete\)\}/);
  assert.match(html,/Complete and save every required section before submission/);
  assert.match(html,/textContent='Create action'/);assert.match(html,/textContent='Support \('\+supportCount\+' outstanding\)'/);
  assert.match(html,/vh26-reopen-report/);assert.match(html,/function enable\(\).*message\(''\)/);
});
test('departmental AI Review preserves original text and spellchecks dynamic textareas',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/new MutationObserver\(markSpellcheck\)/);
  assert.match(html,/t\.spellcheck=true;t\.lang='en-GB'/);
  assert.match(html,/const original=field\?\.value\?\.trim\(\)/);
  assert.match(html,/Review ready\. Suggestions are optional; no report text has changed\./);
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
test('Presenter Mode opens directly on Safety Moment while readiness loads, and clears stale department tabs',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.ok(html.includes("document.getElementById('vh26-presenter-launch').addEventListener('click',()=>openPresenterMode())"));
  assert.match(html,/openPresenterMode=function\(\)\{if\(!hostDashboardAllowed\(\)\)return;const mode=document\.getElementById\('vh26-presenter-mode'\);mode\.hidden=false;presenterModeView='safety';presenterDepartmentIndex=0;syncPresenterDepartments\(\);renderPresenterTabs\(\);renderPresenterSlide\(\);Promise\.resolve\(loadHostReadiness\(\)\)/);
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
  const reports=html.indexOf("const names=['reports','sections','pipeline'],results=await Promise.allSettled(names.map(request))",load);
  assert.ok(load>0&&weeks>load&&reports>weeks);
  assert.match(html,/syncPresenterDepartments\(\);const request=async op=>/);
  assert.match(html,/hostData=\{weeks:\[\],reports:\[\],sections:\[\],pipeline:\[\],loading:\{weeks:true,reports:true,sections:true,pipeline:true\}/);
  assert.match(html,/const names=\['reports','sections','pipeline'\],results=await Promise\.allSettled\(names\.map\(request\)\)/);
  assert.match(html,/hostData\[name\]=result\.value\.items\|\|\[\]/);
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
  assert.match(html,/open the HSQE rolling registers/);
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
  for(const department of ['Managed Environments','Civils','Rail Operations','S&T','TWS','Welding','MMA','HS2','Montel','HSQE','Bids/RFQs'])assert.ok(declaration.includes(`'${department}'`),department+' is available');
});
