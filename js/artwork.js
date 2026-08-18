/* Streamflix real-artwork loader
   Hindi titles use live Wikimedia/Wikipedia thumbnails when no TMDB poster path is bundled.
   English titles keep their TMDB artwork. This keeps the demo key-free while using real artwork.
*/
(() => {
  const wikiCache = new Map();
  const pending = new Map();
  const hindi = new Set(Object.values(window.MOVIES || {}).filter(m => m.language === 'Hindi').map(m => m.title));

  function wikiTitle(title) {
    const map = {
      'Kabhi Khushi Kabhie Gham':'Kabhi Khushi Kabhie Gham...','The Family Man':'The Family Man (Indian TV series)',
      'Panchayat':'Panchayat (TV series)','Mirzapur':'Mirzapur (TV series)','Scam 1992: The Harshad Mehta Story':'Scam 1992: The Harshad Mehta Story',
      'Sacred Games':'Sacred Games','Kota Factory':'Kota Factory','Aspirants':'Aspirants (TV series)','Rocket Boys':'Rocket Boys (TV series)',
      'Made in Heaven':'Made in Heaven (TV series)','Delhi Crime':'Delhi Crime','Guns & Gulaabs':'Guns & Gulaabs','Farzi':'Farzi (TV series)',
      'Heeramandi':'Heeramandi: The Diamond Bazaar','Maamla Legal Hai':'Maamla Legal Hai'
    };
    return map[title] || title;
  }

  async function getWiki(title) {
    const key = wikiTitle(title);
    if (wikiCache.has(key)) return wikiCache.get(key);
    if (pending.has(key)) return pending.get(key);
    const p = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(key), {mode:'cors'})
      .then(r => r.ok ? r.json() : null).then(data => {
        const result = data && (data.originalimage?.source || data.thumbnail?.source) ? {
          image: data.originalimage?.source || data.thumbnail?.source,
          thumb: data.thumbnail?.source || data.originalimage?.source
        } : null;
        wikiCache.set(key, result); return result;
      }).catch(() => null);
    pending.set(key, p); return p;
  }

  function updateMedia(id, m, data) {
    if (!data) return;
    if (data.thumb) m.poster = data.thumb;
    if (data.image) m.backdrop = data.image;
    document.querySelectorAll(`img[data-sf-id="${id}"], .movie-card[data-id="${id}"] img, .trend-card[onclick*="id=${id}"] img, .home-card[data-home-id="${id}"] img`).forEach(img => {
      img.src = data.thumb || data.image; img.removeAttribute('data-sf-id');
    });
    const hero = document.getElementById('detailsHero');
    const params = new URLSearchParams(location.search);
    if (hero && params.get('id') === String(id)) {
      hero.style.backgroundImage = `linear-gradient(90deg,#050505 0%,#000d 38%,#0005 75%),linear-gradient(0deg,#080808,transparent 60%),url("${data.image || data.thumb}")`;
    }
  }

  async function loadHindi() {
    const entries = Object.entries(window.MOVIES || {}).filter(([,m]) => m.language === 'Hindi');
    await Promise.all(entries.map(async ([id,m]) => updateMedia(id,m,await getWiki(m.title))));
    refreshAll();
  }

  async function refreshCast() {
    const cards = [...document.querySelectorAll('.cast-card')];
    await Promise.all(cards.map(async card => {
      const p = card.querySelector('p'); if (!p || card.querySelector('.cast-photo')) return;
      const data = await getWiki(p.textContent.trim()); if (!data?.thumb) return;
      const avatar = card.querySelector('.cast-avatar');
      if (avatar) avatar.innerHTML = `<img class="cast-photo" src="${data.thumb}" alt="${p.textContent.trim()}" loading="lazy">`;
    }));
  }

  function refreshAll() {
    Object.entries(window.MOVIES || {}).filter(([,m]) => m.language === 'Hindi').forEach(([id,m]) => {
      document.querySelectorAll(`.movie-card[data-id="${id}"] img, .sf-progress-card img, .sf-suggest-item[data-id="${id}"] img, .home-card[data-home-id="${id}"] img`).forEach(img => {
        if (m.poster) img.src = m.poster;
      });
    });
    refreshCast();
  }

  const observer = new MutationObserver(() => { refreshAll(); });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  loadHindi();
})();
