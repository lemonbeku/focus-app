// store: app state, persistence and read-only selectors
const KEY='focus10000v2',COL=['#f0b840','#5cc596','#6aa9ff','#e8738f','#b58cf0','#ff9a5c'];
const blank=()=>({projects:[{id:'p1',name:'My first project',goal:10000,color:COL[0],bonus:0}],tasks:[],plans:[],sessions:[],yt:'',fm:25,bm:5,cur:'p1',set:{},notes:'',saved:[],scene:'sunset',curTask:'',vbg:true});
let S=blank();
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{S.ua=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(window.cloudPush)cloudPush()};
const proj=id=>S.projects.find(p=>p.id===id);
const pcol=id=>(proj(id)||{color:'#888'}).color;
const popts=(all)=>(all?'<option value="">All projects</option>':'')+S.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
const pmin=id=>S.sessions.filter(s=>s.project===id).reduce((a,s)=>a+s.min,0);
const tmin=id=>S.sessions.filter(s=>s.task===String(id)).reduce((a,s)=>a+s.min,0);