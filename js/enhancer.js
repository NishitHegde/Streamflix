
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const getStore=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}};
  const setStore=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=(msg)=>{
    let t=$('.sf-toast'); if(!t){t=document.createElement('div');t.className='sf-toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);
  };
  window.sfToast=toast;

  // Premium navbar tools
  const nav=$('.navbar');
  if(nav){
    // Responsive navigation: keeps the desktop layout intact and adds a compact mobile drawer.
    const links=$('.navbar-links',nav);
    if(links){
      const menu=document.createElement('button');
      menu.className='sf-menu-btn'; menu.type='button'; menu.setAttribute('aria-label','Open navigation');
      menu.setAttribute('aria-expanded','false');
      menu.innerHTML='<span></span><span></span><span></span>';
      nav.insertBefore(menu, links);
      const closeMenu=()=>{links.classList.remove('sf-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')};
      menu.onclick=()=>{const open=links.classList.toggle('sf-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')};
      $$('.navbar-links a',links).forEach(a=>a.addEventListener('click',closeMenu));
      document.addEventListener('click',e=>{if(!nav.contains(e.target))closeMenu()});
      const current=location.pathname.split('/').pop().toLowerCase() || 'home.html';
      $$('.navbar-links a',links).forEach(a=>{
        const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0].toLowerCase();
        if(href===current)a.classList.add('active');
      });
    }
    const actions=$('.navbar-actions',nav);
    if(actions){
      const searchLink=$('a[href="search.html"]',actions);
      if(searchLink) searchLink.classList.add('sf-nav-icon'), searchLink.setAttribute('aria-label','Search');
      const sunIcon=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      const moonIcon=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      const isLight=localStorage.getItem('sfTheme')==='light';
      const theme=document.createElement('button');
      theme.className='sf-theme-btn';theme.type='button';theme.title='Toggle theme';theme.setAttribute('aria-label','Toggle theme');
      theme.innerHTML=isLight?moonIcon:sunIcon;
      theme.onclick=(e)=>{
        if(e){e.preventDefault();e.stopPropagation();}
        const light=document.body.classList.toggle('sf-light');
        document.documentElement.classList.toggle('sf-light',light);
        localStorage.setItem('sfTheme',light?'light':'dark');
        theme.innerHTML=light?moonIcon:sunIcon;
        toast(light?'Light mode enabled':'Dark mode enabled');
      };
      actions.prepend(theme);
      const profile=$('a[href="profiles.html"]',actions);
      if(profile){profile.classList.add('sf-avatar');profile.textContent=(localStorage.getItem('streamflixProfile')||'N').slice(0,1).toUpperCase();profile.title='Profiles'}
    }
    if(localStorage.getItem('sfTheme')==='light'){
      document.body.classList.add('sf-light');
      document.documentElement.classList.add('sf-light');
    }
  }

  // Scroll effects + back-to-top
  const top=document.createElement('button');top.className='sf-top';top.innerHTML='↑';top.title='Back to top';top.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.appendChild(top);
  const scrollFx=()=>{nav?.classList.toggle('scrolled',scrollY>20);top.classList.toggle('show',scrollY>450)};addEventListener('scroll',scrollFx);scrollFx();

  // Keyboard shortcuts
  addEventListener('keydown',e=>{
    if(e.key==='/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();location.href='search.html'}
    if(e.key==='Escape')$('.sf-modal')?.classList.remove('show');
  });

  // Search autocomplete on search page
  const searchInput=$('.search-input');
  if(searchInput && window.MOVIES){
    const wrap=document.createElement('div');wrap.className='sf-search-wrap';
    searchInput.parentNode.insertBefore(wrap,searchInput);wrap.appendChild(searchInput);
    const suggest=document.createElement('div');suggest.className='sf-search-suggest';wrap.appendChild(suggest);
    const all=Object.entries(MOVIES);
    const render=(q)=>{
      const hits=all.filter(([id,m])=>m.title.toLowerCase().includes(q.toLowerCase())).slice(0,5);
      suggest.innerHTML=hits.map(([id,m])=>`<div class="sf-suggest-item" data-id="${id}"><img src="${m.poster}" alt=""><div><b>${m.title}</b><small>${m.type} • ${m.year}</small></div></div>`).join('');
      suggest.classList.toggle('show',!!q&&hits.length>0);
      $$('.sf-suggest-item',suggest).forEach(x=>x.onclick=()=>location.href=`movie-details.html?id=${x.dataset.id}`);
    };
    searchInput.addEventListener('input',e=>render(e.target.value));
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))suggest.classList.remove('show')});
  }

  // Strict catalog separation: Movies page renders only Movie records; TV Shows only TV Series.
  // This guard also removes any stale/static cards before rebuilding the grid.
  const path=location.pathname.toLowerCase();
  const category=path.endsWith('/tvshows.html')?'TV Series':path.endsWith('/movies.html')?'Movie':null;
  if(category && window.MOVIES){
    const grid=$('.movie-grid');
    if(grid){
      const seenTitles=new Set();
      const ids=Object.entries(MOVIES).filter(([,m])=>{
        if(m.type!==category)return false;
        const key=String(m.title||'').trim().toLowerCase();
        if(!key || seenTitles.has(key))return false;
        seenTitles.add(key);
        return true;
      });
      grid.innerHTML=ids.map(([id,m])=>`
        <article class="movie-card" data-id="${id}" data-title="${m.title}" data-type="${m.type}">
          <div class="poster"><img src="${m.poster}" alt="${m.title}" loading="lazy">
            <div class="overlay"><button type="button" data-play="${id}" aria-label="Play">▶</button><button type="button" data-add="${id}" aria-label="Add to My List">＋</button></div>
          </div>
          <div class="movie-info"><h3>${m.title}</h3><div class="meta"><span class="match">${m.match} Match</span><span>${m.year}</span><span>${m.rating}</span><span>${m.language||"English"}</span></div></div>
        </article>`).join('');
      $$('.movie-card',grid).forEach(card=>{
        const id=card.dataset.id;
        card.onclick=e=>{if(e.target.closest('[data-add],[data-play]'))return;location.href=`movie-details.html?id=${id}`};
        $('[data-play]',card)?.addEventListener('click',e=>{e.stopPropagation();location.href=`watch.html?id=${id}`});
        $('[data-add]',card)?.addEventListener('click',e=>{e.stopPropagation();toggleList(id)});
        $('img',card)?.addEventListener('error',e=>{e.currentTarget.src='assets/posters/poster-1.svg'});
      });
    }
    addCategoryChips(category);
  }
function toggleList(id){
    const list=getStore('myList',[]).map(String), sid=String(id), exists=list.includes(sid);
    const next=exists?list.filter(x=>x!==sid):[...list,sid];setStore('myList',next);
    toast(exists?'Removed from My List':'Added to My List ✓');
    $(`[data-add="${id}"]`)?.replaceChildren(document.createTextNode(exists?'＋':'✓'));
  }

  function saveProgress(id){
    const progress=getStore('sfProgress',{});
    progress[id]={value:Math.max(15,Math.min(92,progress[id]?.value||37)),updated:Date.now()};
    setStore('sfProgress',progress);
  }

  function addCategoryChips(category){
    const grid=$('.movie-grid');if(!grid||$('.sf-chips'))return;
    const sec=grid.closest('.section')||grid.parentElement;
    const chips=document.createElement('div');chips.className='sf-chips';
    const genres=['All','Hindi','Action','Comedy','Drama','Romance','Thriller','Crime','Family','Mystery','Fantasy','Horror','Sci-Fi','Sports'];
    chips.innerHTML=genres.map((g,i)=>`<button class="sf-chip ${i===0?'active':''}" data-genre="${g}">${g}</button>`).join('');
    sec.insertBefore(chips,grid);
    $$('.sf-chip',chips).forEach(b=>b.onclick=()=>{
      $$('.sf-chip',chips).forEach(x=>x.classList.remove('active'));b.classList.add('active');
      const q=b.dataset.genre.toLowerCase();
      $$('.movie-card',grid).forEach(c=>{const m=MOVIES[c.dataset.id]; if(!m){c.style.display='none';return} const text=((m?.genres||'')+' '+(m?.title||'')).toLowerCase(); const ok=q==='all'||(q==='hindi'&&m.language==='Hindi')||text.includes(q); c.style.display=ok?'':'none'});
    });
  }

  // Home: normal Continue Watching rail (no cinematic stage).
  if(path.endsWith('/home.html') && window.MOVIES){
    const hero=$('.hero'), firstSection=$$('.section')[0];
    const allEntries=Object.entries(MOVIES).filter(([,m])=>m && (m.poster||m.backdrop));
    const progress=getStore('sfProgress',{});
    const watched=Object.entries(progress)
      .filter(([id,p])=>MOVIES[id] && Number(p?.value||0)>0 && Number(p?.value||0)<100)
      .sort((a,b)=>(b[1].updated||0)-(a[1].updated||0));
    // Continue Watching must stay hidden until the user has actually started watching something.
    const ids=watched.map(([id])=>id).slice(0,8);

    function safe(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

    // Keep the existing home hero interactive without adding another cinematic section.
    function setHero(id){
      if(!hero || !MOVIES[id]) return;
      const m=MOVIES[id], bg=m.backdrop||m.poster;
      const heroBg=$('.hero-bg',hero), title=$('.hero-content h1',hero), desc=$('.hero-description',hero), meta=$('.hero-meta',hero), kicker=$('.hero-content>span',hero);
      if(heroBg && bg){
        heroBg.classList.remove('sf-hero-switch'); void heroBg.offsetWidth;
        heroBg.style.backgroundImage=`linear-gradient(90deg,#000 0%,#000d 30%,#0005 70%,transparent),linear-gradient(0deg,#080808,transparent 45%),url("${String(bg).replace(/"/g,'\\"')}")`;
        heroBg.classList.add('sf-hero-switch');
      }
      if(title) title.textContent=m.title||'Streamflix';
      if(kicker) kicker.textContent=m.type==='TV Series'?'N SERIES • FEATURED':'STREAMFLIX ORIGINAL';
      if(meta) meta.innerHTML=[m.match?`${safe(m.match)} Match`:'',m.year||'',m.rating||'',m.type||''].filter(Boolean).map((v,i)=>`<span class="${i===0?'match':''}">${v}</span>`).join('');
      if(desc) desc.textContent=m.description||m.overview||`Watch ${m.title||'this title'} on Streamflix.`;
      const play=$('.hero-buttons .btn.light',hero), info=$('.hero-buttons .btn.dark',hero);
      if(play) play.href=`watch.html?id=${encodeURIComponent(id)}`;
      if(info) info.href=`movie-details.html?id=${encodeURIComponent(id)}`;
      hero.dataset.activeId=id;
    }

    $$('.movie-card[data-id], .trend-card[data-target]').forEach(card=>{
      let id=card.dataset.id;
      if(!id && card.dataset.target){id=new URLSearchParams(card.dataset.target.split('?')[1]||'').get('id');}
      if(!id || !MOVIES[id] || card.dataset.sfHeroBound) return;
      card.dataset.sfHeroBound='1';
      card.addEventListener('click',e=>{if(e.target.closest('button,a')) return;setHero(id)});
    });

    if(hero && ids.length){
      const section=document.createElement('section');
      section.className='section sf-normal-cw';
      section.innerHTML=`
        <div class="sf-section-head"><h2 class="section-title">Continue Watching</h2><a class="sf-see-all" href="mylist.html">View My List →</a></div>
        <div class="sf-continue">${ids.map(id=>{
          const m=MOVIES[id], p=watched.find(x=>String(x[0])===String(id));
          const pct=p?Math.round(Number(p[1]?.value||0)):37;
          return `<article class="sf-progress-card" data-cw-id="${safe(id)}">
            <img class="sf-progress-poster" data-sf-id="${safe(id)}" src="${safe(m.poster||m.backdrop)}" alt="${safe(m.title)}" loading="lazy">
            <div class="sf-progress-info">
              <h3>${safe(m.title)}</h3>
              <p>${safe(m.type)} • ${safe(m.year)} • ${safe(m.rating||'')}</p>
              <div class="sf-progress-bar" title="${Math.min(99,pct)}% watched"><span style="width:${Math.min(99,pct)}%"></span></div>
              <div class="sf-progress-actions"><button type="button" class="sf-continue-btn" data-cw-play="${safe(id)}">▶ Continue</button><button type="button" class="sf-remove-cw" data-cw-remove="${safe(id)}" aria-label="Remove ${safe(m.title)}">×</button></div>
            </div>
          </article>`;
        }).join('')}</div>`;
      firstSection?.parentNode?.insertBefore(section,firstSection);

      $$('.sf-progress-card',section).forEach(card=>{
        const id=card.dataset.cwId;
        card.addEventListener('click',e=>{
          if(e.target.closest('[data-cw-remove]')) return;
          setHero(id);
          if(!e.target.closest('[data-cw-play]')) location.href=`movie-details.html?id=${encodeURIComponent(id)}`;
        });
        $('[data-cw-play]',card)?.addEventListener('click',e=>{e.stopPropagation();location.href=`watch.html?id=${encodeURIComponent(id)}`});
        $('[data-cw-remove]',card)?.addEventListener('click',e=>{
          e.stopPropagation();
          const p=getStore('sfProgress',{}); delete p[id]; setStore('sfProgress',p);
          card.remove();
          if(!section.querySelector('.sf-progress-card')) section.remove();
          toast('Removed from Continue Watching');
        });
        $('img',card)?.addEventListener('error',e=>{e.currentTarget.src='assets/posters/poster-1.svg'});
      });
      setHero(ids[0]);
    }

    // Normal home cards can still update the hero when selected.
    $$('.movie-card[data-id]').forEach(card=>{
      if(card.dataset.sfHeroBound2) return;
      const id=card.dataset.id; if(!MOVIES[id]) return;
      card.dataset.sfHeroBound2='1';
      card.addEventListener('click',e=>{if(e.target.closest('button,a')) return;setHero(id)});
    });
  }

  // Premium category-page UI for Movies and TV Shows.
  if(category && window.MOVIES){
    const main=$('main.category');
    const grid=$('.movie-grid');
    if(main && grid){
      const entries=Object.entries(MOVIES).filter(([,m])=>m.type===category && (m.backdrop||m.poster));
      const featured=entries[0]?.[1];
      if(featured && !$('.sf-category-hero',main)){
        main.classList.add('sf-category-page');
        const heroSection=document.createElement('section');
        heroSection.className='sf-category-hero';
        heroSection.style.backgroundImage=`linear-gradient(90deg,rgba(5,5,7,.98) 0%,rgba(5,5,7,.82) 38%,rgba(5,5,7,.25) 75%,rgba(5,5,7,.72) 100%),url("${String(featured.backdrop||featured.poster).replace(/"/g,'\\"')}")`;
        const label=category==='Movie'?'MOVIE COLLECTION':'SERIES COLLECTION';
        const title=category==='Movie'?'Movies for every mood':'Binge-worthy TV Shows';
        heroSection.innerHTML=`<div class="sf-category-copy"><span class="sf-category-kicker">${label}</span><h2>${title}</h2><p>Discover hand-picked ${category==='Movie'?'movies':'series'} with fresh picks, Hindi favourites and crowd-loved titles.</p><div class="sf-category-stats"><span><b>${entries.length}+</b> Titles</span><span><b>4K</b> Ready</span><span><b>HD</b> Streaming</span></div><div class="sf-category-actions"><a class="btn light" href="movie-details.html?id=${encodeURIComponent(entries[0][0])}">Explore Featured</a><a class="btn dark" href="${category==='Movie'?'trending.html':'movies.html'}">${category==='Movie'?'See Trending':'Browse Movies'}</a></div></div>`;
        main.insertBefore(heroSection,grid);
        const oldTitle=main.querySelector(':scope > h1');
        const oldSub=oldTitle?.nextElementSibling;
        oldTitle?.classList.add('sf-category-original-title');
        oldSub?.classList.add('sf-category-original-subtitle');
      }
    }
  }

  // Premium Trending page: ranked poster grid with a featured backdrop.
  if(path.endsWith('/trending.html') && window.MOVIES){
    const main=$('main.category');
    if(main && !$('.sf-trending-page',main)){
      const ranked=Object.entries(MOVIES).filter(([,m])=>m && (m.poster||m.backdrop)).sort((a,b)=>(parseInt(b[1].match)||0)-(parseInt(a[1].match)||0)).slice(0,12);
      const featured=ranked[0]?.[1];
      main.classList.add('sf-trending-page');
      if(featured){
        const hero=document.createElement('section');hero.className='sf-trending-feature';
        hero.style.backgroundImage=`linear-gradient(90deg,rgba(4,4,6,.98) 0%,rgba(4,4,6,.8) 40%,rgba(4,4,6,.2) 78%,rgba(4,4,6,.7)),url("${String(featured.backdrop||featured.poster).replace(/"/g,'\\"')}")`;
        hero.innerHTML=`<div class="sf-trending-feature-copy"><span class="sf-category-kicker">#1 TRENDING TODAY</span><h2>${safe(featured.title)}</h2><div class="sf-trending-meta"><b>${safe(featured.match||'') } Match</b><span>${safe(featured.year||'')}</span><span>${safe(featured.rating||'')}</span><span>${safe(featured.type||'')}</span></div><p>Everyone is watching ${safe(featured.title)}. Jump in and see why it's trending on Streamflix.</p><div class="sf-category-actions"><a class="btn light" href="watch.html?id=${encodeURIComponent(ranked[0][0])}">▶ Watch Now</a><a class="btn dark" href="movie-details.html?id=${encodeURIComponent(ranked[0][0])}">ⓘ More Info</a></div></div>`;
        main.appendChild(hero);
      }
      const grid=document.createElement('section');grid.className='sf-trending-page sf-trending-showcase';
      grid.innerHTML=`<div class="sf-section-head"><div><h2 class="section-title">Trending Now</h2><p class="sf-section-subtitle">The most-watched titles on Streamflix right now.</p></div></div><div class="sf-trending-grid">${ranked.map(([id,m],i)=>`<article class="sf-rank-card" data-id="${safe(id)}"><div class="sf-rank-number">${String(i+1).padStart(2,'0')}</div><div class="sf-rank-poster"><img src="${safe(m.poster||m.backdrop)}" alt="${safe(m.title)}" loading="lazy"><div class="sf-rank-overlay"><span>${safe(m.type)}</span><button type="button" data-rank-play="${safe(id)}">▶</button></div></div><div class="sf-rank-info"><h3>${safe(m.title)}</h3><div><span class="match">${safe(m.match||'')} Match</span><span>${safe(m.year||'')}</span><span>${safe(m.rating||'')}</span></div></div></article>`).join('')}</div>`;
      main.appendChild(grid);
      $$('.sf-rank-card',grid).forEach(card=>{
        const id=card.dataset.id;
        card.addEventListener('click',e=>{if(e.target.closest('button'))return;location.href=`movie-details.html?id=${encodeURIComponent(id)}`});
        $('[data-rank-play]',card)?.addEventListener('click',e=>{e.stopPropagation();saveProgress(id);location.href=`watch.html?id=${encodeURIComponent(id)}`});
      });
      $('.sf-trending-section')?.classList.add('sf-legacy-trending');
    }
  }

  // Card buttons on pages that still use static cards
  $$('.movie-card').forEach(card=>{
    const id=card.dataset.id;
    const add=$('[data-add]',card);
    if(add && !add.dataset.sfBound){add.dataset.sfBound='1';add.onclick=e=>{e.stopPropagation();toggleList(id)}}
    const play=$('.overlay button:first-child',card);
    if(play && !play.dataset.sfBound){play.dataset.sfBound='1';play.onclick=e=>{e.stopPropagation();saveProgress(id);location.href=`watch.html?id=${id}`}}
  });

  // Toast on successful auth/demo actions
  $$('.btn, a').forEach(a=>{
    if(a.getAttribute('href')==='subscription.html')a.addEventListener('click',()=>toast('Opening plans…'));
  });

  // =========================================================
  // FAST-MOVING PREMIUM NEON STARFIELD ENGINE
  // =========================================================
  const mountStarfield = () => {
    if (document.getElementById('sfNeonStarfield')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'sfNeonStarfield';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:-1;opacity:0.95;';
    const parent = document.body || document.documentElement;
    if (parent) parent.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let particles = [];
    let shootingStars = [];

    const NEON_COLORS = [
      { r: 229, g: 9,   b: 20  }, // Neon Red
      { r: 168, g: 85,  b: 247 }, // Bright Violet / Purple
      { r: 0,   g: 210, b: 255 }, // Neon Cyan
      { r: 255, g: 255, b: 255 }, // Bright Star White
      { r: 255, g: 70,  b: 95  }  // Soft Crimson
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      const isMobile = width < 768;
      const count = isMobile ? 48 : 120;
      particles = [];

      for (let i = 0; i < count; i++) {
        const colorObj = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        const sizeCategory = Math.random();
        let radius = 1.2;
        let glow = 6;

        if (sizeCategory > 0.85) {
          radius = 3.2 + Math.random() * 1.5; // Larger glowing stars
          glow = 14;
        } else if (sizeCategory > 0.5) {
          radius = 2.0 + Math.random() * 1.0; // Medium stars
          glow = 9;
        } else {
          radius = 0.9 + Math.random() * 0.8; // Tiny crisp stars
          glow = 5;
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: radius,
          glow: glow,
          color: colorObj,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(0.3 + Math.random() * 1.4), // Fast upward/floating drift
          baseAlpha: 0.6 + Math.random() * 0.38,
          twinkleSpeed: 0.02 + Math.random() * 0.05,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    }

    function createShootingStar() {
      if (shootingStars.length >= 2) return;
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * height * 0.5;
      const angle = (Math.PI / 6) + (Math.random() * Math.PI / 6); // 30-60 deg
      const speed = 14 + Math.random() * 10;
      const colorObj = NEON_COLORS[Math.floor(Math.random() * 3)];

      shootingStars.push({
        x: startX,
        y: startY,
        length: 70 + Math.random() * 70,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        alpha: 1,
        color: colorObj
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Render Floating Neon Stars
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.twinklePhase += p.twinkleSpeed;

        // Wrap edges smoothly
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.2, Math.min(1, p.baseAlpha + Math.sin(p.twinklePhase) * 0.35));
        const rgbaStr = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha.toFixed(2)})`;

        ctx.save();
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.85)`;
        ctx.fillStyle = rgbaStr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Shooting Stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.speedX;
        s.y += s.speedY;
        s.alpha -= 0.022;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - (s.speedX * 3.5);
        const tailY = s.y - (s.speedY * 3.5);

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.alpha})`);
        grad.addColorStop(1, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, 0)`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, 0.9)`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();
      }

      // Random shooting star trigger (~every 4s)
      if (Math.random() < 0.007) {
        createShootingStar();
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(animate);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountStarfield);
  }
  mountStarfield();
})();
