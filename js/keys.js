// keys: keyboard shortcuts (ignored while typing in a field or with Ctrl/Cmd/Alt held)
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const t=e.target;
  if(t.closest&&t.closest('input,textarea,select,[contenteditable]'))return;
  const go=v=>{const b=document.querySelector(`nav [data-v="${v}"]`);if(b)b.click()};
  const k=e.key.toLowerCase(),tabs={t:'timer',p:'tasks',c:'cal',h:'hours'};
  if(e.key==='Escape'){mods.forEach(m=>$(m).classList.remove('on'));return}
  if(tabs[k]){go(tabs[k]);e.preventDefault();return}
  if(e.key==='?'){go('timer');openM('mSet');e.preventDefault();return}
  if(document.body.dataset.v!=='timer')return;          // the rest only works on the Timer screen
  if(e.code==='Space'){if(t.tagName==='BUTTON')return;$('go').click();e.preventDefault();return}
  if(k==='r')$('rs').click();
  else if(k==='f')$('skip').click();
  else if(k>='1'&&k<='3')document.querySelectorAll('#ptabs button')[+k-1].click();
  else if(k==='m'){if(S.yt)$('vpp').click()}
  else if(k==='n'){$('tl').classList.remove('c');$('qt').focus();e.preventDefault()}
});
