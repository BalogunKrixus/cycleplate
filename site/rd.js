/* CyclePlate redesign — nav, footer, theme, forms */
(function(){
const PAGES=[["The Science","science.html","science"],["Community","community.html","community"],["Journal","journal.html","journal"],["Partners","partners.html","partners"],["About","about.html","about"]];
const HOME="index.html";
function navHTML(active){
const links=PAGES.map(([t,h,k])=>`<a href="${h}"${k===active?' class="active"':''}>${t}</a>`).join("");
const wl=document.getElementById("waitlist")?"#waitlist":HOME+"#waitlist";
return `<div class="nav-in"><a class="nav-logo" href="${HOME}" aria-label="CyclePlate home"><span data-cp="lockup" data-mark-size="34" data-word-size="22"></span></a><nav class="nav-links" id="navLinks">${links}</nav><div class="nav-cta"><button class="theme-toggle" id="themeToggle" aria-label="Switch between light and dark mode"><svg id="tIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></svg></button><a href="community.html#join" class="btn btn-primary">Join the community</a><button class="nav-burger" id="navBurger" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></div>`;}
function footHTML(){
const SOCIAL=[
["Instagram","https://www.instagram.com/hellocycleplate/",'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>'],
["TikTok","https://www.tiktok.com/@cycleplate",'<path d="M14 4v9.5a3.75 3.75 0 1 1-3.75-3.75M14 4c.4 2.4 2 4.2 4.5 4.5"/>'],
["X","https://x.com/cycleplate",'<path d="M4 4l16 16M20 4L4 20"/>'],
["LinkedIn","https://www.linkedin.com/company/cycleplate/about/",'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.2v.1M12 17v-4a2.2 2.2 0 0 1 4.4 0v4"/>']];
const soc=SOCIAL.map(([name,href,p])=>`<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="CyclePlate on ${name}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg></a>`).join("");
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
const ENDPOINTS={newsletter:"/api/subscribe",community:"/api/subscribe",partner:""};
const CONTACT={newsletter:"hellocycleplate@gmail.com",community:"hellocycleplate@gmail.com",partner:"info@hellocycleplate.com"};
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
if(data.company)return;// honeypot: off-screen field only a bot fills in
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
