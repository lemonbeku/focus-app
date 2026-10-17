// insights: hours per project toward the goal
function renderHours(){
  const all=S.sessions.reduce((a,s)=>a+s.min,0),today=dk(new Date()),ws=weekStart(0).getTime();
  const days=new Set(S.sessions.map(s=>dk(s.ts)));let st=0,d=new Date();if(!days.has(dk(d)))d.setDate(d.getDate()-1);
  while(days.has(dk(d))){st++;d.setDate(d.getDate()-1)}
  const stat=(a,b)=>`<div class="card stat"><span class="mut">${a}</span><b>${b}</b></div>`;
  $('stats').innerHTML=stat('All projects',fmt(all))+stat('Today',fmt(S.sessions.filter(s=>dk(s.ts)===today).reduce((a,s)=>a+s.min,0)))+stat('This week',fmt(S.sessions.filter(s=>s.ts>=ws).reduce((a,s)=>a+s.min,0)))+stat('Streak',st+'d');
  $('hcards').innerHTML=S.projects.map(p=>{
    const sm=pmin(p.id),min=sm+Math.round(p.bonus*60),h=min/60,pct=Math.min(100,h/p.goal*100);
    const mine=S.sessions.filter(s=>s.project===p.id);
    let pace='Finish a focus session to see a projected finish date.';
    if(mine.length){const first=Math.min(...mine.map(s=>s.ts)),span=Math.max(1,Math.ceil((Date.now()-first)/864e5)+1),pd=sm/60/span,dd=Math.ceil((p.goal-h)/pd);
      pace=h>=p.goal?'Goal reached.':`At ${(pd*60).toFixed(0)} min/day you finish around ${new Date(Date.now()+dd*864e5).getFullYear()} (${(dd/365).toFixed(1)} years).`}
    return `<div class="card"><div class="row"><span class="dot" style="background:${p.color}"></span><b style="flex:1">${esc(p.name)}</b><span class="mut">goal <input type="number" min="1" value="${p.goal}" data-g="${p.id}" style="width:90px"> h</span></div>
    <div class="big" style="margin:12px 0">${h.toFixed(h<100?1:0)}h <span class="mut">of ${p.goal.toLocaleString()}h (${pct.toFixed(2)}%)</span></div>
    <div class="bar"><i style="width:${pct}%;background:${p.color}"></i></div><p class="mut">${pace}</p>
    <div class="row"><input type="number" min="0" step="0.5" placeholder="past hours" data-bi="${p.id}" style="width:110px"><button class="g" data-b="${p.id}">Add past hours</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-g]').forEach(i=>i.onchange=()=>{proj(i.dataset.g).goal=Math.max(1,+i.value||10000);save();render()});
  document.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const v=+document.querySelector(`[data-bi="${b.dataset.b}"]`).value;if(v>0){proj(b.dataset.b).bonus+=v;save();render()}});
}
$('reset').onclick=()=>{if(confirm('Delete everything?')){S=blank();save();location.reload()}};
