const themeToggle = document.getElementById('themeToggle');
let themeAnimationTimer;

// Keep every fresh open predictable instead of restoring the browser's last state.
try {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
} catch (error) {}

function startAtHomeWhenAppropriate() {
  const hash = window.location.hash;
  if (!hash || hash === '#home') {
    window.scrollTo(0, 0);
  }
}

window.addEventListener('pageshow', startAtHomeWhenAppropriate);
window.addEventListener('load', startAtHomeWhenAppropriate);

function applyTheme(theme, animate = false) {
  const isDark = theme === 'dark';
  if (animate) {
    document.documentElement.classList.remove('theme-switching');
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add('theme-switching');
    clearTimeout(themeAnimationTimer);
    themeAnimationTimer = setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 520);
  }
  document.documentElement.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('dark-mode', isDark);
  if (themeToggle) {
    themeToggle.classList.toggle('is-dark', isDark);
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

applyTheme('light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });
}

// keep fixed-navbar section clicks aligned with the real section top
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("navbar-top");
  const navLinks = Array.from(document.querySelectorAll("#navbar-top .nav-link[href^='#']"));
  const sectionLinks = navLinks
    .map((link) => {
      const hash = link.getAttribute("href");
      const section = hash && hash !== "#" ? document.querySelector(hash) : null;
      return section ? { link, hash, section } : null;
    })
    .filter(Boolean);

  function navbarHeight() {
    return navbar ? Math.ceil(navbar.getBoundingClientRect().height) : 0;
  }

  function syncAnchorOffset() {
    const offset = navbarHeight();
    document.documentElement.style.setProperty("--nav-offset", `${offset}px`);
    document.body.style.paddingTop = `${offset}px`;
  }

  function setActiveNav(hash) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === hash || (hash === '#home' && link.getAttribute("href") === '#');
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function syncActiveNav() {
    if (!sectionLinks.length) return;

    const activationLine = window.scrollY + navbarHeight() + 24;
    let activeItem = sectionLinks[0];

    sectionLinks.forEach((item) => {
      if (item.section.offsetTop <= activationLine) {
        activeItem = item;
      }
    });

    setActiveNav(activeItem.hash);
  }

  syncAnchorOffset();
  syncActiveNav();
  
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      syncAnchorOffset();
      syncActiveNav();
    }, 150);
  });
  window.addEventListener("scroll", syncActiveNav, { passive: true });
  window.addEventListener("hashchange", syncActiveNav);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (event) {
      if (event.defaultPrevented) return;

      const hash = this.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      syncAnchorOffset();

      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight();
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      history.pushState(null, "", hash);
      setActiveNav(hash);

      const openMenu = document.querySelector(".navbar-collapse.show");
      const menuButton = document.querySelector(".nav-menu");
      if (openMenu && menuButton) menuButton.click();
    });
  });
});


// adding funtionality to back to top button 

//Get the button
let mybutton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};
function scrollFunction() {
  if (!mybutton) return;

  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
// When the user clicks on the button, scroll to the top of the document
if (mybutton) {
  mybutton.addEventListener("click",function(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
}

(function(){
  'use strict';
  const track=document.getElementById('track'),
        wrap=document.getElementById('trackWrap'),
        progBar=document.getElementById('prog'),
        cursor=document.getElementById('cursor'),
        curArrow=document.getElementById('curArrow'),
        zoneL=document.getElementById('zoneL'),
        zoneR=document.getElementById('zoneR'),
        section=document.getElementById('wid');

  if (!track || !wrap || !progBar || !cursor || !curArrow || !zoneL || !zoneR || !section) return;

  const cards=Array.from(track.querySelectorAll('.card')),
        dotBtns=Array.from(document.querySelectorAll('.dot'));
  const expertiseSection = section.closest('.expertise');

  if (expertiseSection) expertiseSection.classList.add('animation-ready');

  const TOTAL=cards.length,VISIBLE=3,MAX_SNP=TOTAL-VISIBLE;
  const BASE_SPD=0.72,MAX_MULT=2.15,DELAY=260,SNAP_DUR=560;
  let offset=0,snapIdx=0,step=0,dir=0,depth=0,timer=null;
  let sliding=false,snapping=false,snapFrom=0,snapTo=0,snapT0=null,raf=null,touch=false;

  function measure(){if(cards.length<2)return;step=cards[1].getBoundingClientRect().left-cards[0].getBoundingClientRect().left;}
  function maxOff(){return MAX_SNP*step;}
  function apply(px){track.style.transform=`translateX(${-px}px)`;}
  function isNativeSwipe(){return window.matchMedia('(max-width: 800px)').matches;}
  function syncDots(){dotBtns.forEach((d,i)=>d.classList.toggle('active',i===snapIdx));}
  function syncProg(){progBar.style.width=Math.min(100,Math.max(0,maxOff()>0?(offset/maxOff())*100:0))+'%';}
  function syncCenter(){const c=snapIdx+1;cards.forEach((card,i)=>card.classList.toggle('center',i===c));}
  function syncVisibleCards(){
    cards.forEach((card,i)=>{
      const visible=i>=snapIdx&&i<snapIdx+VISIBLE;
      card.style.setProperty('--card-visible-order', Math.max(0,i-snapIdx));
      if(visible&&!card.classList.contains('in-view-card')){
        card.classList.remove('card-load-anim');
        void card.offsetWidth;
        card.classList.add('card-load-anim');
        clearTimeout(card._loadAnimTimer);
        card._loadAnimTimer=setTimeout(()=>card.classList.remove('card-load-anim'),680);
      }
      card.classList.toggle('in-view-card',visible);
    });
  }
  function syncAll(){syncDots();syncProg();syncCenter();syncVisibleCards();}
  function nearest(){snapIdx=Math.round(Math.max(0,Math.min(MAX_SNP,offset/step)));}
  function ease(t){return t>=1?1:1-Math.pow(2,-10*t);}
  function cancelR(){if(raf){cancelAnimationFrame(raf);raf=null;}}

  function doSnap(idx){
    snapIdx=Math.max(0,Math.min(MAX_SNP,idx));
    if(isNativeSwipe()){
      const targetCard=cards[snapIdx];
      if(targetCard) targetCard.scrollIntoView({behavior:'auto', inline:'start', block:'nearest'});
      syncAll();
      return;
    }
    const dest=snapIdx*step;
    cancelR();
    sliding=false;
    snapping=false;
    offset=dest;
    apply(offset);
    syncAll();
  }
  function snapFrame(ts){
    if(!snapT0)snapT0=ts;
    const p=Math.min((ts-snapT0)/SNAP_DUR,1);
    offset=snapFrom+(snapTo-snapFrom)*ease(p);apply(offset);syncProg();
    if(p<1)raf=requestAnimationFrame(snapFrame);
    else{offset=snapTo;snapping=false;apply(offset);syncAll();}
  }
  function slideTick(){
    if(dir===0||snapping){sliding=false;return;}
    offset+=dir*BASE_SPD*(1+(MAX_MULT-1)*depth);
    const mx=maxOff();
    if(offset<0){offset*=.82;if(offset>-.4)offset=0;}
    if(offset>mx){const ov=offset-mx;offset=mx+ov*.82;if(ov<.4)offset=mx;}
    apply(offset);nearest();syncAll();raf=requestAnimationFrame(slideTick);
  }
  function startSlide(){if(sliding||snapping)return;cancelR();sliding=true;raf=requestAnimationFrame(slideTick);}
  function stopSlide(){sliding=false;dir=0;clearTimeout(timer);timer=null;if(!snapping){cancelR();nearest();doSnap(snapIdx);}}

  function onEnter(d){return function(){if(touch)return;dir=d;cursor.classList.add('show');curArrow.setAttribute('points',d===-1?'15 18 9 12 15 6':'9 18 15 12 9 6');this.classList.add('on');};}
  function onLeave(){return function(){if(touch)return;dir=0;clearTimeout(timer);timer=null;sliding=false;this.classList.remove('on');cursor.classList.remove('show');if(!snapping){cancelR();nearest();doSnap(snapIdx);}};}
  function onMove(d){return function(e){if(touch)return;cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';const r=section.getBoundingClientRect(),zw=r.width*.15;depth=d===-1?Math.max(0,Math.min(1,1-(e.clientX-r.left)/zw)):Math.max(0,Math.min(1,1-(r.right-e.clientX)/zw));if(!sliding&&!timer){timer=setTimeout(()=>{if(dir!==0)startSlide();timer=null;},DELAY);}};}

  zoneL.addEventListener('mouseenter',onEnter(-1));zoneL.addEventListener('mouseleave',onLeave());zoneL.addEventListener('mousemove',onMove(-1));
  zoneR.addEventListener('mouseenter',onEnter(1));zoneR.addEventListener('mouseleave',onLeave());zoneR.addEventListener('mousemove',onMove(1));
  cards.forEach(c=>c.addEventListener('mouseenter',()=>{if(sliding)stopSlide();}));
  dotBtns.forEach((d,i)=>d.addEventListener('click',()=>doSnap(i)));
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')doSnap(Math.min(MAX_SNP,snapIdx+1));if(e.key==='ArrowLeft')doSnap(Math.max(0,snapIdx-1));});

  let tx0=0,txL=0,tVel=0,tAct=false;
  wrap.addEventListener('touchstart',e=>{if(isNativeSwipe())return;touch=true;tx0=txL=e.touches[0].clientX;tVel=0;tAct=true;cancelR();snapping=false;},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(isNativeSwipe()||!tAct)return;const x=e.touches[0].clientX;tVel=x-txL;txL=x;let no=offset+(tx0-x)*.42;no=Math.max(-step*.35,Math.min(maxOff()+step*.35,no));apply(no);},{passive:true});
  wrap.addEventListener('touchend',()=>{if(isNativeSwipe()||!tAct)return;tAct=false;if(Math.abs(tVel)>3)snapIdx+=tVel<0?1:-1;else nearest();doSnap(snapIdx);});

  wrap.addEventListener('scroll',()=>{
    if(!isNativeSwipe())return;
    const wrapCenter=wrap.getBoundingClientRect().left + wrap.clientWidth / 2;
    let closest=0,closestDist=Infinity;
    cards.forEach((card,i)=>{
      const rect=card.getBoundingClientRect();
      const dist=Math.abs((rect.left + rect.width / 2) - wrapCenter);
      if(dist<closestDist){closest=i;closestDist=dist;}
    });
    snapIdx=Math.max(0,Math.min(MAX_SNP,closest));
    syncAll();
  },{passive:true});

  let rsz;window.addEventListener('resize',()=>{clearTimeout(rsz);rsz=setTimeout(()=>{measure();offset=snapIdx*step;if(!isNativeSwipe())apply(offset);syncProg();},130);});

  let revealDoneTimer,revealedOnce=false,lastPageY=window.scrollY;
  function reveal(){
    if(revealedOnce)return;
    revealedOnce=true;
    clearTimeout(revealDoneTimer);
    cards.forEach((c,i)=>{
      c.style.setProperty('--expertise-delay', `${140 + i * 110}ms`);
      c.classList.add('expertise-card-visible');
    });
    revealDoneTimer=setTimeout(()=>{
      cards.forEach(c=>{
        c.classList.add('done');
        c.style.removeProperty('--expertise-delay');
      });
      if (expertiseSection) expertiseSection.classList.remove('animation-ready');
      syncCenter();
      io.disconnect();
    },1200);
  }
  function showRevealInstantly(){
    if(revealedOnce)return;
    revealedOnce=true;
    clearTimeout(revealDoneTimer);
    cards.forEach(c=>{
      c.classList.add('expertise-card-visible','done');
      c.style.removeProperty('--expertise-delay');
    });
    if (expertiseSection) expertiseSection.classList.remove('animation-ready');
    syncCenter();
    io.disconnect();
  }
  function resetReveal(){
    if(revealedOnce)return;
    clearTimeout(revealDoneTimer);
    cards.forEach(c=>{
      c.classList.remove('expertise-card-visible', 'done');
      c.style.removeProperty('--expertise-delay');
    });
  }
  const io=new IntersectionObserver(e=>{
    const currentY=window.scrollY;
    const scrollingDown=currentY>=lastPageY;
    lastPageY=currentY;
    if(e[0].isIntersecting) {
      if(scrollingDown) reveal();
      else showRevealInstantly();
    } else resetReveal();
  },{threshold:.28, rootMargin:'0px 0px -12% 0px'});
  io.observe(section);

  function init(){measure();apply(0);syncAll();setTimeout(syncCenter,1400);}
  if(document.readyState==='complete')init();else window.addEventListener('load',init);
})();


  // ── Intersection Observer: animate-in ──
  const aboutSection = document.querySelector('.about-animated');
  if (aboutSection) aboutSection.classList.add('animation-ready');

  const animItems = document.querySelectorAll('.animate-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  animItems.forEach(el => observer.observe(el));

  if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        aboutSection.classList.toggle('about-in-view', entry.isIntersecting);
      });
    }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' });

    aboutObserver.observe(aboutSection);
  }

  // ── Skill bars ──
  const bars = document.querySelectorAll('.skill-bar');
  const pctLabels = document.querySelectorAll('.skill-pct');

  function resetSkillBar(bar) {
    const idx = [...bars].indexOf(bar);
    const label = pctLabels[idx];
    clearTimeout(bar._fillTimer);
    cancelAnimationFrame(bar._countTimer);
    bar.style.width = '0%';
    bar.classList.remove('filled');
    if (label) label.textContent = '0%';
  }

  function fillSkillBar(bar) {
    const pct = bar.dataset.pct;
    const idx = [...bars].indexOf(bar);
    const label = pctLabels[idx];
    const end = parseInt(pct, 10);

    clearTimeout(bar._fillTimer);
    cancelAnimationFrame(bar._countTimer);

    bar._fillTimer = setTimeout(() => {
      bar.style.width = pct + '%';
      bar.classList.add('filled');
      const duration = 1200;
      const startTime = performance.now();

      function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        // if (label) label.textContent = Math.round(eased * end) + '%'; // Commented out to hide percentage number
        if (progress < 1) {
          bar._countTimer = requestAnimationFrame(update);
        }
      }

      bar._countTimer = requestAnimationFrame(update);
    }, idx * 80);
  }

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const bar = e.target;
      if (e.isIntersecting) {
        fillSkillBar(bar);
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => skillObserver.observe(b));

  // ── Modal ──
  const overlay = document.getElementById('modalOverlay');
  const hireMeBtns = document.querySelectorAll('[data-hire-modal], #hireMeBtn');
  const closeBtn = document.getElementById('modalClose');

  if (overlay && hireMeBtns.length && closeBtn) {
    const openModal = (event) => {
      event.preventDefault();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };

    hireMeBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  const CLRS = ['#e63946','#f4a261','#2ec4b6','#8338ec','#06d6a0','#fb5607','#3a86ff','#ffbe0b','#ff006e','#5390d9','#80b918','#c77dff'];

const data = [

  { id:1, cat:'cpc', title:'CDO Babarmahal — Phase II Fire Damage & NDT Assessment', photo:'images/optimized/cdo.jpg' },

  { id:2, cat:'nipun', title:'Residential Project — Drawing Updates & Coordination', photo:'images/optimized/residential.jpg' },

  { id:3, cat:'riu', title:'ACEM Campus — 3D Model via Drone Photogrammetry', photo:'images/optimized/drone.jpg' },

  { id:4, cat:'cpc', title:'Bagmati Corridor — Estimate Revision & Finalization', photo:'images/optimized/bagmati.jpg' },

  { id:5, cat:'nipun', title:'Site Survey — Layout Verification & Field Measurement', photo:'images/optimized/nip.jpg' },

  { id:6, cat:'cpc', title:'Nilopul–Jadibuti Corridor — End-to-End Cost Estimation', photo:'images/optimized/nare.jpg' },

  { id:7, cat:'riu', title:'Drone Photogrammetry — Technical Case Study Publication', photo:'images/optimized/blog.jpg' },

  { id:8, cat:'cpc', title:'Rastriya Sabha Griha — Survey for 3D & Lighting', photo:'images/optimized/rastriya.jpg' },


  { id:10, cat:'cpc', title:'Kanti Ishwori School — BOQ & Cost Validation', photo:'images/optimized/kanti.jpg' },

  { id:11, cat:'riu', title:'Photogrammetry Training — Theory & Practical Mentorship', photo:'images/optimized/teaching.jpg' },

  { id:12, cat:'cpc', title:'Pancha Kumari Park — Quantity Takeoff & Site Survey', photo:'images/optimized/pancha.jpg' },

  { id:13, cat:'nipun', title:'Project Coordination — Site to Office Workflow', photo:'images/optimized/neap.jpg' },

  { id:14, cat:'cpc', title:'Chamati Park — Estimate Verification & Documentation', photo:'images/optimized/chamati.jpg' },

  { id:16, cat:'nipun', title:'BOQ Support — Quantity Checks & Corrections', photo:'images/optimized/naip.jpg' },

  { id:17, cat:'cpc', title:'Dhungedhara Park — Field Survey & Site Study', photo:'images/optimized/dhunge.jpg' },

  { id:18, cat:'cpc', title:'Mahankal Temple — Traditional Construction Study', photo:'images/optimized/mahankal.jpg' },

  { id:19, cat:'cpc', title:'Traffic Signal Survey – KMC (37 Sites)', photo:'images/optimized/traffic.jpg' },


  

];

const svgMarkup = `<svg class="i5o6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="10" width="40" height="28" rx="4" stroke="#9ca3af" stroke-width="1.8"/><circle cx="16" cy="21" r="4" stroke="#9ca3af" stroke-width="1.8"/><path d="M4 31 L14 22 L22 30 L32 20 L44 31" stroke="#9ca3af" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

function genCard(p) {
  const idx = data.indexOf(p);
  const brdr = CLRS[idx % CLRS.length];
  const img = p.photo
    ? `<img class="m2n3" src="${p.photo}" alt="${p.title}" loading="lazy" decoding="async" onerror="this.style.display='none'">`
    : `<div class="h1j4">${svgMarkup}<span class="l7p8">Insert Photo</span></div>`;
  return `<article class="c9l0" style="border-color:${brdr}" data-cat="${p.cat}">
    ${img}
    <div class="k9u1 b-${p.cat}">
      <span class="d4y2"></span>${p.cat === 'nipun' ? 'Nipun' : p.cat.toUpperCase()}
    </div>
    <div class="f5e6"><h3 class="t1t2">${p.title}</h3></div>
  </article>`;
}

const mainTrack = document.getElementById('t4r2');
let activeF = 'all';

function getItems(f) { return f === 'all' ? data : data.filter(p => p.cat === f); }

function render(f) {
  const list = getItems(f);
  mainTrack.innerHTML = list.map(p => genCard(p)).join('') + list.map(p => genCard(p)).join('');
  const spd = Math.max(48, 92 * (list.length / data.length));
  mainTrack.style.animation = 'none';
  void mainTrack.offsetWidth;
  mainTrack.style.animation = `a4r7 ${spd}s linear infinite`;
}

function counter(el, val, ms) {
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / ms, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * val);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

let runOnce = false;

function fire() {
  if (runOnce) return;
  runOnce = true;
  ['vT','vC','vN','vR'].forEach(id => document.getElementById(id).classList.add('in'));
  ['lT','lC','lN','lR'].forEach(id => document.getElementById(id).classList.add('in'));
  setTimeout(() => counter(document.getElementById('cT'), data.length, 900), 0);
  setTimeout(() => counter(document.getElementById('cC'), data.filter(p=>p.cat==='cpc').length, 800), 100);
  setTimeout(() => counter(document.getElementById('cN'), data.filter(p=>p.cat==='nipun').length, 800), 200);
  setTimeout(() => counter(document.getElementById('cR'), data.filter(p=>p.cat==='riu').length, 800), 300);
}

const obs = new IntersectionObserver(e => {
  if (e[0].isIntersecting) { fire(); obs.disconnect(); }
}, { threshold: 0.25 });
obs.observe(document.getElementById('c2r4'));

setTimeout(() => {
  const r = document.getElementById('c2r4').getBoundingClientRect();
  if (r.top < window.innerHeight) fire();
}, 500);

document.querySelectorAll('.x5t9').forEach(b => {
  b.addEventListener('click', () => {
    const f = b.dataset.f;
    if (f === activeF) return;
    activeF = f;
    document.querySelectorAll('.x5t9').forEach(btn => btn.classList.toggle('v6m1', btn === b));
    mainTrack.style.transition = 'opacity .22s, transform .22s';
    mainTrack.style.opacity = '0';
    mainTrack.style.transform = 'translateY(8px)';
    setTimeout(() => {
      render(f);
      mainTrack.style.transition = 'none';
      mainTrack.style.opacity = '0';
      mainTrack.style.transform = 'translateY(8px)';
      void mainTrack.offsetWidth;
      mainTrack.style.transition = 'opacity .3s, transform .3s';
      mainTrack.style.opacity = '1';
      mainTrack.style.transform = 'translateY(0)';
    }, 230);
  });
});

render('all');

const revealConfigs = [
  ['.expertise > .heading', 'zoom', 0, 'reveal-stagger'],
  ['.portfolio > .heading', 'zoom', 0, 'reveal-stagger'],
  ['.portfolio .b3v1', 'zoom', 120, ''],
  ['.portfolio .p4s2', 'right', 210, 'reveal-glow'],
  ['.blog > .heading', 'zoom', 0, 'reveal-stagger'],
  ['.blog .w6y3', 'flip', 150, 'reveal-glow'],
  ['.contact .profile-card', 'left', 0, 'reveal-glow reveal-stagger'],
  ['.contact .map-card', 'right', 160, 'reveal-glow'],
];

const revealItems = [];
revealConfigs.forEach(([selector, type, delay, extraClass]) => {
  document.querySelectorAll(selector).forEach(el => {
    if (el.classList.contains('scroll-reveal')) return;
    el.classList.add('scroll-reveal');
    if (extraClass) el.classList.add(...extraClass.split(' '));
    el.dataset.reveal = type;
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    revealItems.push(el);
  });
});

if (revealItems.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach(el => revealObserver.observe(el));
}

let sx;
const stg = document.getElementById('s3t1');
if (stg) {
  stg.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive:true });
  stg.addEventListener('touchmove',  e => { if (Math.abs(sx - e.touches[0].clientX) > 5) e.stopPropagation(); }, { passive:true });
}

/* Staggered entrance for contact list items */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.profile-contact-list li');
  items.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = `opacity 0.44s ease ${0.08 * i + 0.3}s,
                           transform 0.44s ease ${0.08 * i + 0.3}s`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = '';
        el.style.transform = '';
      })
    );
  });
});
