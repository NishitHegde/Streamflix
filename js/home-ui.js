/* Streamflix Home dynamic rails and premium interactions. */
(function(){
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const safe=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const poster=m=>m?.poster||m?.backdrop||'';
  const backdrop=m=>m?.backdrop||m?.poster||'';

  function card(id,m,rank){
    const rankHtml=rank?`<div class="rank-number" aria-hidden="true">${rank}</div>`:'';
    return `<article class="home-card ${rank?'rank-card':''}" data-home-id="${safe(id)}" tabindex="0" aria-label="Open ${safe(m.title)}">
      ${rankHtml}<div class="home-card-poster"><img src="${safe(poster(m))}" data-sf-id="${safe(id)}" alt="${safe(m.title)}" loading="lazy" onerror="this.onerror=null;this.src='assets/posters/poster-1.svg';this.classList.add('artwork-failed')">
        <div class="home-card-actions"><button type="button" data-home-play="${safe(id)}" aria-label="Play ${safe(m.title)}">▶</button><button type="button" data-home-add="${safe(id)}" aria-label="Add ${safe(m.title)} to My List">＋</button></div>
      </div><div class="home-card-copy"><h3 class="home-card-title">${safe(m.title)}</h3><div class="home-card-meta"><span class="match">${safe(m.match||'90%')} Match</span><span>${safe(m.year||'')}</span><span>${safe(m.type==='TV Series'?'Series':'Movie')}</span></div></div>
    </article>`;
  }

  function rail(title,sub,entries,opts={}){
    if(!entries.length)return '';
    const cards=entries.slice(0,opts.limit||12).map(([id,m],i)=>card(id,m,opts.rank?i+1:null)).join('');
    return `<section class="home-rail ${opts.className||''}"><div class="home-rail-head"><div><h2>${safe(title)}</h2>${sub?`<p>${safe(sub)}</p>`:''}</div>${opts.link?`<a class="home-see-all" href="${opts.link}">See all →</a>`:''}</div><div class="home-rail-row">${cards}</div></section>`;
  }

  function init(){
    if(!window.MOVIES)return;
    const all=Object.entries(MOVIES).filter(([,m])=>m&&(m.poster||m.backdrop));
    if(!all.length)return;
    const byType=(type)=>all.filter(([,m])=>m.type===type);
    const movies=byType('Movie'), shows=byType('TV Series');
    const hindi=all.filter(([,m])=>String(m.language||'').toLowerCase()==='hindi');
    const trending=[...all].sort((a,b)=>(parseInt(b[1].match)||0)-(parseInt(a[1].match)||0));
    const newHot=[...all].sort((a,b)=>(parseInt(b[1].year)||0)-(parseInt(a[1].year)||0));
    const rails=$('#homeRails'); if(!rails)return;
    rails.innerHTML=
      rail('Top 10 on Streamflix','The titles everyone is talking about right now.',trending,{rank:true,className:'home-numbered',limit:10,link:'trending.html'})+
      rail('Popular on Streamflix','Fan favorites across movies and series.',all,{limit:12})+
      (hindi.length?rail('Hindi Spotlight','Popular Hindi entertainment, all in one place.',hindi,{limit:10}):'')+
      rail('New & Hot','Fresh picks for your next watch.',newHot,{limit:12})+
      rail('Movie Night','Big-screen stories for tonight.',movies,{limit:10,link:'movies.html'})+
      rail('Binge-Worthy Series','Long nights. Great stories. No limits.',shows,{limit:10,link:'tvshows.html'});

    // One cinematic spotlight below the rails, using original catalog artwork.
    const pick=all.find(([id,m])=>m.title==='Money Heist')||all[0];
    const [pid,pm]=pick;
    const spotlight=document.createElement('section');
    spotlight.className='home-spotlight';
    spotlight.innerHTML=`<div class="home-spotlight-bg" style="background-image:url('${safe(backdrop(pm))}')"></div><div class="home-spotlight-content"><div class="home-spotlight-kicker">STREAMFLIX SPOTLIGHT</div><h2>${safe(pm.title)}</h2><p>${safe(pm.description||pm.overview||'Discover a fan-favorite story with original artwork, full streaming video and a premium viewing experience.')}</p><div class="home-spotlight-actions"><a class="primary" href="watch.html?id=${encodeURIComponent(pid)}">▶ Play Now</a><a class="secondary" href="movie-details.html?id=${encodeURIComponent(pid)}">ⓘ More Info</a></div></div>`;
    rails.appendChild(spotlight);

    const end=document.createElement('div');end.className='home-end';end.innerHTML='<strong>Ready for your next story?</strong><p>Explore the full Streamflix library and find something worth watching.</p><a href="movies.html">Browse All Titles</a>';rails.appendChild(end);

    // Card interactions.
    $$('.home-card',rails).forEach(c=>{
      const id=c.dataset.homeId;
      const open=()=>location.href=`movie-details.html?id=${encodeURIComponent(id)}`;
      c.addEventListener('click',e=>{if(e.target.closest('button'))return;open()});
      c.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.target.closest('button'))open()});
      $('[data-home-play]',c)?.addEventListener('click',e=>{e.stopPropagation();location.href=`watch.html?id=${encodeURIComponent(id)}`});
      $('[data-home-add]',c)?.addEventListener('click',e=>{
        e.stopPropagation();
        try{
          const key='streamflixMyList'; const list=JSON.parse(localStorage.getItem(key)||'[]');
          const exists=list.map(String).includes(String(id));
          const next=exists?list.filter(x=>String(x)!==String(id)):[...list,id];
          localStorage.setItem(key,JSON.stringify(next));
          e.currentTarget.textContent=exists?'＋':'✓';
          window.sfToast?.(exists?'Removed from My List':'Added to My List');
        }catch{}
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
