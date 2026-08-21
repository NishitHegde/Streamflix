(function(){
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const Admin=()=>window.StreamflixAdmin;
  let editing=null;
  const toast=t=>{const x=$('#toast'); if(!x)return; x.textContent=t; x.classList.add('show'); clearTimeout(window.__st); window.__st=setTimeout(()=>x.classList.remove('show'),2200)};
  const catalog=()=>Admin().loadCatalog();
  const isAuth=()=>sessionStorage.getItem('streamflix_admin_auth')==='1';
  function requireAuth(){
    if(!isAuth()){
      location.replace('login.html');
      return false;
    }
    return true;
  }
  function setView(){
    if(!requireAuth()) return;
    $('#adminApp').hidden=false;
    switchSection('dashboard');
    renderAll();
  }
  $('#adminLogout')?.addEventListener('click',()=>{
    sessionStorage.removeItem('streamflix_admin_auth');
    sessionStorage.removeItem('streamflix_login_role');
    location.replace('login.html');
  });
  function switchSection(id){
    if(!isAuth()) return location.replace('login.html');
    $$('.admin-section').forEach(x=>x.classList.toggle('active',x.id===id));
    $$('.nav-item[data-section]').forEach(x=>x.classList.toggle('active',x.dataset.section===id));
    const names={dashboard:'Dashboard',content:'Content Library',users:'Users',trending:'Trending Manager',analytics:'Analytics',settings:'Site Settings'};
    $('#pageTitle').textContent=names[id]||'Dashboard';
    if(id==='content') renderContent(); if(id==='users') renderUsers(); if(id==='trending') renderTrending(); if(id==='analytics') renderAnalytics(); if(id==='settings') renderSettings();
  }
  $$('[data-section]').forEach(b=>b.addEventListener('click',()=>switchSection(b.dataset.section)));
  $$('[data-section-go]').forEach(b=>b.addEventListener('click',()=>switchSection(b.dataset.sectionGo)));
  function stats(){
    const vals=Object.values(catalog());
    $('#statMovies').textContent=vals.filter(x=>x.type==='Movie').length;
    $('#statShows').textContent=vals.filter(x=>x.type==='TV Series').length;
    let users=[]; try{users=JSON.parse(localStorage.getItem('streamflix_users')||'[]')}catch(e){}
    $('#statUsers').textContent=users.length||1;
    $('#statTrending').textContent=Admin().getTrending().length||Math.min(10,vals.length);
  }
  function renderRecent(){
    const vals=Object.values(catalog()).slice(-6).reverse();
    $('#recentContent').innerHTML=vals.map(x=>`<div class="recent-item"><img src="${x.poster||''}" onerror="this.src='assets/posters/poster-1.svg'"><div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.type||'Movie')} • ${escapeHtml(x.language||'English')}</small></div></div>`).join('')||'<p>No content yet. Add your first title.</p>';
  }
  const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function renderContent(){
    const q=($('#contentSearch')?.value||'').toLowerCase(), type=$('#contentType')?.value||'all';
    const vals=Object.entries(catalog()).filter(([id,x])=>(type==='all'||x.type===type)&&JSON.stringify(x).toLowerCase().includes(q));
    $('#contentRows').innerHTML=vals.map(([id,x])=>`<tr><td><img src="${x.poster||''}" onerror="this.src='assets/posters/poster-1.svg'"></td><td><b>${escapeHtml(x.title)}</b></td><td>${escapeHtml(x.type||'Movie')}</td><td>${escapeHtml(x.year||'—')}</td><td>${escapeHtml(x.language||'English')}</td><td>${escapeHtml(x.genres||'—')}</td><td><div class="table-actions"><button class="mini" data-edit="${escapeHtml(id)}">Edit</button><button class="mini red" data-delete="${escapeHtml(id)}">Delete</button></div></td></tr>`).join('')||'<tr><td colspan="7">No matching content.</td></tr>';
  }
  $('#contentSearch')?.addEventListener('input',renderContent); $('#contentType')?.addEventListener('change',renderContent);
  function setModalOpen(open){const m=$('#modal'); if(!m)return; m.hidden=!open; m.style.display=open?'grid':'none'; document.body.classList.toggle('modal-open',open);}
  function openModal(id,type){
    editing=id||null; setModalOpen(true); $('#modalTitle').textContent=id?'Edit Content':'Add Content';
    const x=id?catalog()[id]:{type:type||'Movie',language:'Hindi',rating:'13+',match:'90%',genres:'Drama',cast:[]};
    $('#editId').value=id||''; $('#fTitle').value=x.title||''; $('#fType').value=x.type||'Movie'; $('#fYear').value=x.year||''; $('#fLanguage').value=x.language||'Hindi'; $('#fRating').value=x.rating||'13+'; $('#fMatch').value=x.match||'90%';
    $('#fPoster').value=(x.poster||'').startsWith('data:')?'':(x.poster||''); $('#fBackdrop').value=(x.backdrop||'').startsWith('data:')?'':(x.backdrop||'');
    $('#fPosterFile').value=''; $('#fBackdropFile').value=''; $('#fTrailer').value=x.videoUrl||x.trailer||''; $('#fGenres').value=x.genres||''; $('#fCast').value=(x.cast||[]).join(', '); $('#fDescription').value=x.description||'';
    setTimeout(()=>$('#fTitle').focus(),60);
  }
  function closeModal(){const f=$('#contentForm'); if(f)f.reset(); $('#editId').value=''; editing=null; setModalOpen(false);}
  document.addEventListener('click',e=>{const b=e.target.closest('#modalClose,#cancelModal'); if(b){e.preventDefault(); closeModal();}});
  $('#modal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal()});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action]'); if(b&&(b.dataset.action==='add-movie'||b.dataset.action==='add-show'))openModal(null,b.dataset.action==='add-show'?'TV Series':'Movie')});
  $('#contentRows')?.addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]'); if(edit)openModal(edit.dataset.edit); if(del&&confirm('Delete this title?')){const c=catalog(); delete c[del.dataset.delete]; Admin().saveCatalog(c); renderAll(); toast('Content deleted');}});
  function readFile(file){return new Promise((resolve,reject)=>{if(!file)return resolve(''); const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file);})}
  $('#contentForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const title=$('#fTitle').value.trim(); if(!title){toast('Enter a title');$('#fTitle').focus();return;}
    const type=$('#fType').value, year=$('#fYear').value;
    if(year&&(Number(year)<1900||Number(year)>2100)){toast('Enter a valid year');return;}
    const c=catalog(), id=$('#editId').value||('admin_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)), old=c[id]||{};
    // Prevent accidental duplicate titles while still allowing edits.
    const duplicate=Object.entries(c).some(([key,x])=>key!==id && String(x.title||'').trim().toLowerCase()===title.toLowerCase() && x.type===type);
    if(duplicate){toast('That title already exists in this category');return;}
    const posterUpload=await readFile($('#fPosterFile').files[0]), backdropUpload=await readFile($('#fBackdropFile').files[0]);
    const poster=posterUpload||$('#fPoster').value.trim()||old.poster||`assets/posters/poster-1.svg`;
    const backdrop=backdropUpload||$('#fBackdrop').value.trim()||old.backdrop||poster;
    const videoUrl=$('#fTrailer').value.trim()||old.videoUrl||'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    c[id]={...old,id,title,type,year:year||String(new Date().getFullYear()),rating:$('#fRating').value.trim()||'13+',match:$('#fMatch').value.trim()||'90%',language:$('#fLanguage').value.trim()||'English',poster,backdrop,genres:$('#fGenres').value.trim()||'Drama',cast:$('#fCast').value.split(',').map(x=>x.trim()).filter(Boolean),description:$('#fDescription').value.trim(),videoUrl};
    try{Admin().saveCatalog(c); closeModal(); renderAll(); toast(editing?'Content updated successfully':'New content added successfully'); switchSection('content');}catch(err){toast('Could not save. Browser storage may be full.');}
  });
  function renderUsers(){let users=[];try{users=JSON.parse(localStorage.getItem('streamflix_users')||'[]')}catch(e){} if(!users.length)users=[{id:'demo',name:'Demo User',email:'demo@streamflix.local',plan:'Premium',status:'Active'}]; $('#userRows').innerHTML=users.map((u,i)=>`<tr><td>${escapeHtml(u.name||u.username||'User '+(i+1))}</td><td>${escapeHtml(u.email||'—')}</td><td>${escapeHtml(u.plan||'Free')}</td><td>${escapeHtml(u.status||'Active')}</td><td><button class="mini" data-toggle-user="${escapeHtml(u.id||i)}">${(u.status||'Active')==='Active'?'Deactivate':'Activate'}</button></td></tr>`).join('')}
  $('#userSearch')?.addEventListener('input',()=>{$$('#userRows tr').forEach(r=>r.style.display=r.textContent.toLowerCase().includes($('#userSearch').value.toLowerCase())?'':'none')});
  $('#userRows')?.addEventListener('click',e=>{const b=e.target.closest('[data-toggle-user]');if(!b)return;let users=JSON.parse(localStorage.getItem('streamflix_users')||'[]');const u=users.find(x=>String(x.id)===b.dataset.toggleUser)||users[Number(b.dataset.toggleUser)];if(u){u.status=u.status==='Active'?'Inactive':'Active';localStorage.setItem('streamflix_users',JSON.stringify(users));renderUsers();toast('User status updated')}});
  function renderTrending(){const c=catalog(),ids=Admin().getTrending(),ordered=[...ids,...Object.keys(c).filter(id=>!ids.includes(id))]; $('#trendingList').innerHTML=ordered.map((id,i)=>{const x=c[id];if(!x)return '';return `<div class="trend-admin-item"><input type="checkbox" data-trend="${escapeHtml(id)}" ${ids.includes(id)?'checked':''}><b>#${i+1}</b><img src="${x.poster||''}"><div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.type||'')} • ${escapeHtml(x.language||'')}</small></div><button class="mini" data-up="${escapeHtml(id)}">↑</button></div>`}).join('')||'<p>No content available.</p>'}
  $('#saveTrending')?.addEventListener('click',()=>{Admin().setTrending($$('#trendingList [data-trend]:checked').map(x=>x.dataset.trend));toast('Trending updated');stats()});
  $('#trendingList')?.addEventListener('click',e=>{const b=e.target.closest('[data-up]');if(!b)return;const item=b.closest('.trend-admin-item');if(item?.previousElementSibling)item.parentElement.insertBefore(item,item.previousElementSibling)});
  function renderAnalytics(){const vals=Object.values(catalog()),genres={};vals.forEach(x=>(x.genres||'').split('•').forEach(g=>{g=g.trim();if(g)genres[g]=(genres[g]||0)+1}));const top=Object.entries(genres).sort((a,b)=>b[1]-a[1])[0];$('#aCatalog').textContent=vals.length;$('#aMovieShare').textContent=(vals.length?Math.round(vals.filter(x=>x.type==='Movie').length/vals.length*100):0)+'%';$('#aHindi').textContent=vals.filter(x=>x.language==='Hindi').length;$('#aGenre').textContent=top?top[0]:'—';const max=Math.max(1,...Object.values(genres));$('#genreBars').innerHTML=Object.entries(genres).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([g,n])=>`<div class="bar-row"><span>${escapeHtml(g)}</span><div class="bar"><i style="width:${n/max*100}%"></i></div><b>${n}</b></div>`).join('')||'<p>No genres yet.</p>'}
  function renderSettings(){const s=Admin().getSettings();$('#siteName').value=s.siteName||'Streamflix';$('#heroTitle').value=s.heroTitle||'Unlimited movies, shows and more.';$('#defaultLanguage').value=s.defaultLanguage||'English';$('#allowSignups').checked=s.allowSignups!==false;$('#showTrending').checked=s.showTrending!==false}
  $('#saveSettings')?.addEventListener('click',()=>{Admin().setSettings({siteName:$('#siteName').value,heroTitle:$('#heroTitle').value,defaultLanguage:$('#defaultLanguage').value,allowSignups:$('#allowSignups').checked,showTrending:$('#showTrending').checked});toast('Settings saved')});
  $('#exportBtn')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({catalog:catalog(),trending:Admin().getTrending(),settings:Admin().getSettings()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='streamflix-admin-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
  $('#importFile')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.catalog)Admin().saveCatalog(d.catalog);if(d.trending)Admin().setTrending(d.trending);if(d.settings)Admin().setSettings(d.settings);renderAll();toast('Backup imported')}catch(err){toast('Invalid JSON backup')}e.target.value=''});
  function renderAll(){stats();renderRecent();renderContent();renderUsers();renderTrending();renderAnalytics();renderSettings()}
  window.addEventListener('streamflix:catalog',()=>{if(isAuth())renderAll()});
  setView();
})();

/* Admin dashboard loading feedback */
(function(){
  function loader(){
    let l=document.querySelector('.sf-page-loader');
    if(l)return l;
    l=document.createElement('div');
    l.className='sf-page-loader';
    l.innerHTML='<div class="sf-loader-box"><div class="sf-loader-ring"></div><div class="sf-loader-text">Loading dashboard…</div></div>';
    document.body.appendChild(l);
    return l;
  }
  function show(){
    loader().classList.add('show');
    document.body.classList.add('sf-loading');
    setTimeout(()=>{
      document.querySelector('.sf-page-loader')?.classList.remove('show');
      document.body.classList.remove('sf-loading');
    },480);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,.nav-item');
    if(!b || b.id==='toggleAdminPass' || b.id==='modalClose' || b.id==='cancelModal')return;
    show();
  },true);
})();
