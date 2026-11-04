import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import handler from '../netlify/functions/acceptance.mjs';

const id='11111111-1111-4111-8111-111111111111';
process.env.SUPABASE_URL='https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY='fixture-public-key';
delete process.env.VH_FINANCE_WRITES_ACCEPTED;
const token='test-only-access-token-with-at-least-thirty-characters';
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
test('a zero-row RLS-filtered section PATCH is reported as failure',async()=>{
  const out=await request('save_section',{report_id:id,section_key:'delivery',content:{notes:'Update'}},[{body:{id}},{body:[{id}]},{body:[]}]);
  assert.equal(out.status,409);assert.match(out.body.error,/not saved/);
});
test('a persisted section PATCH succeeds and uses the caller JWT',async()=>{
  const out=await request('save_section',{report_id:id,section_key:'delivery',content:{notes:'Update'}},[{body:{id}},{body:[{id}]},{body:[{id,content:{notes:'Update'}}]}]);
  assert.equal(out.status,200);assert.equal(out.body.items[0].content.notes,'Update');
  assert.equal(out.calls.at(-1).options.headers.authorization,'Bearer '+token);
});
test('submission includes reopened reports and does not query finance',async()=>{
  const out=await request('submit_report',{report_id:id},[{body:{id}},{body:[{id,status:'submitted'}]}]);
  assert.equal(out.status,200);assert.match(out.calls[1].url,/status=in\.\(draft,reopened\)/);
  assert.equal(out.calls.length,2);assert.ok(out.calls.every(x=>!x.url.includes('finance')));
});
test('submitted, inaccessible or concurrently changed report is not falsely submitted',async()=>{
  const out=await request('submit_report',{report_id:id},[{body:{id}},{body:[]}]);assert.equal(out.status,409);
});
test('finance publication stays server-gated',async()=>{
  const out=await request('finance_publish',{import_id:id,confirm:true,comment:'Test only'},[{body:{id}}]);
  assert.equal(out.status,503);assert.equal(out.body.code,'FINANCE_SECURITY_GATE');assert.equal(out.calls.length,1);
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
  const start=html.indexOf('const pipeline=selectedSection',fn);
  const end=html.indexOf('\nasync function loadPublishedFinance',start);
  assert.ok(fn>0&&start>fn&&end>start);
  for(const [status,editable,manager,disabled] of [['reopened',true,true,false],['draft',true,true,false],['submitted',false,true,true],['reopened',true,false,true]]){
    const nodes=new Map();
    const make=()=>({replaceChildren(){},querySelectorAll(){return []},append(){},setAttribute(){},addEventListener(){}});
    const document={getElementById(id){if(!nodes.has(id))nodes.set(id,make());return nodes.get(id)},createElement:make};
    vm.runInNewContext('function renderSection(){'+html.slice(start,end)+';renderSection();',{document,selectedSection:'delivery',nativeData:{sections:[]},context:()=>({report:{id,status},editable}),canManage:()=>manager,reportKeys:['delivery'],reportLabels:['Delivery'],reportMessage(){}});
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
test('published finance has its own view while import controls remain role-gated',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(html,/const financeRole=roles\.some\(r=>\['finance','finance_admin','administrator'\]\.includes\(r\.role\)\)/);
  assert.ok(html.includes('<button type="button" data-connected-nav="finance">£ Finance</button>'));
  assert.match(html,/vh26-finance-preview'\)\.hidden=!roles\.some/);
  assert.match(html,/vh26-finance-review'\)\.hidden=!financeRole/);
  assert.ok(html.includes("[data-connected-nav=\"finance\"]')?.addEventListener"));
});

test('Report Absence opens the Build 052 screen and linked staging form',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const nav=html.indexOf("side.querySelector('[data-connected-nav=\\"absence\\"]')");
  const navEnd=html.indexOf("side.querySelector('#vh26-sidebar-signout')",nav);
  assert.ok(nav>0&&navEnd>nav);
  const handler=html.slice(nav,navEnd);
  assert.match(handler,/vh26-absence-view-active/);
  assert.doesNotMatch(handler,/unavailable for this connected account/);
  assert.match(html,/id='vh26-absence-workspace'/);
  assert.match(html,/window\\.vhOpenAttendance\\(\\)/);
  assert.match(html,/vh26-absence-view-active #vh26-absence-workspace/);
});
