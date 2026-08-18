
/* Streamflix cinematic feature hero — original artwork per movie / TV show. */
(function(){
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function items(){
    return window.MOVIES && typeof window.MOVIES==="object"
      ? Object.values(window.MOVIES).filter(x=>x && (x.backdrop||x.poster))
      : [];
  }

  function init(){
    const all=items();
    if(!all.length) return;

    const hero=document.querySelector(".sf-cinematic-hero");
    if(!hero) return;

    hero.innerHTML=`
      <div class="sf-hero-art"></div>
      <div class="sf-hero-vignette"></div>
      <div class="sf-hero-content">
        <div class="sf-hero-poster-wrap">
          <img class="sf-hero-poster" id="sfHeroPoster" alt="">
        </div>
        <div class="sf-hero-copy">
          <div class="sf-hero-kicker" id="sfHeroKicker">FEATURED</div>
          <h1 class="sf-hero-title" id="sfHeroTitle"></h1>
          <div class="sf-hero-meta" id="sfHeroMeta"></div>
          <p class="sf-hero-description" id="sfHeroDescription"></p>
          <div class="sf-hero-actions">
            <a id="sfHeroPlay" class="btn light" href="#">▶ Play</a>
            <a id="sfHeroInfo" class="btn dark" href="#">ⓘ More Info</a>
          </div>
        </div>
      </div>
      <div class="sf-hero-dots" id="sfHeroDots"></div>
      <button class="sf-hero-arrow" id="sfHeroNext" aria-label="Next title">›</button>`;

    const dots=$("#sfHeroDots",hero);
    all.forEach((m,i)=>{
      const d=document.createElement("button");
      d.type="button";
      d.className="sf-hero-dot"+(i===0?" active":"");
      d.dataset.index=i;
      d.title=m.title||"Title";
      dots.appendChild(d);
    });

    let index=0;
    let timer;

    function render(i){
      index=(i+all.length)%all.length;
      const m=all[index];
      const backdrop=m.backdrop||m.poster;
      const poster=m.poster||m.backdrop;

      const art=$(".sf-hero-art",hero);
      art.style.backgroundImage=`url("${String(backdrop).replace(/"/g,'\\"')}")`;
      art.classList.remove("sf-hero-art-in");
      void art.offsetWidth;
      art.classList.add("sf-hero-art-in");

      const p=$("#sfHeroPoster",hero);
      p.src=poster;
      p.alt=(m.title||"")+" poster";

      $("#sfHeroKicker",hero).textContent =
        m.type==="TV Series" ? "N SERIES • FEATURED" : "FEATURED MOVIE";

      $("#sfHeroTitle",hero).textContent=m.title||"Streamflix";

      const meta=[];
      if(m.match) meta.push(m.match+" Match");
      if(m.year) meta.push(m.year);
      if(m.rating) meta.push(m.rating);
      if(m.genres) meta.push(m.genres);
      $("#sfHeroMeta",hero).innerHTML=meta.map(v=>`<span>${esc(v)}</span>`).join("");

      $("#sfHeroDescription",hero).textContent =
        m.description || m.overview ||
        `Watch ${m.title||"this title"} on Streamflix.`;

      const href=`movie-details.html?id=${encodeURIComponent(m.id||"")}`;
      $("#sfHeroPlay",hero).href=`watch.html?id=${encodeURIComponent(m.id||"")}`;
      $("#sfHeroInfo",hero).href=href;

      $$(".sf-hero-dot",hero).forEach((d,n)=>d.classList.toggle("active",n===index));
    }

    function restart(){
      clearInterval(timer);
      timer=setInterval(()=>render(index+1),9000);
    }

    dots.addEventListener("click",e=>{
      const d=e.target.closest(".sf-hero-dot");
      if(!d)return;
      render(Number(d.dataset.index));
      restart();
    });

    $("#sfHeroNext",hero).addEventListener("click",()=>{
      render(index+1);
      restart();
    });

    hero.addEventListener("mouseenter",()=>clearInterval(timer));
    hero.addEventListener("mouseleave",restart);

    render(0);
    restart();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
  }else{
    init();
  }
})();
