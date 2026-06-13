/* ============================================================
   CosmoBrain — interactions
   ============================================================ */
(function(){
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s,c)=> (c||document).querySelector(s);
  const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));

  /* ---------------- STARFIELD ---------------- */
  function starfield(){
    const cv = $("#starfield"); if(!cv) return;
    const ctx = cv.getContext("2d");
    let w,h,dpr,stars=[],shoot=null,scrollY=0,tg=0;
    function resize(){
      dpr = Math.min(window.devicePixelRatio||1, 2);
      w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr;
      cv.style.width=innerWidth+"px"; cv.style.height=innerHeight+"px";
      const count = Math.min(360, Math.floor(innerWidth*innerHeight/5200));
      stars = [];
      for(let i=0;i<count;i++){
        const layer = Math.random();
        stars.push({
          x:Math.random()*w, y:Math.random()*h,
          z:0.3+layer*1.4,
          r:(0.3+layer*1.3)*dpr,
          tw:Math.random()*Math.PI*2,
          tws:0.6+Math.random()*1.8,
          hue: Math.random()<0.18 ? (Math.random()<0.5?"205":"265") : null
        });
      }
    }
    function maybeShoot(){
      if(shoot||Math.random()>0.004) return;
      shoot={x:Math.random()*w*0.7,y:Math.random()*h*0.4,len:0,
        vx:(5+Math.random()*5)*dpr,vy:(2+Math.random()*2)*dpr,life:1};
    }
    let t=0;
    function draw(){
      t+=0.016;
      ctx.clearRect(0,0,w,h);
      const off = (scrollY*0.04*dpr);
      for(const s of stars){
        const fl = 0.55+0.45*Math.sin(s.tw + t*s.tws);
        let y = (s.y - off*s.z) % h; if(y<0) y+=h;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI*2);
        if(s.hue){ ctx.fillStyle="hsla("+s.hue+",100%,80%,"+(fl*0.9)+")"; }
        else { ctx.fillStyle="rgba(255,255,255,"+(fl*0.85)+")"; }
        ctx.fill();
        if(s.r>1.3*dpr){
          ctx.beginPath(); ctx.arc(s.x,y,s.r*2.6,0,Math.PI*2);
          ctx.fillStyle="rgba(150,200,255,"+(fl*0.06)+")"; ctx.fill();
        }
      }
      if(!reduce){ maybeShoot();
        if(shoot){
          shoot.x+=shoot.vx; shoot.y+=shoot.vy; shoot.len=Math.min(shoot.len+8*dpr,140*dpr); shoot.life-=0.012;
          const gx=shoot.x-shoot.vx*shoot.len/8, gy=shoot.y-shoot.vy*shoot.len/8;
          const g=ctx.createLinearGradient(gx,gy,shoot.x,shoot.y);
          g.addColorStop(0,"rgba(86,216,255,0)"); g.addColorStop(1,"rgba(180,230,255,"+(0.8*shoot.life)+")");
          ctx.strokeStyle=g; ctx.lineWidth=1.6*dpr; ctx.beginPath();
          ctx.moveTo(gx,gy); ctx.lineTo(shoot.x,shoot.y); ctx.stroke();
          if(shoot.life<=0||shoot.x>w||shoot.y>h) shoot=null;
        }
      }
      requestAnimationFrame(draw);
    }
    addEventListener("resize",resize); resize();
    addEventListener("scroll",()=>{scrollY=window.scrollY||window.pageYOffset;},{passive:true});
    draw();
  }

  /* ---------------- COSMIC WEB (hero canvases) ---------------- */
  function cosmicWeb(cv){
    const ctx=cv.getContext("2d");
    let w,h,dpr,nodes=[],mx=0,my=0,tmx=0,tmy=0;
    function resize(){
      dpr=Math.min(window.devicePixelRatio||1,2);
      const r=cv.getBoundingClientRect();
      w=cv.width=r.width*dpr; h=cv.height=r.height*dpr;
      const n=Math.min(70,Math.floor(r.width*r.height/14000));
      nodes=[];
      for(let i=0;i<n;i++){
        nodes.push({x:Math.random()*w,y:Math.random()*h,
          vx:(Math.random()-0.5)*0.18*dpr,vy:(Math.random()-0.5)*0.18*dpr,
          r:(1+Math.random()*2.2)*dpr,p:Math.random()*Math.PI*2});
      }
    }
    const maxd=()=>160*dpr;
    let t=0;
    function draw(){
      t+=0.01;
      tmx+=(mx-tmx)*0.05; tmy+=(my-tmy)*0.05;
      ctx.clearRect(0,0,w,h);
      const md=maxd();
      for(let i=0;i<nodes.length;i++){
        const a=nodes[i];
        a.x+=a.vx; a.y+=a.vy;
        if(a.x<0||a.x>w)a.vx*=-1; if(a.y<0||a.y>h)a.vy*=-1;
        for(let j=i+1;j<nodes.length;j++){
          const b=nodes[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
          if(d<md){
            const al=(1-d/md)*0.5;
            ctx.strokeStyle="rgba(86,180,255,"+al+")"; ctx.lineWidth=0.6*dpr;
            ctx.beginPath(); ctx.moveTo(a.x+tmx*a.r*0.4,a.y+tmy*a.r*0.4);
            ctx.lineTo(b.x+tmx*b.r*0.4,b.y+tmy*b.r*0.4); ctx.stroke();
          }
        }
      }
      for(const a of nodes){
        const pl=0.6+0.4*Math.sin(a.p+t*2);
        const x=a.x+tmx*a.r*0.4, y=a.y+tmy*a.r*0.4;
        ctx.beginPath(); ctx.arc(x,y,a.r*3.4,0,Math.PI*2);
        ctx.fillStyle="rgba(86,216,255,"+(0.12*pl)+")"; ctx.fill();
        ctx.beginPath(); ctx.arc(x,y,a.r,0,Math.PI*2);
        ctx.fillStyle="rgba(190,235,255,"+(0.9*pl)+")"; ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    addEventListener("resize",resize);
    addEventListener("mousemove",e=>{mx=(e.clientX/innerWidth-0.5)*30;my=(e.clientY/innerHeight-0.5)*30;},{passive:true});
    resize(); draw();
  }

  /* ---------------- SCRAMBLE ---------------- */
  const GLYPHS="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/*+-#";
  function scramble(el){
    if(el.dataset.scrambled) return; el.dataset.scrambled="1";
    const final=el.textContent; const len=final.length;
    if(reduce){ el.textContent=final; return; }
    let frame=0; const total=Math.min(34, 12+len);
    const lock=new Array(len).fill(false);
    function tick(){
      let out="";
      const revealUpto=Math.floor((frame/total)*len);
      for(let i=0;i<len;i++){
        const ch=final[i];
        if(ch===" "||ch==="\n"){out+=ch;continue;}
        if(i<=revealUpto||lock[i]){out+=ch;lock[i]=true;}
        else out+=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
      }
      el.textContent=out; frame++;
      if(frame<=total) setTimeout(tick,28); else el.textContent=final;
    }
    tick();
  }

  /* ---------------- REVEAL + NAV SYNC ---------------- */
  function observers(){
    const scenes=$$(".scene");
    const railItems=$$(".rail__item");
    const curNum=$("#curNum"), curLabel=$("#curLabel");
    const railMap={}; railItems.forEach(b=>railMap[b.dataset.target]=b);

    const io=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add("is-visible");
          $$("[data-scramble]",e.target).forEach(scramble);
        }
      });
    },{threshold:0.18});
    scenes.forEach(s=>io.observe(s));

    // active section detection (closest to viewport center)
    let ticking=false;
    function setActive(){
      ticking=false;
      const mid=innerHeight*0.42; let best=null,bd=1e9;
      for(const s of scenes){
        const r=s.getBoundingClientRect();
        const c=r.top+r.height/2; const d=Math.abs(c-mid);
        if(r.top<innerHeight*0.6 && r.bottom>innerHeight*0.4 && d<bd){bd=d;best=s;}
      }
      if(!best){ // fallback: topmost in view
        for(const s of scenes){const r=s.getBoundingClientRect(); if(r.bottom>0){best=s;break;}}
      }
      if(best){
        railItems.forEach(b=>b.classList.remove("active"));
        const ri=railMap[best.id]; if(ri) ri.classList.add("active");
        const idx=best.getAttribute("data-index")||"";
        const nav=best.getAttribute("data-nav")||"";
        if(curNum) curNum.textContent = idx || "→";
        if(curLabel) curLabel.textContent = nav;
      }
    }
    addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(setActive);}},{passive:true});
    addEventListener("resize",setActive); setActive();

    // rail click
    railItems.forEach(b=>b.addEventListener("click",()=>{
      const t=document.getElementById(b.dataset.target);
      if(t) t.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
    }));
  }

  /* ---------------- SCROLL PROGRESS + PARALLAX ---------------- */
  function progressParallax(){
    const bar=$("#progBar");
    const blobs=$$(".nebula__blob");
    let ticking=false;
    function on(){
      ticking=false;
      const sc=window.scrollY||0;
      const max=document.documentElement.scrollHeight-innerHeight;
      if(bar) bar.style.width=(max>0?(sc/max*100):0)+"%";
      blobs.forEach((b,i)=>{ b.style.transform="translateY("+(sc*(0.04+i*0.03))+"px)"; });
    }
    addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(on);}},{passive:true});
    on();
  }

  /* ---------------- MENU ---------------- */
  function menu(){
    const ov=$("#menu"), open=$("#indexBtn"), close=$("#menuClose");
    if(!ov) return;
    const setOpen=v=>{ov.classList.toggle("open",v);ov.setAttribute("aria-hidden",v?"false":"true");
      document.body.style.overflow=v?"hidden":"";};
    open&&open.addEventListener("click",()=>setOpen(true));
    close&&close.addEventListener("click",()=>setOpen(false));
    $$(".menu__item",ov).forEach(a=>a.addEventListener("click",()=>setOpen(false)));
    addEventListener("keydown",e=>{if(e.key==="Escape")setOpen(false);});
  }

  /* ---------------- LOADER ---------------- */
  function loader(cb){
    const el=$("#loader");
    let fired=false;
    const finish=()=>{ if(fired)return; fired=true;
      if(el) el.classList.add("done");
      document.body.classList.add("ready"); cb(); };
    if(!el){ finish(); return; }
    const cells=$$(".lg__cell",el), pct=$(".loader__pct"), status=$(".loader__status");
    const N=cells.length;
    const phases=["INITIALIZING COSMIC DATA","INGESTING OPEN ARCHIVES","BUILDING COSMIC GRAPH","RANKING ANOMALIES"];
    const dur=reduce?160:1700; const start=Date.now();
    // timer-based (resilient to rAF throttling / background tabs)
    const iv=setInterval(()=>{
      const t=Math.min(1,(Date.now()-start)/dur);
      pct.textContent=Math.floor(t*100)+"%";
      const lit=Math.floor(t*N);
      for(let i=0;i<N;i++) cells[i].classList.toggle("on", i<lit);
      if(status) status.textContent=phases[Math.min(phases.length-1,Math.floor(t*phases.length))];
      if(t>=1){ clearInterval(iv); pct.textContent="100%"; cells.forEach(c=>c.classList.add("on"));
        setTimeout(finish, reduce?40:320); }
    }, 40);
    // hard safety: never leave content hidden
    setTimeout(()=>{ clearInterval(iv); finish(); }, dur+1500);
  }

  /* ---------------- INIT ---------------- */
  function safe(fn){ try{ fn(); }catch(e){ console.warn("[cosmobrain]",e); } }
  function init(){
    safe(starfield);
    safe(()=>$$(".hero__web").forEach(cosmicWeb));
    safe(observers);
    safe(progressParallax);
    safe(menu);
    loader(()=>{
      const hero=$(".scene--hero");
      if(hero){ hero.classList.add("is-visible"); $$("[data-scramble]",hero).forEach(scramble); }
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
