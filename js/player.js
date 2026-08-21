(() => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || '1';
  const m = window.MOVIES?.[id] || window.MOVIES?.['1'];
  if (!m) return;

  document.title = `Watch ${m.title} | Streamflix`;

  const $ = s => document.querySelector(s);
  const video = $('#streamVideo');
  const videoWrapper = $('#videoWrapper');
  const videoOverlay = $('#videoOverlay');
  const bigPlayBtn = $('#bigPlayBtn');
  const btnPlayPause = $('#btnPlayPause');
  const btnRewind = $('#btnRewind');
  const btnForward = $('#btnForward');
  const btnMute = $('#btnMute');
  const volumeSlider = $('#volumeSlider');
  const timeDisplay = $('#timeDisplay');
  const btnNextEp = $('#btnNextEp');
  const episodeSelect = $('#episodeSelect');
  const qualitySelect = $('#qualitySelect');
  const btnPip = $('#btnPip');
  const btnFullscreen = $('#btnFullscreen');
  const progressWrap = $('#progressWrap');
  const progressFilled = $('#progressFilled');
  const progressBuffered = $('#progressBuffered');
  const progressHandle = $('#progressHandle');
  const watchTitle = $('#watchTitle');
  const watchSubtitle = $('#watchSubtitle');
  const backBtn = $('#backBtn');
  const playerTopBar = $('#playerTopBar');
  const videoControls = $('#videoControls');

  const KEY = 'sfProgress';
  let currentEpisodeIndex = 0;
  let isTvSeries = m.type === 'TV Series' && Array.isArray(m.episodes) && m.episodes.length > 0;
  let hideControlsTimer = null;

  // Title and Header setup
  if (watchTitle) watchTitle.textContent = m.title;
  if (watchSubtitle) watchSubtitle.textContent = isTvSeries ? (m.episodes[0]?.title || 'Series Stream') : `${m.type} • ${m.year} • ${m.duration || ''}`;
  if (backBtn) backBtn.href = `movie-details.html?id=${encodeURIComponent(id)}`;

  // Episode Selection Setup
  if (isTvSeries && episodeSelect) {
    episodeSelect.style.display = 'inline-block';
    episodeSelect.innerHTML = m.episodes.map((ep, idx) => `<option value="${idx}">${ep.title}</option>`).join('');
    episodeSelect.onchange = (e) => loadEpisode(parseInt(e.target.value, 10));
    if (btnNextEp) {
      btnNextEp.style.display = m.episodes.length > 1 ? 'inline-flex' : 'none';
      btnNextEp.onclick = () => {
        if (currentEpisodeIndex < m.episodes.length - 1) {
          loadEpisode(currentEpisodeIndex + 1);
        }
      };
    }
  }

  function loadEpisode(idx) {
    currentEpisodeIndex = idx;
    const ep = isTvSeries ? m.episodes[idx] : null;
    const streamUrl = ep ? ep.videoUrl : (m.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    
    if (watchSubtitle) watchSubtitle.textContent = ep ? ep.title : `${m.type} • ${m.year}`;
    if (episodeSelect) episodeSelect.value = idx;
    
    video.src = streamUrl;
    video.poster = m.backdrop || m.poster || '';
    video.load();
    playVideo();
  }

  // Load initial video source
  loadEpisode(0);

  // Restore saved watch progress if available
  try {
    const store = JSON.parse(localStorage.getItem(KEY) || '{}');
    const savedPct = Number(store[id]?.value || 0);
    if (savedPct > 0 && savedPct < 95) {
      video.addEventListener('loadedmetadata', () => {
        if (video.duration) video.currentTime = (savedPct / 100) * video.duration;
      }, { once: true });
    }
  } catch {}

  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateProgress() {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (progressFilled) progressFilled.style.width = `${pct}%`;
    if (progressHandle) progressHandle.style.left = `${pct}%`;
    if (timeDisplay) timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

    // Buffer bar
    if (video.buffered.length > 0 && progressBuffered) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufPct = (bufferedEnd / video.duration) * 100;
      progressBuffered.style.width = `${bufPct}%`;
    }

    // Persist progress to localStorage
    try {
      const store = JSON.parse(localStorage.getItem(KEY) || '{}');
      store[id] = {
        value: +pct.toFixed(1),
        updated: Date.now(),
        title: m.title,
        poster: m.poster,
        type: m.type,
        year: m.year
      };
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {}
  }

  function playVideo() {
    video.play().then(() => {
      videoOverlay.style.opacity = '0';
      videoOverlay.style.pointerEvents = 'none';
      if (btnPlayPause) btnPlayPause.textContent = '❚❚ Pause';
      resetControlsTimeout();
    }).catch(() => {
      videoOverlay.style.opacity = '1';
      videoOverlay.style.pointerEvents = 'auto';
      if (btnPlayPause) btnPlayPause.textContent = '▶ Play';
    });
  }

  function pauseVideo() {
    video.pause();
    videoOverlay.style.opacity = '1';
    videoOverlay.style.pointerEvents = 'auto';
    if (btnPlayPause) btnPlayPause.textContent = '▶ Play';
    showControls();
  }

  function togglePlay() {
    if (video.paused) playVideo();
    else pauseVideo();
  }

  // Controls Auto-Hide Behavior
  function showControls() {
    if (playerTopBar) playerTopBar.style.opacity = '1';
    if (videoControls) videoControls.style.opacity = '1';
    resetControlsTimeout();
  }

  function resetControlsTimeout() {
    clearTimeout(hideControlsTimer);
    if (!video.paused) {
      hideControlsTimer = setTimeout(() => {
        if (playerTopBar) playerTopBar.style.opacity = '0';
        if (videoControls) videoControls.style.opacity = '0';
      }, 3500);
    }
  }

  // Event Listeners
  if (bigPlayBtn) bigPlayBtn.onclick = togglePlay;
  if (videoOverlay) videoOverlay.onclick = togglePlay;
  if (btnPlayPause) btnPlayPause.onclick = togglePlay;
  if (video) video.onclick = togglePlay;

  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('ended', () => {
    pauseVideo();
    if (isTvSeries && currentEpisodeIndex < m.episodes.length - 1) {
      if (window.sfToast) window.sfToast('Playing Next Episode…');
      setTimeout(() => loadEpisode(currentEpisodeIndex + 1), 1500);
    }
  });

  if (btnRewind) btnRewind.onclick = () => { video.currentTime = Math.max(0, video.currentTime - 10); showControls(); };
  if (btnForward) btnForward.onclick = () => { video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); showControls(); };

  if (btnMute) {
    btnMute.onclick = () => {
      video.muted = !video.muted;
      btnMute.textContent = video.muted ? '🔇' : '🔊';
      if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
    };
  }

  if (volumeSlider) {
    volumeSlider.oninput = (e) => {
      video.volume = parseFloat(e.target.value);
      video.muted = video.volume === 0;
      if (btnMute) btnMute.textContent = video.muted ? '🔇' : '🔊';
    };
  }

  // Progress Bar Seek Interaction
  if (progressWrap) {
    const seek = (e) => {
      const rect = progressWrap.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (video.duration) video.currentTime = pos * video.duration;
    };

    progressWrap.onclick = seek;
    let isDragging = false;
    progressWrap.onmousedown = () => { isDragging = true; };
    window.addEventListener('mousemove', (e) => { if (isDragging) seek(e); });
    window.addEventListener('mouseup', () => { isDragging = false; });
  }

  // Fullscreen
  if (btnFullscreen) {
    btnFullscreen.onclick = () => {
      const fsEl = videoWrapper;
      if (!document.fullscreenElement) {
        if (fsEl.requestFullscreen) fsEl.requestFullscreen();
        else if (fsEl.webkitRequestFullscreen) fsEl.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    };
  }

  // Picture in Picture
  if (btnPip) {
    btnPip.onclick = async () => {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else if (video.requestPictureInPicture) await video.requestPictureInPicture();
      } catch (err) {}
    };
  }

  // Mouse & Touch Activity Tracking
  if (videoWrapper) {
    videoWrapper.onmousemove = showControls;
    videoWrapper.ontouchstart = showControls;
  }
})();