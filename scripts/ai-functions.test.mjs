import test from 'node:test';
import assert from 'node:assert/strict';
import reviewReport from '../netlify/functions/review-report.mjs';
import safetyMoment from '../netlify/functions/safety-moment.mjs';

const userId='4dc09629-3a17-48b5-8a82-622c1cb4f012';
const departmentId='66fc03cf-e42c-4f7a-881c-b12e2c5508de';
const organisationId='6d50a120-aa9b-43af-b059-34c64db370db';
const token='eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0ZGMwOTYyOS0zYTE3LTQ4YjUtOGE4Mi02MjJjMWNiNGYwMTIifQ.signature';
const config={SUPABASE_URL:'https://staging-project.supabase.co',SUPABASE_ANON_KEY:'public-test-key',OLLAMA_API_KEY:'server-only-test-key',OLLAMA_MODEL:'gemma4:31b'};
const review={assessment:'Clear and concise; add a dated milestone.',suggestions:['Name the milestone date.'],questions:['What is the forecast date?'],draft:'Delivery is progressing; the next milestone is due on the confirmed date.'};
const safety={topic:'Situational awareness',why:'Changing conditions can affect safe decisions.',scenario:'Illustrative example: a worksite condition changes.',points:['Pause when conditions change.','Reconfirm the plan with the team.','Use approved briefings and controls.'],questions:['What changed?','Who needs to know?'],takeaway:'Pause, communicate and follow approved controls.'};

function withEnv(fn){
  const before={};for(const key of Object.keys(config)){before[key]=process.env[key];process.env[key]=config[key]}
  const originalFetch=globalThis.fetch;
  return Promise.resolve().then(()=>fn()).finally(()=>{globalThis.fetch=originalFetch;for(const [key,value]of Object.entries(before)){if(value===undefined)delete process.env[key];else process.env[key]=value}});
}
function request(path,body,auth=token,method='POST'){
  return new Request('https://example.test/.netlify/functions/'+path,{method,headers:{...(auth?{authorization:'Bearer '+auth}:{}),'content-type':'application/json'},body:method==='POST'?JSON.stringify(body):undefined});
}
function supabaseMock({roles=[{role:'department_manager',organisation_id:organisationId}],memberships=[]}={}){
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
    delete process.env.OLLAMA_API_KEY;
    globalThis.fetch=supabaseMock();
    const unavailable=await reviewReport(request('review-report',{section:'delivery',text:'Update',department:'Managed Environments',week:'2026-W45'}));
    assert.equal(unavailable.status,503);
  });
});

test('Safety Moment reports missing Ollama API key without calling the provider',async()=>withEnv(async()=>{
  delete process.env.OLLAMA_API_KEY;
  globalThis.fetch=supabaseMock({roles:[{role:'meeting_host',organisation_id:organisationId}]});
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations'}));
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/OLLAMA_API_KEY/);
}));

test('AI report review rejects missing, inactive and out-of-scope sessions before calling Ollama',async()=>withEnv(async()=>{
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
    throw new Error('Ollama must not be called');
  };
  assert.equal((await reviewReport(request('review-report',{section:'delivery',text:'update',department:'Managed Environments',week:'2026-W45'}))).status,403);
}));

test('AI report review requires department membership and returns the agreed review shape',async()=>withEnv(async()=>{
  delete process.env.OLLAMA_MODEL;
  let providerCalls=0;
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://ollama.com/api/chat'){
      providerCalls++;
      assert.match(options.headers.authorization,/^Bearer server-only-test-key$/);
      assert.equal(JSON.parse(options.body).model,'gpt-oss:120b');
      assert.equal(JSON.parse(options.body).stream,false);
      assert.equal(JSON.parse(options.body).options.temperature,0);
      assert.deepEqual(JSON.parse(options.body).format.required,['assessment','suggestions','questions','draft']);
      return Response.json({message:{content:JSON.stringify(review)}});
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

test('AI provider failures return actionable diagnostics without exposing provider response bodies',async()=>withEnv(async()=>{
  const upstream=supabaseMock();
  for(const [status,expected] of [[401,/OLLAMA_API_KEY/],[404,/OLLAMA_MODEL/],[400,/structured JSON output/]]){
    globalThis.fetch=async(input,options)=>String(input)==='https://ollama.com/api/chat'?Response.json({error:'secret=provider-detail'}, {status}):upstream(input,options);
    const response=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
    assert.equal(response.status,502);
    const error=(await response.json()).error;
    assert.match(error,expected);
    assert.doesNotMatch(error,/secret=provider-detail/);
  }
  globalThis.fetch=async(input,options)=>{if(String(input)==='https://ollama.com/api/chat')throw Object.assign(new TypeError('fetch failed'),{cause:{code:'ENOTFOUND'}});return upstream(input,options)};
  const network=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.equal(network.status,502);
  assert.match((await network.json()).error,/ENOTFOUND/);
  globalThis.fetch=async(input,options)=>String(input)==='https://ollama.com/api/chat'?new Response('<html>blocked</html>',{status:200}):upstream(input,options);
  const unreadable=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.match((await unreadable.json()).error,/non-JSON response/);
  globalThis.fetch=async(input,options)=>String(input)==='https://ollama.com/api/chat'?Response.json({message:{content:JSON.stringify({assessment:'ok',suggestions:'not an array',questions:[],draft:'private text must not appear'})}}):upstream(input,options);
  const malformed=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  const malformedError=(await malformed.json()).error;
  assert.match(malformedError,/suggestions=string/);
  assert.doesNotMatch(malformedError,/private text/);
  globalThis.fetch=async(input,options)=>{if(String(input)==='https://ollama.com/api/chat')return Object.defineProperty({},'status',{get(){throw new TypeError('provider diagnostic test')}});return upstream(input,options)};
  const unexpected=await reviewReport(request('review-report',{section:'delivery',text:'Progress update',department:'Managed Environments',week:'2026-W45'}));
  assert.match((await unexpected.json()).error,/TypeError: provider diagnostic test/);
}));

test('Safety Moment generation is restricted to presenter roles and produces exactly three points and two questions',async()=>withEnv(async()=>{
  let providerCalls=0;
  globalThis.fetch=async(input,options={})=>{
    const url=String(input);
    if(url==='https://ollama.com/api/chat'){
      providerCalls++;
      assert.match(options.headers.authorization,/^Bearer server-only-test-key$/);
      assert.match(JSON.parse(options.body).messages[0].content,/must never be presented as an approved procedure/);
      return Response.json({message:{content:JSON.stringify(safety)}});
    }
    if(url.endsWith('/auth/v1/user'))return Response.json({id:userId});
    if(url.includes('/rest/v1/profiles?'))return Response.json([{id:userId,active:true}]);
    if(url.includes('/rest/v1/user_roles?'))return Response.json([{role:'meeting_host',organisation_id:organisationId}]);
    if(url.includes('/rest/v1/departments?'))return Response.json([]);
    throw new Error('Unexpected fetch URL: '+url);
  };
  const response=await safetyMoment(request('safety-moment',{category:'Rail operations'}));
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),safety);
  assert.equal(providerCalls,1);
}));
