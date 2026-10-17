// main: single render entry point, runs last
function render(){
  const k=[$('pp').value||S.cur,$('cfil').value];
  if(!proj(S.cur))S.cur=S.projects[0]?S.projects[0].id:'';
  $('psel').innerHTML=popts();$('pp').innerHTML=popts();$('cfil').innerHTML=popts(true);
  $('psel').value=S.cur;if(proj(k[0]))$('pp').value=k[0];$('cfil').value=proj(k[1])?k[1]:'';
  renderStage();renderProjects();renderCal();renderHours();draw();
}
render();
