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
  const playIcon = $('#playIcon');
  const pauseIcon = $('#pauseIcon');
  const btnRewind = $('#btnRewind');
  const btnForward = $('#btnForward');
  const btnMute = $('#btnMute');
  const volHighIcon = $('#volHighIcon');
  const volMuteIcon = $('#volMuteIcon');
  const volumeSlider = $('#volumeSlider');
  const timeDisplay = $('#timeDisplay');
  const btnNextEp = $('#btnNextEp');
  const episodeSelect = $('#episodeSelect');
  const speedSelect = $('#speedSelect');
  const qualitySelect = $('#qualitySelect');
  const btnPip = $('#btnPip');
  const btnFullscreen = $('#btnFullscreen');
  const progressWrap = $('#progressWrap');
  const progressFilled = $('#progressFilled');
  const progressBuffered = $('#progressBuffered');
  const progressHandle = $('#progressHandle');
  const progressTooltip = $('#progressTooltip');
  const watchTitle = $('#watchTitle');
  const watchSubtitle = $('#watchSubtitle');
  const backBtn = $('#backBtn');
  const playerTopBar = $('#playerTopBar');
  const videoControls = $('#videoControls');
  const rippleLeft = $('#rippleLeft');
  const rippleRight = $('#rippleRight');

  const KEY = 'sfProgress';
  const FALLBACK_SOURCES = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://vjs.zencdn.net/v/oceans.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  ];

  let currentFallbackIdx = 0;
  let currentEpisodeIdx = 0;
  let isTvSeries = m.type === 'TV Series' && Array.isArray(m.episodes) && m.episodes.length > 0;
  let hideControlsTimer = null;
  let lastTapTime = 0;

  // Header Titles Setup
  if (watchTitle) watchTitle.textContent = m.title;
  if (watchSubtitle) watchSubtitle.textContent = isTvSeries ? (m.episodes[0]?.title || 'Series Stream') : `${m.type} • ${m.year} • ${m.duration || ''}`;
  if (backBtn) backBtn.href = `movie-details.html?id=${encodeURIComponent(id)}`;

  // Episodes Selection Setup
  if (isTvSeries && episodeSelect) {
    episodeSelect.style.display = 'inline-block';
    episodeSelect.innerHTML = m.episodes.map((ep, idx) => `<option value="${idx}">${ep.title}</option>`).join('');
    episodeSelect.onchange = (e) => loadEpisode(parseInt(e.target.value, 10));
    if (btnNextEp) {
      btnNextEp.style.display = m.episodes.length > 1 ? 'inline-flex' : 'none';
      btnNextEp.onclick = () => {
        if (currentEpisodeIdx < m.episodes.length - 1) {
          loadEpisode(currentEpisodeIdx + 1);
        }
      };
    }
  }

  function loadEpisode(idx) {
    currentEpisodeIdx = idx;
    const ep = isTvSeries ? m.episodes[idx] : null;
    const primaryUrl = ep ? ep.videoUrl : (m.videoUrl || FALLBACK_SOURCES[0]);

    if (watchSubtitle) watchSubtitle.textContent = ep ? ep.title : `${m.type} • ${m.year} • ${m.duration || ''}`;
    if (episodeSelect) episodeSelect.value = idx;

    currentFallbackIdx = 0;
    video.src = primaryUrl;
    video.poster = m.backdrop || m.poster || '';
    video.load();
    playVideo();
  }

  // Automatic Video Error Fallback Recovery
  video.addEventListener('error', () => {
    console.warn("Primary stream failed, attempting fallback URL...");
    currentFallbackIdx = (currentFallbackIdx + 1) % FALLBACK_SOURCES.length;
    video.src = FALLBACK_SOURCES[currentFallbackIdx];
    video.load();
    playVideo();
  });

  // Restore saved watch progress
  try {
    const store = JSON.parse(localStorage.getItem(KEY) || '{}');
    const savedPct = Number(store[id]?.value || 0);
    if (savedPct > 0 && savedPct < 96) {
      video.addEventListener('loadedmetadata', () => {
        if (video.duration) video.currentTime = (savedPct / 100) * video.duration;
      }, { once: true });
    }
  } catch {}

  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateProgressUI() {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (progressFilled) progressFilled.style.width = `${pct}%`;
    if (progressHandle) progressHandle.style.left = `${pct}%`;
    if (timeDisplay) timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

    // Buffer percentage
    if (video.buffered.length > 0 && progressBuffered) {
      const bufEnd = video.buffered.end(video.buffered.length - 1);
      progressBuffered.style.width = `${(bufEnd / video.duration) * 100}%`;
    }

    // Store playback progress
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
      if (videoOverlay) videoOverlay.style.opacity = '0';
      if (videoOverlay) videoOverlay.style.pointerEvents = 'none';
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline-block';
      resetControlsTimeout();
    }).catch(() => {
      // Browser blocked unmuted autoplay
      if (videoOverlay) videoOverlay.style.opacity = '1';
      if (videoOverlay) videoOverlay.style.pointerEvents = 'auto';
      if (playIcon) playIcon.style.display = 'inline-block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    });
  }

  function pauseVideo() {
    video.pause();
    if (videoOverlay) videoOverlay.style.opacity = '1';
    if (videoOverlay) videoOverlay.style.pointerEvents = 'auto';
    if (playIcon) playIcon.style.display = 'inline-block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    showControls();
  }

  function togglePlay() {
    if (video.paused) playVideo();
    else pauseVideo();
  }

  // Auto-Hiding Controls Manager
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

  // Event Handlers
  if (bigPlayBtn) bigPlayBtn.onclick = (e) => { e.stopPropagation(); togglePlay(); };
  if (btnPlayPause) btnPlayPause.onclick = (e) => { e.stopPropagation(); togglePlay(); };

  video.addEventListener('timeupdate', updateProgressUI);
  video.addEventListener('ended', () => {
    pauseVideo();
    if (isTvSeries && currentEpisodeIdx < m.episodes.length - 1) {
      if (window.sfToast) window.sfToast('Playing Next Episode…');
      setTimeout(() => loadEpisode(currentEpisodeIdx + 1), 1200);
    }
  });

  if (btnRewind) btnRewind.onclick = () => { video.currentTime = Math.max(0, video.currentTime - 10); showControls(); triggerRipple(rippleLeft); };
  if (btnForward) btnForward.onclick = () => { video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); showControls(); triggerRipple(rippleRight); };

  function triggerRipple(el) {
    if (!el) return;
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 600);
  }

  // Double Tap & Touch Controls
  if (videoWrapper) {
    videoWrapper.addEventListener('click', (e) => {
      if (e.target.closest('#videoControls, #playerTopBar, .big-play-btn')) return;

      const now = Date.now();
      const timeDiff = now - lastTapTime;
      const rect = videoWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      if (timeDiff < 300) {
        // Double tap gesture
        if (clickX < rect.width * 0.35) {
          video.currentTime = Math.max(0, video.currentTime - 10);
          triggerRipple(rippleLeft);
        } else if (clickX > rect.width * 0.65) {
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          triggerRipple(rippleRight);
        } else {
          togglePlay();
        }
      } else {
        togglePlay();
      }
      lastTapTime = now;
      showControls();
    });

    videoWrapper.onmousemove = showControls;
  }

  // Volume & Mute
  if (btnMute) {
    btnMute.onclick = () => {
      video.muted = !video.muted;
      if (volHighIcon) volHighIcon.style.display = video.muted ? 'none' : 'inline-block';
      if (volMuteIcon) volMuteIcon.style.display = video.muted ? 'inline-block' : 'none';
      if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
      showControls();
    };
  }

  if (volumeSlider) {
    volumeSlider.oninput = (e) => {
      video.volume = parseFloat(e.target.value);
      video.muted = video.volume === 0;
      if (volHighIcon) volHighIcon.style.display = video.muted ? 'none' : 'inline-block';
      if (volMuteIcon) volMuteIcon.style.display = video.muted ? 'inline-block' : 'none';
      showControls();
    };
  }

  // Speed Selector
  if (speedSelect) {
    speedSelect.onchange = (e) => {
      video.playbackRate = parseFloat(e.target.value);
      showControls();
    };
  }

  // Progress Bar Scrub & Hover Tooltip
  if (progressWrap) {
    const getPos = e => {
      const rect = progressWrap.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    };

    progressWrap.onclick = (e) => {
      if (video.duration) video.currentTime = getPos(e) * video.duration;
    };

    progressWrap.onmousemove = (e) => {
      if (!video.duration) return;
      const pos = getPos(e);
      if (progressTooltip) {
        progressTooltip.style.left = `${pos * 100}%`;
        progressTooltip.textContent = formatTime(pos * video.duration);
        progressTooltip.style.opacity = '1';
      }
    };

    progressWrap.onmouseleave = () => {
      if (progressTooltip) progressTooltip.style.opacity = '0';
    };
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
      showControls();
    };
  }

  // Picture-in-Picture
  if (btnPip) {
    btnPip.onclick = async () => {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else if (video.requestPictureInPicture) await video.requestPictureInPicture();
      } catch (e) {}
    };
  }

  // Keyboard Shortcuts (Space, F, M, Left, Right Arrow)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'f') { e.preventDefault(); btnFullscreen?.click(); }
    else if (e.key === 'm') { e.preventDefault(); btnMute?.click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); triggerRipple(rippleLeft); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); triggerRipple(rippleRight); }
    showControls();
  });

  loadEpisode(0);
})();