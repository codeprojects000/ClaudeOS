
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const h=(tag,props={},...kids)=>{
  const e=document.createElement(tag);
  for(const [k,v] of Object.entries(props||{})){
    if(k==='class')e.className=v;
    else if(k==='html')e.innerHTML=v;
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v);
  }
  for(const kid of kids.flat(Infinity)){
    if(kid==null||kid===false)continue;
    e.append(kid.nodeType?kid:document.createTextNode(kid));
  }
  return e;
};
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
let uid=0; const nid=()=>'c'+(++uid);
const T0=Date.now();
const narrow=()=>matchMedia('(max-width:700px)').matches;
const coarse=matchMedia('(pointer:coarse)').matches;
const fmtUp=()=>{const s=Math.floor((Date.now()-T0)/1000),hh=Math.floor(s/3600),m=Math.floor(s%3600/60);return (hh?hh+' godz ':'')+m+' min '+(s%60)+' s'};

/* ---------- ikony ---------- */
const svg=(d,s=16,sw=1.8)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const FOLDER='<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>';
const ICO={
  min:svg('<path d="M6 12h12"/>',14,2),
  max:svg('<rect x="6" y="6" width="12" height="12" rx="1.5"/>',14,2),
  close:svg('<path d="M6 6l12 12M18 6L6 18"/>',14,2),
  folder:svg(FOLDER,20,1.7),
  file:svg('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',20,1.7),
  edit:svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>',16),
  trash:svg('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',16)
};
const tile=(app,s)=>h('span',{class:'tile',style:`width:${s}px;height:${s}px;background:${app.color};border-radius:${Math.round(s*.28)}px`,
  html:`<svg viewBox="0 0 24 24" width="${Math.round(s*.6)}" height="${Math.round(s*.6)}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${app.icon}</svg>`});

/* ---------- ustawienia ---------- */
const CFG_KEY='mojsystem.cfg.v1', FS_KEY='mojsystem.fs.v1';
const WALLS=[
  {n:'Zmierzch',v:'radial-gradient(circle at 80% 90%,rgba(255,170,150,.55),transparent 55%),linear-gradient(160deg,#1f2a44,#3b4a7a 55%,#8b5a86)'},
  {n:'Las',v:'radial-gradient(circle at 20% 90%,rgba(190,230,150,.4),transparent 55%),linear-gradient(160deg,#0f2a24,#1f5a4a 60%,#5d8f6a)'},
  {n:'Piasek',v:'radial-gradient(circle at 85% 15%,rgba(255,240,200,.5),transparent 50%),linear-gradient(160deg,#e9d8b8,#d4a373 55%,#8c5a3c)'},
  {n:'Grafit',v:'radial-gradient(circle at 70% 20%,rgba(120,140,180,.25),transparent 55%),linear-gradient(160deg,#16181d,#2b3038 60%,#454c58)'},
  {n:'Aurora',v:'radial-gradient(at 20% 20%,#7c5ce6aa,transparent 50%),radial-gradient(at 80% 30%,#2fd4c0aa,transparent 50%),radial-gradient(at 50% 90%,#3b6ef5aa,transparent 55%),#0b1020'},
  {n:'Neon',v:'radial-gradient(at 10% 90%,#ff3d81aa,transparent 50%),radial-gradient(at 90% 10%,#00d1ffaa,transparent 50%),#10061f'},
  {n:'Ocean',v:'linear-gradient(180deg,#0a3d62,#1e6f9f 55%,#7fd1e8)'},
  {n:'Wulkan',v:'radial-gradient(circle at 50% 110%,#ffb347,transparent 55%),linear-gradient(180deg,#1a0b0b,#5a1a12)'},
  {n:'Mgła',v:'linear-gradient(160deg,#e8edf5,#c9d4e6 60%,#a9b8d4)'},
  {n:'Róż',v:'linear-gradient(135deg,#ffd1dc,#f6a6c1 50%,#b388eb)'},
  {n:'Północ',v:'linear-gradient(180deg,#05060f,#0d1230 70%,#1b2a5e)'}
];
const ACCENTS=[['Niebieski','#3b6ef5'],['Zielony','#178a5c'],['Pomarańczowy','#c8641a'],['Fioletowy','#7c5ce6'],['Różowy','#d6428a'],['Turkusowy','#0e9aa7'],['Czerwony','#d64545'],['Złoty','#b8860b']];
const DEF_CFG={theme:'auto',accent:'#3b6ef5',wall:0,sound:true,glass:80,blur:16,rad:10,fs:14,iz:1,anim:true,live:true,secs:false};
let cfg=Object.assign({},DEF_CFG,store.get(CFG_KEY,{}));
if(!WALLS[cfg.wall])cfg.wall=0;
function applyCfg(){
  const r=document.documentElement;
  if(cfg.theme==='auto')r.removeAttribute('data-os');else r.setAttribute('data-os',cfg.theme);
  r.style.setProperty('--accent',cfg.accent);
  const cc=parseInt(cfg.accent.slice(1),16),lum=(.299*(cc>>16)+.587*(cc>>8&255)+.114*(cc&255))/255;
  r.style.setProperty('--accent-fg',lum>.62?'#111':'#fff');
  r.style.setProperty('--glass',cfg.glass+'%');r.style.setProperty('--blur',cfg.blur+'px');
  r.style.setProperty('--rad',cfg.rad+'px');r.style.setProperty('--iz',cfg.iz);
  document.body.style.fontSize=cfg.fs+'px';
  r.classList.toggle('anim-off',!cfg.anim);r.classList.toggle('no-live',!cfg.live);
  $('#desk').style.background=WALLS[cfg.wall].v;
  store.set(CFG_KEY,cfg);
}

/* ---------- dźwięk ---------- */
let AC=null;
function audio(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  if(AC.state==='suspended')AC.resume().catch(()=>{});
  return AC;
}
const N=n=>440*Math.pow(2,(n-9)/12);
function tone(freq,t0,dur,o){
  const c=audio();if(!c)return;
  o=o||{};
  const t=c.currentTime+t0,osc=c.createOscillator(),g=c.createGain(),v=o.vol==null?.12:o.vol;
  osc.type=o.type||'sine';osc.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(v,t+(o.atk||.015));
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  osc.connect(g);g.connect(c.destination);
  osc.start(t);osc.stop(t+dur+.05);
}
const SFX={
  boot(){[0,4,7,12,16].forEach((n,i)=>{tone(N(n-12),i*.16,2.2,{vol:.07,atk:.05});tone(N(n),i*.16+.02,1.8,{vol:.05,type:'triangle',atk:.05})});tone(N(19),1,2.4,{vol:.06,atk:.08})},
  login(){tone(N(7),0,.18,{vol:.09,type:'triangle'});tone(N(12),.12,.3,{vol:.09,type:'triangle'});tone(N(16),.26,.5,{vol:.08})},
  error(){tone(180,0,.18,{type:'square',vol:.06});tone(140,.16,.24,{type:'square',vol:.06})},
  open(){tone(N(7),0,.09,{vol:.05,type:'triangle'});tone(N(14),.06,.12,{vol:.05,type:'triangle'})},
  close(){tone(N(14),0,.07,{vol:.04,type:'triangle'});tone(N(7),.05,.1,{vol:.04,type:'triangle'})},
  pop(){tone(N(19),0,.06,{vol:.05})},
  msg(){tone(N(16),0,.07,{vol:.05});tone(N(21),.07,.1,{vol:.05})},
  off(){[16,12,7,0].forEach((n,i)=>tone(N(n),i*.14,.5,{vol:.07}))},
  alarm(){for(let i=0;i<6;i++)tone(880,i*.3,.15,{type:'square',vol:.05})}
};
function sfx(n){if(cfg.sound&&AC&&SFX[n])try{SFX[n]()}catch(e){}}

/* ---------- konto ---------- */
const USER_KEY='mojsystem.user.v1';
let user=store.get(USER_KEY,null);
if(!user||typeof user.name!=='string')user=null;
const hashPw=s=>{let x=5381;for(const ch of s)x=((x<<5)+x+ch.charCodeAt(0))|0;return String(x)};

/* ---------- wirtualny system plików ---------- */
const WELCOME=`Witaj w Moim Systemie!

To prosty system operacyjny działający w przeglądarce. Co możesz zrobić:

• Notatnik – pisz i zapisuj pliki tekstowe (Ctrl+S)
• Pliki – przeglądaj foldery, twórz, zmieniaj nazwy i usuwaj
• Kalkulator – obliczenia, także z klawiatury
• Terminal – wpisz help, aby zobaczyć polecenia
• Ustawienia – motyw, kolor akcentu i tapeta
• Menedżer zadań – lista uruchomionych okien
• Rysowanie, Lista zadań, Zegar, Pianino i Wąż – proste aplikacje na start
• Iskra – asystent w rogu pulpitu, z którym możesz porozmawiać

Okna możesz przeciągać za pasek tytułu, minimalizować i powiększać. Pliki i ustawienia zapisują się w tej przeglądarce.`;
const defaultFS=()=>({t:'d',c:{
  'Dokumenty':{t:'d',c:{
    'powitanie.txt':{t:'f',v:WELCOME},
    'lista-zakupow.txt':{t:'f',v:'Lista zakupów\n- chleb\n- mleko\n- jajka\n- kawa'}
  }},
  'Pulpit':{t:'d',c:{}},
  'Pobrane':{t:'d',c:{}}
}});
let fs=store.get(FS_KEY,null);
if(!fs||fs.t!=='d'||typeof fs.c!=='object')fs=defaultFS();
const saveFS=()=>store.set(FS_KEY,fs);
const walk=parts=>{let n=fs;for(const p of parts){if(!n||n.t!=='d'||!Object.prototype.hasOwnProperty.call(n.c,p))return null;n=n.c[p]}return n};
const parsePath=(str,cwd)=>{const parts=str.startsWith('/')?[]:[...cwd];for(const s of str.split('/')){if(!s||s==='.')continue;if(s==='..')parts.pop();else parts.push(s)}return parts};
const pathStr=p=>'/'+p.join('/');
const badName=v=>{if(!v)return 'Podaj nazwę.';if(/[\/\\]/.test(v))return 'Nazwa nie może zawierać znaków / i \\.';if(v==='.'||v==='..')return 'Ta nazwa jest niedozwolona.';return ''};
const allFiles=(n=fs,p=[],out=[])=>{for(const [k,v] of Object.entries(n.c)){if(v.t==='f')out.push([...p,k]);else allFiles(v,[...p,k],out)}return out};
const fmtSize=s=>{const n=new Blob([s]).size;return n<1024?n+' B':(n/1024).toFixed(1).replace('.',',')+' KB'};
const fsBus=[], winBus=[];
const fsChanged=()=>fsBus.slice().forEach(f=>f());

/* ---------- okna ---------- */
const wins=[]; let zTop=10, pidN=100, focused=null;
const z=w=>+w.el.style.zIndex||0;

function toast(msg){
  const t=h('div',{class:'toast',role:'status'},msg);
  $('#toasts').append(t);
  setTimeout(()=>t.classList.add('out'),2400);
  setTimeout(()=>t.remove(),2900);
}
function closeMenus(){
  $('#startmenu').hidden=true; $('#cal').hidden=true;
  $('#startbtn').setAttribute('aria-expanded','false');
}
const PINNED=['files','notes','calc','paint','term','settings'];
const appWins=app=>wins.filter(w=>w.app===app);
function tkClick(id){
  const app=APPS[id],ws=appWins(app);
  if(!ws.length)return void openApp(id);
  if(focused&&focused.app===app&&!focused.minimized)return minimize(focused);
  const w=ws.slice().sort((a,b)=>z(b)-z(a))[0];
  restore(w);focus(w);
}
function tkUpdate(){
  const ids=[...PINNED];
  wins.forEach(w=>{const id=Object.keys(APPS).find(k=>APPS[k]===w.app);if(id&&!ids.includes(id))ids.push(id)});
  $('#tasks').replaceChildren(...ids.map(id=>{
    const app=APPS[id],ws=appWins(app),act=!!focused&&focused.app===app&&!focused.minimized;
    return h('button',{class:'tk'+(ws.length?' run':'')+(act?' active':'')+(ws.length&&ws.every(w=>w.minimized)?' mini':''),title:app.name,'aria-label':app.name,'aria-pressed':String(act),onclick:()=>tkClick(id)},tile(app,28));
  }));
  winBus.slice().forEach(f=>f());
}
function focus(w){
  if(!w||w.minimized)return;
  focused=w; w.el.style.zIndex=++zTop;
  wins.forEach(x=>x.el.classList.toggle('inactive',x!==w));
  tkUpdate();
}
function restore(w){if(w.minimized){w.minimized=false;w.el.hidden=false}}
function minimize(w){
  w.minimized=true; w.el.hidden=true;
  if(focused===w){
    focused=null;
    const t=wins.filter(x=>!x.minimized).sort((a,b)=>z(b)-z(a))[0];
    if(t)focus(t);
  }
  tkUpdate();
}
function toggleMax(w){w.maximized=!w.maximized;w.el.classList.toggle('max',w.maximized)}
function destroy(w){
  const i=wins.indexOf(w); if(i<0)return;
  w.cleanup.forEach(f=>f());
  w.el.remove(); wins.splice(i,1); sfx('close');
  if(focused===w){
    focused=null;
    const t=wins.filter(x=>!x.minimized).sort((a,b)=>z(b)-z(a))[0];
    if(t)focus(t);
  }
  tkUpdate();
}
function requestClose(w){ if(w.beforeClose){restore(w);focus(w);w.beforeClose(()=>destroy(w))} else destroy(w); }

function openApp(id,args){
  const app=APPS[id]; if(!app)return null;
  args=args||{};
  if(app.single){const ex=wins.find(w=>w.app===app);if(ex){restore(ex);focus(ex);closeMenus();return ex}}
  if(id==='notes'&&args.path){const ex=wins.find(w=>w.app===app&&w.path===args.path);if(ex){restore(ex);focus(ex);closeMenus();return ex}}
  closeMenus();
  const layer=$('#wins'), ow=layer.clientWidth, oh=layer.clientHeight;
  const w=Math.min(app.w,ow-16), hh=Math.min(app.h,oh-16), off=(wins.length%6)*28;
  const left=Math.max(0,Math.min(ow-w,48+off)), top=Math.max(0,Math.min(oh-hh,28+off));
  const el=h('div',{class:'win',role:'dialog','aria-label':app.name,style:`left:${left}px;top:${top}px;width:${w}px;height:${hh}px`});
  const titleEl=h('span',{class:'tt'},app.name);
  const bmin=h('button',{class:'min',title:'Minimalizuj','aria-label':'Minimalizuj',html:ICO.min});
  const bmax=h('button',{class:'mx',title:'Powiększ / przywróć','aria-label':'Powiększ lub przywróć',html:ICO.max});
  const bcl=h('button',{class:'cl',title:'Zamknij','aria-label':'Zamknij',html:ICO.close});
  const tb=h('div',{class:'tb'},tile(app,18),titleEl,h('div',{class:'tbtn'},bmin,bmax,bcl));
  const body=h('div',{class:'wb'});
  el.append(tb,body);
  const win={pid:pidN++,app,el,body,titleEl,minimized:false,maximized:false,cleanup:[],path:null,beforeClose:null,
    setTitle(t){titleEl.textContent=t;tkUpdate()},
    close(){requestClose(win)},
    modal(content){
      const m=h('div',{class:'modal'},h('div',{class:'card'},content));
      body.append(m);
      return {el:m,close:()=>m.remove()};
    },
    ask(label,initial,cb,okText){
      const id=nid(); const inp=h('input',{class:'inp',id,value:initial||'',maxlength:60,autocomplete:'off'}); const err=h('div',{class:'err'});
      const m=win.modal([h('label',{for:id,class:'lbl'},label),inp,err,
        h('div',{class:'btns'},h('button',{class:'btn',onclick:()=>m.close()},'Anuluj'),h('button',{class:'btn pri',onclick:()=>go()},okText||'OK'))]);
      function go(){const r=cb(inp.value.trim());if(r){err.textContent=r;return}m.close()}
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();if(e.key==='Escape')m.close()});
      setTimeout(()=>{inp.focus();inp.select()},0);
    },
    confirm(text,okText,cb,danger){
      const m=win.modal([h('div',{},text),
        h('div',{class:'btns'},h('button',{class:'btn',onclick:()=>m.close()},'Anuluj'),
          h('button',{class:'btn '+(danger?'dan':'pri'),onclick:()=>{m.close();cb()}},okText||'OK'))]);
    }
  };
  bmin.onclick=()=>minimize(win); bmax.onclick=()=>toggleMax(win); bcl.onclick=()=>requestClose(win);
  el.addEventListener('pointerdown',()=>{if(focused!==win)focus(win)},true);
  el.addEventListener('keydown',e=>{
    if(e.key==='Escape'){const ms=body.querySelectorAll(':scope > .modal');if(ms.length){ms[ms.length-1].remove();e.stopPropagation()}}
  });
  tb.addEventListener('pointerdown',e=>{
    if(e.target.closest('button')||win.maximized||narrow())return;
    const sx=e.clientX,sy=e.clientY,ox=el.offsetLeft,oy=el.offsetTop;
    tb.setPointerCapture(e.pointerId);
    const mv=ev=>{
      el.style.left=Math.max(-el.offsetWidth+90,Math.min(layer.clientWidth-90,ox+ev.clientX-sx))+'px';
      el.style.top=Math.max(0,Math.min(layer.clientHeight-38,oy+ev.clientY-sy))+'px';
    };
    const up=()=>{tb.removeEventListener('pointermove',mv);tb.removeEventListener('pointerup',up);tb.removeEventListener('pointercancel',up)};
    tb.addEventListener('pointermove',mv);tb.addEventListener('pointerup',up);tb.addEventListener('pointercancel',up);
  });
  tb.addEventListener('dblclick',e=>{if(!e.target.closest('button')&&!narrow())toggleMax(win)});
  wins.push(win); layer.append(el); focus(win); sfx('open');
  app.open(win,args);
  tkUpdate();
  return win;
}

/* ---------- aplikacje ---------- */
const APPS={};

APPS.notes={name:'Notatnik',w:560,h:420,color:'#d99a1c',
  icon:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  open(win,args){
    const ta=h('textarea',{class:'np-ta',id:nid(),spellcheck:'false','aria-label':'Treść notatki'});
    const st=h('span'), pos=h('span');
    let cur=null, dirty=false;
    const name=()=>cur?cur[cur.length-1]:'Bez tytułu';
    const title=()=>win.setTitle((dirty?'• ':'')+name()+' – Notatnik');
    const stats=()=>{
      const t=ta.value, words=(t.trim().match(/\S+/g)||[]).length;
      st.textContent=`${t.length} znaków · ${words} słów`;
      const before=t.slice(0,ta.selectionStart).split('\n');
      pos.textContent=`Wiersz ${before.length}, kol. ${before[before.length-1].length+1}`;
    };
    function load(path){
      const n=walk(path);
      if(!n||n.t!=='f'){toast('Nie znaleziono pliku');return}
      cur=path;ta.value=n.v;dirty=false;win.path=pathStr(path);title();stats();
    }
    function save(path){
      const parent=walk(path.slice(0,-1));
      if(!parent||parent.t!=='d'){toast('Nie można zapisać pliku');return false}
      parent.c[path[path.length-1]]={t:'f',v:ta.value};
      saveFS();cur=path;win.path=pathStr(path);dirty=false;title();
      toast('Zapisano: '+pathStr(path));fsChanged();return true;
    }
    function saveAs(then){
      win.ask('Nazwa pliku',cur?name():'notatka.txt',v=>{
        const e=badName(v);if(e)return e;
        let dir=cur?cur.slice(0,-1):['Dokumenty'];
        if(!walk(dir))dir=[];
        const ex=walk(dir).c[v];
        if(ex&&ex.t==='d')return 'W tym miejscu istnieje folder o tej nazwie.';
        if(save([...dir,v])&&then)then();
      },'Zapisz');
    }
    const doSave=then=>{if(cur){if(save(cur)&&then)then()}else saveAs(then)};
    function newDoc(){
      const go=()=>{cur=null;ta.value='';dirty=false;win.path=null;title();stats();ta.focus()};
      if(dirty)win.confirm('Odrzucić niezapisane zmiany?','Odrzuć',go,true);else go();
    }
    function openDlg(){
      const files=allFiles();
      const m=win.modal([h('strong',{},'Otwórz plik'),
        h('div',{class:'dlg-list'},files.length?files.map(p=>h('button',{class:'dlg-it',onclick:()=>{
          m.close();const go=()=>load(p);
          if(dirty)win.confirm('Odrzucić niezapisane zmiany?','Odrzuć',go,true);else go();
        }},pathStr(p))):h('div',{class:'empty'},'Brak plików.')),
        h('div',{class:'btns'},h('button',{class:'btn',onclick:()=>m.close()},'Anuluj'))]);
    }
    win.beforeClose=proceed=>{
      if(!dirty)return proceed();
      const m=win.modal([h('div',{},`Zapisać zmiany w pliku „${name()}”?`),
        h('div',{class:'btns'},
          h('button',{class:'btn',onclick:()=>m.close()},'Anuluj'),
          h('button',{class:'btn',onclick:()=>{m.close();proceed()}},'Nie zapisuj'),
          h('button',{class:'btn pri',onclick:()=>{m.close();doSave(proceed)}},'Zapisz'))]);
    };
    ta.addEventListener('input',()=>{if(!dirty){dirty=true;title()}stats()});
    ['keyup','click','select'].forEach(ev=>ta.addEventListener(ev,stats));
    ta.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();doSave()}});
    win.body.append(
      h('div',{class:'tool'},
        h('button',{class:'btn',onclick:newDoc},'Nowy'),
        h('button',{class:'btn',onclick:openDlg},'Otwórz'),
        h('button',{class:'btn pri',onclick:()=>doSave()},'Zapisz'),
        h('button',{class:'btn',onclick:()=>saveAs()},'Zapisz jako')),
      ta,h('div',{class:'sb'},st,pos));
    if(args.path)load(parsePath(args.path,[]));else{title();stats()}
    setTimeout(()=>ta.focus(),0);
  }};

APPS.calc={name:'Kalkulator',w:300,h:400,color:'#2f9e8f',
  icon:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"/>',
  open(win){
    let expr='',fresh=false;
    const disp=h('div',{class:'ca-d'},'0'), sub=h('div',{class:'ca-s'},' ');
    const show=()=>{disp.textContent=expr||'0'};
    const isOp=c=>'+-×÷'.includes(c);
    function evalExpr(){
      let js=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/%/g,'/100').replace(/,/g,'.').replace(/[+\-*/.]+$/,'');
      js=js.replace(/(^|[^0-9.])0+(?=\d)/g,'$1');
      if(!js||!/^[0-9+\-*/.() ]+$/.test(js))return;
      let v;
      try{v=Function('"use strict";return ('+js+')')()}catch(e){v=NaN}
      sub.textContent=expr+' =';
      if(!Number.isFinite(v)){expr='';disp.textContent='Błąd';fresh=true;return}
      v=Math.round(v*1e10)/1e10;
      expr=String(v).replace('.',',');fresh=true;show();
    }
    function press(k){
      if(k==='C'){expr='';sub.textContent=' ';fresh=false;show();return}
      if(k==='⌫'){if(fresh){expr='';fresh=false}else expr=expr.slice(0,-1);show();return}
      if(k==='='){evalExpr();return}
      if(k==='±'){
        if(!/^-?[0-9,]+$/.test(expr))evalExpr();
        if(/^-?[0-9,]+$/.test(expr))expr=expr[0]==='-'?expr.slice(1):(expr?'-'+expr:expr);
        show();return;
      }
      if(isOp(k)||k==='%'){
        if(!expr&&k!=='-')return;
        if(k!=='%'&&/[+\-×÷]$/.test(expr))expr=expr.slice(0,-1)+k;else expr+=k;
        fresh=false;show();return;
      }
      if(fresh){expr='';fresh=false}
      if(k===','){const last=expr.split(/[+\-×÷%]/).pop();if(last.includes(','))return;if(!last)expr+='0'}
      if(expr.length>30)return;
      expr+=k;show();
    }
    const keys=[['C','C','op'],['⌫','⌫','op'],['%','%','op'],['÷','÷','op'],
      ['7','7'],['8','8'],['9','9'],['×','×','op'],
      ['4','4'],['5','5'],['6','6'],['−','-','op'],
      ['1','1'],['2','2'],['3','3'],['+','+','op'],
      ['±','±','op'],['0','0'],[',',','],['=','=','eq']];
    const root=h('div',{class:'ca',tabindex:0,'aria-label':'Kalkulator'},
      h('div',{class:'ca-out'},sub,disp),
      h('div',{class:'ca-k'},keys.map(([l,k,c])=>h('button',{class:c||'',onclick:()=>press(k),'aria-label':l},l))));
    root.addEventListener('keydown',e=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const k=e.key;let p=null;
      if(/^[0-9]$/.test(k)||k==='+'||k==='-'||k==='%')p=k;
      else if(k==='*')p='×';else if(k==='/')p='÷';
      else if(k===','||k==='.')p=',';
      else if(k==='Enter'||k==='=')p='=';
      else if(k==='Backspace')p='⌫';
      else if(k==='Escape'||k==='Delete')p='C';
      if(p){e.preventDefault();press(p)}
    });
    win.body.append(root);
    setTimeout(()=>root.focus(),0);
  }};

APPS.files={name:'Pliki',w:580,h:400,color:'#4f7cf0',icon:FOLDER,
  open(win,args){
    let cwd=args.cwd||[];
    const list=h('div',{class:'fl-list'}), crumb=h('div',{class:'crumb'}), places=h('div',{class:'places'});
    const up=h('button',{class:'btn',title:'Folder nadrzędny','aria-label':'Folder nadrzędny',onclick:()=>{cwd=cwd.slice(0,-1);render()}},'↑ W górę');
    function openItem(name,n){
      if(n.t==='d'){cwd=[...cwd,name];render()}
      else openApp('notes',{path:pathStr([...cwd,name])});
    }
    function rename(name){
      win.ask('Nowa nazwa',name,v=>{
        const e=badName(v);if(e)return e;
        const node=walk(cwd);
        if(v!==name){
          if(node.c[v])return 'Ta nazwa jest już zajęta.';
          node.c[v]=node.c[name];delete node.c[name];
        }
        saveFS();fsChanged();
      },'Zmień');
    }
    function del(name,n){
      win.confirm(`Usunąć „${name}”${n.t==='d'?' razem z zawartością':''}?`,'Usuń',()=>{
        delete walk(cwd).c[name];saveFS();fsChanged();
      },true);
    }
    function create(kind){
      win.ask(kind==='d'?'Nazwa nowego folderu':'Nazwa nowego pliku',kind==='d'?'Nowy folder':'nowy.txt',v=>{
        const e=badName(v);if(e)return e;
        const node=walk(cwd);
        if(node.c[v])return 'Ta nazwa jest już zajęta.';
        node.c[v]=kind==='d'?{t:'d',c:{}}:{t:'f',v:''};
        saveFS();fsChanged();
      },'Utwórz');
    }
    function render(){
      let node=walk(cwd);
      if(!node||node.t!=='d'){cwd=[];node=fs}
      crumb.textContent=pathStr(cwd);
      up.disabled=!cwd.length;
      win.setTitle((cwd.length?cwd[cwd.length-1]:'Pliki')+' – Pliki');
      places.replaceChildren(...Object.entries(fs.c).filter(([k,v])=>v.t==='d').map(([k])=>
        h('button',{class:'chip',onclick:()=>{cwd=[k];render()}},k)));
      list.replaceChildren();
      const entries=Object.entries(node.c).sort(([a,x],[b,y])=>x.t===y.t?a.localeCompare(b,'pl'):(x.t==='d'?-1:1));
      if(!entries.length)list.append(h('div',{class:'empty'},'Ten folder jest pusty.'));
      entries.forEach(([name,n])=>list.append(
        h('div',{class:'row',tabindex:0,role:'button','aria-label':(n.t==='d'?'Folder ':'Plik ')+name,
          onclick:()=>openItem(name,n),onkeydown:e=>{if(e.key==='Enter')openItem(name,n)}},
          h('span',{class:'fi'+(n.t==='d'?' d':''),html:n.t==='d'?ICO.folder:ICO.file}),
          h('span',{class:'nm'},name),
          h('span',{class:'meta'},n.t==='d'?Object.keys(n.c).length+' elem.':fmtSize(n.v)),
          h('button',{class:'ib',title:'Zmień nazwę','aria-label':'Zmień nazwę',html:ICO.edit,onclick:e=>{e.stopPropagation();rename(name)}}),
          h('button',{class:'ib',title:'Usuń','aria-label':'Usuń',html:ICO.trash,onclick:e=>{e.stopPropagation();del(name,n)}}))));
    }
    fsBus.push(render);
    win.cleanup.push(()=>{const i=fsBus.indexOf(render);if(i>=0)fsBus.splice(i,1)});
    win.body.append(
      h('div',{class:'tool'},up,crumb,
        h('button',{class:'btn',onclick:()=>create('d')},'Nowy folder'),
        h('button',{class:'btn',onclick:()=>create('f')},'Nowy plik')),
      places,list);
    render();
  }};

APPS.term={name:'Terminal',w:600,h:380,color:'#2b2f3a',
  icon:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10l3 2-3 2M12 15h5"/>',
  open(win){
    let cwd=[];const hist=[];let hi=0;
    const out=h('div'), pr=h('span',{class:'tm-pr'});
    const inp=h('input',{class:'tm-in',id:nid(),autocomplete:'off',autocapitalize:'off',spellcheck:'false','aria-label':'Polecenie'});
    const scr=h('div',{class:'tm',onclick:()=>{if(!String(getSelection()))inp.focus()}},out,h('label',{class:'tm-line'},pr,inp));
    win.body.append(scr);
    const setPrompt=()=>{pr.textContent=`uzytkownik@system:${pathStr(cwd)}$ `};
    const print=(t,cls)=>{out.append(h('div',{class:'pre '+(cls||'')},t));scr.scrollTop=scr.scrollHeight};
    const err=t=>print(t,'err');
    const HELP=`Dostępne polecenia:
  help              pokaż tę pomoc
  ls [ścieżka]      wyświetl zawartość folderu
  cd <ścieżka>      zmień folder
  pwd               pokaż bieżący folder
  cat <plik>        wyświetl zawartość pliku
  mkdir <nazwa>     utwórz folder
  touch <nazwa>     utwórz pusty plik
  rm <nazwa>        usuń plik lub folder
  echo <tekst> [> plik]   wypisz tekst albo zapisz go do pliku
  apps              lista aplikacji
  open <aplikacja>  uruchom aplikację
  ps                lista uruchomionych okien
  kill <pid>        zamknij okno
  date, uptime, whoami, uname, clear`;
    function split(p){const parts=parsePath(p,cwd);return {parts,parent:walk(parts.slice(0,-1)),name:parts[parts.length-1]}}
    function run(line){
      print(pr.textContent+line,'cmd');
      let s=line.trim();if(!s)return;
      hist.push(s);hi=hist.length;
      let redirect=null;
      const rm=s.match(/^(echo\b.*?)\s*>\s*(\S+)$/);
      if(rm){s=rm[1];redirect=rm[2]}
      const parts=s.split(/\s+/), c=parts[0], a=parts.slice(1), rest=s.slice(c.length).trim();
      switch(c){
        case 'help':print(HELP);break;
        case 'pwd':print(pathStr(cwd));break;
        case 'clear':out.replaceChildren();break;
        case 'date':print(new Date().toLocaleString('pl-PL',{dateStyle:'full',timeStyle:'medium'}));break;
        case 'uptime':print('Czas pracy: '+fmtUp());break;
        case 'whoami':print(user?user.name:'uzytkownik');break;
        case 'uname':print('MójSystem 1.0 (przeglądarka)');break;
        case 'ls':{
          const n=walk(a[0]?parsePath(a[0],cwd):cwd);
          if(!n)return err('ls: nie ma takiej ścieżki');
          if(n.t==='f')return print(a[0]);
          const names=Object.entries(n.c).map(([k,v])=>k+(v.t==='d'?'/':''));
          print(names.length?names.join('  '):'(pusto)');break;
        }
        case 'cd':{
          if(!a[0]){cwd=[];setPrompt();break}
          const p=parsePath(a[0],cwd), n=walk(p);
          if(n&&n.t==='d'){cwd=p;setPrompt()}else err('cd: '+a[0]+': nie ma takiego folderu');
          break;
        }
        case 'cat':{
          if(!a[0])return err('cat: podaj nazwę pliku');
          const n=walk(parsePath(a[0],cwd));
          if(!n)return err('cat: '+a[0]+': nie ma takiego pliku');
          if(n.t==='d')return err('cat: '+a[0]+': to jest folder');
          print(n.v||'(pusty plik)');break;
        }
        case 'mkdir':case 'touch':{
          if(!a[0])return err(c+': podaj nazwę');
          const {parent,name}=split(a[0]);
          if(!parent||parent.t!=='d')return err(c+': nie ma takiej ścieżki');
          const e=badName(name);if(e)return err(c+': '+e);
          if(parent.c[name]){if(c==='touch')break;return err(c+': '+name+': już istnieje')}
          parent.c[name]=c==='mkdir'?{t:'d',c:{}}:{t:'f',v:''};
          saveFS();fsChanged();break;
        }
        case 'rm':{
          if(!a[0])return err('rm: podaj nazwę');
          const {parent,name}=split(a[0]);
          if(!parent||parent.t!=='d'||!name||!parent.c[name])return err('rm: '+a[0]+': nie ma takiego pliku ani folderu');
          delete parent.c[name];saveFS();fsChanged();break;
        }
        case 'echo':{
          const text=rest.replace(/^["']|["']$/g,'');
          if(redirect){
            const {parent,name}=split(redirect);
            if(!parent||parent.t!=='d')return err('echo: nie ma takiej ścieżki');
            const e=badName(name);if(e)return err('echo: '+e);
            if(parent.c[name]&&parent.c[name].t==='d')return err('echo: '+name+': to jest folder');
            parent.c[name]={t:'f',v:text};saveFS();fsChanged();
          }else print(text);
          break;
        }
        case 'apps':print(Object.entries(APPS).map(([id,ap])=>`  ${id.padEnd(10)}${ap.name}`).join('\n'));break;
        case 'open':{
          const q=(a[0]||'').toLowerCase();
          const id=Object.keys(APPS).find(k=>k===q||APPS[k].name.toLowerCase()===q);
          if(!id)return err('open: nie znam aplikacji „'+q+'”. Wpisz apps.');
          openApp(id);break;
        }
        case 'ps':print('PID  APLIKACJA'.padEnd(24)+'TYTUŁ\n'+wins.map(w=>String(w.pid).padEnd(5)+w.app.name.padEnd(19)+w.titleEl.textContent).join('\n'));break;
        case 'kill':{
          const w=wins.find(x=>String(x.pid)===a[0]);
          if(!w)return err('kill: nie ma procesu '+(a[0]||''));
          requestClose(w);break;
        }
        default:err(c+': nie znaleziono polecenia. Wpisz help.');
      }
    }
    inp.addEventListener('keydown',e=>{
      if(e.key==='Enter'){const v=inp.value;inp.value='';run(v)}
      else if(e.key==='ArrowUp'){e.preventDefault();if(hi>0){hi--;inp.value=hist[hi]}}
      else if(e.key==='ArrowDown'){e.preventDefault();if(hi<hist.length-1){hi++;inp.value=hist[hi]}else{hi=hist.length;inp.value=''}}
    });
    setPrompt();
    print('Mój System 1.0 – wpisz help, aby zobaczyć polecenia.');
    setTimeout(()=>inp.focus(),0);
  }};
APPS.settings={name:'Ustawienia',w:480,h:480,single:true,color:'#707a8e',
  icon:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  open(win){
    const root=h('div',{class:'set'});
    const sec=(t,...c)=>h('div',{class:'set-sec'},h('h3',{},t),c);
    const seg=(opts,val,fn)=>h('div',{class:'seg',role:'group'},opts.map(([v,l])=>
      h('button',{'aria-pressed':String(val===v),onclick:()=>fn(v)},l)));
    function extra(){
      const sld=(k,l,min,max,step,u)=>{
        const o=h('output',{class:'mono'},cfg[k]+u);
        return h('label',{class:'sl'},h('span',{},l),h('input',{type:'range',min,max,step,value:cfg[k],'aria-label':l,oninput:e=>{cfg[k]=+e.target.value;o.textContent=cfg[k]+u;applyCfg()}}),o);
      };
      const tgl=(k,l)=>h('div',{class:'sl'},h('span',{},l),seg([['on','Wł.'],['off','Wył.']],cfg[k]?'on':'off',v=>{cfg[k]=v==='on';applyCfg();render()}));
      return [
        sec('Wygląd',sld('glass','Przezroczystość',30,100,5,'%'),sld('blur','Rozmycie szkła',0,40,2,' px'),sld('rad','Zaokrąglenie',0,24,1,' px'),sld('fs','Rozmiar tekstu',12,18,1,' px'),sld('iz','Ikony pulpitu',.7,1.5,.1,'×')),
        sec('Animacje i zegar',tgl('anim','Animacje systemu'),tgl('live','Żywa tapeta'),tgl('secs','Sekundy w zegarze')),
        sec('Własny kolor akcentu',h('input',{type:'color',id:nid(),value:cfg.accent,'aria-label':'Własny kolor akcentu',style:'width:64px;height:34px;border:0;background:none',oninput:e=>{cfg.accent=e.target.value;applyCfg()},onchange:render})),
        sec('Awatar',h('div',{class:'sw'},AV.map((a,i)=>h('button',{class:'swb'+((user&&user.av|0)===i?' on':''),style:'background:'+a[0],'aria-label':'Awatar '+(i+1),html:avSvg(i,18),onclick:()=>{if(user){user.av=i;store.set(USER_KEY,user);render()}}}))))
      ];
    }
    function stats(){
      const files=allFiles();
      return h('dl',{class:'kv'},
        h('dt',{},'Użytkownik'),h('dd',{},user?user.name:'–'),
        h('dt',{},'Pliki'),h('dd',{},String(files.length)),
        h('dt',{},'Zajęte miejsce'),h('dd',{},fmtSize(files.map(p=>walk(p).v).join(''))),
        h('dt',{},'Otwarte okna'),h('dd',{},String(wins.length)),
        h('dt',{},'Czas pracy'),h('dd',{},fmtUp()));
    }
    function reset(){
      win.confirm('Usunąć konto, wszystkie pliki i przywrócić domyślne ustawienia?','Przywróć',()=>{
        factoryReset();
      },true);
    }
    function render(){
      root.replaceChildren(
        sec('Motyw',seg([['auto','Automatyczny'],['light','Jasny'],['dark','Ciemny']],cfg.theme,v=>{cfg.theme=v;applyCfg();render()})),
        sec('Kolor akcentu',h('div',{class:'sw'},ACCENTS.map(([n,c])=>
          h('button',{class:'swb'+(cfg.accent===c?' on':''),title:n,'aria-label':n,'aria-pressed':String(cfg.accent===c),style:'background:'+c,
            onclick:()=>{cfg.accent=c;applyCfg();render()}})))),
        sec('Tapeta',h('div',{class:'wl'},WALLS.map((w,i)=>
          h('button',{class:'wb2'+(cfg.wall===i?' on':''),title:w.n,'aria-label':w.n,'aria-pressed':String(cfg.wall===i),style:'background:'+w.v,
            onclick:()=>{cfg.wall=i;applyCfg();render()}})))),
        ...extra(),
        sec('Dźwięk',seg([['on','Włączony'],['off','Wyłączony']],cfg.sound?'on':'off',v=>{cfg.sound=v==='on';applyCfg();render();if(cfg.sound){audio();sfx('pop')}})),
        sec('Informacje o systemie',stats()),
        sec('Dane',h('div',{},h('button',{class:'btn dan',onclick:reset},'Przywróć ustawienia fabryczne'),
          h('p',{class:'hint'},'Usuwa wszystkie pliki i ustawienia zapisane w tej przeglądarce.'))));
    }
    fsBus.push(render);
    win.cleanup.push(()=>{const i=fsBus.indexOf(render);if(i>=0)fsBus.splice(i,1)});
    win.body.append(root);render();
  }};

APPS.tasks={name:'Menedżer zadań',w:480,h:340,single:true,color:'#d4553f',
  icon:'<path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6"/>',
  open(win){
    const tb=h('tbody'), info=h('div',{class:'tmi'});
    const render=()=>{
      tb.replaceChildren(...wins.map(w=>h('tr',{},
        h('td',{class:'mono'},String(w.pid)),h('td',{},w.app.name),h('td',{class:'ell'},w.titleEl.textContent),
        h('td',{},h('button',{class:'btn sm',onclick:()=>requestClose(w)},'Zakończ')))));
      info.textContent=`Procesy: ${wins.length} · Czas pracy: ${fmtUp()}`;
    };
    winBus.push(render);
    const t=setInterval(()=>{info.textContent=`Procesy: ${wins.length} · Czas pracy: ${fmtUp()}`},1000);
    win.cleanup.push(()=>{clearInterval(t);const i=winBus.indexOf(render);if(i>=0)winBus.splice(i,1)});
    win.body.append(
      h('div',{class:'tbl'},h('table',{},h('thead',{},h('tr',{},h('th',{},'PID'),h('th',{},'Aplikacja'),h('th',{},'Okno'),h('th',{},''))),tb)),
      info);
    render();
  }};

APPS.paint={name:'Rysowanie',w:560,h:440,color:'#e0575b',
  icon:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2S13 17 14.5 17H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  open(win){
    const COLORS=['#1b1e27','#d64545','#e8912d','#e8c92d','#2fa26b','#3b6ef5','#8a63d2','#c05a9a'];
    let color=COLORS[0],size=4,erase=false,drawing=false,lx=0,ly=0;
    const cv=h('canvas',{style:'position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair','aria-label':'Płótno do rysowania'});
    const wrap=h('div',{style:'flex:1;min-height:0;position:relative;overflow:hidden;background:#fff'},cv);
    const ctx=cv.getContext('2d');
    function fit(){
      const w=wrap.clientWidth,hh=wrap.clientHeight;if(!w||!hh)return;
      const snap=document.createElement('canvas');snap.width=cv.width;snap.height=cv.height;snap.getContext('2d').drawImage(cv,0,0);
      cv.width=w;cv.height=hh;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,hh);ctx.drawImage(snap,0,0);
    }
    const ro=new ResizeObserver(fit);ro.observe(wrap);win.cleanup.push(()=>ro.disconnect());
    const pos=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
    cv.addEventListener('pointerdown',e=>{
      drawing=true;cv.setPointerCapture(e.pointerId);[lx,ly]=pos(e);
      ctx.fillStyle=erase?'#fff':color;ctx.beginPath();ctx.arc(lx,ly,size/2,0,Math.PI*2);ctx.fill();
    });
    cv.addEventListener('pointermove',e=>{
      if(!drawing)return;const [x,y]=pos(e);
      ctx.lineCap='round';ctx.strokeStyle=erase?'#fff':color;ctx.lineWidth=size;
      ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(x,y);ctx.stroke();lx=x;ly=y;
    });
    const end=()=>{drawing=false};
    cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
    const sw=h('div',{class:'sw',style:'gap:6px'});
    const eb=h('button',{class:'btn sm','aria-pressed':'false',onclick:()=>{erase=!erase;paintSw()}},'Gumka');
    function paintSw(){
      eb.setAttribute('aria-pressed',String(erase));
      eb.style.background=erase?'var(--accent)':'';eb.style.color=erase?'var(--accent-fg)':'';
      sw.replaceChildren(...COLORS.map(c=>h('button',{class:'swb'+(!erase&&color===c?' on':''),style:'width:24px;height:24px;background:'+c,'aria-label':'Kolor '+c,'aria-pressed':String(!erase&&color===c),onclick:()=>{color=c;erase=false;paintSw()}})));
    }
    paintSw();
    win.body.append(
      h('div',{class:'tool',style:'align-items:center'},sw,eb,
        h('input',{type:'range',id:nid(),min:1,max:32,value:4,'aria-label':'Grubość pędzla',style:'width:90px',oninput:e=>{size=+e.target.value}}),
        h('button',{class:'btn sm',onclick:()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height)}},'Wyczyść')),
      wrap);
  }};

APPS.todo={name:'Lista zadań',w:360,h:440,color:'#3fa66b',
  icon:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  open(win){
    const KEY='mojsystem.todo.v1';
    let items=store.get(KEY,null);
    if(!Array.isArray(items))items=[{t:'Przywitać się z asystentem Iskrą',d:false},{t:'Zapisać pierwszą notatkę',d:false},{t:'Namalować coś w Rysowaniu',d:false}];
    const save=()=>store.set(KEY,items);
    const list=h('div',{class:'td-list'}),cnt=h('span'),inp=h('input',{class:'inp',id:nid(),placeholder:'Dodaj zadanie…',maxlength:120,autocomplete:'off','aria-label':'Nowe zadanie'});
    function render(){
      list.replaceChildren();
      if(!items.length)list.append(h('div',{class:'empty'},'Brak zadań. Dodaj pierwsze powyżej.'));
      items.forEach((it,i)=>{
        const id=nid();
        list.append(h('div',{class:'td-row'+(it.d?' done':'')},
          h('input',{type:'checkbox',id,checked:it.d,onchange:e=>{it.d=e.target.checked;save();render()}}),
          h('label',{class:'td-t',for:id},it.t),
          h('button',{class:'ib',title:'Usuń','aria-label':'Usuń zadanie',html:ICO.trash,onclick:()=>{items.splice(i,1);save();render()}})));
      });
      cnt.textContent='Do zrobienia: '+items.filter(x=>!x.d).length;
    }
    function add(){const t=inp.value.trim();if(!t)return;items.push({t,d:false});inp.value='';save();render();sfx('pop')}
    inp.addEventListener('keydown',e=>{if(e.key==='Enter')add()});
    win.body.append(
      h('div',{class:'td-form'},inp,h('button',{class:'btn pri',onclick:add},'Dodaj')),list,
      h('div',{class:'sb'},cnt,h('button',{class:'btn sm',onclick:()=>{items=items.filter(x=>!x.d);save();render()}},'Usuń ukończone')));
    render();setTimeout(()=>inp.focus(),0);
  }};

APPS.clock={name:'Zegar',w:340,h:380,color:'#8a63d2',
  icon:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/>',
  open(win){
    let mode='sw';
    const sw={run:false,t0:0,acc:0,laps:[]},tm={run:false,end:0,left:300000,set:300000};
    const pad=n=>String(n).padStart(2,'0');
    const fmt=(ms,cs)=>{ms=Math.max(0,ms);return pad(Math.floor(ms/60000))+':'+pad(Math.floor(ms/1000)%60)+(cs?','+pad(Math.floor(ms%1000/10)):'')};
    const swNow=()=>sw.acc+(sw.run?performance.now()-sw.t0:0);
    const disp=h('div',{class:'clk-d mono'}),tabs=h('div'),ctrl=h('div',{class:'btns',style:'justify-content:center'}),extra=h('div',{style:'width:100%;display:grid;gap:8px;justify-items:center'});
    const draw=()=>{disp.textContent=mode==='sw'?fmt(swNow(),true):fmt(tm.left,false)};
    function render(){
      tabs.replaceChildren(h('div',{class:'seg'},[['sw','Stoper'],['tm','Minutnik']].map(([m,l])=>h('button',{'aria-pressed':String(mode===m),onclick:()=>{mode=m;render()}},l))));
      ctrl.replaceChildren();extra.replaceChildren();
      if(mode==='sw'){
        ctrl.append(
          h('button',{class:'btn pri',onclick:()=>{if(sw.run){sw.acc+=performance.now()-sw.t0;sw.run=false}else{sw.t0=performance.now();sw.run=true}render()}},sw.run?'Stop':(sw.acc?'Wznów':'Start')),
          h('button',{class:'btn',disabled:!sw.run,onclick:()=>{sw.laps.unshift(fmt(swNow(),true));render()}},'Okrążenie'),
          h('button',{class:'btn',onclick:()=>{sw.run=false;sw.acc=0;sw.laps=[];render()}},'Zeruj'));
        extra.append(h('div',{class:'clk-l'},sw.laps.map((l,i)=>h('div',{},h('span',{},'Okrążenie '+(sw.laps.length-i)),h('span',{class:'mono'},l)))));
      }else{
        ctrl.append(
          h('button',{class:'btn pri',onclick:()=>{if(tm.run){tm.left=tm.end-Date.now();tm.run=false}else if(tm.left>0){tm.end=Date.now()+tm.left;tm.run=true}render()}},tm.run?'Pauza':'Start'),
          h('button',{class:'btn',onclick:()=>{tm.run=false;tm.left=tm.set;render()}},'Zeruj'));
        extra.append(h('div',{class:'places',style:'border:0;justify-content:center'},[1,5,10,25].map(m=>h('button',{class:'chip',onclick:()=>{tm.run=false;tm.left=tm.set=m*60000;render()}},m+' min'))));
      }
      draw();
    }
    const t=setInterval(()=>{
      if(tm.run){tm.left=tm.end-Date.now();if(tm.left<=0){tm.left=0;tm.run=false;render();toast('Minutnik zakończony');sfx('alarm')}}
      draw();
    },100);
    win.cleanup.push(()=>clearInterval(t));
    win.body.append(h('div',{class:'clk'},tabs,disp,ctrl,extra));
    render();
  }};

APPS.piano={name:'Pianino',w:560,h:270,color:'#c05a9a',
  icon:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 19V5M15 19V5M7 5v7M11 5v7M17 5v7"/>',
  open(win){
    const W=[['C',0,'a'],['D',2,'s'],['E',4,'d'],['F',5,'f'],['G',7,'g'],['A',9,'h'],['B',11,'j'],['C',12,'k'],['D',14,'l'],['E',16,';']];
    const B=[[0,1,'w'],[1,3,'e'],[3,6,'t'],[4,8,'y'],[5,10,'u'],[7,13,'o'],[8,15,'p']];
    const els={};
    const play=(n,el)=>{
      tone(N(n),0,1.4,{type:'triangle',vol:.16,atk:.006});tone(N(n+12),0,.8,{vol:.04,atk:.006});
      el.classList.add('on');setTimeout(()=>el.classList.remove('on'),160);
    };
    const kb=h('div',{class:'pi-k'});
    const mk=(cls,label,n,k,extra)=>{
      const b=h('button',Object.assign({class:cls,'aria-label':label},extra||{}),k.toUpperCase());
      b.addEventListener('pointerdown',e=>{e.preventDefault();play(n,b);root.focus()});
      els[k]=[n,b];return b;
    };
    W.forEach(([nm,n,k])=>kb.append(mk('pi-w','Dźwięk '+nm,n,k)));
    B.forEach(([i,n,k])=>kb.append(mk('pi-b','Półton',n,k,{style:'left:'+((i+1)*10)+'%'})));
    const root=h('div',{class:'pi',tabindex:0,'aria-label':'Pianino'},kb,
      h('div',{class:'hint',style:'margin:0;text-align:center'},'Klikaj klawisze lub graj na klawiaturze: A S D F G H J K L ; oraz W E T Y U O P'));
    root.addEventListener('keydown',e=>{
      if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
      const x=els[e.key.toLowerCase()];if(x){e.preventDefault();play(x[0],x[1])}
    });
    win.body.append(root);setTimeout(()=>root.focus(),0);
  }};

APPS.snake={name:'Wąż',w:400,h:520,color:'#5aa02c',
  icon:'<path d="M4 18h8a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h9"/><circle cx="19" cy="6" r="1"/>',
  open(win){
    const G=16,C=22,S=G*C,BEST='mojsystem.snake.best';
    const cv=h('canvas',{width:S,height:S,'aria-label':'Plansza gry Wąż'}),ctx=cv.getContext('2d'),sc=h('div',{class:'mono'});
    let best=+store.get(BEST,0)||0,snake,dir,nextDir,food,score,alive,started;
    const place=()=>{let p;do{p={x:Math.floor(Math.random()*G),y:Math.floor(Math.random()*G)}}while(snake.some(s=>s.x===p.x&&s.y===p.y));food=p};
    const upd=()=>{sc.textContent='Wynik: '+score+'  ·  Rekord: '+best};
    function reset(){snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}];dir=nextDir={x:1,y:0};score=0;alive=true;started=false;place();upd();draw()}
    function turn(x,y){if(!alive||(x===-dir.x&&y===-dir.y))return;nextDir={x,y};started=true}
    function step(){
      if(!alive||!started||focused!==win||win.minimized)return;
      dir=nextDir;
      const hd={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
      if(hd.x<0||hd.y<0||hd.x>=G||hd.y>=G||snake.some(s=>s.x===hd.x&&s.y===hd.y)){
        alive=false;if(score>best){best=score;store.set(BEST,best)}sfx('error');upd();draw();return;
      }
      snake.unshift(hd);
      if(hd.x===food.x&&hd.y===food.y){score++;sfx('pop');place()}else snake.pop();
      upd();draw();
    }
    function draw(){
      const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim()||'#888';
      ctx.fillStyle=v('--surface');ctx.fillRect(0,0,S,S);
      ctx.globalAlpha=.35;ctx.fillStyle=v('--line');
      for(let i=0;i<G;i++)for(let j=0;j<G;j++)if((i+j)%2===0)ctx.fillRect(i*C,j*C,C,C);
      ctx.globalAlpha=1;
      ctx.fillStyle=v('--danger');ctx.beginPath();ctx.arc(food.x*C+C/2,food.y*C+C/2,C/2-3,0,7);ctx.fill();
      snake.forEach((s,i)=>{ctx.globalAlpha=i?.8:1;ctx.fillStyle=v('--accent');ctx.fillRect(s.x*C+1,s.y*C+1,C-2,C-2)});
      ctx.globalAlpha=1;
      if(!started||!alive){
        ctx.fillStyle='rgba(8,10,18,.65)';ctx.fillRect(0,S/2-36,S,72);
        ctx.fillStyle='#fff';ctx.textAlign='center';
        ctx.font='600 16px Inter,system-ui,sans-serif';ctx.fillText(alive?'Naciśnij strzałkę, aby zacząć':'Koniec gry! Wynik: '+score,S/2,S/2-4);
        ctx.font='13px Inter,system-ui,sans-serif';ctx.fillText(alive?'albo użyj przycisków poniżej':'Enter lub „Nowa gra”',S/2,S/2+20);
      }
    }
    const pad=(t,x,y,c,r,l)=>h('button',{style:'grid-column:'+c+';grid-row:'+r,'aria-label':l,onclick:()=>turn(x,y)},t);
    const root=h('div',{class:'sn',tabindex:0,'aria-label':'Gra Wąż'},sc,cv,
      h('div',{class:'sn-pad'},pad('▲',0,-1,2,1,'W górę'),pad('◀',-1,0,1,2,'W lewo'),pad('▼',0,1,2,2,'W dół'),pad('▶',1,0,3,2,'W prawo')),
      h('button',{class:'btn',onclick:()=>{reset();root.focus()}},'Nowa gra'));
    const KEYS={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
    root.addEventListener('keydown',e=>{
      if(e.key==='Enter'&&!alive){reset();return}
      const k=KEYS[e.key]||KEYS[e.key.toLowerCase()];
      if(k){e.preventDefault();turn(k[0],k[1])}
    });
    const t=setInterval(step,130);win.cleanup.push(()=>clearInterval(t));
    win.body.append(root);reset();setTimeout(()=>root.focus(),0);
  }};

/* ---------- asystent Iskra ---------- */
const ORDER=['files','notes','calc','paint','todo','clock','piano','snake','term','settings','tasks'];
const ALIAS=[['tasks',['menedzer','procesy']],['notes',['notatnik','notatnika','notatki']],['calc',['kalkulator','kalkulatora','liczydlo']],
  ['files',['pliki','plikow','eksplorator']],['term',['terminal','terminala','konsola','konsole']],['paint',['rysowanie','rysowania','paint','maluj']],
  ['todo',['zadania','zadan','todo','lista','liste']],['clock',['zegar','zegara','stoper','stopera','minutnik','minutnika','timer']],
  ['piano',['pianino','pianina','piano']],['snake',['waz','weza','snake']],['settings',['ustawienia','ustawien','opcje']]];
const norm=s=>s.toLowerCase().replace(/ł/g,'l').normalize('NFD').replace(/[̀-ͯ]/g,'');
const JOKES=['Dlaczego programiści mylą Halloween z Bożym Narodzeniem? Bo Oct 31 = Dec 25.',
  'Żona programisty: kup chleb, a jak będą jajka, to weź dziesięć. Wraca z dziesięcioma chlebami. „Bo były jajka.”',
  'Są 10 rodzajów ludzi: ci, którzy rozumieją system binarny, i ci, którzy nie.',
  'U mnie działa! No to wysyłamy twój komputer do klienta.',
  'Dlaczego AI nie lubi lasu? Bo ciągle gubi się w drzewie decyzyjnym.'];
const asLog=$('#as-log');
let bubT=0;
function bubble(text,ms){if(!$('#as-chat').hidden)return;const b=$('#as-bub');b.textContent=text;b.hidden=false;clearTimeout(bubT);bubT=setTimeout(()=>{b.hidden=true},ms||5000)}
function addMsg(role,text){const m=h('div',{class:'as-m '+role},text);asLog.append(m);asLog.scrollTop=asLog.scrollHeight;return m}
function botSay(text){
  const d=h('div',{class:'as-m bot as-dots'},h('i'),h('i'),h('i'));asLog.append(d);asLog.scrollTop=asLog.scrollHeight;
  setTimeout(()=>{d.remove();addMsg('bot',text);sfx('msg')},Math.min(1100,350+text.length*9));
}
function chatOpen(v){
  $('#as-chat').hidden=!v;$('#as-av').setAttribute('aria-expanded',String(v));
  if(v){
    $('#as-bub').hidden=true;
    if(!asLog.children.length)botSay(`Cześć, ${user?user.name:''}! Jestem Iskra, asystent Mojego Systemu. Otworzę aplikację, policzę, zapiszę notatkę albo opowiem dowcip. Jestem prostym asystentem opartym na regułach i działam bez internetu. Napisz „pomoc”, aby zobaczyć, co umiem.`);
    if(!coarse)$('#as-in').focus();
    sfx('pop');
  }
}
function answer(raw){
  const q=norm(raw),tokens=q.split(/[^a-z0-9]+/).filter(Boolean);
  const has=(...w)=>w.some(x=>q.includes(x)),tok=(...w)=>w.some(x=>tokens.includes(x));
  const find=()=>{const r=ALIAS.find(([id,al])=>al.some(a=>tokens.includes(a)));return r?r[0]:null};
  const nm=raw.trim().match(/^(?:zapisz\s+notatk[ęe]|zanotuj|notatka)\s*:?\s*(.+)$/i);
  if(nm){
    const dir=walk(['Dokumenty'])||fs,d=new Date(),file='notatka-'+[d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,'0')).join('')+'.txt';
    dir.c[file]={t:'f',v:nm[1]};saveFS();fsChanged();return `Zapisane w Dokumenty jako ${file}.`;
  }
  if(/\d/.test(q)&&(has('policz','oblicz','ile to','ile jest','ile wynosi','wynik')||/^[\d\s+\-*\/x×÷:().,]+$/.test(q))){
    const m=q.match(/[\d(][\d\s.,+\-*\/x×÷:()]*[\d)]/);
    if(m){
      const ex=m[0].replace(/[x×]/g,'*').replace(/[÷:]/g,'/').replace(/,/g,'.');
      let v=NaN;
      if(/^[\d\s+\-*\/.()]+$/.test(ex))try{v=Function('"use strict";return ('+ex+')')()}catch(e){}
      if(Number.isFinite(v))return m[0].trim()+' = '+String(Math.round(v*1e10)/1e10).replace('.',',');
      return 'Nie umiem policzyć tego wyrażenia. Spróbuj np. „policz 12*(3+4)”.';
    }
  }
  if(has('dzwiek','dzwieki')){
    if(has('wylacz','wycisz','cicho')){cfg.sound=false;applyCfg();fsChanged();return 'Dźwięki wyłączone.'}
    if(has('wlacz','odcisz')){cfg.sound=true;applyCfg();fsChanged();audio();sfx('pop');return 'Dźwięki włączone.'}
  }
  if(has('wyloguj'))return setTimeout(logout,900),'Wylogowuję. Do zobaczenia!';
  if(has('wylacz komputer','wylacz system','zamknij system'))return setTimeout(shutdown,900),'Wyłączam system. Do zobaczenia!';
  if(has('zamknij wszystk','zamknij okna')){wins.slice().forEach(requestClose);return 'Zamykam okna.'}
  if(has('motyw','tryb')){
    if(has('ciemn')){cfg.theme='dark';applyCfg();fsChanged();return 'Ustawiłam ciemny motyw.'}
    if(has('jasn')){cfg.theme='light';applyCfg();fsChanged();return 'Ustawiłam jasny motyw.'}
  }
  if(has('tapet')){cfg.wall=(cfg.wall+1)%WALLS.length;applyCfg();fsChanged();return 'Nowa tapeta: '+WALLS[cfg.wall].n+'.'}
  if(tok('otworz','uruchom','wlacz','odpal','pokaz','start')||(tokens.length<=2&&find())){
    const id=find();
    if(id){openApp(id);return 'Otwieram: '+APPS[id].name+'.'}
    return 'Której aplikacji szukasz? Mam: '+ORDER.map(i=>APPS[i].name).join(', ')+'.';
  }
  if(has('czas pracy','uptime'))return 'System działa od '+fmtUp()+'.';
  if(has('godzin','ktora jest','jaki jest czas'))return 'Jest '+new Date().toLocaleTimeString('pl-PL')+'.';
  if(has('data','dzisiaj','jaki dzis dzien','jaki mamy dzien'))return 'Dziś jest '+new Date().toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'.';
  if(has('dowcip','zart','kawal','rozsmiesz'))return JOKES[Math.floor(Math.random()*JOKES.length)];
  if(has('kostk'))return 'Wypadło: '+(1+Math.floor(Math.random()*6))+'.';
  if(has('monet'))return Math.random()<.5?'Orzeł.':'Reszka.';
  if(has('losuj'))return 'Wylosowałam: '+(1+Math.floor(Math.random()*100))+' (z zakresu 1–100).';
  if(has('pogod','internet'))return 'Nie mam dostępu do internetu, więc nie sprawdzę pogody ani nowości.';
  if(has('dziekuj','dzieki'))return 'Proszę! Miło mi pomóc.';
  if(has('jak sie masz','co slychac','jak leci'))return 'Świetnie, mam całe pulpit dla siebie. A u ciebie?';
  if(has('kim jestes','jak masz na imie','jak sie nazywasz','kto ty'))return 'Jestem Iskra, wbudowany asystent Mojego Systemu. Nie jestem prawdziwym modelem AI, tylko prostym programem, który rozumie kilkanaście poleceń.';
  if(has('pomoc','co potrafisz','co umiesz','help','komendy'))return `Umiem:
• otwierać aplikacje: „otwórz kalkulator”
• liczyć: „policz 12*(3+4)”
• podać godzinę i datę
• zapisać notatkę: „zapisz notatkę: kupić mleko”
• zmienić motyw lub tapetę: „ciemny motyw”, „zmień tapetę”
• wyciszyć dźwięki: „wycisz dźwięki”
• opowiedzieć dowcip, rzucić kostką lub monetą
• wylogować: „wyloguj”`;
  if(tok('czesc','hej','hejka','witaj','siema','hello','elo')||q.startsWith('dzien dobry'))return 'Cześć, '+(user?user.name:'')+'!';
  if(has('system'))return 'Mój System – Kod, AI i reszta OS. Działa w przeglądarce: ma okna, pliki, aplikacje i mnie.';
  return 'Tego jeszcze nie umiem. Napisz „pomoc”, a podpowiem, co potrafię.';
}
function userSay(text){
  text=text.trim();if(!text)return;
  addMsg('me',text);
  let r;try{r=answer(text)}catch(e){r='Coś poszło nie tak. Spróbuj inaczej.'}
  if(r)botSay(r);
}
$('#as-av').addEventListener('click',()=>chatOpen($('#as-chat').hidden));
$('#as-x').addEventListener('click',()=>chatOpen(false));
$('#as-chat').addEventListener('keydown',e=>{if(e.key==='Escape')chatOpen(false)});
$('#as-form').addEventListener('submit',e=>{e.preventDefault();const i=$('#as-in'),v=i.value;i.value='';userSay(v)});
$('#as-chips').append(...['Która godzina?','Otwórz kalkulator','Opowiedz dowcip','Co potrafisz?','Zmień tapetę'].map(t=>h('button',{class:'chip',type:'button',onclick:()=>userSay(t)},t)));
document.addEventListener('pointermove',e=>{
  if($('#asst').hidden)return;
  const r=$('#as-av').getBoundingClientRect(),cl=v=>Math.max(-1,Math.min(1,v/200)),el=$('.as-eyes');
  el.style.setProperty('--ex',(cl(e.clientX-r.left-r.width/2)*3)+'px');
  el.style.setProperty('--ey',(cl(e.clientY-r.top-r.height/2)*2)+'px');
});

/* ---------- uruchamianie, logowanie, wylogowanie ---------- */
const AV=[['#3b6ef5','<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'],
  ['#e0575b','<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'],
  ['#2fa26b','<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>'],
  ['#8a63d2','<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
  ['#e8912d','<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'],
  ['#c05a9a','<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>'],
  ['#2b9fb8','<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/>'],
  ['#5aa02c','<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10v5M5.5 12.5h5M16 12h.01M18 14h.01"/>'],
  ['#d4553f','<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>'],
  ['#707a8e','<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4M9 13h.01M15 13h.01"/>']];
const avSvg=(i,s)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AV[(i|0)%AV.length][1]}</svg>`;
function avSet(el,i){i=(i|0)%AV.length;el.style.background=AV[i][0];el.innerHTML=avSvg(i,36)}
let pickAv=0;
function drawPick(){
  const box=$('#lg-avs');box.hidden=loginMode!=='create';
  box.replaceChildren(...AV.map((a,i)=>h('button',{type:'button',class:'swb'+(pickAv===i?' on':''),style:'background:'+a[0],'aria-label':'Awatar '+(i+1),'aria-pressed':String(pickAv===i),html:avSvg(i,18),onclick:()=>{pickAv=i;avSet($('#lg-av'),i);drawPick()}})));
}
const LOGO=`<svg class="logo" viewBox="0 0 120 120" fill="none" aria-hidden="true"><circle class="lg-ring" cx="60" cy="60" r="54" pathLength="1"/><path class="lg-br" d="M40 44L24 60l16 16" pathLength="1"/><path class="lg-br" d="M80 44l16 16-16 16" pathLength="1"/><path class="lg-star" d="M60 46l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><circle class="lg-orb" cx="60" cy="6" r="3.5"/></svg>`;
let bootState='off',bootTimers=[],loginMode='login',justCreated=false,resetArm=false;
function showPower(){
  bootState='power';
  $('#login').hidden=true;$('#asst').hidden=true;
  $('#bt-logo0').innerHTML=LOGO.replace('class="logo"','class="logo still"');
  const b=$('#boot');b.hidden=false;b.classList.remove('out');
  $('#bt-power').hidden=false;$('#bt-run').hidden=true;
  setTimeout(()=>$('#bt-btn').focus(),0);
}
function startBoot(){
  audio();bootState='run';
  $('#bt-power').hidden=true;
  const run=$('#bt-run');run.hidden=false;
  run.innerHTML=LOGO+'<div class="bt-name">Mój System</div><h1 class="bt-tag" aria-label="Kod, AI i reszta OS"></h1><div class="bt-bar"><i></i></div><div class="bt-st" id="bt-st" aria-live="polite"></div><button class="lg-link" id="bt-skip" type="button">Pomiń</button>';
  const tag=run.querySelector('.bt-tag');
  [...'Kod, AI i reszta OS'].forEach((ch,i)=>tag.append(h('span',{'aria-hidden':'true',style:'animation-delay:'+(1.4+i*.045)+'s'},ch===' '?' ':ch)));
  const st=$('#bt-st');
  bootTimers=[[0,'Ładowanie jądra…'],[1.2,'Uruchamianie usług…'],[2.4,'Budzenie asystenta Iskry…'],[3.4,'Przygotowanie pulpitu…']].map(([t,m])=>setTimeout(()=>{st.textContent=m},t*1000));
  bootTimers.push(setTimeout(finishBoot,4600));
  if(cfg.sound)try{SFX.boot()}catch(e){}
  $('#bt-skip').addEventListener('click',finishBoot);
  $('#bt-skip').focus();
}
function finishBoot(){
  if(bootState!=='run')return;
  bootState='done';bootTimers.forEach(clearTimeout);
  showLogin();
  const b=$('#boot');b.classList.add('out');setTimeout(()=>{if(bootState==='done')b.hidden=true},520);
}
function showLogin(){
  const l=$('#login');
  l.style.background=WALLS[cfg.wall].v;l.style.backgroundSize='cover';
  loginMode=user?'login':'create';
  const create=loginMode==='create',nopw=!create&&!user.pass;
  if(create)pickAv=0;
  avSet($('#lg-av'),create?pickAv:user.av);drawPick();
  $('#lg-h').textContent=create?'Witaj w Moim Systemie':user.name;
  $('#lg-sub').textContent=create?'Utwórz konto, aby zacząć. Dane zostają w tej przeglądarce.':(nopw?'Konto bez hasła.':'Wpisz hasło, aby się zalogować.');
  $('#lg-namel').hidden=$('#lg-name').hidden=!create;
  $('#lg-pwl').hidden=$('#lg-pw').hidden=nopw;
  $('#lg-pwl').textContent=create?'Hasło (opcjonalne)':'Hasło';
  $('#lg-go').textContent=create?'Utwórz konto i zaloguj':'Zaloguj';
  $('#lg-reset').hidden=create;
  $('#lg-name').value=$('#lg-pw').value='';$('#lg-err').textContent='';
  resetArm=false;$('#lg-reset').textContent='Nie pamiętasz hasła? Zresetuj system';
  l.hidden=false;l.classList.remove('out');tick();
  setTimeout(()=>(create?$('#lg-name'):nopw?$('#lg-go'):$('#lg-pw')).focus(),60);
}
function doLogin(){
  sfx('login');
  const os=$('#os');os.classList.remove('entered');void os.offsetWidth;os.classList.add('entered');
  const l=$('#login');l.classList.add('out');setTimeout(()=>{l.hidden=true},470);
  smUser.textContent=user.name;
  $('#asst').hidden=false;tkUpdate();
  toast('Witaj, '+user.name+'!');
  setTimeout(()=>bubble(`Cześć, ${user.name}! Kliknij mnie, jeśli chcesz pogadać.`,6000),900);
  if(justCreated){justCreated=false;if(walk(['Dokumenty','powitanie.txt']))openApp('notes',{path:'/Dokumenty/powitanie.txt'})}
}
function closeAll(){wins.slice().forEach(requestClose);return wins.length===0}
function leave(){
  closeMenus();
  if(!closeAll()){toast('Zapisz lub zamknij otwarte dokumenty');return false}
  chatOpen(false);$('#asst').hidden=true;$('#as-bub').hidden=true;asLog.replaceChildren();
  return true;
}
function logout(){if(leave())showLogin()}
function shutdown(){if(leave()){sfx('off');showPower()}}
function wipe(){
  fs=defaultFS();saveFS();cfg=Object.assign({},DEF_CFG);applyCfg();
  user=null;store.set(USER_KEY,null);store.set('mojsystem.todo.v1',null);store.set('mojsystem.snake.best',0);
}
function factoryReset(){wipe();toast('Przywrócono ustawienia fabryczne');setTimeout(logout,400)}
$('#bt-btn').addEventListener('click',startBoot);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bootState==='run')finishBoot()});
$('#lg-form').addEventListener('submit',e=>{
  e.preventDefault();
  const err=$('#lg-err'),pw=$('#lg-pw').value;
  if(loginMode==='create'){
    const name=$('#lg-name').value.trim();
    if(!name){err.textContent='Wpisz nazwę użytkownika.';sfx('error');$('#lg-name').focus();return}
    user={name,pass:pw?hashPw(pw):'',av:pickAv};store.set(USER_KEY,user);justCreated=true;
  }else if(user.pass&&hashPw(pw)!==user.pass){
    err.textContent='Niepoprawne hasło. Spróbuj jeszcze raz.';sfx('error');
    const c=$('#lg-form');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');
    $('#lg-pw').select();return;
  }
  doLogin();
});
$('#lg-reset').addEventListener('click',()=>{
  const b=$('#lg-reset');
  if(!resetArm){resetArm=true;b.textContent='Na pewno? To usunie konto i wszystkie pliki. Kliknij ponownie.';return}
  wipe();showLogin();
});

/* ---------- pulpit, menu Start, zegar, blokada ---------- */
const icons=$('#icons');
ORDER.map(id=>[id,APPS[id]]).forEach(([id,app])=>{
  const b=h('button',{class:'ic','aria-label':app.name},tile(app,48),h('span',{},app.name));
  b.addEventListener('click',()=>{icons.querySelectorAll('.ic.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');if(coarse)openApp(id)});
  b.addEventListener('dblclick',()=>openApp(id));
  b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openApp(id)}});
  b.style.setProperty('--d',icons.children.length*60+'ms');icons.append(b);
});
$('#desk').addEventListener('pointerdown',()=>icons.querySelectorAll('.ic.sel').forEach(x=>x.classList.remove('sel')));
icons.addEventListener('pointerdown',e=>{if(e.target===icons)icons.querySelectorAll('.ic.sel').forEach(x=>x.classList.remove('sel'))});

const sm=$('#startmenu');
const smQ=h('input',{class:'inp',id:nid(),type:'search',placeholder:'Szukaj aplikacji…','aria-label':'Szukaj aplikacji'});
const smList=h('div',{class:'sm-list'});
function fillStart(){
  smList.replaceChildren();
  const t=smQ.value.trim().toLowerCase();
  const res=ORDER.map(id=>[id,APPS[id]]).filter(([id,a])=>!t||a.name.toLowerCase().includes(t));
  if(!res.length)smList.append(h('div',{class:'empty'},'Brak wyników.'));
  res.forEach(([id,a],i)=>smList.append(h('button',{class:'sm-it',style:'animation-delay:'+i*28+'ms',onclick:()=>openApp(id)},tile(a,32),h('span',{},a.name))));
}
smQ.addEventListener('input',fillStart);
smQ.addEventListener('keydown',e=>{if(e.key==='Enter'){const f=smList.querySelector('.sm-it');if(f)f.click()}});
const smUser=h('span',{class:'usr'},'Użytkownik');
sm.append(smQ,smList,h('div',{class:'sm-ft'},smUser,
  h('button',{class:'btn',onclick:()=>logout()},'Wyloguj'),
  h('button',{class:'btn',onclick:()=>shutdown()},'Wyłącz')));
$('#startbtn').addEventListener('click',()=>{
  const open=sm.hidden;
  closeMenus();
  if(open){sm.hidden=false;$('#startbtn').setAttribute('aria-expanded','true');smQ.value='';fillStart();if(!coarse)smQ.focus()}
});

let calM=new Date();
function renderCal(){
  const c=$('#cal'), now=new Date(), y=calM.getFullYear(), m=calM.getMonth(), first=new Date(y,m,1);
  const lead=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate(), cells=[];
  for(let i=0;i<lead;i++)cells.push(h('span'));
  for(let d=1;d<=days;d++){
    const today=d===now.getDate()&&m===now.getMonth()&&y===now.getFullYear();
    cells.push(h('span',{class:'cd'+(today?' today':'')},String(d)));
  }
  c.replaceChildren(
    h('div',{class:'cal-h'},
      h('button',{class:'ib','aria-label':'Poprzedni miesiąc',onclick:()=>{calM=new Date(y,m-1,1);renderCal()}},'‹'),
      h('strong',{},new Intl.DateTimeFormat('pl-PL',{month:'long',year:'numeric'}).format(first)),
      h('button',{class:'ib','aria-label':'Następny miesiąc',onclick:()=>{calM=new Date(y,m+1,1);renderCal()}},'›')),
    h('div',{class:'cal-g'},['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(d=>h('span',{class:'wd'},d)),cells));
}
$('#tray').addEventListener('click',()=>{
  const open=$('#cal').hidden;
  closeMenus();
  if(open){calM=new Date();renderCal();$('#cal').hidden=false}
});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#startmenu,#startbtn,#cal,#tray'))closeMenus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus()});

function tick(){
  const d=new Date();
  const t=d.toLocaleTimeString('pl-PL',Object.assign({hour:'2-digit',minute:'2-digit'},cfg.secs?{second:'2-digit'}:{}));
  $('#tm').textContent=t;
  $('#dt').textContent=d.toLocaleDateString('pl-PL');
  $('#lg-t').textContent=t;
  $('#lg-d').textContent=d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'});
}

/* ---------- start ---------- */
applyCfg();
tick();setInterval(tick,1000);
tkUpdate();
showPower();
})();

