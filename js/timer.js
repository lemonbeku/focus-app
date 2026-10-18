// timer: pomodoro / flowmodoro engine (phases, ticking, logging sessions)
const D={style:'circle',count:'pomo',work:25,short:5,long:15,interval:4,autoB:false,autoP:false,sound:true,notify:true,ytSync:true};
S.set=Object.assign({},D,S.set);
const st=()=>S.set;
let ph='work',running=false,end=0,tick=null,up=0,startT=0,round=0,span=1500,left=1500;
const plen=()=>(ph==='work'?st().work:ph==='short'?st().short:st().long)*60;
const flowNow=()=>st().count==='flow'&&ph==='work';
function setPhase(p,sec){ph=p;left=sec||plen();span=left;up=0}
setPhase('work');
function draw(){
  const fl=flowNow(),s=Math.max(0,Math.ceil(fl?up:left));
  const t=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  $('clock').textContent=t;
  $('mode').textContent=ph==='work'?(fl?'FLOWMODORO':'POMODORO'):ph==='short'?'SHORT BREAK':'LONG BREAK';
  $('go').textContent=running?'⏸ Pause':'▶ Start';
  document.querySelectorAll('#ptabs button').forEach(b=>b.classList.toggle('on',b.dataset.ph===ph));
  const f=fl?Math.min(1,up/(st().work*60)):Math.max(0,Math.min(1,1-left/span));
  $('prg').style.strokeDashoffset=879.6*(1-f);
  const a=f*2*Math.PI-Math.PI/2;$('knob').setAttribute('cx',150+140*Math.cos(a));$('knob').setAttribute('cy',150+140*Math.sin(a));
  document.title=(running?t+' - ':'')+'10,000 Hours Focus';
  syncVideo();
  saveRun();
}
// keep the running/paused timer in the browser so a refresh or closed tab does not lose progress
const RUN='focus10000run';
function saveRun(){
  try{
    const idle=!running&&(flowNow()?up<=0:left>=span);
    if(idle){localStorage.removeItem(RUN);return}
    localStorage.setItem(RUN,JSON.stringify({ph,running,end,startT,left,span,up,round,t:Date.now()}));
  }catch(e){}
}
function restoreRun(){
  let r=null;try{r=JSON.parse(localStorage.getItem(RUN)||'null')}catch(e){}
  if(!r||!r.ph)return;
  ph=r.ph;span=r.span||plen();left=r.left;up=r.up||0;round=r.round||0;
  if(!r.running)return;                                   // paused: show it where it stopped
  if(Date.now()-r.t>150000){                              // page was closed: log the time done until the last heartbeat
    if(r.ph==='work'){
      const sec=flowNow()?(r.t-r.startT)/1000:r.span-(r.end-r.t)/1000;
      const n=round;if(logTime(sec))round=n+1;
    }
    setPhase('work');return;
  }
  if(flowNow()){startT=r.startT;up=(Date.now()-startT)/1000}
  else{end=r.end;left=(end-Date.now())/1000}
  running=true;tick=setInterval(loop,500);
}
window.addEventListener('pagehide',saveRun);
// three-note chime
function beep(){if(!st().sound)return;try{const c=new (window.AudioContext||window.webkitAudioContext)(),t=c.currentTime;
  [660,880,1100].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),s=t+i*.22;o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.25,s+.03);g.gain.exponentialRampToValueAtTime(.001,s+.5);
    o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+.55)});
  setTimeout(()=>c.close(),1500)}catch(e){}}
// desktop notification (only when the tab is in the background; the chime is enough when you are looking at it)
function askNotif(){if(st().notify&&'Notification' in window&&Notification.permission==='default')Notification.requestPermission()}
function notify(title,body){
  if(!st().notify||!('Notification' in window)||Notification.permission!=='granted')return;
  if(!document.hidden&&document.hasFocus())return;
  try{const n=new Notification(title,{body,tag:'focus-timer'});n.onclick=()=>{window.focus();n.close()}}catch(e){}
}
function logTime(sec){const m=Math.floor(sec/60),t=S.tasks.find(x=>String(x.id)===String(S.curTask)),pr=t&&proj(t.project)?t.project:S.cur;if(m<1||!pr)return false;S.sessions.push({ts:Date.now(),min:m,task:S.curTask?String(S.curTask):'',project:pr});save();return true}
function goBreak(w){const lg=round>0&&round%st().interval===0;setPhase(lg?'long':'short',st().count==='flow'?Math.max(1,Math.round(w/300))*60:0)}
function elapsed(){if(flowNow()){if(running)up=(Date.now()-startT)/1000;return up}return span-(running?(end-Date.now())/1000:left)}
function finish(){
  const was=ph;running=false;clearInterval(tick);beep();
  notify(was==='work'?'Focus session done 🎉':'Break is over',was==='work'?'Time for a break.':'Time to focus again.');
  if(ph==='work'){const sec=flowNow()?up:span;if(logTime(sec))round++;goBreak(sec)}else setPhase('work');
  render();
  if((ph!=='work'&&st().autoB)||(ph==='work'&&st().autoP))$('go').click();
}
function loop(){
  if(flowNow()){up=(Date.now()-startT)/1000;draw();return}
  left=(end-Date.now())/1000;
  if(left<=0)finish();else draw();
}
$('go').onclick=()=>{
  if(running){elapsed();if(!flowNow())left=(end-Date.now())/1000;running=false;clearInterval(tick);draw();return}
  if(flowNow())startT=Date.now()-up*1000;else{if(left<=0)left=span;end=Date.now()+left*1000}
  askNotif();running=true;tick=setInterval(loop,500);draw();
};
document.querySelectorAll('#ptabs button').forEach(b=>b.onclick=()=>{
  if(b.dataset.ph===ph)return;
  if(ph==='work'){const w=elapsed();if(logTime(w))round++}
  running=false;clearInterval(tick);setPhase(b.dataset.ph);render();
});
$('rs').onclick=()=>{running=false;clearInterval(tick);setPhase(ph);draw()};
$('skip').onclick=()=>{
  const w=ph==='work'?elapsed():0;
  running=false;clearInterval(tick);
  if(ph==='work'){if(logTime(w))round++;goBreak(w)}else setPhase('work');
  render();
};
restoreRun();