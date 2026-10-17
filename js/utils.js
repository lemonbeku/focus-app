// utils: DOM + formatting helpers (no app state)
const $=id=>document.getElementById(id);
const dk=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmt=m=>m<60?m+'m':Math.floor(m/60)+'h '+(m%60)+'m';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
