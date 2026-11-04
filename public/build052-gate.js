"use strict";
(()=>{
 const gate=document.getElementById('vh26-auth'), ribbon=document.getElementById('vh26-ribbon'), msg=document.getElementById('vh26-message');
 let token=null;
 async function api(op,extra={}){const r=await fetch('/api/acceptance',{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify({op,...extra})});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed');return data}
 function unlock(identity){if(!identity.profiles?.some(p=>p.active)||!identity.roles?.length)throw Error('No active Visualisation Hub role');gate.hidden=true;ribbon.style.display='flex';document.getElementById('vh26-message').textContent='';}
 async function check(){const raw=sessionStorage.getItem('vh-stage20-session');if(!raw){msg.textContent='Sign in with your staging account.';return}try{const s=JSON.parse(raw);let identity;try{identity=await api('whoami',{access_token:s.access_token});token=s.access_token}catch{const fresh=await api('refresh',{refresh_token:s.refresh_token});sessionStorage.setItem('vh-stage20-session',JSON.stringify(fresh));token=fresh.access_token;identity=await api('whoami',{access_token:token})}unlock(identity)}catch(e){sessionStorage.removeItem('vh-stage20-session');msg.textContent='Session expired. Please sign in.'}}
 document.getElementById('vh26-form').addEventListener('submit',async e=>{e.preventDefault();msg.textContent='Signing in…';try{const s=await api('login',{email:document.getElementById('vh26-email').value,password:document.getElementById('vh26-password').value});const identity=await api('whoami',{access_token:s.access_token});sessionStorage.setItem('vh-stage20-session',JSON.stringify(s));unlock(identity);document.getElementById('vh26-password').value=''}catch(e){msg.textContent=e.message}});
 document.getElementById('vh26-signout').addEventListener('click',()=>{sessionStorage.removeItem('vh-stage20-session');location.reload()});
 check();
})();
