// stage: timer screen rendering (top bar, task card, task list panel)
// Daftar tugas menampilkan SEMUA proyek; tugas bisa dipindah proyek & ditunda ke besok.
$('psel').onchange=()=>{S.cur=$('psel').value;save();render()};
let editId=null;
const tmr=()=>{const d=new Date();d.setDate(d.getDate()+1);return dk(d)};
const tById=id=>S.tasks.find(x=>String(x.id)===String(id));
function editForm(t){
  return `<div class="ed"><input data-et value="${esc(t.title)}" aria-label="Task title"><select data-ep aria-label="Project">${popts()}</select><input data-edt type="date" value="${t.due||dk(new Date())}" aria-label="Due date"><div class="pt"><b>Add past time</b><div class="row"><input data-eh type="number" min="0" step="0.25" placeholder="Hours (e.g. 1.5)" aria-label="Past hours"><input data-eps type="date" value="${dk(new Date())}" aria-label="Date worked"></div><small>Logged to this task on that date. Now: ${fmt(tmin(t.id))}</small></div><div class="row" style="justify-content:space-between"><button class="edel" data-edel>Delete</button><span><button class="g" data-ecx>Cancel</button> <button class="p" data-esv>Save</button></span></div></div>`;
}
function renderStage(){
  $('stage').dataset.scene=S.scene||'sunset';
  $('yt').classList.toggle('bg',S.vbg!==false);$('stage').classList.toggle('vbg',S.vbg!==false&&!!S.yt);$('vpp').style.display=S.yt?'':'none';
  $('dial').classList.toggle('num',st().style==='num');
  const today=dk(new Date()),p=proj(S.cur);
  // selesai hari ini tetap tampil (bisa di-undo); selesai hari sebelumnya disembunyikan dari daftar
  const ts=S.tasks.filter(t=>(!t.due||t.due<=today)&&(!t.done||t.doneAt===today)),later=S.tasks.filter(t=>!t.done&&t.due>today).length;
  $('pdot').style.background=pcol(S.cur);
  const cur=tById(S.curTask),cp=cur?proj(cur.project):p;
  $('cur').innerHTML=`<div style="font-size:20px">${cur?esc(cur.title):'No task selected'}</div><div class="row" style="justify-content:space-between;margin:8px 0 0;opacity:.85"><span>Project: ${cp?esc(cp.name):'none'}</span><span>${cur?fmt(tmin(cur.id))+' focused':''}</span></div>`;
  const days=new Set(S.sessions.map(s=>dk(s.ts)));
  $('tTrophy').textContent=S.sessions.filter(s=>dk(s.ts)===today).length;
  let n=0,d=new Date();if(!days.has(dk(d)))d.setDate(d.getDate()-1);while(days.has(dk(d))){n++;d.setDate(d.getDate()-1)}
  $('tStreak').textContent=n;
  $('tltot').innerHTML='Total time spent: <b>'+fmt(ts.reduce((a,t)=>a+tmin(t.id),0))+'</b>'+(later?' · '+later+' ditunda':'');
  $('tlb').innerHTML=ts.map(t=>{
    if(String(t.id)===String(editId))return editForm(t);
    const q=proj(t.project);
    return `<div class="tr ${t.done?'done':''} ${String(t.id)===String(S.curTask)?'sel':''}" data-s="${t.id}"><span class="rd" data-k="${t.id}" role="checkbox" aria-checked="${t.done}" aria-label="Complete"></span><div class="tn">${esc(t.title)}<br><small><span class="dot" style="background:${pcol(t.project)};width:8px;height:8px"></span> ${q?esc(q.name):'-'} · ${fmt(tmin(t.id))}${t.due&&t.due<today?' · terlewat':''}</small></div><button class="ta" data-tm="${t.id}" title="Tomorrow" aria-label="Move to tomorrow">☀</button><button class="ta" data-ed="${t.id}" title="Edit" aria-label="Edit">✎</button></div>`;
  }).join('')+`<input id="qt" placeholder="+ Add new task" aria-label="Add new task">`;
  const L=$('tlb');
  L.querySelectorAll('[data-s]').forEach(r=>r.onclick=()=>{S.curTask=r.dataset.s;save();renderStage()});
  L.querySelectorAll('[data-k]').forEach(r=>r.onclick=e=>{e.stopPropagation();const t=tById(r.dataset.k);t.done=!t.done;t.doneAt=t.done?today:'';save();render()});
  L.querySelectorAll('[data-tm]').forEach(b=>b.onclick=e=>{e.stopPropagation();const t=tById(b.dataset.tm);t.due=tmr();if(String(S.curTask)===String(t.id))S.curTask='';save();render()});
  L.querySelectorAll('[data-ed]').forEach(b=>b.onclick=e=>{e.stopPropagation();editId=b.dataset.ed;renderStage()});
  const f=L.querySelector('.ed');
  if(f){
    const t=tById(editId);f.querySelector('[data-ep]').value=t.project;
    const saveEdit=()=>{
      const v=f.querySelector('[data-et]').value.trim(),np=f.querySelector('[data-ep]').value;
      if(v)t.title=v;
      if(np!==t.project){t.project=np;S.sessions.forEach(s=>{if(s.task===String(t.id))s.project=np})}
      const hv=+f.querySelector('[data-eh]').value;
      if(hv>0){
        const dv=f.querySelector('[data-eps]').value||today;
        S.sessions.push({ts:dv===today?Date.now():new Date(dv+'T12:00:00').getTime(),min:Math.max(1,Math.round(hv*60)),task:String(t.id),project:t.project});
      }
      t.due=f.querySelector('[data-edt]').value||dk(new Date());
      if(t.due>dk(new Date())&&String(S.curTask)===String(t.id))S.curTask='';
      editId=null;save();render();
    };
    f.querySelector('[data-esv]').onclick=saveEdit;
    f.querySelector('[data-et]').onkeydown=e=>{if(e.key==='Enter')saveEdit()};
    f.querySelector('[data-eh]').onkeydown=e=>{if(e.key==='Enter')saveEdit()};
    f.querySelector('[data-ecx]').onclick=()=>{editId=null;renderStage()};
    f.querySelector('[data-edel]').onclick=()=>{if(confirm('Delete this task?')){S.tasks=S.tasks.filter(x=>x!==t);if(String(S.curTask)===String(t.id))S.curTask='';editId=null;save();render()}};
  }
  $('qt').onkeydown=e=>{if(e.key==='Enter'&&$('qt').value.trim()&&S.cur){const id=Date.now();S.tasks.push({id,title:$('qt').value.trim(),project:S.cur,done:false,due:today});S.curTask=String(id);save();render();$('qt').focus()}};
}
$('tlc').onclick=()=>$('tl').classList.toggle('c');
if(innerWidth<720)$('tl').classList.add('c');