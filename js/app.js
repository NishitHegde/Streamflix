document.addEventListener("DOMContentLoaded",()=>{const n=document.querySelector(".navbar");if(n){const f=()=>n.classList.toggle("scrolled",scrollY>30);addEventListener("scroll",f);f()}document.querySelectorAll(".faq button").forEach(b=>b.onclick=()=>b.parentElement.classList.toggle("open"));document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active")})});
/* Premium click feedback for every real interactive control */
(function(){
  document.addEventListener('click',function(e){
    const el=e.target.closest('button,a,.setting-action,.switch-ui,.profile-edit,.overlay button');
    if(!el || el.disabled || ['INPUT', 'IMG', 'SELECT', 'TEXTAREA', 'HR', 'BR'].includes(el.tagName)) return;
    const r=el.getBoundingClientRect();
    const size=Math.max(r.width,r.height)*.35;
    const ripple=document.createElement('span');
    ripple.className='click-ripple';
    ripple.style.width=ripple.style.height=size+'px';
    ripple.style.left=(e.clientX-r.left-size/2)+'px';
    ripple.style.top=(e.clientY-r.top-size/2)+'px';
    el.appendChild(ripple);
    setTimeout(()=>ripple.remove(),600);
  });
  document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',function(e){e.preventDefault();}));
})();
