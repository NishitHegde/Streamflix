(() => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "1";
  const m = window.MOVIES?.[id] || window.MOVIES?.["1"];
  if (!m) return;

  document.title = `${m.title} | Streamflix`;
  const setText = (sel, value) => { const el = document.getElementById(sel); if (el) el.textContent = value ?? ""; };
  setText("detailsTitle", m.title);
  setText("detailsType", String(m.type || "").toUpperCase());
  setText("detailsMatch", `${m.match || ""} Match`);
  setText("detailsYear", m.year);
  setText("detailsRating", m.rating);
  setText("detailsGenres", m.genres);
  setText("detailsDescription", `Watch ${m.title}, a ${String(m.type || "title").toLowerCase()} packed with memorable characters, suspense and cinematic storytelling.`);

  const hero = document.getElementById("detailsHero");
  if (hero && (m.backdrop || m.poster)) {
    const bg = m.backdrop || m.poster;
    const poster = m.poster || m.backdrop;
    hero.style.setProperty("--details-backdrop", `url("${String(bg).replace(/"/g,'\\\"')}")`);
    hero.style.setProperty("--details-poster", `url("${String(poster).replace(/"/g,'\\\"')}")`);
  }

  const playBtn = document.getElementById("playBtn");
  if (playBtn) playBtn.href = `watch.html?id=${id}`;

  const listBtn = document.getElementById("listBtn");
  if (listBtn) {
    const getList = () => { try { return JSON.parse(localStorage.getItem("myList") || "[]").map(String); } catch { return []; } };
    const renderListState = () => { listBtn.textContent = getList().includes(String(id)) ? "✓ In My List" : "＋ My List"; };
    listBtn.onclick = () => {
      const sid = String(id);
      let list = getList();
      list = list.includes(sid) ? list.filter(x => x !== sid) : [...list, sid];
      localStorage.setItem("myList", JSON.stringify(list));
      renderListState();
    };
    renderListState();
  }

  // Cast: always render a visible cast section from movie-data.js.
  const castGrid = document.getElementById("castGrid");
  const castSection = document.querySelector(".cast");
  const cast = Array.isArray(m.cast) ? m.cast.filter(Boolean) : [];
  if (castGrid) {
    castGrid.innerHTML = cast.length ? cast.map(name => {
      const initials = name.split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase();
      return `<div class="cast-card"><div class="cast-avatar" aria-hidden="true">${initials}</div><p>${name}</p></div>`;
    }).join("") : `<p class="cast-empty">Cast information unavailable.</p>`;
  }
  if (castSection) castSection.style.display = "block";

  // Recommendations were intentionally removed from the details page.
  const recommendations = document.getElementById("recommendGrid");
  if (recommendations) recommendations.closest("section")?.remove();
})();
