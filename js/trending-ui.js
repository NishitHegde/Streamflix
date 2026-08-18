(function(){
  function initTrending(){
    const row=document.querySelector('.sf-trending-section .trending-row');
    if(!row) return;

    const cards=[...row.querySelectorAll('.trend-card')];
    if(!cards.length) return;

    cards.forEach((card,index)=>{
      const num=card.querySelector('.trend-num');
      if(num) num.textContent=String(index+1);
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label','Trending number '+(index+1));
    });

    // Reference-style right arrow.
    if(!row.parentElement.querySelector('.sf-trend-arrow')){
      const arrow=document.createElement('button');
      arrow.className='sf-trend-arrow';
      arrow.type='button';
      arrow.setAttribute('aria-label','Show more trending titles');
      arrow.innerHTML='<span>›</span>';
      row.parentElement.appendChild(arrow);

      const scrollAmount=()=>Math.max(520, Math.min(900, row.clientWidth*.72));
      arrow.addEventListener('click',e=>{
        e.preventDefault();
        row.scrollBy({left:scrollAmount(),behavior:'smooth'});
      });

      const update=()=>{
        const atEnd=row.scrollLeft+row.clientWidth>=row.scrollWidth-12;
        arrow.classList.toggle('is-end',atEnd);
        arrow.innerHTML=atEnd?'<span>‹</span>':'<span>›</span>';
      };
      row.addEventListener('scroll',update,{passive:true});
      arrow.addEventListener('click',()=>{
        setTimeout(()=>{
          const atEnd=row.scrollLeft+row.clientWidth>=row.scrollWidth-12;
          if(atEnd){
            row.scrollTo({left:0,behavior:'smooth'});
          }
        },420);
      });
      update();
    }

    // Clicking a card navigates to its title.
    cards.forEach(card=>{
      card.addEventListener('click',function(e){
        if(e.target.closest('.sf-trend-arrow')) return;
        const target=card.getAttribute('data-target') || 'movie-details.html';
        card.classList.add('is-selected');
        if(window.sfShowLoader) sfShowLoader('Loading title…');
        setTimeout(()=>{window.location.href=target;},220);
      });
      card.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initTrending);
  else initTrending();
})();