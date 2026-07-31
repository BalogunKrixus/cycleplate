/* CyclePlate redesign — nav, footer, theme, forms */
(function(){
const PAGES=[["The Science","science.html","science"],["Community","community.html","community"],["Journal","journal.html","journal"],["Partners","partners.html","partners"],["About","about.html","about"]];
const HOME="index.html";
function navHTML(active){
const links=PAGES.map(([t,h,k])=>`<a href="${h}"${k===active?' class="active"':''}>${t}</a>`).join("");
const wl=document.getElementById("waitlist")?"#waitlist":HOME+"#waitlist";
return `<div class="nav-in"><a class="nav-logo" href="${HOME}" aria-label="CyclePlate home"><span data-cp="lockup" data-mark-size="34" data-word-size="22"></span></a><nav class="nav-links" id="navLinks">${links}</nav><div class="nav-cta"><button class="theme-toggle" id="themeToggle" aria-label="Switch between light and dark mode"><svg id="tIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></svg></button><a href="community.html#join" class="btn btn-primary">Join the community</a><button class="nav-burger" id="navBurger" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></div>`;}
function footHTML(){
/* Brand marks from site/cycleplate icons. The source files fill with the
   accent colour; here they inherit currentColor instead, so the footer's
   muted-to-accent hover and both themes keep working. The clip paths in the
   originals cover the whole viewBox, so they are dropped rather than carried
   in and risking duplicate ids on the page. */
const SOCIAL=[
["Instagram","https://www.instagram.com/hellocycleplate/",'<path d="M384 0H128C57.3436 0 0 57.3439 0 128V384C0 454.656 57.3436 512 128 512H384C454.656 512 512 454.656 512 384V128C512 57.3439 454.656 0 384 0ZM256 384C185.344 384 128 326.656 128 256C128 185.344 185.344 128 256 128C326.656 128 384 185.344 384 256C384 326.656 326.656 384 256 384ZM392.96 143.872C378.88 143.872 367.36 132.352 367.36 118.272C367.36 104.192 378.88 92.6719 392.96 92.6719C407.04 92.6719 418.56 104.192 418.56 118.272C418.56 132.352 407.04 143.872 392.96 143.872Z"/><path d="M256 332.8C298.416 332.8 332.8 298.415 332.8 256C332.8 213.585 298.416 179.2 256 179.2C213.585 179.2 179.2 213.585 179.2 256C179.2 298.415 213.585 332.8 256 332.8Z"/>'],
["TikTok","https://www.tiktok.com/@cycleplate",'<path d="M480.32 128.39C451.1 128.39 424.14 118.71 402.49 102.38C377.66 83.66 359.82 56.2 353.52 24.55C351.96 16.73 351.12 8.66002 351.04 0.390015H267.57V228.47L267.47 353.4C267.47 386.8 245.72 415.12 215.57 425.08C206.82 427.97 197.37 429.34 187.53 428.8C174.97 428.11 163.2 424.32 152.97 418.2C131.2 405.18 116.44 381.56 116.04 354.54C115.41 312.31 149.55 277.88 191.75 277.88C200.08 277.88 208.08 279.24 215.57 281.71V219.37V196.96C207.67 195.79 199.63 195.18 191.5 195.18C145.31 195.18 102.11 214.38 71.2301 248.97C47.8901 275.11 33.8901 308.46 31.7301 343.43C28.9001 389.37 45.7101 433.04 78.3101 465.26C83.1001 469.99 88.1301 474.38 93.3901 478.43C121.34 499.94 155.51 511.6 191.5 511.6C199.63 511.6 207.67 511 215.57 509.83C249.19 504.85 280.21 489.46 304.69 465.26C334.77 435.53 351.39 396.06 351.57 354.05L351.14 167.49C365.49 178.56 381.18 187.72 398.02 194.83C424.21 205.88 451.98 211.48 480.56 211.47V150.86V128.37C480.58 128.39 480.34 128.39 480.32 128.39Z"/>'],
["X","https://x.com/cycleplate",'<path d="M273.121 247.258L388.34 412.062H341.054L247.033 277.582V277.573L233.229 257.832L123.397 100.727H170.683L259.317 227.517L273.121 247.258Z"/><path d="M456.677 0H55.3227C24.7696 0 0 24.7696 0 55.3227V456.677C0 487.23 24.7696 512 55.3227 512H456.677C487.23 512 512 487.23 512 456.677V55.3227C512 24.7696 487.23 0 456.677 0ZM326.57 434.186L231.426 295.717L112.306 434.186H81.5194L217.756 275.829L81.5194 77.5511H185.43L275.524 208.672L388.323 77.5511H419.11L289.199 228.564H289.19L430.481 434.186H326.57Z"/>'],
["LinkedIn","https://www.linkedin.com/company/cycleplate/about/",'<path d="M61.5379 0.440125C27.5311 0.440125 0.00550183 28.0153 0 61.945C0 95.9078 27.5256 123.477 61.5434 123.477C95.4677 123.477 123.032 95.9078 123.032 61.945C123.032 28.0098 95.4622 0.440125 61.5379 0.440125Z"/><path d="M8.46191 170.149H114.576V511.56H8.46191V170.149Z"/><path d="M384.715 161.66C333.097 161.66 298.485 189.962 284.318 216.799H282.898V170.149H181.126H181.12V511.554H287.14V342.659C287.14 298.133 295.619 255.004 350.824 255.004C405.237 255.004 405.963 305.929 405.963 345.515V511.549H512V324.289C512 232.37 492.166 161.66 384.715 161.66Z"/>']];
const soc=SOCIAL.map(([name,href,p])=>`<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="CyclePlate on ${name}"><svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">${p}</svg></a>`).join("");
const wl=document.getElementById("waitlist")?"#waitlist":HOME+"#waitlist";
return `<div class="wrap"><div class="foot-grid">
<div><span data-cp="lockup" data-mark-size="30" data-word-size="20"></span><p class="muted small" style="margin-top:14px;max-width:26ch">Cycle aligned nutrition and community for women, grounded in published research.</p><div class="foot-social">${soc}</div></div>
<div><h4>Explore</h4><ul><li><a href="science.html">The science</a></li><li><a href="community.html">Community</a></li><li><a href="journal.html">Journal</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="about.html">About</a></li><li><a href="about.html">Our mission</a></li><li><a href="partners.html">Partners</a></li><li><a href="${wl}">Newsletter</a></li></ul></div>
<div><h4>Stay in touch</h4><ul><li><a href="mailto:hellocycleplate@gmail.com">hellocycleplate@gmail.com</a></li><li><a href="mailto:info@hellocycleplate.com">info@hellocycleplate.com</a></li><li><a href="${wl}">Join the waitlist</a></li></ul></div>
</div><div class="foot-legal"><span class="mono">© 2026 CyclePlate</span><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Service</a><span>CyclePlate is a nutrition wellness tool. It is not medical advice, diagnosis, or treatment.</span></div></div>`;}
const SUN='<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"/>';
const MOON='<path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5z"/>';
function setIcon(){const el=document.getElementById("tIcon");if(el)el.innerHTML=document.documentElement.dataset.theme==="dark"?SUN:MOON;}
function init(){
const nav=document.querySelector(".nav");if(nav)nav.innerHTML=navHTML(document.body.dataset.page);
const foot=document.querySelector("footer");if(foot)foot.innerHTML=footHTML();
if(window.CyclePlate)CyclePlate.hydrate();
setIcon();
document.getElementById("themeToggle")?.addEventListener("click",()=>{const d=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=d;localStorage.setItem("cpTheme",d);setIcon();});
document.getElementById("navBurger")?.addEventListener("click",()=>document.getElementById("navLinks").classList.toggle("open"));
/* forms -------------------------------------------------------------------
Every submission is posted to a provider endpoint. Paste the endpoints into
ENDPOINTS below and redeploy; while one is blank that form tells the visitor
to email us instead, because reporting a success we cannot deliver is how
signups got silently dropped before. */
const ENDPOINTS={newsletter:"/api/subscribe",community:"/api/subscribe",partner:"/api/subscribe"};
const CONTACT={newsletter:"hellocycleplate@gmail.com",community:"hellocycleplate@gmail.com",partner:"hellocycleplate@gmail.com"};
const DONE={
newsletter:"Thank you. You are on the list. Science backed cycle nutrition, straight to your inbox.",
community:"Welcome in. You are on the list, and we will email you as your circles open up.",
partner:"Thank you. We will respond within two business days."};
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function setMsg(el,kind,text){el.className="form-msg"+(kind?" "+kind:"");el.textContent=text;}
// FormData keeps only the last value for repeated names, so fold checkbox groups by hand
function readFields(form){
const data=Object.fromEntries(new FormData(form).entries());
const groups={};
form.querySelectorAll('input[type="checkbox"][name]:checked').forEach(i=>{(groups[i.name]??=[]).push(i.value);});
Object.entries(groups).forEach(([k,v])=>{data[k]=v.join(", ");});
return data;}
async function deliver(kind,data){
const url=ENDPOINTS[kind];
if(!url)throw new Error("unconfigured");
const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({form:kind,...data})});
if(res.ok)return;
let reason="";
try{reason=(await res.json()).error||"";}catch{}
throw new Error(reason||"http "+res.status);}
function wireForm(form,kind,validate){
if(!form)return;
const msg=form.parentElement.querySelector(".form-msg");
const btn=form.querySelector('button[type="submit"]');
const label=btn?btn.textContent:"";
let busy=false;
form.addEventListener("submit",async e=>{
e.preventDefault();
if(busy)return;
const data=readFields(form);
if(data.cp_hp)return;// honeypot: off-screen field only a bot fills in. Deliberately not
// named after anything autofill recognises, or a browser fills it for a real person
const problem=validate(data);
if(problem){setMsg(msg,"err",problem);return;}
busy=true;setMsg(msg,"","");
if(btn){btn.disabled=true;btn.textContent="Sending…";}
try{
await deliver(kind,data);
setMsg(msg,"ok",DONE[kind]);
form.reset();
}catch(err){
const why=err.message;
setMsg(msg,"err",
why==="already"?"You are already on the list.":
why==="invalid email"?"Please enter a valid email address.":
why==="unconfigured"?"Sign ups are not connected yet. Please email "+CONTACT[kind]+" and we will add you by hand.":
"That did not go through. Please try again, or email "+CONTACT[kind]+".");
}finally{
busy=false;if(btn){btn.disabled=false;btn.textContent=label;}
}});}
const needsEmail=d=>!d.email||!EMAIL_RE.test(d.email)?"Please enter a valid email address.":"";
document.querySelectorAll("form.cp-waitlist").forEach(f=>wireForm(f,"newsletter",needsEmail));
wireForm(document.getElementById("communityForm"),"community",d=>!d.display_name?"Please choose a display name.":needsEmail(d));
wireForm(document.getElementById("partnerForm"),"partner",d=>!d.org_name?"Please tell us your organisation name.":!d.contact_name?"Please tell us your name.":needsEmail(d));
// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");en.target.querySelectorAll?.(".bar-fill").forEach(b=>{if(b.dataset.w)b.style.width=b.dataset.w;});if(en.target.dataset&&en.target.dataset.p)en.target.style.setProperty("--p",en.target.dataset.p);io.unobserve(en.target);}}),{threshold:.12});
document.querySelectorAll(".rv").forEach(el=>io.observe(el));
// charts that are not .rv still fill
document.querySelectorAll(".chart:not(.rv)").forEach(c=>c.querySelectorAll(".bar-fill").forEach(b=>{if(b.dataset.w)setTimeout(()=>b.style.width=b.dataset.w,120);}));
}
if(document.readyState!=="loading")init();else document.addEventListener("DOMContentLoaded",init);
})();
