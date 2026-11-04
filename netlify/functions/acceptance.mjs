const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
export default async (request)=>{
  if(request.method!=='POST')return json(405,{error:'POST required'});
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))return json(503,{error:'Supabase staging configuration missing'});
  let data;try{data=await request.json()}catch{return json(400,{error:'Invalid JSON'})}
  if(!data||!['login','refresh','whoami','reports','actions','weeks','sections','items','pipeline','create_report','save_section','submit_report','create_pipeline','update_pipeline','create_action','update_action','hsqe_assurance','hsqe_close_calls','hsqe_workforce','hsqe_add_assurance','hsqe_update_assurance','hsqe_add_close_call','hsqe_set_workforce','finance_published','finance_preview','finance_import','finance_review','finance_reconcile','finance_publish'].includes(data.op))return json(400,{error:'Unsupported operation'});
  const common={'apikey':key,'content-type':'application/json'};
  try{
    if(data.op==='login'){
      if(typeof data.email!=='string'||typeof data.password!=='string')return json(400,{error:'Email and password required'});
      const r=await fetch(url+'/auth/v1/token?grant_type=password',{method:'POST',headers:common,body:JSON.stringify({email:data.email,password:data.password}),signal:AbortSignal.timeout(12000)});
      const b=await r.json();if(!r.ok)return json(401,{error:'Sign-in unsuccessful'});
      return json(200,{access_token:b.access_token,refresh_token:b.refresh_token,expires_in:b.expires_in});
    }
    if(data.op==='refresh'){
      if(typeof data.refresh_token!=='string')return json(401,{error:'Refresh token required'});
      const r=await fetch(url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:common,body:JSON.stringify({refresh_token:data.refresh_token}),signal:AbortSignal.timeout(12000)});
      if(!r.ok)return json(401,{error:'Session expired'});const b=await r.json();return json(200,{access_token:b.access_token,refresh_token:b.refresh_token,expires_in:b.expires_in});
    }
    if(typeof data.access_token!=='string'||data.access_token.length<30)return json(401,{error:'Authenticated session required'});
    const headers={...common,authorization:'Bearer '+data.access_token};
    const userResponse=await fetch(url+'/auth/v1/user',{headers,signal:AbortSignal.timeout(12000)});
    if(!userResponse.ok)return json(401,{error:'Session invalid'});
    const user=await userResponse.json();
    // All mutations use the caller's JWT; Supabase RLS remains the authority.
    if(['create_report','save_section','submit_report','create_pipeline','update_pipeline'].includes(data.op)){
      const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
      const send=async(path,method,body)=>{
        const r=await fetch(url+'/rest/v1/'+path,{method,headers:{...headers,prefer:'return=representation'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
        const b=await r.json().catch(()=>[]);
        if(!r.ok)return {error:true,status:r.status};
        return {items:b};
      };
      if(data.op==='update_pipeline'){
        if(!uuid(data.id)||!uuid(data.department_id)||typeof data.customer!=='string'||!data.customer.trim()||data.customer.length>200||typeof data.project!=='string'||!data.project.trim()||data.project.length>300||typeof data.owner_text!=='string'||!data.owner_text.trim()||data.owner_text.length>200||typeof data.required_by!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.required_by)||typeof data.estimated_value!=='number'||!Number.isFinite(data.estimated_value)||data.estimated_value<0||data.estimated_value>100000000000)return json(400,{error:'Valid opportunity details required'});
        const out=await send('pipeline_opportunities?id=eq.'+encodeURIComponent(data.id)+'&department_id=eq.'+encodeURIComponent(data.department_id),'PATCH',{customer:data.customer.trim(),project:data.project.trim(),owner_text:data.owner_text.trim(),estimated_value:data.estimated_value,required_by:data.required_by});
        if(out.error)return json(403,{error:'Opportunity update denied'});
        if(!out.items.length)return json(403,{error:'Opportunity not found or not authorised'});
        return json(200,out);
      }
      if(data.op==='create_pipeline'){
        if(!uuid(data.department_id)||typeof data.customer!=='string'||!data.customer.trim()||data.customer.length>200||typeof data.project!=='string'||!data.project.trim()||data.project.length>300||typeof data.owner_text!=='string'||!data.owner_text.trim()||data.owner_text.length>200||typeof data.required_by!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.required_by)||typeof data.estimated_value!=='number'||!Number.isFinite(data.estimated_value)||data.estimated_value<0||data.estimated_value>100000000000)return json(400,{error:'Customer, project, owner, value and required-by date are required'});
        const out=await send('pipeline_opportunities','POST',{department_id:data.department_id,customer:data.customer.trim(),project:data.project.trim(),owner_text:data.owner_text.trim(),estimated_value:data.estimated_value,required_by:data.required_by,status:'open'});
        return out.error?json(out.status===403?403:409,{error:'Opportunity save denied; check department membership'}):json(200,out);
      }
      if(data.op==='create_report'){
        if(!uuid(data.department_id)||!uuid(data.reporting_week_id))return json(400,{error:'Valid department and week required'});
        const out=await send('department_reports','POST',{department_id:data.department_id,reporting_week_id:data.reporting_week_id,status:'draft'});
        return out.error?json(out.status===403?403:409,{error:'Cannot create draft in this department or reporting week'}):json(200,out);
      }
      if(data.op==='save_section'){
        if(!uuid(data.report_id)||!['pipeline','delivery','programme','risks','resources','hsqe_accidents','hsqe_close_calls','hsqe_assurance','hsqe_events','hsqe_documents'].includes(data.section_key)||typeof data.content!=='object'||data.content===null||Array.isArray(data.content)||JSON.stringify(data.content).length>16000)return json(400,{error:'Invalid report section'});
        const content=data.content;
        // Check existing section via caller-scoped SELECT, then INSERT or PATCH.
        const path='report_sections?select=id&report_id=eq.'+encodeURIComponent(data.report_id)+'&section_key=eq.'+encodeURIComponent(data.section_key);
        const existing=await fetch(url+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(12000)});
        if(!existing.ok)return json(502,{error:'Section lookup failed'});
        const rows=await existing.json();
        const out=rows.length?await send('report_sections?id=eq.'+rows[0].id,'PATCH',{content,updated_by:user.id}):await send('report_sections','POST',{report_id:data.report_id,section_key:data.section_key,content,updated_by:user.id});
        if(out.error)return json(out.status===403?403:409,{error:'Draft save denied; verify department membership and open reporting week'});
        if(!Array.isArray(out.items)||out.items.length!==1)return json(409,{error:'Section was not saved. Refresh to check report status and permissions before retrying.'});
        return json(200,out);
      }
      if(!uuid(data.report_id))return json(400,{error:'Valid report required'});
      // Submission is independent of finance uploads. Existing RLS + trigger govern transitions.
      const out=await send('department_reports?id=eq.'+encodeURIComponent(data.report_id)+'&status=in.(draft,reopened)','PATCH',{status:'submitted',submitted_by:user.id,submitted_at:new Date().toISOString()});
      if(out.error)return json(out.status===403?403:409,{error:'Submission denied; check role and reporting week'});
      if(!out.items.length)return json(409,{error:'Report is not an editable draft or reopened report, or is outside your permissions'});
      return json(200,out);
    }
    if(['create_action','update_action'].includes(data.op)){
      const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
      const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x));
      const validText=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
      // Meeting-host authority is enforced by existing Supabase RLS policies.
      const rolesResponse=await fetch(url+'/rest/v1/user_roles?select=role&role=eq.meeting_host',{headers,signal:AbortSignal.timeout(12000)});
      if(!rolesResponse.ok||!(await rolesResponse.json()).length)return json(403,{error:'Only the meeting host may manage meeting actions'});
      if(data.op==='create_action'){
        if(!uuid(data.department_id)||!uuid(data.reporting_week_id)||!validText(data.description,3000)||!validText(data.owner_text,200)||!date(data.required_by)||typeof data.support_text!=='string'||data.support_text.length>1000)return json(400,{error:'Description, owner, reporting week and required-by date are required'});
        const body={department_id:data.department_id,created_in_reporting_week_id:data.reporting_week_id,description:data.description.trim(),owner_text:data.owner_text.trim(),support_text:data.support_text.trim(),required_by:data.required_by,status:'open'};
        const r=await fetch(url+'/rest/v1/meeting_actions',{method:'POST',headers:{...headers,prefer:'return=representation'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
        if(!r.ok)return json(403,{error:'Action creation denied by database policy'});
        return json(200,{items:await r.json()});
      }
      if(!uuid(data.id)||!uuid(data.department_id)||!Number.isInteger(data.version)||data.version<1||!['open','in_progress','completed','cancelled'].includes(data.status)||!validText(data.description,3000)||!validText(data.owner_text,200)||!date(data.required_by)||typeof data.support_text!=='string'||data.support_text.length>1000)return json(400,{error:'Valid action details and version required'});
      const body={description:data.description.trim(),owner_text:data.owner_text.trim(),support_text:data.support_text.trim(),required_by:data.required_by,status:data.status,version:data.version+1,completed_at:data.status==='completed'?new Date().toISOString():null,completed_by:data.status==='completed'?user.id:null};
      const path='meeting_actions?id=eq.'+encodeURIComponent(data.id)+'&department_id=eq.'+encodeURIComponent(data.department_id)+'&version=eq.'+data.version;
      const r=await fetch(url+'/rest/v1/'+path,{method:'PATCH',headers:{...headers,prefer:'return=representation'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
      if(!r.ok)return json(403,{error:'Action update denied by database policy'});
      const items=await r.json();if(!items.length)return json(409,{error:'Action changed since loading, or not authorised. Refresh before retrying'});
      return json(200,{items});
    }
    if(['hsqe_add_assurance','hsqe_update_assurance','hsqe_add_close_call','hsqe_set_workforce','finance_published','finance_preview','finance_import','finance_review','finance_reconcile','finance_publish'].includes(data.op)){
      const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
      const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x));
      const text=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
      const send=async(path,method,body)=>{
        const r=await fetch(url+'/rest/v1/'+path,{method,headers:{...headers,prefer:data.op==='hsqe_set_workforce'?'resolution=merge-duplicates,return=representation':'return=representation'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
        const b=await r.json().catch(()=>[]);return r.ok?(method==='PATCH'&&Array.isArray(b)&&b.length===0?json(409,{error:'Record not found or update not authorised'}):json(200,{items:b})):json(r.status===403?403:409,{error:'HSQE change denied or invalid; verify membership and fields'});
      };
      if(data.op==='hsqe_add_assurance'){
        if(!['audit','ncr'].includes(data.kind)||!uuid(data.department_id)||!text(data.reference,100)||!text(data.description,2000)||!text(data.owner_text,200)||!date(data.opened_on)||(data.due_on&&!date(data.due_on)))return json(400,{error:'Complete all required assurance fields'});
        return send('hsqe_assurance_register','POST',{kind:data.kind,department_id:data.department_id,reference:data.reference.trim(),description:data.description.trim(),owner_text:data.owner_text.trim(),opened_on:data.opened_on,due_on:data.due_on||null,status:'open'});
      }
      if(data.op==='hsqe_update_assurance'){
        if(!uuid(data.id)||!['in_progress','signed_off'].includes(data.status))return json(400,{error:'Invalid assurance update'});
        return send('hsqe_assurance_register?id=eq.'+data.id+'&status=neq.signed_off','PATCH',data.status==='signed_off'?{status:'signed_off',signed_off_by:user.id,signed_off_on:new Date().toISOString().slice(0,10)}:{status:'in_progress'});
      }
      if(data.op==='hsqe_add_close_call'){
        if(!uuid(data.department_id)||!date(data.occurred_on)||!text(data.description,2000))return json(400,{error:'Department, date and description required'});
        return send('hsqe_close_calls','POST',{department_id:data.department_id,occurred_on:data.occurred_on,description:data.description.trim(),reference:typeof data.reference==='string'?data.reference.slice(0,150):null});
      }
      if(data.op==='hsqe_set_workforce'){
        if(!uuid(data.department_id)||!date(data.effective_on)||!Number.isInteger(data.operative_count)||data.operative_count<0||data.operative_count>1000000)return json(400,{error:'Valid headcount and effective date required'});
        return send('hsqe_workforce_counts?on_conflict=department_id,effective_on','POST',{department_id:data.department_id,effective_on:data.effective_on,operative_count:data.operative_count});
      }
    }
    // Deployment safety: write RPCs remain disabled until database migration,
    // RLS, transaction rollback and role isolation pass authenticated acceptance.
    // This gate is deliberately independent of any client-provided flags.
    if(['finance_import','finance_reconcile','finance_publish'].includes(data.op) &&
       process.env.VH_FINANCE_WRITES_ACCEPTED !== 'staging-verified-26c19') {
      return json(503,{error:'Finance writes are disabled pending database security acceptance',code:'FINANCE_SECURITY_GATE'});
    }
    if(data.op==='finance_reconcile'){
      const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
      if(!uuid(data.import_id)||data.confirm!==true||typeof data.comment!=='string'||data.comment.trim().length<8||data.comment.length>2000)
        return json(400,{error:'Valid import, explicit confirmation and reconciliation comment (minimum 8 characters) required'});
      const roleRes=await fetch(url+'/rest/v1/user_roles?select=role',{headers,signal:AbortSignal.timeout(12000)});
      if(!roleRes.ok||!(await roleRes.json()).some(r=>['finance','administrator'].includes(r.role)))
        return json(403,{error:'Reconciliation requires authorised finance or administrator role'});
      const response=await fetch(url+'/rest/v1/rpc/vh_finance_reconcile',{
        method:'POST',headers,body:JSON.stringify({p_import_id:data.import_id,p_comment:data.comment.trim()}),signal:AbortSignal.timeout(20000)});
      if(!response.ok)return json(response.status===403?403:409,{error:'Finance reconciliation rejected; no status change committed',status:response.status});
      return json(200,{result:await response.json(),reconciled:true});
    }
    if(data.op==='finance_publish'){
      const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
      if(!uuid(data.import_id)||data.confirm!==true||typeof data.comment!=='string'||data.comment.length>2000)
        return json(400,{error:'Valid import, explicit confirmation and review comment required'});
      const roleRes=await fetch(url+'/rest/v1/user_roles?select=role',{headers,signal:AbortSignal.timeout(12000)});
      if(!roleRes.ok||!(await roleRes.json()).some(r=>['finance','administrator'].includes(r.role)))
        return json(403,{error:'Finance publication requires authorised finance or administrator role'});
      const response=await fetch(url+'/rest/v1/rpc/vh_finance_publish',{
        method:'POST',headers,body:JSON.stringify({p_import_id:data.import_id,p_comment:data.comment}),signal:AbortSignal.timeout(20000)});
      if(!response.ok)return json(response.status===403?403:409,{error:'Atomic finance publication rejected; no publication committed',status:response.status});
      return json(200,{result:await response.json(),published:true});
    }
    if(data.op==='finance_review'){
      const roleRes=await fetch(url+'/rest/v1/user_roles?select=role',{headers,signal:AbortSignal.timeout(12000)});
      if(!roleRes.ok)return json(403,{error:'Finance role lookup denied'});
      const roles=await roleRes.json();
      if(!roles.some(r=>['finance','finance_admin','administrator'].includes(r.role)))return json(403,{error:'Finance reconciliation review restricted'});
      const get=async(path)=>{const r=await fetch(url+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Finance review data unavailable');return r.json()};
      const imports=await get('finance_imports?select=id,file_name,file_sha256,reporting_week_id,reconciliation_status,findings,imported_at&order=imported_at.desc&limit=100');
      const ids=imports.map(x=>x.id).filter(x=>/^[0-9a-f-]{36}$/i.test(x));
      const metrics=ids.length?await get('finance_metric_values?select=finance_import_id,department_id,reporting_week_id,metric_key,amount,input_state,source_period_id,mapping_status,issues&finance_import_id=in.('+ids.join(',')+')&limit=12000'):[];
      const publications=await get('finance_publications?select=id,source_import_id,reporting_week_id,department_id,status,publication_version&order=publication_version.desc&limit=1000');
      const [weeks,periods]=await Promise.all([
        get('reporting_weeks?select=id,rail_period_id&limit=500'),
        get('rail_calendar_periods?select=id,rail_week,start_date&order=start_date.asc&limit=500')
      ]);
      const expectedSource=new Map(weeks.map(w=>{const i=periods.findIndex(p=>p.id===w.rail_period_id);return [w.id,i>=2?periods[i-2].id:null]}));
      const groups=imports.map(imp=>{
        const rows=metrics.filter(r=>r.finance_import_id===imp.id);
        const byDepartment=new Map();
        for(const r of rows){const k=r.department_id+'|'+r.reporting_week_id;const a=byDepartment.get(k)||[];a.push(r);byDepartment.set(k,a)}
        const problems=[];
        if(!rows.length)problems.push('No metric rows saved');
        if(rows.some(r=>r.reporting_week_id!==imp.reporting_week_id))problems.push('Management week mismatch');
        if(rows.some(r=>r.mapping_status!=='reconciled'))problems.push('Metrics not marked reconciled');
        if(!expectedSource.has(imp.reporting_week_id)||!expectedSource.get(imp.reporting_week_id))problems.push('Finance source rail week unavailable');
        if(rows.some(r=>r.source_period_id!==expectedSource.get(r.reporting_week_id)))problems.push('Finance source week differs from management week minus two rail periods');
        if(rows.some(r=>r.input_state==='missing'&&r.amount!==null))problems.push('Missing-value state has a non-null amount');
        if(rows.some(r=>r.input_state==='zero'&&Number(r.amount)!==0))problems.push('Zero-value state has a non-zero amount');
        if(rows.some(r=>r.input_state==='value'&&(r.amount===null||!Number.isFinite(Number(r.amount)))))problems.push('Value state has no valid numeric amount');
        if(rows.some(r=>!['missing','zero','value'].includes(r.input_state)))problems.push('Unrecognised input state');
        if(Array.isArray(imp.findings)&&imp.findings.length)problems.push('Import-level findings require resolution');
        if(rows.some(r=>Array.isArray(r.issues)&&r.issues.length))problems.push('Metric-level issues recorded');
        for(const [k,group] of byDepartment){if(group.length!==4||new Set(group.map(r=>r.metric_key)).size!==4||!['weekly_budget','weekly_revenue','ytd_budget','ytd_revenue'].every(m=>group.some(r=>r.metric_key===m)))problems.push('Incomplete or duplicate metric group: '+k)}
        if(rows.some(r=>r.department_id===null||r.reporting_week_id===null))problems.push('Metric has no department or reporting week');
        if(imp.reconciliation_status!=='reconciled')problems.push('Import reconciliation not approved');
        const linked=publications.filter(pub=>pub.source_import_id===imp.id);
        return {id:imp.id,file_name:imp.file_name,reporting_week_id:imp.reporting_week_id,imported_at:imp.imported_at,reconciliation_status:imp.reconciliation_status,ready_for_review:problems.length===0,metric_count:rows.length,department_count:byDepartment.size,issues:problems,publication_count:linked.length,published_count:linked.filter(x=>x.status==='published').length};
      });
      return json(200,{imports:groups,approval_enabled:false,publication_enabled:false,notice:'Approval and publication are disabled until a transactional, database-authorised workflow is installed and tested.'});
    }
    if(['finance_preview','finance_import'].includes(data.op)){
      // Finance-only validation; no import is committed and no service-role credentials are used.
      const rr=await fetch(url+'/rest/v1/user_roles?select=role',{headers,signal:AbortSignal.timeout(12000)});
      if(!rr.ok)return json(403,{error:'Finance access could not be verified'});
      const roles=await rr.json();
      if(!roles.some(r=>['finance','finance_admin','administrator'].includes(r.role)))return json(403,{error:'Finance preview requires an authorised finance or administrator role'});
      if(!Array.isArray(data.rows)||data.rows.length>300||!data.rows.length)return json(400,{error:'Provide 1-300 finance rows'});
      const get=async(path)=>{const r=await fetch(url+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Reference data access denied');return r.json()};
      const [departments,periods,weeks]=await Promise.all([
        get('departments?select=id,code,display_name&limit=100'),
        get('rail_calendar_periods?select=id,rail_week,start_date,end_date&order=start_date.asc&limit=200'),
        get('reporting_weeks?select=id,rail_period_id&limit=200')
      ]);
      const metrics=['weekly_budget','weekly_revenue','ytd_budget','ytd_revenue'];
      const normalized=[];const errors=[];const seen=new Set();
      for(let i=0;i<data.rows.length;i++){
        const r=data.rows[i];const line=i+2;
        if(!r||typeof r!=='object'){errors.push({line,reason:'Invalid row'});continue}
        const week=weeks.find(w=>w.id===r.reporting_week_id);
        const index=periods.findIndex(p=>p.id===week?.rail_period_id);
        const source=index>=2?periods[index-2]:null;
        const dept=departments.find(d=>d.id===r.department_id);
        const metric=String(r.metric_key||'').trim();
        const state=String(r.input_state||'').trim();
        const raw=String(r.amount??'').trim();
        const amount=raw===''?null:Number(raw);
        const issues=[];
        if(!week)issues.push('Unknown management reporting week');
        if(!dept)issues.push('Unknown department');
        if(!metrics.includes(metric))issues.push('Unknown metric');
        if(!source)issues.push('Two-week finance source period unavailable');
        if(!source||r.source_period_id!==source.id)issues.push('Finance source period does not match management week minus two rail weeks');
        if(!['missing','zero','value'].includes(state))issues.push('Invalid input state');
        if(state==='missing'&&raw!=='')issues.push('Missing must have blank amount');
        if(state==='zero'&&amount!==0)issues.push('Zero must have amount 0');
        if(state==='value'&&(raw===''||!Number.isFinite(amount)))issues.push('Value requires a finite numeric amount');
        if(raw!==''&&!Number.isFinite(amount))issues.push('Invalid amount');
        const dedupe=[r.reporting_week_id,r.department_id,metric].join('|');
        if(seen.has(dedupe))issues.push('Duplicate department, management week and metric');
        seen.add(dedupe);
        if(issues.length)errors.push({line,reason:issues.join('; ')});
        else normalized.push({reporting_week_id:week.id,department_id:dept.id,metric_key:metric,amount:state==='missing'?null:amount,input_state:state,source_period_id:source.id,source_rail_week:source.rail_week});
      }
      const groups=new Map();
      for(const r of normalized){const k=r.reporting_week_id+'|'+r.department_id;groups.set(k,(groups.get(k)||0)+1)}
      for(const [k,count] of groups)if(count!==4)errors.push({line:'Group',reason:'Expected four distinct metrics for '+k+'; found '+count});
      if(data.op==='finance_preview')return json(200,{valid:errors.length===0,accepted_rows:normalized.length,errors,preview:normalized,committed:false});
      // Explicit, validated, one-week staging import. No approval or publication.
      if(errors.length)return json(422,{error:'Resolve reconciliation errors before importing',errors,committed:false});
      if(typeof data.file_name!=='string'||!/^[- a-zA-Z0-9_.()]{1,120}\.csv$/i.test(data.file_name))return json(400,{error:'Valid CSV file name required'});
      const weeksInImport=[...new Set(normalized.map(r=>r.reporting_week_id))];
      if(weeksInImport.length!==1)return json(422,{error:'Import one management reporting week at a time'});
      if(normalized.length>300)return json(422,{error:'Import exceeds the row limit'});
      const canonical=JSON.stringify(normalized.map(({source_rail_week,...row})=>row).sort((a,b)=>(a.department_id+a.metric_key).localeCompare(b.department_id+b.metric_key)));
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical));
      const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      // Single database transaction: do not fall back to multi-request inserts.
      const response=await fetch(url+'/rest/v1/rpc/vh_finance_stage_import',{
        method:'POST',headers:{...headers,prefer:'return=representation'},
        body:JSON.stringify({p_file_name:data.file_name,p_file_sha256:hash,
          p_reporting_week_id:weeksInImport[0],
          p_metrics:normalized.map(({source_rail_week,...row})=>row)}),
        signal:AbortSignal.timeout(20000)
      });
      if(!response.ok){
        const detail=await response.json().catch(()=>({}));
        if(response.status===404||detail.code==='PGRST202')return json(503,{error:'Atomic finance import is not installed; import disabled',committed:false});
        return json(response.status===409?409:422,{error:'Atomic finance import rejected; no partial import committed',detail:detail.message||'Database validation or permissions failed',committed:false});
      }
      const result=await response.json();
      return json(200,result);

    }
    if(data.op==='finance_published'){
      // Read-only publication feed. Caller JWT and Supabase RLS govern access.
      const get=async(path)=>{
        const r=await fetch(url+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(12000)});
        if(!r.ok)throw new Error('Finance publication access denied');
        return r.json();
      };
      const [publications,periods]=await Promise.all([
        get('finance_publications?select=id,reporting_week_id,department_id,publication_version,published_at,status&status=eq.published&order=publication_version.desc&limit=1000'),
        get('rail_calendar_periods?select=id,rail_week,start_date,end_date&order=start_date.desc&limit=150')
      ]);
      const ids=publications.map(p=>p.id).filter(id=>/^[0-9a-f-]{36}$/i.test(id));
      const values=ids.length?await get('finance_publication_values?select=publication_id,metric_key,amount,source_period_id,input_state&publication_id=in.('+ids.join(',')+')&limit=4000'):[];
      return json(200,{publications,values,periods});
    }
    if(['hsqe_assurance','hsqe_close_calls','hsqe_workforce'].includes(data.op)){
      const paths={
        hsqe_assurance:'hsqe_assurance_register?select=id,kind,reference,department_id,description,owner_text,opened_on,due_on,status,signed_off_on&order=opened_on.desc&limit=500',
        hsqe_close_calls:'hsqe_close_calls?select=id,department_id,occurred_on,reference&order=occurred_on.desc&limit=2000',
        hsqe_workforce:'hsqe_workforce_counts?select=department_id,effective_on,operative_count&order=effective_on.desc&limit=2000'
      };
      const r=await fetch(url+'/rest/v1/'+paths[data.op],{headers,signal:AbortSignal.timeout(12000)});
      if(!r.ok)return json(403,{error:'HSQE register access denied'});
      return json(200,{items:await r.json()});
    }
    if(data.op==='whoami'){
      const paths=['profiles?select=id,display_name,active','user_roles?select=role,organisation_id','department_memberships?select=department_id,membership_role,active','departments?select=id,code,display_name'];
      const results=await Promise.all(paths.map(p=>fetch(url+'/rest/v1/'+p,{headers,signal:AbortSignal.timeout(12000)})));
      if(results.some(r=>!r.ok))return json(502,{error:'Permission lookup failed',statuses:results.map(r=>r.status)});
      const [profiles,roles,memberships,departments]=await Promise.all(results.map(r=>r.json()));
      return json(200,{user:{id:user.id,email:user.email},profiles,roles,memberships,departments});
    }
    if(data.op==='weeks'){
      const r=await fetch(url+'/rest/v1/reporting_weeks?select=id,status,rail_period_id,creation_method,rail_calendar_periods(rail_year,rail_week,start_date,end_date)&order=created_at.desc&limit=100',{headers,signal:AbortSignal.timeout(12000)});
      if(!r.ok)return json(502,{error:'Reporting week lookup failed',status:r.status});
      return json(200,{items:await r.json()});
    }
    if(['sections','items','pipeline','create_report','save_section','submit_report','create_pipeline','update_pipeline'].includes(data.op)){
      const paths={sections:'report_sections?select=id,report_id,section_key,content,revision&limit=200',items:'report_items?select=id,report_id,section_key,item_type,payload,owner_text,support_text,required_by,status,position&limit=200',pipeline:'pipeline_opportunities?select=*&limit=200'};
      const r=await fetch(url+'/rest/v1/'+paths[data.op],{headers,signal:AbortSignal.timeout(12000)});
      if(!r.ok)return json(r.status===401?401:502,{error:'Read-only section lookup failed',status:r.status});
      return json(200,{items:await r.json()});
    }
    const path=data.op==='reports'?'department_reports?select=id,department_id,reporting_week_id,status,revision&limit=100':'meeting_actions?select=id,department_id,created_in_reporting_week_id,description,owner_text,support_text,status,required_by,completed_at,completed_by,version&order=created_at.desc&limit=1000';
    const r=await fetch(url+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(12000)});
    if(!r.ok)return json(r.status===401?401:502,{error:'Data access failed',status:r.status});
    return json(200,{items:await r.json()});
  }catch{return json(502,{error:'Supabase request unavailable'})}
};
export const config={path:'/api/acceptance'};
