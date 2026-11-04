const path=require('path');process.chdir(path.resolve(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const file='public/index.html',t=fs.readFileSync(file,'utf8'),checks=[];
const check=(name,ok)=>{checks.push({name,passed:!!ok});if(!ok)process.exitCode=1};
let scripts=[];for(const m of t.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/application\/json|text\/plain/.test(m[1]))continue;new vm.Script(m[2]);scripts.push(m)}
check('All '+scripts.length+' executable scripts compile',true);
for(const marker of ['vh-demo','Demo123','vhQuickLogin','vhChooseTestAccount','vhSetDemoRole','vhDeleteAllTestData','vhRequestDeleteReport','local-demo.invalid','ryan.spence','host@','Local preview','Test account access','Stage 3F'])check('Removed '+marker,!t.includes(marker));
check('No embedded portable snapshot',!t.includes('id="vh-portable-snapshot"'));
check('No nested portable template',!t.includes('id="vh-portable-template"'));
check('Build badge retained',t.includes('Build 052'));
const field=()=>({value:'old',disabled:false,setAttribute(){}});const fields={loginPassword:field(),loginEmail:field(),vhSignInStatus:field()};let submitHandler;const button=field(),status=[];
const form={removeAttribute(){},addEventListener(name,fn){submitHandler=fn},querySelector(){return button},appendChild(x){status.push(x)}};
const ctx={window:{},document:{getElementById:id=>fields[id],querySelector:()=>form,createElement:()=>({setAttribute(){}})}};vm.createContext(ctx);
for(const id of ['vh-authentication-pending','vh-staging-access-gate'])vm.runInContext(scripts.find(m=>m[1].includes('id="'+id+'"'))[2],ctx);
for(const name of ['enter','showChooser','chooseDept','navigate','openMeeting','launchPresenter','renderPresentation']){check(name+' denied',ctx.window[name]()===false);check(name+' cannot be replaced',Object.getOwnPropertyDescriptor(ctx.window,name).writable===false)}
check('Credentials disabled and cleared',[fields.loginEmail,fields.loginPassword].every(x=>x.disabled&&x.value===''));
check('Sign in disabled',button.disabled);check('Explanation displayed',fields.vhSignInStatus.textContent.includes('account service'));
let prevented=false;submitHandler({preventDefault(){prevented=true}});check('Form submission blocked',prevented);
check('Identity empty',ctx.window.vhIdentityEmail()==='');check('Roles denied',!ctx.window.vhHasRole('presenter'));

const manifest=JSON.parse(fs.readFileSync('docs/build-manifest.json'));
check('Entry matches reviewed build hash',crypto.createHash('sha256').update(t).digest('hex')===manifest.entry_sha256);
check('Public files exactly match allowlist',JSON.stringify(fs.readdirSync('public').sort())===JSON.stringify([...manifest.publicFiles,'acceptance.html','acceptance.js','acceptance.css'].sort()));
check('Static credential fields disabled', /<input disabled[^>]*id="loginEmail"/.test(t)&&/<input disabled[^>]*id="loginPassword"/.test(t));
check('Static sign-in disabled',t.includes('<button disabled aria-describedby="vhSignInStatus"'));
const netlify=fs.readFileSync('netlify.toml','utf8');
check('Netlify publishes only public', /publish = "public"/.test(netlify));
check('Netlify runs checks', /command = "node scripts\/verify.cjs"/.test(netlify));
const headers=fs.readFileSync('public/_headers','utf8');
check('Headers prevent framing and indexing',headers.includes('X-Frame-Options: DENY')&&headers.includes('X-Robots-Tag: noindex'));
check('Unconnected services blocked by policy',headers.includes("connect-src 'none'")&&headers.includes("form-action 'none'"));
check('No embedded credential patterns',!/(-----BEGIN [A-Z ]*PRIVATE KEY|sb_secret_[A-Za-z0-9_]+|sk-[A-Za-z0-9]{30,})/.test(t));
check('Status matches disabled build',JSON.parse(fs.readFileSync('public/deployment-status.json')).build==='052'&&JSON.parse(fs.readFileSync('public/deployment-status.json')).signInEnabled===false);
const result={type:'static syntax and isolated access-gate checks; not browser or full feature regression',checks,passed:checks.every(x=>x.passed),browser:'Playwright could not launch: Chromium executable unavailable',limitations:['No connected Supabase authentication or shared storage','No full browser/Edge visual or feature regression','No deployment, mail or live AI requests']};
fs.writeFileSync('docs/verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
