(function(){
  const root=document.documentElement;
  function updateScroll(){const h=document.body.scrollHeight-window.innerHeight; const p=h>0?Math.min(100,Math.max(0,window.scrollY/h*100)):0; document.body.style.setProperty('--sf-scroll',p+'%'); document.body.style.setProperty('--sf-scroll-width',p+'%');}
  window.addEventListener('scroll',updateScroll,{passive:true}); updateScroll();
  document.addEventListener('click',e=>{
    const el=e.target.closest('button,a'); if(!el) return;
    if(el.dataset.ripple!=='off'){
      const r=document.createElement('span'); r.className='sf-ripple'; const rect=el.getBoundingClientRect(); const s=Math.max(rect.width,rect.height)*1.6;
      r.style.width=r.style.height=s+'px'; r.style.left=(e.clientX-rect.left-s/2)+'px'; r.style.top=(e.clientY-rect.top-s/2)+'px'; el.appendChild(r); setTimeout(()=>r.remove(),500);
    }
  });
  const style=document.createElement('style');style.textContent=`
  body::before{width:var(--sf-scroll-width,0%)}
  button,a{position:relative;overflow:hidden}.sf-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.22);transform:scale(0);animation:sfRipple .5s ease-out;pointer-events:none}@keyframes sfRipple{to{transform:scale(1);opacity:0}}
  .sf-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);padding:12px 17px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(14,14,17,.94);color:#fff;box-shadow:0 15px 40px rgba(0,0,0,.4);backdrop-filter:blur(16px);z-index:99999;opacity:0;transition:.25s;font-weight:700}.sf-toast.show{opacity:1;transform:translate(-50%,0)}
  `;document.head.appendChild(style);
  window.sfToast=function(msg){let t=document.querySelector('.sf-toast');if(!t){t=document.createElement('div');t.className='sf-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2200)};
  document.querySelectorAll('button,a').forEach(el=>{if(el.getAttribute('href')==='#')el.addEventListener('click',e=>{e.preventDefault();window.sfToast('Coming soon')})});
})();

/* Netflix-style loading feedback for navigation and actions */
(function(){
  function ensureLoader(){
    let loader=document.querySelector('.sf-page-loader');
    if(loader)return loader;
    loader=document.createElement('div');
    loader.className='sf-page-loader';
    loader.innerHTML='<div class="sf-loader-box"><div class="sf-loader-ring"></div><div class="sf-loader-text">Loading…</div></div>';
    document.body.appendChild(loader);
    return loader;
  }
  window.sfShowLoader=function(text){
    const l=ensureLoader();
    const t=l.querySelector('.sf-loader-text');
    if(t)t.textContent=text||'Loading…';
    l.classList.add('show');
    document.body.classList.add('sf-loading');
  };
  window.sfHideLoader=function(){
    document.querySelector('.sf-page-loader')?.classList.remove('show');
    document.body.classList.remove('sf-loading');
  };

  document.addEventListener('click',function(e){
    const el=e.target.closest('button,a');
    if(!el || el.dataset.loadingOff==='1')return;
    if(el.disabled || el.getAttribute('aria-disabled')==='true')return;
    if(el.matches('.show-pass,.password-toggle,.sf-theme-btn,.sf-top,.sf-chip,[data-ripple="off"]'))return;
    if(el.closest('.sf-page-loader'))return;

    const href=el.getAttribute('href');
    const samePage=el.tagName==='BUTTON' || !href || href==='#' || href.startsWith('javascript:');
    sfShowLoader(el.dataset.loadingText || (samePage?'Processing…':'Loading…'));

    if(samePage){
      window.setTimeout(()=>sfHideLoader(),520);
    }
  },true);

  window.addEventListener('pageshow',()=>sfHideLoader());
})();
