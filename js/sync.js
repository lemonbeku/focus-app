// sync: login + sinkron state S ke Supabase (tabel focus_state, satu baris per user)
(function(){
  const ok=typeof supabase!=='undefined'&&!SUPA_URL.includes('XXXX');
  if(!ok){$('accs').textContent='Cloud sync belum dikonfigurasi (isi js/config.js).';$('auth').classList.remove('on');return}
  const sb=supabase.createClient(SUPA_URL,SUPA_KEY);
  let user=null,t=null,skipped=false;
  const status=m=>$('accs').textContent=m;
  const msg=m=>$('amsg').textContent=m;

  function ui(){
    $('auth').classList.toggle('on',!user&&!skipped);
    $('accu').textContent=user?user.email:'Belum login (data hanya di browser ini)';
    $('aout').style.display=user?'':'none';
    $('ashow').style.display=user?'none':'';
  }

  async function push(){
    if(!user)return;
    const {error}=await sb.from('focus_state').upsert({user_id:user.id,data:S,updated_at:new Date().toISOString()});
    status(error?'Gagal menyimpan: '+error.message:'Tersimpan '+new Date().toLocaleTimeString());
  }
  async function pull(){
    if(!user)return;
    const {data,error}=await sb.from('focus_state').select('data').eq('user_id',user.id).maybeSingle();
    if(error){status('Gagal sinkron: '+error.message);return}
    if(!data){await push();return}               // akun baru: upload data lokal
    const r=data.data||{},ra=r.ua||0,la=S.ua||0;
    if(ra>la){                                    // cloud lebih baru: timpa lokal
      Object.keys(S).forEach(k=>delete S[k]);
      Object.assign(S,blank(),r);
      S.set=Object.assign({},D,S.set);
      try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
      if(!running)setPhase(ph);
      render();
      if(S.yt)ytPlay(S.yt,false);
      status('Tersinkron dari cloud');
    }else if(ra<la){await push()}                 // lokal lebih baru: kirim ke cloud
    else status('Tersinkron');
  }

  // dipanggil dari save() di store.js (di-debounce 1 detik)
  window.cloudPush=()=>{if(!user)return;status('Menyimpan…');clearTimeout(t);t=setTimeout(()=>{t=null;push()},1000)};

  sb.auth.onAuthStateChange((ev,sess)=>{
    user=sess?sess.user:null;ui();
    if(user&&(ev==='INITIAL_SESSION'||ev==='SIGNED_IN'))setTimeout(pull,0);
  });

  const creds=()=>({email:$('ae').value.trim(),password:$('ap').value});
  $('ain').onclick=async()=>{
    msg('Masuk…');
    const {error}=await sb.auth.signInWithPassword(creds());
    msg(error?error.message:'');
  };
  $('aup').onclick=async()=>{
    msg('Mendaftar…');
    const {data,error}=await sb.auth.signUp(creds());
    if(error)msg(error.message);
    else msg(data.session?'':'Cek email untuk konfirmasi, lalu login.');
  };
  $('askip').onclick=()=>{skipped=true;ui()};
  $('ashow').onclick=()=>{skipped=false;ui()};
  $('aout').onclick=async()=>{
    if(!confirm('Logout? Data lokal di browser ini akan dihapus (data tetap aman di cloud).'))return;
    if(t){clearTimeout(t);await push()}
    await sb.auth.signOut();
    try{localStorage.removeItem(KEY)}catch(e){}
    location.reload();
  };

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden'&&t){clearTimeout(t);t=null;push()}
    else if(document.visibilityState==='visible'&&user&&!running)pull();
  });
  ui();
})();