// projects: project and task management view
$('addp').onclick=()=>{
  const n=$('pn').value.trim();if(!n)return;
  S.projects.push({id:'p'+Date.now(),name:n,goal:Math.max(1,+$('pg').value||10000),color:COL[S.projects.length%COL.length],bonus:0});
  $('pn').value='';save();render();
};
function renderProjects(){
  $('plist').innerHTML=S.projects.map(p=>{
    const ts=S.tasks.filter(t=>t.project===p.id);
    return `<div class="card"><div class="row"><span class="dot" style="background:${p.color}"></span><b style="flex:1">${esc(p.name)}</b><span class="mut">${fmt(pmin(p.id))} focused</span><button class="g" data-dp="${p.id}">Delete project</button></div>`+
    ts.map(t=>`<div class="task ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} data-c="${t.id}" aria-label="Done"><span>${esc(t.title)} <small class="mut">${fmt(S.sessions.filter(s=>s.task===String(t.id)).reduce((a,s)=>a+s.min,0))}</small></span><button class="g" data-dt="${t.id}">Delete</button></div>`).join('')+
    `<div class="row" style="margin-top:10px"><input data-ni="${p.id}" placeholder="Add a task" style="flex:1"><button class="p" data-nt="${p.id}">Add task</button></div></div>`;
  }).join('')||'<p class="mut">Add your first project above.</p>';
  const q=s=>document.querySelectorAll(s);
  q('[data-c]').forEach(c=>c.onchange=()=>{const t=S.tasks.find(x=>String(x.id)===c.dataset.c);t.done=c.checked;t.doneAt=c.checked?dk(new Date()):'';save();render()});
  q('[data-dt]').forEach(b=>b.onclick=()=>{S.tasks=S.tasks.filter(x=>String(x.id)!==b.dataset.dt);save();render()});
  q('[data-dp]').forEach(b=>b.onclick=()=>{if(confirm('Delete this project, its tasks, plans and logged time?')){const id=b.dataset.dp;S.projects=S.projects.filter(p=>p.id!==id);S.tasks=S.tasks.filter(t=>t.project!==id);S.plans=S.plans.filter(t=>t.project!==id);S.sessions=S.sessions.filter(t=>t.project!==id);save();render()}});
  q('[data-nt]').forEach(b=>b.onclick=()=>{const i=document.querySelector(`[data-ni="${b.dataset.nt}"]`),t=i.value.trim();if(!t)return;S.tasks.push({id:Date.now(),title:t,project:b.dataset.nt,done:false});save();render()});
  q('[data-ni]').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')document.querySelector(`[data-nt="${i.dataset.ni}"]`).click()});
}