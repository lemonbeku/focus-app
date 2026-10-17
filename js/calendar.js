// calendar: weekly plan + logged sessions
let wk=0;
$('pd').value=dk(new Date());
function weekStart(off){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)+off*7);return d}
$('addplan').onclick=()=>{
  const t=$('ptl').value.trim();if(!t||!$('pp').value||!$('pd').value)return;
  S.plans.push({id:Date.now(),date:$('pd').value,project:$('pp').value,title:t,min:+$('pm').value||30,done:false});
  $('ptl').value='';save();render();
};
function renderCal(){
  const f=$('cfil').value,s=weekStart(wk),days=[];
  for(let i=0;i<7;i++){const d=new Date(s);d.setDate(s.getDate()+i);days.push(d)}
  $('calT').textContent=days[0].toLocaleDateString(undefined,{month:'long',year:'numeric'})+', week of '+days[0].getDate();
  const today=dk(new Date());
  $('grid').innerHTML=days.map(d=>{
    const k=dk(d),ss=S.sessions.filter(x=>dk(x.ts)===k&&(!f||x.project===f)),pl=S.plans.filter(x=>x.date===k&&(!f||x.project===f)),tot=ss.reduce((a,x)=>a+x.min,0);
    return `<div class="day ${k===today?'today':''}"><span class="mut">${d.toLocaleDateString(undefined,{weekday:'short'})}</span><b>${d.getDate()}</b><span class="mut">${tot?fmt(tot)+' focused':'No focus yet'}</span>`+
    pl.map(x=>`<div class="ev plan ${x.done?'done':''}" style="border-left-color:${pcol(x.project)}">Plan: ${esc(x.title)} (${x.min}m)<br><button data-pd="${x.id}">${x.done?'Undo':'Done'}</button><button data-px="${x.id}">Remove</button></div>`).join('')+
    ss.map(x=>{const t=S.tasks.find(y=>String(y.id)===x.task),h=new Date(x.ts);return `<div class="ev" style="border-left-color:${pcol(x.project)}">${String(h.getHours()).padStart(2,'0')}:${String(h.getMinutes()).padStart(2,'0')} ${x.min}m ${esc((proj(x.project)||{name:''}).name)}${t?': '+esc(t.title):''}</div>`}).join('')+'</div>';
  }).join('');
  document.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>{const p=S.plans.find(x=>String(x.id)===b.dataset.pd);p.done=!p.done;save();renderCal()});
  document.querySelectorAll('[data-px]').forEach(b=>b.onclick=()=>{S.plans=S.plans.filter(x=>String(x.id)!==b.dataset.px);save();renderCal()});
}
$('cp').onclick=()=>{wk--;renderCal()};$('cn').onclick=()=>{wk++;renderCal()};$('ct').onclick=()=>{wk=0;renderCal()};
$('cfil').onchange=renderCal;
