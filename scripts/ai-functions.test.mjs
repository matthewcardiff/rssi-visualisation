import test from 'node:test';
import assert from 'node:assert/strict';
import reviewReport from '../netlify/functions/review-report.mjs';
import safetyMoment from '../netlify/functions/safety-moment.mjs';

const userId='4dc09629-3a17-48b5-8a82-622c1cb4f012';
const departmentId='66fc03cf-e42c-4f7a-881c-b12e2c5508de';
const organisationId='6d50a120-aa9b-43af-b059-34c64db370db';
const token='local-test-session-not-a-secret-value';
const config={SUPABASE_URL:'https://staging-project.supabase.co',SUPABASE_ANON_KEY:'test',OPENROUTER_API_KEY:'server-only-test-key',OPENROUTER_MODEL:'google/gemma-3-27b-it'};
const review={assessment:'Clear and concise; add a dated milestone.',suggestions:['Name the milestone date.'],questions:['What is the forecast date?'],draft:'Delivery is progressing; the next milestone is due on the confirmed date.'};
const safety={topic:'Situational awareness',why:'Changing conditions can affect safe decisions.',scenario:'Illustrative example: a worksite condition changes.',points:['Pause when conditions change.','Reconfirm the plan with the team.','Use approved briefings and controls.'],questions:['What changed?','Who needs to know?'],takeaway:'Pause, communicate and follow approved controls.'};
function safetyFocusFromOptions(options){const body=JSON.parse(options.body);return JSON.parse(body.messages[1].content).focus.id;}

function withEnv(fn){
  const before={};for(const key of Object.keys(config)){before[key]=process.env[key];process.env[key]=config[key]}
  const originalFetch=globalThis.fetch;
  return Promise.resolve().then(()=>fn()).finally(()=>{globalThis.fetch=originalFetch;for(const [key,value]of Object.entries(before)){if(value===undefined)delete process.env[key];else process.env[key]=value}});
}
function request(path,body,auth=token,method='POST'){
  return new Request('https://example.test/.netlify/functions/'+path,{method,headers:{...(auth?{authorization:'Bearer '+auth}:{}),'content-type':'application/json'},body:method==='POST'?JSON.stringify(body):undefined});
}
function supabaseMock({roles=[{role:'department_manager',organisation_id:organisationId}],memberships=[{department_id:departmentId,membership_role:'manager',active:true}]}={}){
  return async(input)=>{
    const url=String(input);
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId,email:'manager@example.test'});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json(roles);
    if(url.includes('/rest/v1/departments?'))return Response.json([{id:departmentId,display_name:'Managed Environments',organisation_id:organisationId,active:true}]);
    if(url.includes('/rest/v1/department_memberships?'))return Response.json(memberships);
    throw new Error('Unexpected fetch URL: '+url);
  };
}

test('AI endpoints require POST, valid request bodies and configured server credentials',async()=>{
  const method=await reviewReport(request('review-report',{},null,'GET'));
  assert.equal(method.status,405);
  const missingDepartment=await reviewReport(request('review-report',{section:'delivery',text:'Update',department:'',week:'2026-W45'}));
  assert.equal(missingDepartment.status,400);
  assert.match((await missingDepartment.json()).error,/department/);
  const invalid=await safetyMoment(request('safety-moment',{category:'unapproved'}));
  assert.equal(invalid.status,400);
  await withEnv(async()=>{
    delete process.env.OPENROUTER_API_KEY;
    globalThis.fetch=supabaseMock();
    const unavailable=await reviewReport(request('review-report',{section:'delivery',text:'Update',department:'Managed Environments',week:'2026-W45'}));
    assert.equal(unavailable.status,503);
  });
});

test('Safety Moment reports missing OpenRouter API key without calling the provider',async()=>withEnv(async()=>{
  delete process.env.OPENROUTER_API_KEY;
  globalThis.fetch=supabaseMock({roles:[{role:'meeting_host',organisation_id:organisationId}]});
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations'}));
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/OPENROUTER_API_KEY/);
}));

test('AI report review rejects missing, inactive and out-of-scope sessions before calling OpenRouter',async()=>withEnv(async()=>{
  globalThis.fetch=async url=>String(url).endsWith('/auth/v1/user')?Response.json({}):Response.json([],{status:403});
  assert.equal((await reviewReport(request('review-report',{section:'delivery',text:'update',department:'Managed Environments',week:'2026-W45'},null))).status,401);
  assert.equal((await reviewReport(request('review-report',{section:'delivery',text:'update',department:'Managed Environments',week:'2026-W45'}))).status,401);
  globalThis.fetch=async url=>{
    const u=String(url);
    if(u.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(u.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:false}]);
    if(u.includes('/rest/v1/user_roles?'))return Response.json([]);
    if(u.includes('/rest/v1/departments?'))return Response.json([{id:departmentId,display_name:'Managed Environments',organisation_id:organisationId,active:true}]);
    if(u.includes('/rest/v1/department_memberships?'))return Response.json([]);
    throw new Error('OpenRouter must not be called');
  };
  assert.equal((await reviewReport(request('review-report',{section:'delivery',text:'update',department:'Managed Environments',week:'2026-W45'}))).status,403);
}));

test('AI report review requires department membership and returns the agreed review shape',async()=>withEnv(async()=>{
  delete process.env.OPENROUTER_MODEL;
  let providerCalls=0;
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){
      providerCalls++;
      assert.match(options.headers.authorization,/^Bearer server-only-test-key$/);
      assert.equal(JSON.parse(options.body).model,'openrouter/free');
      assert.equal(JSON.parse(options.body).stream,false);
      assert.equal(JSON.parse(options.body).temperature,0);
      assert.equal(JSON.parse(options.body).max_completion_tokens,2200);
      const requestBody=JSON.parse(options.body);
      assert.equal(requestBody.reasoning_effort,undefined);
      assert.equal(requestBody.plugins,undefined);
      assert.deepEqual(requestBody.response_format,{type:'json_object'});
      assert.equal(requestBody.provider.require_parameters,true);
      assert.equal(requestBody.tool_choice,undefined);
      assert.equal(requestBody.tools,undefined);
      return Response.json({choices:[{message:{content:JSON.stringify(review)}}]});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([]);
    if(url.includes('/rest/v1/departments?'))return Response.json([{id:departmentId,display_name:'Managed Environments',organisation_id:organisationId,active:true}]);
    if(url.includes('/rest/v1/department_memberships?'))return Response.json([{department_id:departmentId,membership_role:'contributor',active:true}]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),review);
  assert.equal(providerCalls,1);
}));

test('a paid OpenRouter model retries once through the free router after HTTP 402',async()=>withEnv(async()=>{
  let models=[];
  const upstream=supabaseMock();
  globalThis.fetch=async(input,options={})=>{
    if(String(input)==='https://openrouter.ai/api/v1/chat/completions'){
      const model=JSON.parse(options.body).model;models.push(model);
      return model==='openrouter/free'?Response.json({choices:[{message:{content:JSON.stringify(review)}}]}):Response.json({error:'insufficient credits'},{status:402});
    }
    return upstream(input,options);
  };
  const response=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.equal(response.status,200);
  assert.deepEqual(models,['google/gemma-3-27b-it','openrouter/free']);
}));

test('AI provider failures return actionable diagnostics without exposing provider response bodies',async()=>withEnv(async()=>{
  const upstream=supabaseMock();
  for(const [status,expected] of [[401,/OPENROUTER_API_KEY/],[404,/OPENROUTER_MODEL/],[400,/OpenRouter rejected the structured-output request/]]){
    globalThis.fetch=async(input,options)=>String(input)==='https://openrouter.ai/api/v1/chat/completions'?Response.json({error:'secret=provider-detail'}, {status}):upstream(input,options);
    const response=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
    assert.equal(response.status,502);
    const error=(await response.json()).error;
    assert.match(error,expected);
    assert.doesNotMatch(error,/secret=provider-detail/);
  }
  globalThis.fetch=async(input,options)=>{if(String(input)==='https://openrouter.ai/api/v1/chat/completions')throw Object.assign(new TypeError('fetch failed'),{cause:{code:'ENOTFOUND'}});return upstream(input,options)};
  const network=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.equal(network.status,502);
  assert.match((await network.json()).error,/ENOTFOUND/);
  globalThis.fetch=async(input,options)=>String(input)==='https://openrouter.ai/api/v1/chat/completions'?new Response('<html>blocked</html>',{status:200}):upstream(input,options);
  const unreadable=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.match((await unreadable.json()).error,/non-JSON response/);
  globalThis.fetch=async(input,options)=>String(input)==='https://openrouter.ai/api/v1/chat/completions'?Response.json({choices:[{message:{content:JSON.stringify({assessment:'ok',suggestions:'not an array',questions:[],draft:'private text must not appear'})}}]}):upstream(input,options);
  const malformed=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  const malformedError=(await malformed.json()).error;
  assert.match(malformedError,/suggestions=string/);
  assert.doesNotMatch(malformedError,/private text/);
  globalThis.fetch=async(input,options)=>{if(String(input)==='https://openrouter.ai/api/v1/chat/completions')return Object.defineProperty({},'status',{get(){throw new TypeError('provider diagnostic test')}});return upstream(input,options)};
  const unexpected=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.match((await unexpected.json()).error,/TypeError/);
}));

test('Safety Moment generation is restricted to presenter roles and produces exactly three points and two questions',async()=>withEnv(async()=>{
  let providerCalls=0,selectedFocus='';
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){
      providerCalls++;
      const requestBody=JSON.parse(options.body);selectedFocus=safetyFocusFromOptions(options);
      assert.match(options.headers.authorization,/^Bearer server-only-test-key$/);
      assert.match(requestBody.messages[0].content,/must never be presented as an approved procedure/);
      assert.match(JSON.stringify(requestBody),/practical reminders distinct from discussion questions/);
      assert.match(JSON.stringify(requestBody),/must not restate the reminders/);
      assert.equal(requestBody.temperature,0.9);
      assert.equal(requestBody.top_p,0.95);
      return Response.json({choices:[{message:{content:JSON.stringify({...safety,focus:selectedFocus})}}]});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations'}));
  assert.equal(response.status,200);
  const generated=await response.json();assert.equal(generated.focus,selectedFocus);delete generated.focus;
  assert.deepEqual(generated,safety);
  assert.equal(providerCalls,1);
}));

test('Safety Moment accepts structured JSON returned through an OpenRouter tool call',async()=>withEnv(async()=>{
  let providerCalls=0;
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){
      providerCalls++;
      const focus=safetyFocusFromOptions(options);
      return Response.json({choices:[{finish_reason:'tool_calls',message:{content:null,tool_calls:[{type:'function',function:{name:'visualisation_ai_response',arguments:JSON.stringify({...safety,focus})}}]}}]});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations'}));
  assert.equal(response.status,200);
  const generated=await response.json();assert.ok(generated.focus);delete generated.focus;
  assert.deepEqual(generated,safety);
  assert.equal(providerCalls,1);
}));

test('Safety Moment retries once when OpenRouter returns malformed structured content',async()=>withEnv(async()=>{
  let providerCalls=0;
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){
      providerCalls++;
      if(providerCalls===1)return Response.json({choices:[{message:{content:'I could not return the requested JSON.'}}]});
      const focus=safetyFocusFromOptions(options);
      return Response.json({choices:[{message:{content:JSON.stringify({...safety,focus})}}]});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations'}));
  assert.equal(response.status,200);
  const generated=await response.json();assert.ok(generated.focus);delete generated.focus;
  assert.deepEqual(generated,safety);
  assert.equal(providerCalls,2);
}));

test('Safety Moment bounds history sent to OpenRouter while keeping server duplicate checks',async()=>withEnv(async()=>{
  let recentExamples=[];
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){
      const requestBody=JSON.parse(options.body);
      recentExamples=JSON.parse(requestBody.messages[1].content).recent_examples;
      const focus=safetyFocusFromOptions(options);
      return Response.json({choices:[{message:{content:JSON.stringify({...safety,focus,topic:'A fresh topic about team communication',scenario:'A hypothetical shift handover introduces a new, clearly distinct discussion angle.'})}}]});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const recent=Array.from({length:12},(_,i)=>({focus:'fatigue-alertness',topic:'Previous topic '+i,scenario:'Previous illustrative scenario '+i+' '+('detail '.repeat(90)),points:['Reminder one','Reminder two','Reminder three']}));
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations',recent}));
  assert.equal(response.status,200);
  assert.equal(recentExamples.length,8);
  for(const example of recentExamples){
    assert.deepEqual(Object.keys(example).sort(),['focus','scenario','topic']);
    assert.ok(example.scenario.length<=320);
    assert.ok(!('points'in example));
  }
}));

test('Safety Moment retries recent duplicates and accepts a different scenario',async()=>withEnv(async()=>{
  let providerCalls=0,selectedFocus='';const seeds=new Set();const varied={...safety,topic:'Changing storage arrangements',scenario:'Illustrative example: a delivery team changes the temporary storage area after a weather update.',points:['Recheck the agreed route with the team.','Keep people clear while the change is reviewed.','Ask a supervisor to confirm the approved arrangement.'],questions:['Who needs the revised information?','What should pause until the arrangement is clear?'],takeaway:'Confirm the revised arrangement before work resumes.'};
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){
      providerCalls++;const requestBody=JSON.parse(options.body);seeds.add(requestBody.seed);selectedFocus=safetyFocusFromOptions(options);
      assert.notEqual(selectedFocus,'fatigue-alertness');
      assert.equal(requestBody.temperature,0.9);assert.equal(requestBody.top_p,0.95);assert.equal(requestBody.max_completion_tokens,2000);assert.equal(requestBody.reasoning_effort,'low');
      assert.ok(requestBody.messages[1].content.includes('recent_examples'));
      const result=providerCalls<2?safety:varied;
      return Response.json({choices:[{message:{content:JSON.stringify({...result,focus:selectedFocus})}}]});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations',recent:[{...safety,focus:'fatigue-alertness'}]}));
  assert.equal(response.status,200);const generated=await response.json();assert.equal(generated.focus,selectedFocus);delete generated.focus;assert.deepEqual(generated,varied);assert.equal(providerCalls,2);assert.equal(seeds.size,2);
}));

test('Safety Moment returns a clear error rather than repeating after two duplicate candidates',async()=>withEnv(async()=>{
  let providerCalls=0;
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://openrouter.ai/api/v1/chat/completions'){providerCalls++;return Response.json({choices:[{message:{content:JSON.stringify({...safety,focus:safetyFocusFromOptions(options)})}}]})}
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations',recent:[safety]}));
  assert.equal(response.status,409);assert.match((await response.json()).error,/sufficiently different.*two attempts/i);assert.equal(providerCalls,2);
}));
