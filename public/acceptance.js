'use strict';
const $=id=>document.getElementById(id);let session=null;let generation=0;let snapshot=null;let activeView="overview";let hsqeRegister=null;
const status=s=>{$('status').textContent=s};
function setBusy(b){$('boot').hidden=!b;$('login').hidden=b||!!session;$('session').hidden=b||!session;}
async function api(op,extra={}){const r=await fetch('/api/acceptance',{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify({op,...extra})});const b=await r.json();if(!r.ok)throw Error(b.error||'Request failed');return b}
function save(s){session=s;sessionStorage.setItem('vh-stage20-session',JSON.stringify(s))}
function logout(){generation++;session=null;sessionStorage.removeItem('vh-stage20-session');$('session').hidden=true;$('login').hidden=false;$('boot').hidden=true;$('password').value='';$('identity').textContent='';$('permissions').textContent='';$('reports').textContent='';$('actions').textContent='';$('dashboard').replaceChildren();$('editor').hidden=true;$('pipeline-editor').hidden=true;$('hsqe-editor').hidden=true;$('hsqe-register').hidden=true;$('hsqe-register-editor').hidden=true;$('bid-link').hidden=true;$('summary').textContent='';snapshot=null;status('Signed out')}
async function load(){if(!session)return;const run=++generation;setBusy(true);status('Validating session...');try{let identity;try{identity=await api('whoami',{access_token:session.access_token})}catch{const fresh=await api('refresh',{refresh_token:session.refresh_token});if(run!==generation)return;save(fresh);identity=await api('whoami',{access_token:session.access_token})}if(run!==generation)return;if(identity.profiles.length!==1||!identity.profiles[0].active)throw Error('Profile inactive or missing');const [reports,actions,weeks,sections,items,pipeline]=await Promise.all([api('reports',{access_token:session.access_token}),api('actions',{access_token:session.access_token}),api('weeks',{access_token:session.access_token}),api('sections',{access_token:session.access_token}),api('items',{access_token:session.access_token}),api('pipeline',{access_token:session.access_token})]);if(run!==generation)return;$('identity').textContent='Signed in: '+identity.user.email;$('permissions').textContent=JSON.stringify({roles:identity.roles,memberships:identity.memberships,departments:identity.departments},null,2);$('reports').textContent=JSON.stringify(reports.items,null,2);$('actions').textContent=JSON.stringify(actions.items,null,2);snapshot={identity,reports:reports.items,actions:actions.items,weeks:weeks.items,sections:sections.items,items:items.items,pipeline:pipeline.items};hsqeRegister=null;renderDashboard();loadHsqeRegister(run);$('boot').hidden=true;$('login').hidden=true;$('session').hidden=false;status('Permissions loaded from Supabase');}catch(e){if(run!==generation)return;logout();status('Session validation failed: '+e.message)}}
$('login').addEventListener('submit',async e=>{e.preventDefault();status('Signing in...');$('submit').disabled=true;try{save(await api('login',{email:$('email').value,password:$('password').value}));$('password').value='';await load()}catch(err){status(err.message)}finally{$('submit').disabled=false}});
$('signout').addEventListener('click',logout);$('refresh').addEventListener('click',load);
try{session=JSON.parse(sessionStorage.getItem('vh-stage20-session')||'null')}catch{session=null}if(session)load();else setBusy(false);

function option(value,label){const o=document.createElement('option');o.value=value;o.textContent=label;return o}
function renderDashboard(){
 if(!snapshot)return;
 const {identity,reports,actions,weeks,sections,items,pipeline}=snapshot;
 const isHost=identity.roles.some(r=>['meeting_host','executive','administrator'].includes(r.role));
 const allowed=new Set(identity.memberships.filter(m=>m.active).map(m=>m.department_id));
 const depts=identity.departments.filter(d=>isHost||allowed.has(d.id));
 const dep=$('department-filter'),wk=$('week-filter');const oldDep=dep.value,oldWeek=wk.value;
 const shortcuts=$('department-shortcuts');shortcuts.replaceChildren();for(const d of depts){const b=document.createElement('button');b.type='button';b.className='department-tile';b.textContent=d.display_name;b.dataset.department=d.id;b.setAttribute('aria-label','View '+d.display_name);shortcuts.append(b)}

 dep.replaceChildren(option('','All authorised departments'));
 depts.forEach(d=>dep.append(option(d.id,d.display_name)));
 if([...dep.options].some(o=>o.value===oldDep))dep.value=oldDep;else if(depts.length===1)dep.value=depts[0].id;
 // Deep-link selection is resolved only against server-authorised departments.
 const requested=new URLSearchParams(location.search).get('department');
 if(requested&&!window.vh26DeepLinkConsumed){
   window.vh26DeepLinkConsumed=true;
   const match=depts.find(d=>d.code===requested||d.id===requested);
   if(match){dep.value=match.id;activeView='reports';}
 }

 shortcuts.querySelectorAll('[data-department]').forEach(b=>{b.classList.toggle('selected',b.dataset.department===dep.value);b.setAttribute('aria-pressed',String(b.dataset.department===dep.value))});
 if(activeView==='pipeline'&&!dep.value&&depts.length===1)dep.value=depts[0].id;
 wk.replaceChildren(option('','All reporting weeks'));
 weeks.forEach(w=>{const p=w.rail_calendar_periods||{};const label=`${p.rail_year||'?'} W${String(p.rail_week||'?').padStart(2,'0')} — ${w.status} (${p.start_date||'?'} to ${p.end_date||'?'})${/synthetic/i.test(p.source_version||'')?' [SYNTHETIC TEST]':''}`;wk.append(option(w.id,label))});
 if([...wk.options].some(o=>o.value===oldWeek))wk.value=oldWeek;
 else if(!snapshot.identity.roles.some(r=>['administrator','executive','meeting_host'].includes(r.role))){const current=weeks.find(w=>w.status==='open'&&!/synthetic/i.test(w.rail_calendar_periods?.source_version||''));if(current)wk.value=current.id;}
 const rs=reports.filter(r=>(!dep.value||r.department_id===dep.value)&&(!wk.value||r.reporting_week_id===wk.value));
 const as=actions.filter(a=>!dep.value||a.department_id===dep.value);
 const reportIds=new Set(rs.map(r=>r.id));
 const ss=sections.filter(s=>reportIds.has(s.report_id));
 const ii=items.filter(i=>reportIds.has(i.report_id));
 // Pipeline is rendered only if its schema exposes a department identifier and that department is authorised.
 const ps=pipeline.filter(p=>p.department_id&&depts.some(d=>d.id===p.department_id)&&(!dep.value||p.department_id===dep.value));
 $('summary').textContent=`${depts.length} authorised departments · ${weeks.length} reporting weeks · ${rs.length} visible reports · ${as.length} visible actions`;
 $('view-heading').textContent={overview:'Reporting overview',reports:'Department reporting',pipeline:'Pipeline',actions:'Meeting actions'}[activeView];
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('nav-active',b.dataset.view===activeView);b.setAttribute('aria-pressed',String(b.dataset.view===activeView))});
 const root=$('dashboard');root.replaceChildren();
 const label=id=>depts.find(d=>d.id===id)?.display_name||'Department';
 function panel(title,rows){const wrap=document.createElement('section');wrap.className='preview-panel';const h=document.createElement('h3');h.textContent=title;wrap.append(h);if(!rows.length){const p=document.createElement('p');p.textContent='No records currently available.';wrap.append(p)}else{const ul=document.createElement('ul');rows.forEach(row=>{const li=document.createElement('li');li.textContent=row;ul.append(li)});wrap.append(ul)}root.append(wrap)}
 if(activeView==='overview'){
  panel('Department reporting',rs.map(r=>`${label(r.department_id)} · ${r.status} · revision ${r.revision}`));
  panel('Open meeting actions',as.filter(a=>a.status!=='completed').map(a=>`${label(a.department_id)} · ${a.description} · ${a.status} · due ${a.required_by||'not set'}`));
 }else if(activeView==='reports'){
  panel('Report status',rs.map(r=>`${label(r.department_id)} · ${r.status} · revision ${r.revision}`));
  panel('Report sections',ss.map(s=>`${s.section_key} · ${JSON.stringify(s.content||{})}`));
  panel('Report items',ii.map(i=>`${i.section_key} · ${i.item_type} · ${JSON.stringify(i.payload||{})} · owner ${i.owner_text||'not assigned'} · required ${i.required_by||'not set'}`));
 }else if(activeView==='pipeline'){
  panel('Authorised pipeline records',ps.map(p=>`${label(p.department_id)} · ${p.project||'Opportunity'} · ${p.status||'Status not set'}`));
 const canEdit=new Set(identity.memberships.filter(m=>m.active&&['manager','contributor'].includes(m.membership_role)).map(m=>m.department_id));
 const ul=root.lastElementChild.querySelector('ul');if(ul)ps.forEach((p,i)=>{if(canEdit.has(p.department_id)){const b=document.createElement('button');b.type='button';b.textContent='Edit';b.dataset.editPipeline=p.id;b.style.marginLeft='12px';ul.children[i].append(b)}});
 }else if(activeView==='actions'){
  panel('Outstanding actions',as.filter(a=>a.status!=='completed').map(a=>`${label(a.department_id)} · ${a.description} · ${a.status} · due ${a.required_by||'not set'}`));
  panel('Completed actions',as.filter(a=>a.status==='completed').map(a=>`${label(a.department_id)} · ${a.description}`));
 }
 renderEditor();renderPipelineEditor();renderSpecialDepartments();renderActionManager();
}
$('department-shortcuts').addEventListener('click',e=>{const b=e.target.closest('[data-department]');if(!b||!snapshot)return;const dep=$('department-filter');if(![...dep.options].some(o=>o.value===b.dataset.department))return;dep.value=b.dataset.department;activeView='reports';renderDashboard()});
$('department-filter').addEventListener('change',renderDashboard);$('week-filter').addEventListener('change',renderDashboard);

document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{activeView=b.dataset.view;renderDashboard()}));

function editorContext(){
 if(!snapshot)return null;
 const dep=$('department-filter').value,week=$('week-filter').value;
 const member=snapshot.identity.memberships.find(m=>m.active&&m.department_id===dep&&['manager','contributor'].includes(m.membership_role));
 const w=snapshot.weeks.find(w=>w.id===week);
 const report=snapshot.reports.find(r=>r.department_id===dep&&r.reporting_week_id===week);
 return {dep,week,member,w,report};
}
function renderEditor(){
 const c=editorContext(),e=$('editor');
 e.hidden=activeView!=='reports'||!c?.member||!c?.w||!c.dep||!c.week||['hsqe','bids-rfqs'].includes(snapshot.identity.departments.find(d=>d.id===c.dep)?.code);
 if(e.hidden)return;
 const writable=c.w.status==='open'&&(!c.report||['draft','reopened'].includes(c.report.status));
 $('editor-info').textContent=`Week: ${c.w.status} · Membership: ${c.member.membership_role} · Report: ${c.report?.status||'not created'}${c.report?.status==='submitted'?' — Submitted — Read Only':''}`;
 $('create-draft').disabled=!writable||!!c.report||c.member.membership_role!=='manager';
 $('save-draft').disabled=!writable||(!c.report&&c.member.membership_role!=='manager');
 $('save-draft').textContent=c.report?'Save section':'Create draft and save section';
 $('editor-status').textContent=c.report?.status==='submitted'?'This report has been submitted and is read-only. Contact an authorised administrator to request reopening.':(c.w.status!=='open'?'This reporting week is closed. Select the current open week to edit.':(c.report?'':'No draft exists. Save will create a draft first for a department manager.'));
 const complete=reportCompletion(c);
 $('section-progress-fill').style.width=complete.percent+'%';
 $('section-progress-text').textContent=complete.count+' of '+complete.total+' sections complete';
 $('submit-report').hidden=!(complete.count===complete.total&&writable&&c.report&&c.member.membership_role==='manager');
 $('submit-report').disabled=complete.count!==complete.total||!writable||!c.report||c.member.membership_role!=='manager';
 $('save-draft').title=!writable?(c.report?.status==='submitted'?'This report has been submitted and is read-only.':'This reporting week is closed; select the current open week.') : '';
 $('submit-report').title=!writable?'This report is read-only.':'';
 const sec=snapshot.sections.find(s=>s.report_id===c.report?.id&&s.section_key===$('section-select').value);
 $('section-notes').value=sec?.content?.notes||'';
 $('section-notes').disabled=!writable;
 renderStructuredEntries(sec?.content?.entries||[],writable);
 renderSectionTabs();
}
// Structured entries use the existing report_sections JSON content; no schema migration.
let workingEntries=[];
function renderStructuredEntries(entries,writable){
 workingEntries=Array.isArray(entries)?entries.map(x=>({...x})):[];
 const root=$('structured-entries');root.replaceChildren();
 const title=document.createElement('h4');title.textContent='Section entries';root.append(title);
 const list=document.createElement('div');list.id='structured-list';root.append(list);
 const draw=()=>{list.replaceChildren();workingEntries.forEach((entry,i)=>{
  const card=document.createElement('div');card.className='structured-entry';
  const heading=document.createElement('strong');heading.textContent=`Entry ${i+1}: ${entry.title||'Untitled'}`;card.append(heading);
  const summary=document.createElement('p');summary.textContent=[entry.detail,`Owner: ${entry.owner_text||'Unassigned'}`,`Support: ${entry.support_text||'None recorded'}`,`Required by: ${entry.required_by||'Not set'}`].filter(Boolean).join(' | ');card.append(summary);
  if(writable){const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.addEventListener('click',()=>populate(entry,i));card.append(edit);const del=document.createElement('button');del.type='button';del.textContent='Remove';del.addEventListener('click',()=>{workingEntries.splice(i,1);draw();$('editor-status').textContent='Unsaved change: select Save section to persist.'});card.append(del)}list.append(card)
 });if(!workingEntries.length){const p=document.createElement('p');p.textContent='No structured entries for this section.';list.append(p)}};
 const form=$('structured-form');form.hidden=!writable;form.reset();$('structured-index').value='';
 function populate(entry,i){$('structured-index').value=String(i);for(const key of ['title','detail','owner_text','support_text','required_by'])form.elements.namedItem(key).value=entry[key]||'';form.elements.namedItem('create_action').checked=!!entry.create_action;form.scrollIntoView({block:'nearest'});}
 form.onsubmit=e=>{e.preventDefault();if(!writable)return;const f=new FormData(form);const entry={create_action:f.get('create_action')==='on'};for(const key of ['title','detail','owner_text','support_text','required_by'])entry[key]=String(f.get(key)||'').trim();if(!entry.title||!entry.owner_text||!entry.required_by){$('editor-status').textContent='Title, owner and required-by date are mandatory.';return}const idx=$('structured-index').value;if(idx==='')workingEntries.push(entry);else workingEntries[Number(idx)]=entry;form.reset();$('structured-index').value='';draw();$('editor-status').textContent='Entry staged. Select Save section to persist to Supabase.'};
 $('structured-cancel').onclick=()=>{form.reset();$('structured-index').value=''};draw();
}
const sectionNames={pipeline:'Pipeline',delivery:'Delivery',programme:'Major project status / next 2-4 week milestone / delay / dependency',risks:'New risks / customer concerns / cross-functional issue or opportunity / management support',resources:'Resources'};
function renderSectionTabs(){
 const selected=$('section-select').value;
 document.querySelectorAll('#section-tabs [data-section]').forEach(b=>{
  const active=b.dataset.section===selected;
  b.classList.toggle('section-active',active);
  b.setAttribute('aria-pressed',String(active));
 });
 const label=$('section-notes-label');
 if(label)label.firstChild.textContent=(sectionNames[selected]||'Section')+' update ';
}
$('section-tabs').addEventListener('click',e=>{
 const b=e.target.closest('[data-section]');if(!b)return;
 $('section-select').value=b.dataset.section;renderEditor();
});
$('section-select').addEventListener('change',renderEditor);
async function mutate(op,payload){
 const run=generation;
 $('editor-status').textContent='Saving to Supabase…';
 try{
  await api(op,{access_token:session.access_token,...payload});
  if(run!==generation)return;
  $('editor-status').textContent='Saved successfully. Reloading server records…';
  await load();
 }catch(e){if(run===generation)$('editor-status').textContent=e.message;}
}
$('create-draft').addEventListener('click',()=>{const c=editorContext();if(c?.member?.membership_role==='manager'&&c.w?.status==='open'&&!c.report)mutate('create_report',{department_id:c.dep,reporting_week_id:c.week})});
$('save-draft').addEventListener('click',async()=>{
 const c=editorContext();if(!c?.member||c.w?.status!=='open')return;
 if(c.report&&!['draft','reopened'].includes(c.report.status))return;
 const notes=$('section-notes').value,section_key=$('section-select').value,entries=workingEntries.map(x=>({...x})),run=generation;
 $('save-draft').disabled=true;$('editor-status').textContent='Saving section…';
 try{
  let reportId=c.report?.id;
  if(!reportId){
   if(c.member.membership_role!=='manager')throw Error('A department manager must create the draft before contributors can save.');
   $('editor-status').textContent='Creating departmental draft…';
   const created=await api('create_report',{access_token:session.access_token,department_id:c.dep,reporting_week_id:c.week});
   reportId=created.items?.[0]?.id;
   if(!reportId)throw Error('Draft creation did not return a report ID. Refresh and check report status before retrying.');
  }
  $('editor-status').textContent='Saving section to Supabase…';
  const existing=snapshot.sections.find(x=>x.report_id===reportId&&x.section_key===section_key)?.content||{};
  await api('save_section',{access_token:session.access_token,report_id:reportId,section_key,content:{...existing,notes,entries}});
  const prior=Array.isArray(existing.entries)?existing.entries:[];
  for(let i=0;i<entries.length;i++){const entry=entries[i];if(entry.create_action&&!prior[i]?.create_action){await api('create_action',{access_token:session.access_token,department_id:c.dep,reporting_week_id:c.week,description:entry.title+' — '+entry.detail,owner_text:entry.owner_text,support_text:entry.support_text||'',required_by:entry.required_by});}}
  if(run!==generation)return;
  await load();
  $('section-select').value=section_key;
  renderEditor();
  $('editor-status').textContent='Section saved to Supabase. Refresh the page to verify persistence.';
 }catch(e){$('editor-status').textContent='Save failed: '+e.message;$('section-notes').value=notes;$('save-draft').disabled=false;}
});
$('submit-report').addEventListener('click',()=>{const c=editorContext();if(c?.member?.membership_role==='manager'&&['draft','reopened'].includes(c.report?.status)&&c.w?.status==='open'&&reportCompletion(c).count===5&&confirm('Submit this departmental report? Editing will be locked.'))mutate('submit_report',{report_id:c.report.id})});

function renderPipelineEditor(){
 const el=$('pipeline-editor');if(!snapshot){el.hidden=true;return}
 const dep=$('department-filter').value;
 const permitted=snapshot.identity.memberships.some(m=>m.active&&m.department_id===dep&&['manager','contributor'].includes(m.membership_role));
 el.hidden=activeView!=='pipeline'||!permitted;
 $('pipeline-help').textContent=activeView!=='pipeline'?'':(!dep?'Select a specific department to add or edit opportunities.':(!permitted?'This department is read-only for your account.':'Pipeline is editable independently of submitted weekly reports.'));
}
$('pipeline-create').addEventListener('click',async()=>{
 const dep=$('department-filter').value;
 if(!snapshot?.identity.memberships.some(m=>m.active&&m.department_id===dep&&['manager','contributor'].includes(m.membership_role)))return;
 const editingId=$('pipeline-edit-id').value;
 const data={department_id:dep,customer:$('pipeline-customer').value,project:$('pipeline-project').value,estimated_value:Number($('pipeline-value').value),owner_text:$('pipeline-owner').value,required_by:$('pipeline-required').value};
 if(!data.customer.trim()||!data.project.trim()||!$('pipeline-value').value||!data.owner_text.trim()||!data.required_by){$('pipeline-status').textContent='All fields are required.';return}
 $('pipeline-create').disabled=true;$('pipeline-status').textContent='Saving to Supabase…';
 try{await api(editingId?'update_pipeline':'create_pipeline',{access_token:session.access_token,...data,...(editingId?{id:editingId}:{})});await load();$('department-filter').value=dep;renderDashboard();$('pipeline-status').textContent='Opportunity saved to Supabase.';clearPipelineForm()}catch(e){$('pipeline-status').textContent='Save failed: '+e.message}finally{$('pipeline-create').disabled=false}
});

function clearPipelineForm(){ $('pipeline-edit-id').value='';$('pipeline-create').textContent='Save opportunity';['pipeline-customer','pipeline-project','pipeline-value','pipeline-owner','pipeline-required'].forEach(id=>$(id).value='');}
$('pipeline-cancel').addEventListener('click',clearPipelineForm);
$('dashboard').addEventListener('click',e=>{const btn=e.target.closest('[data-edit-pipeline]');if(!btn||!snapshot)return;const p=snapshot.pipeline.find(x=>x.id===btn.dataset.editPipeline);if(!p)return;const dep=$('department-filter');dep.value=p.department_id;renderDashboard();$('pipeline-edit-id').value=p.id;$('pipeline-customer').value=p.customer||'';$('pipeline-project').value=p.project||'';$('pipeline-value').value=p.estimated_value??'';$('pipeline-owner').value=p.owner_text||'';$('pipeline-required').value=p.required_by||'';$('pipeline-create').textContent='Save changes';$('pipeline-status').textContent='Editing '+p.project;});

// Stage 25C: HSQE-specific reporting. Each section is stored as structured JSON in report_sections.
const hsqeSections=[
 {key:'hsqe_accidents',title:'1. Accidents and Incidents',fields:[['accidents','Accidents (number)','number'],['incidents','Incidents (number)','number'],['details','Details, actions and current status','textarea']]},
 {key:'hsqe_close_calls',title:'2. Close Calls by Department',fields:[['department_breakdown','Department | Operatives | Close calls this week | Close calls in last 12 months (one department per line)','textarea'],['total_12_months','Total close calls in the last 12 months','number'],['notes','Trends and follow-up','textarea']]},
 {key:'hsqe_assurance',title:'3. Assurance, Performance and Sustainability',fields:[['toolbox_talks','Toolbox talks delivered','textarea'],['audits','Audits register: reference | department | finding | owner | due date | status (one per line)','textarea'],['ncrs','NCR register: reference | department | issue | owner | due date | status (one per line)','textarea'],['supplier_performance','Supplier performance: supplier | assessing department | assessment | actions','textarea'],['site_inspections','Site inspections','textarea'],['campaigns','Themed weeks / campaigns','textarea'],['sustainability','Sustainability','textarea']]},
 {key:'hsqe_events',title:'4. Attendance at Events',fields:[['events','Event | date | attendees | outcome (one per line)','textarea']]},
 {key:'hsqe_documents',title:'5. Documents',fields:[['documents','Document | date updated | date reviewed | owner (one per line)','textarea']]}
];
let hsqeSectionKey='hsqe_accidents';
function renderSpecialDepartments(){
 if(!snapshot)return;
 const c=editorContext();const code=snapshot.identity.departments.find(d=>d.id===$('department-filter').value)?.code;
 $('bid-link').hidden=!(activeView==='reports'&&code==='bids-rfqs');
 const box=$('hsqe-editor');box.hidden=!(activeView==='reports'&&code==='hsqe'&&c?.member&&c?.w);
 if(box.hidden)return;
 const writable=c.w.status==='open'&&(!c.report||['draft','reopened'].includes(c.report.status));
 $('hsqe-context').textContent=`Week: ${c.w.status} · Report: ${c.report?.status||'not created'}${writable?'':' — Submitted / Read Only'}`;
 const host=$('hsqe-fields');host.replaceChildren();
 const selector=document.createElement('select');selector.id='hsqe-section-select';
 hsqeSections.forEach(x=>selector.append(option(x.key,x.title)));selector.value=hsqeSectionKey;
 selector.addEventListener('change',()=>{hsqeSectionKey=selector.value;renderSpecialDepartments()});
 host.append(selector);
 const definition=hsqeSections.find(x=>x.key===hsqeSectionKey);
 const saved=snapshot.sections.find(x=>x.report_id===c.report?.id&&x.section_key===hsqeSectionKey)?.content?.fields||{};
 for(const [id,label,type] of definition.fields){
  const wrap=document.createElement('label');wrap.textContent=label;
  const el=document.createElement(type==='textarea'?'textarea':'input');el.dataset.hsqeField=id;
  if(type==='textarea')el.rows=3;else {el.type=type;el.min='0'}
  el.value=saved[id]??'';el.disabled=!writable;wrap.append(el);host.append(wrap);
 }
 $('hsqe-save').disabled=!writable||(!c.report&&c.member.membership_role!=='manager');
 $('hsqe-message').textContent=writable?'Save each section separately.':'Submitted reports cannot be edited.';
}
$('hsqe-save').addEventListener('click',async()=>{
 const c=editorContext();if(!c?.member||c.w?.status!=='open'||(c.report&&!['draft','reopened'].includes(c.report.status)))return;
 const fields={};document.querySelectorAll('[data-hsqe-field]').forEach(el=>fields[el.dataset.hsqeField]=el.value);
 const key=hsqeSectionKey;const btn=$('hsqe-save');btn.disabled=true;$('hsqe-message').textContent='Saving HSQE section…';
 try{
  let reportId=c.report?.id;
  if(!reportId){if(c.member.membership_role!=='manager')throw Error('A department manager must create the draft first.');
   const created=await api('create_report',{access_token:session.access_token,department_id:c.dep,reporting_week_id:c.week});reportId=created.items?.[0]?.id;
   if(!reportId)throw Error('Draft creation returned no report ID.');}
  await api('save_section',{access_token:session.access_token,report_id:reportId,section_key:key,content:{fields}});
  await load();hsqeSectionKey=key;renderDashboard();$('hsqe-message').textContent='HSQE section saved. Refresh to verify persistence.';
 }catch(e){$('hsqe-message').textContent='Save failed: '+e.message;btn.disabled=false;}
});

// Stage 25D: HSQE register is queried independently of weekly report submission.
async function loadHsqeRegister(run){
 if(!snapshot||!snapshot.identity.departments.some(d=>d.code==='hsqe'))return;
 try{
  const [assurance,closeCalls,workforce]=await Promise.all(['hsqe_assurance','hsqe_close_calls','hsqe_workforce'].map(op=>api(op,{access_token:session.access_token})));
  if(run!==generation)return;
  hsqeRegister={assurance:assurance.items,closeCalls:closeCalls.items,workforce:workforce.items};renderHsqeRegister();
 }catch(e){if(run===generation){hsqeRegister={error:e.message};renderHsqeRegister()}}
}
function renderHsqeRegister(){
 const box=$('hsqe-register');if(!box||!snapshot)return;
 const dept=snapshot.identity.departments.find(d=>d.id===$('department-filter').value);
 box.hidden=activeView!=='reports'||dept?.code!=='hsqe';if(box.hidden)return;
 const root=$('hsqe-register-results');root.replaceChildren();
 const para=t=>{const p=document.createElement('p');p.textContent=t;root.append(p)};
 if(!hsqeRegister){para('Loading HSQE registers…');return}
 if(hsqeRegister.error){para('Register unavailable: '+hsqeRegister.error);return}
 const {assurance,closeCalls,workforce}=hsqeRegister;
 const outstanding=assurance.filter(a=>a.status!=='signed_off');
 const title=document.createElement('h4');title.textContent=`Open audits and NCRs (${outstanding.length})`;root.append(title);
 if(!outstanding.length)para('No open audit or NCR records.');
 for(const a of outstanding){const p=document.createElement('p');p.textContent=`${a.kind.toUpperCase()} ${a.reference} · ${snapshot.identity.departments.find(d=>d.id===a.department_id)?.display_name||'Department'} · ${a.description} · Owner: ${a.owner_text} · Due: ${a.due_on||'Not set'} · ${a.status}`;root.append(p);if(canManageHsqe()){for(const state of ['in_progress','signed_off']){const b=document.createElement('button');b.type='button';b.textContent=state==='signed_off'?'Sign off':'Mark in progress';b.addEventListener('click',()=>updateAssurance(a.id,state));p.append(' ',b)}}}
 const t=document.createElement('h4');t.textContent='Close calls — rolling 12 months by department';root.append(t);
 const cutoff=new Date();cutoff.setUTCFullYear(cutoff.getUTCFullYear()-1);const since=cutoff.toISOString().slice(0,10);
 for(const d of snapshot.identity.departments){
  const count=closeCalls.filter(c=>c.department_id===d.id&&c.occurred_on>=since).length;
  const headcount=workforce.filter(w=>w.department_id===d.id).sort((a,b)=>b.effective_on.localeCompare(a.effective_on))[0];
  para(`${d.display_name}: ${count} close calls · ${headcount?headcount.operative_count+' operatives ('+headcount.effective_on+')':'Operative count not recorded'}`);
 }
}
const oldRenderSpecialDepartments=renderSpecialDepartments;
renderSpecialDepartments=function(){oldRenderSpecialDepartments();renderHsqeRegister()};

function canEditHsqe(){return !!snapshot?.identity.memberships.some(m=>m.active&&['manager','contributor'].includes(m.membership_role)&&snapshot.identity.departments.some(d=>d.id===m.department_id&&d.code==='hsqe'))}
function canManageHsqe(){return !!snapshot?.identity.memberships.some(m=>m.active&&m.membership_role==='manager'&&snapshot.identity.departments.some(d=>d.id===m.department_id&&d.code==='hsqe'))}
function renderHsqeForms(){const box=$('hsqe-register-editor');if(!snapshot)return;const dept=snapshot.identity.departments.find(d=>d.id===$('department-filter').value);box.hidden=!(activeView==='reports'&&dept?.code==='hsqe'&&canEditHsqe());if(box.hidden)return;for(const form of box.querySelectorAll('form')){const select=form.querySelector('select[name=department_id]');if(select){const old=select.value;select.replaceChildren(...snapshot.identity.departments.map(d=>option(d.id,d.display_name)));if(old)select.value=old}for(const input of form.querySelectorAll('input[type=date]'))if(!input.value)input.value=new Date().toISOString().slice(0,10)}}
const priorRenderHsqe=renderSpecialDepartments;renderSpecialDepartments=function(){priorRenderHsqe();renderHsqeForms()};
async function hsqeMutate(op,payload){const m=$('hsqe-register-message');m.textContent='Saving…';try{await api(op,{access_token:session.access_token,...payload});m.textContent='Saved. Refreshing registers…';await load();$('hsqe-register-message').textContent='Saved to Supabase.'}catch(e){m.textContent='Save failed: '+e.message}}
$('hsqe-assurance-form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));hsqeMutate('hsqe_add_assurance',d)});
$('hsqe-close-form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));hsqeMutate('hsqe_add_close_call',d)});
$('hsqe-workforce-form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.operative_count=Number(d.operative_count);hsqeMutate('hsqe_set_workforce',d)});
async function updateAssurance(id,status){if(status==='signed_off'&&!confirm('Sign off this record? This cannot be undone.'))return;await hsqeMutate('hsqe_update_assurance',{id,status})}

const reportKeys=['pipeline','delivery','programme','risks','resources'];
function reportCompletion(c){
 const saved=reportKeys.filter(key=>{const x=snapshot.sections.find(s=>s.report_id===c.report?.id&&s.section_key===key)?.content;return x&&(String(x.notes||'').trim()||(Array.isArray(x.entries)&&x.entries.length))&&(!x.entries||x.entries.every(e=>e.title&&e.owner_text&&e.required_by))});
 return {count:saved.length,total:5,percent:saved.length*20};
}
function renderActionManager(){
 const box=$('action-manager');if(!box)return;
 box.hidden=activeView!=='actions';
 if(box.hidden||!snapshot)return;
 const host=$('action-register');host.replaceChildren();
 const depts=snapshot.identity.departments;
 const form=$('action-form'),select=form.elements.namedItem('department_id');
 const old=select.value;select.replaceChildren();
 const canManage=id=>snapshot.identity.roles.some(r=>['administrator','meeting_host','executive'].includes(typeof r==='string'?r:r.role))||snapshot.identity.memberships.some(m=>m.active&&m.department_id===id&&m.membership_role==='manager');
 depts.filter(d=>canManage(d.id)).forEach(d=>select.append(option(d.id,d.display_name)));
 if([...select.options].some(o=>o.value===old))select.value=old;
 form.hidden=!select.options.length;
 snapshot.actions.forEach(a=>{
  const line=document.createElement('div');line.className='action-row';
  const dep=depts.find(d=>d.id===a.department_id)?.display_name||'Department';
  const text=document.createElement('span');text.textContent=dep+' · '+a.description+' · '+a.status+' · Owner: '+a.owner_text+' · Due: '+(a.required_by||'Not set');line.append(text);
  if(canManage(a.department_id)&&a.status!=='completed'){
   const done=document.createElement('button');done.type='button';done.textContent='Complete action';
   done.onclick=async()=>{try{await api('update_action',{access_token:session.access_token,id:a.id,department_id:a.department_id,version:a.version,status:'completed',description:a.description,owner_text:a.owner_text,support_text:a.support_text||'',required_by:a.required_by});await load();}catch(e){$('action-message').textContent=e.message}};
   line.append(done);
  }host.append(line);
 });
}
$('action-form').addEventListener('submit',async e=>{
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const week=$('week-filter').value;
 if(!week){$('action-message').textContent='Select a reporting week.';return}
 try{await api('create_action',{access_token:session.access_token,...d,reporting_week_id:week});await load();$('action-message').textContent='Action created.'}catch(err){$('action-message').textContent=err.message}
});
$('ai-review').addEventListener('click',async()=>{
 const c=editorContext();if(!c?.member)return;
 const button=$('ai-review');button.disabled=true;$('ai-review-result').textContent='Reviewing update…';
 try{const res=await fetch('/.netlify/functions/review-report',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+session.access_token},body:JSON.stringify({section:$('section-select').value,text:$('section-notes').value,department:snapshot.identity.departments.find(d=>d.id===c.dep)?.display_name,week:String(snapshot.weeks.find(w=>w.id===c.week)?.week_number||c.week).slice(0,40)})});const data=await res.json();if(!res.ok)throw Error(data.error||'AI review unavailable');$('ai-review-result').textContent=[data.assessment,...(data.suggestions||[]).map(x=>'Suggestion: '+x),...(data.questions||[]).map(x=>'Question: '+x),'Suggested draft: '+(data.draft||'')].join('\n')}catch(e){$('ai-review-result').textContent='AI review failed: '+e.message}finally{button.disabled=false}
});
