(() => {
  const id = new URLSearchParams(location.search).get('id') || '1';
  const m = window.MOVIES?.[id] || window.MOVIES?.['1'];
  if (!m) return;

  document.title = `Watch ${m.title} | Streamflix`;
  const $ = s => document.querySelector(s);
  const title = $('#watchTitle'), poster = $('#watchPoster'), back = $('#backBtn');
  const iframe = $('#mainTrailer'), player = $('#streamPlayer');
  const playBtn = $('#watchPlay'), circle = $('#demoPlay'), hint = $('#playerHint');
  const controls = document.querySelector('.sf-player-controls');
  const progress = $('.sf-player-progress');
  const KEY = 'sfProgress';

  if (title) title.textContent = m.title;
  if (poster) { poster.src = m.poster || m.backdrop || ''; poster.alt = m.title; }
  if (back) back.href = `movie-details.html?id=${encodeURIComponent(id)}`;

  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { store = {}; }
  let value = Math.max(0, Math.min(99.9, Number(store[id]?.value || 0)));
  let playing = false, timer = null;

  function youtubeId(url) {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.replace(/^\/+/,'').split('/')[0];
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v') || (u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/) || [])[1] || '';
      }
    } catch {}
    return '';
  }

  function trailerUrl(id) {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&controls=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`;
  }

  function persist() {
    if (value >= 99.5) delete store[id];
    else store[id] = { value:+value.toFixed(1), updated:Date.now(), title:m.title, poster:m.poster, type:m.type, year:m.year };
    localStorage.setItem(KEY, JSON.stringify(store));
  }

  function render() {
    const bar = $('#watchProgressBar');
    if (bar) bar.style.width = `${value}%`;
    if (playBtn) playBtn.textContent = playing ? '❚❚ Watching' : (value > 0 ? '▶ Resume Trailer' : '▶ Watch Trailer');
    if (circle) circle.textContent = playing ? '●' : '▶';
    if (player) player.setAttribute('aria-label', `${m.title} official trailer`);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function finish() {
    stopTimer(); playing = false; value = 100; persist(); render();
    if (hint) hint.textContent = 'Trailer finished';
    if (window.sfToast) window.sfToast('Trailer finished');
  }

  function start() {
    const yt = youtubeId(m.trailer);
    if (!yt) {
      if (window.sfToast) window.sfToast('Official trailer is not available for this title.');
      return;
    }
    if (playing) return;
    playing = true;
    // Mark the title as Continue Watching only after playback has actually started.
    value = Math.max(value, 1);
    persist();
    if (iframe) {
      iframe.src = trailerUrl(yt);
      iframe.style.display = 'block';
    }
    if (poster) poster.style.display = 'none';

    // Clean player: remove Streamflix overlay buttons once the trailer starts.
    if (controls) controls.style.display = 'none';
    if (circle) circle.style.display = 'none';
    if (progress) progress.style.display = 'none';
    if (hint) { hint.textContent = 'Official trailer'; hint.style.display = 'none'; }

    render();
    stopTimer();
    timer = setInterval(() => {
      value = Math.min(99.5, value + 0.6);
      persist(); render();
    }, 1000);
  }

  function pause() {
    // YouTube iframe owns its playback controls; Streamflix does not duplicate them.
    if (window.sfToast) window.sfToast('Use the YouTube player controls to pause or resume.');
  }

  function setup() {
    if (iframe) {
      iframe.src = '';
      iframe.style.display = 'none';
    }
    if (poster) { poster.style.display='block'; poster.style.opacity='1'; }
    if (controls) controls.style.display='';
    if (circle) { circle.style.display=''; circle.textContent='▶'; }
    if (progress) progress.style.display='';
    if (hint) {
      hint.style.display='inline-block';
      hint.textContent = youtubeId(m.trailer) ? 'Official trailer • Press Play to watch' : 'Official trailer unavailable';
    }
    render();
  }

  playBtn?.addEventListener('click', start);
  circle?.addEventListener('click', start);
  poster?.addEventListener('click', start);

  $('#watchMute')?.addEventListener('click', () => {
    if (window.sfToast) window.sfToast('Use the YouTube player sound control.');
  });
  $('#watchFull')?.addEventListener('click', () => {
    const el = iframe?.style.display !== 'none' ? iframe : player;
    if (el?.requestFullscreen) el.requestFullscreen().catch(()=>{});
  });

  window.addEventListener('beforeunload', persist);
  setup();
})();