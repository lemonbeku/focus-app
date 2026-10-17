// player
function ytId(u){const m=u.match(/(?:v=|youtu\.be\/|embed\/|live\/)([\w-]{11})/);return m?m[1]:/^[\w-]{11}$/.test(u)?u:null}
function ytPlay(u,auto){const id=ytId(u);if(!id)return false;S.yt=u;save();$('ytf').src='https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1&enablejsapi=1'+(auto?'&autoplay=1':'');$('yt').classList.add('has');return true}
$('ytm').onclick=()=>{const m=$('yt').classList.toggle('min');$('ytm').textContent=m?'Expand':'Minimize'};
document.body.dataset.v='timer';
let vPlay=true;
$('vpp').onclick=()=>{vPlay=!vPlay;try{$('ytf').contentWindow.postMessage(JSON.stringify({event:'command',func:vPlay?'playVideo':'pauseVideo',args:''}),'*')}catch(e){}};
if(S.yt)ytPlay(S.yt,false);

// video follows timer: plays while a focus phase is running, pauses otherwise (setting: Video follows timer)
function ytCmd(fn){try{$('ytf').contentWindow.postMessage(JSON.stringify({event:'command',func:fn,args:''}),'*')}catch(e){}}
let vLast=null;
function syncVideo(){
  if(!S.yt||!st().ytSync)return;
  const want=running&&ph==='work';
  if(want===vLast)return;
  vLast=want;vPlay=want;ytCmd(want?'playVideo':'pauseVideo');
}
