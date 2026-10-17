// backup: export / import all data as a JSON file
$('bkx').onclick=()=>{
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));
  a.download='focus-backup-'+dk(new Date())+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
$('bkb').onclick=()=>$('bki').click();
$('bki').onchange=e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    let d;try{d=JSON.parse(r.result)}catch(err){alert('That file is not valid JSON.');return}
    if(!d||!Array.isArray(d.projects)||!d.projects.length||!Array.isArray(d.tasks)||!Array.isArray(d.sessions)){alert('This does not look like a backup from this app.');return}
    if(!confirm('Replace ALL current data with this backup ('+d.projects.length+' projects, '+d.tasks.length+' tasks, '+d.sessions.length+' sessions)? If you are signed in, your cloud copy will be replaced too.'))return;
    Object.keys(S).forEach(k=>delete S[k]);
    Object.assign(S,blank(),d);
    S.set=Object.assign({},D,S.set);
    ['plans','saved'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]});
    save();
    if(!running)setPhase(ph);
    render();
    if(S.yt)ytPlay(S.yt,false);
  };
  r.readAsText(f);
};
