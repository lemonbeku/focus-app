// nav: switches between the four views
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.body.dataset.v=b.dataset.v;
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id===b.dataset.v));
  render();
});
