// modals: timer settings, theme, notes and sounds (music + noise) pop-ups
const mods=['mSnd','mThm','mSet','mNote'],fills={mSnd:()=>fSnd(),mThm:()=>fThm(),mSet:()=>fSet(),mNote:()=>fNote()};
function openM(id){mods.forEach(m=>$(m).classList.toggle('on',m===id));fills[id]()}
mods.forEach(m=>$(m).onclick=e=>{if(e.target===$(m))$(m).classList.remove('on')});
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>openM(b.dataset.m));
const xb=id=>$(id+'c').querySelector('[data-x]').onclick=()=>$(id).classList.remove('on');
const hdr=t=>`<div class="mh"><b>${t}</b><button data-x aria-label="Close">✕</button></div>`;
function fSet(){
  const s=st(),o=(k,v,t)=>`<button class="opt ${s[k]===v?'on':''}" data-o="${k}:${v}">${t}</button>`;
  const num=(k,l)=>`<div class="sr"><span>${l}</span><input type="number" min="1" max="240" data-n="${k}" value="${s[k]}"></div>`;
  const tg=(k,l)=>`<div class="sr"><span>${l}</span><input type="checkbox" data-t="${k}" ${s[k]?'checked':''}></div>`;
  const c=$('mSetc');
  c.innerHTML=hdr('Timer settings')+'<b>Timer style</b><div class="row">'+o('style','circle','⏱ Circle timer<br><small>Classic circular progress</small>')+o('style','num','🔢 Number clock<br><small>Large numeric display</small>')+'</div><b>Counting mode</b><div class="row">'+o('count','pomo','🍅 Pomodoro (countdown)')+o('count','flow','⏳ Flowmodoro (count up)')+'</div>'+num('work','Work duration (min)')+num('short','Short break (min)')+num('long','Long break (min)')+num('interval','Long break interval')+tg('autoB','Auto-start breaks')+tg('autoP','Auto-start pomodoros')+tg('sound','Notification sound')+tg('notify','Desktop notification when done')+tg('ytSync','Video follows timer')+'<b>Keyboard shortcuts</b><p class="m2">Space start/pause · R reset · F finish and log · 1 / 2 / 3 Pomodoro / Short / Long break · N new task · M video play/pause · T / P / C / H switch tab · Esc close · ? this panel</p>';
  xb('mSet');
  const reset=()=>{if(!running){setPhase(ph);draw()}};
  c.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const[k,v]=b.dataset.o.split(':');st()[k]=v;save();reset();renderStage();fSet()});
  c.querySelectorAll('[data-n]').forEach(i=>i.onchange=()=>{st()[i.dataset.n]=Math.max(1,+i.value||D[i.dataset.n]);save();reset()});
  c.querySelectorAll('[data-t]').forEach(i=>i.onchange=()=>{st()[i.dataset.t]=i.checked;save();if(i.dataset.t==='notify'&&i.checked)askNotif()});
}
function fThm(){
  const c=$('mThmc'),act=(S.vbg!==false&&S.yt)?'video':S.scene;
  c.innerHTML=hdr('Theme')+'<b>Background</b><div class="row">'+`<button class="opt ${act==='video'?'on':''}" data-sc="video">▶ YouTube video<br><small>${S.yt?'Plays behind your timer':'Choose a video in Sounds first'}</small></button>`+[['sunset','Golden hour'],['night','Night'],['forest','Forest'],['plain','Plain dark']].map(([k,l])=>`<button class="opt ${act===k?'on':''}" data-sc="${k}">${l}</button>`).join('')+'</div>';
  xb('mThm');
  c.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.sc;
    if(k==='video'){S.vbg=true;save();renderStage();if(!S.yt){openM('mSnd');return}}
    else{S.scene=k;S.vbg=false;save();renderStage()}
    fThm();
  });
}
function fNote(){
  const c=$('mNotec');
  c.innerHTML=hdr('Notes')+'<textarea id="nt" rows="12" style="width:100%" placeholder="Jot things down while you focus"></textarea>';
  $('nt').value=S.notes;$('nt').oninput=()=>{S.notes=$('nt').value;save()};xb('mNote');
}
let sndTab='music',ac,nz={},vol=.4;
function mkNoise(t){ac=ac||new AudioContext();const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let l=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;if(t==='white')d[i]=w*.5;else if(t==='brown'){l=(l+.02*w)/1.02;d[i]=l*3.5}else{l=.97*l+.03*w;d[i]=l*3}}
  const s=ac.createBufferSource();s.buffer=b;s.loop=true;const g=ac.createGain();g.gain.value=vol;s.connect(g);g.connect(ac.destination);s.start();return{s,g}}
function fSnd(){
  const c=$('mSndc'),tb=(k,l)=>`<button class="tab ${sndTab===k?'on':''}" data-tb="${k}">${l}</button>`;
  let body;
  if(sndTab==='music')body=`<b>YouTube video</b><div class="row"><input id="yturl" placeholder="Paste YouTube URL" value="${esc(S.yt)}" style="flex:1;min-width:0"><button class="p" id="ytgo">Play</button></div><div class="row"><input id="ytname" placeholder="Name (to save it)" style="flex:1;min-width:0"><button class="g" id="ytsv">Save</button></div><p class="m2" id="ytmsg"></p><div class="sr"><span>Use video as background</span><input type="checkbox" id="vbtog" ${S.vbg!==false?'checked':''}></div><b>Saved videos</b>`+(S.saved.length?S.saved.map((v,i)=>`<div class="sv"><span data-pl="${i}">▶ ${esc(v.name)}</span><button data-rm="${i}" aria-label="Remove">✕</button></div>`).join(''):'<p class="m2">No saved videos yet. Add your favorites to build a playlist.</p>');
  else body=`<b>Background noise</b><div class="row">`+[['white','White'],['pink','Soft'],['brown','Deep']].map(([k,l])=>`<button class="opt ${nz[k]?'on':''}" data-nz="${k}">${l}</button>`).join('')+`</div><label class="m2">Volume <input type="range" min="0" max="1" step=".05" value="${vol}" id="vol"></label>`;
  c.innerHTML=`<div class="mh"><span>${tb('music','Music')}${tb('noise','Noise')}</span><button data-x aria-label="Close">✕</button></div>`+body;
  xb('mSnd');
  c.querySelectorAll('[data-tb]').forEach(b=>b.onclick=()=>{sndTab=b.dataset.tb;fSnd()});
  if(sndTab==='music'){
    $('ytgo').onclick=()=>{if(!ytPlay($('yturl').value.trim(),true))$('ytmsg').textContent='That does not look like a YouTube link.'};
    $('ytsv').onclick=()=>{const u=$('yturl').value.trim();if(!ytId(u)){$('ytmsg').textContent='Paste a valid YouTube link first.';return}S.saved.push({u,name:$('ytname').value.trim()||'Video '+(S.saved.length+1)});save();fSnd()};
    $('vbtog').onchange=()=>{S.vbg=$('vbtog').checked;save();renderStage()};
    c.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{ytPlay(S.saved[b.dataset.pl].u,true);$('yturl').value=S.yt});
    c.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{S.saved.splice(b.dataset.rm,1);save();fSnd()});
  }else{
    c.querySelectorAll('[data-nz]').forEach(b=>b.onclick=()=>{const k=b.dataset.nz;if(nz[k]){nz[k].s.stop();delete nz[k]}else nz[k]=mkNoise(k);fSnd()});
    $('vol').oninput=()=>{vol=+$('vol').value;Object.values(nz).forEach(n=>n.g.gain.value=vol)};
  }
}
