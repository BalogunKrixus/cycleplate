/* CyclePlate redesign — nav, footer, theme, forms */
(function(){
const PAGES=[["The Science","science.html","science"],["Community","community.html","community"],["Journal","journal.html","journal"],["Partners","partners.html","partners"],["About","about.html","about"]];
const HOME="index.html";
function navHTML(active){
const links=PAGES.map(([t,h,k])=>`<a href="${h}"${k===active?' class="active"':''}>${t}</a>`).join("");
const wl=document.getElementById("waitlist")?"#waitlist":HOME+"#waitlist";
return `<div class="nav-in"><a class="nav-logo" href="${HOME}" aria-label="CyclePlate home"><span data-cp="lockup" data-mark-size="34" data-word-size="22"></span></a><nav class="nav-links" id="navLinks">${links}</nav><div class="nav-cta"><button class="theme-toggle" id="themeToggle" aria-label="Switch between light and dark mode"><svg id="tIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></svg></button><a href="community.html#join" class="btn btn-primary">Join the community</a><button class="nav-burger" id="navBurger" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></div>`;}
function footHTML(){
const ic={instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',tiktok:'<path d="M14 4v9.5a3.75 3.75 0 1 1-3.75-3.75M14 4c.4 2.4 2 4.2 4.5 4.5"/>',x:'<path d="M4 4l16 16M20 4L4 20"/>',linkedin:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.2v.1M12 17v-4a2.2 2.2 0 0 1 4.4 0v4"/>'};
const soc=Object.entries(ic).map(([k,p])=>`<a href="#" aria-label="${k}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg></a>`).join("");
const wl=document.getElementById("waitlist")?"#waitlist":HOME+"#waitlist";
return `<div class="wrap"><div class="foot-grid">
<div><span data-cp="lockup" data-mark-size="30" data-word-size="20"></span><p class="muted small" style="margin-top:14px;max-width:26ch">Cycle aligned nutrition and community for women, grounded in published research.</p><div class="foot-social">${soc}</div></div>
<div><h4>Explore</h4><ul><li><a href="science.html">The science</a></li><li><a href="community.html">Community</a></li><li><a href="journal.html">Journal</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="about.html">About</a></li><li><a href="about.html">Our mission</a></li><li><a href="partners.html">Partners</a></li><li><a href="${wl}">Newsletter</a></li></ul></div>
<div><h4>Stay in touch</h4><ul><li><a href="mailto:hellocycleplate@gmail.com">hellocycleplate@gmail.com</a></li><li><a href="mailto:info@hellocycleplate.com">info@hellocycleplate.com</a></li><li><a href="${wl}">Join the waitlist</a></li></ul></div>
</div><div class="foot-legal"><span class="mono">© 2026 CyclePlate</span><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><span>CyclePlate is a nutrition wellness tool. It is not medical advice, diagnosis, or treatment.</span></div></div>`;}
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
// waitlist forms
document.querySelectorAll("form.cp-waitlist").forEach(f=>{f.addEventListener("submit",e=>{e.preventDefault();
const email=f.querySelector('input[type="email"]').value.trim();
const name=f.querySelector('input[name="first_name"]')?.value.trim()||"";
const msg=f.parentElement.querySelector(".form-msg");
if(!email||!/.+@.+\..+/.test(email)){msg.className="form-msg err";msg.textContent="Something went wrong. Please try again or email hellocycleplate@gmail.com.";return;}
console.log("Waitlist signup:",{email,first_name:name});
msg.className="form-msg ok";msg.textContent="Thank you. You are on the list. Science backed cycle nutrition, straight to your inbox.";f.reset();});});
// community join form
const cf=document.getElementById("communityForm");
if(cf)cf.addEventListener("submit",e=>{e.preventDefault();
const email=cf.querySelector('input[type="email"]').value.trim();
const msg=cf.parentElement.querySelector(".form-msg");
if(!email||!/.+@.+\..+/.test(email)){msg.className="form-msg err";msg.textContent="Something went wrong. Please check your email address and try again.";return;}
console.log("Community signup:",Object.fromEntries(new FormData(cf).entries()));
msg.className="form-msg ok";msg.textContent="Welcome in. Check your inbox to confirm your email and choose the circles you want to join.";cf.reset();});
// partner form
const pf=document.getElementById("partnerForm");
if(pf)pf.addEventListener("submit",e=>{e.preventDefault();
const data=Object.fromEntries(new FormData(pf).entries());
data.partnership_interest=[...pf.querySelectorAll('input[name="interest"]:checked')].map(i=>i.value);
const msg=pf.parentElement.querySelector(".form-msg");
if(!data.org_name||!data.email||!/.+@.+\..+/.test(data.email)){msg.className="form-msg err";msg.textContent="Something went wrong. Please check the required fields and try again, or email info@hellocycleplate.com.";return;}
console.log("Partner enquiry:",data);
msg.className="form-msg ok";msg.textContent="Thank you. We will respond within two business days.";pf.reset();});
// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");en.target.querySelectorAll?.(".bar-fill").forEach(b=>{if(b.dataset.w)b.style.width=b.dataset.w;});if(en.target.dataset&&en.target.dataset.p)en.target.style.setProperty("--p",en.target.dataset.p);io.unobserve(en.target);}}),{threshold:.12});
document.querySelectorAll(".rv").forEach(el=>io.observe(el));
// charts that are not .rv still fill
document.querySelectorAll(".chart:not(.rv)").forEach(c=>c.querySelectorAll(".bar-fill").forEach(b=>{if(b.dataset.w)setTimeout(()=>b.style.width=b.dataset.w,120);}));
}
if(document.readyState!=="loading")init();else document.addEventListener("DOMContentLoaded",init);
})();
