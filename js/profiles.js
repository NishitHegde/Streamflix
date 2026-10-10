(() => {
  const KEY = 'streamflixProfiles';
  const ACTIVE_KEY = 'streamflixProfile';
  const defaults = [
    { name: 'Nishit', avatar: 'avatar-red', initial: 'N' },
    { name: 'Kids', avatar: 'avatar-kids', initial: 'K' },
    { name: 'Family', avatar: 'avatar-blue', initial: 'F' },
    { name: 'Guest', avatar: 'avatar-green', initial: 'G' }
  ];

  let profiles = JSON.parse(localStorage.getItem(KEY) || 'null') || defaults;
  let activeProfile = localStorage.getItem(ACTIVE_KEY) || profiles[0]?.name || 'Nishit';

  localStorage.setItem(KEY, JSON.stringify(profiles));
  if (!localStorage.getItem(ACTIVE_KEY)) {
    localStorage.setItem(ACTIVE_KEY, activeProfile);
  }

  const grid = document.querySelector('.profiles-grid');
  const manage = document.querySelector('.manage-profiles');
  let manageMode = false;

  const save = () => localStorage.setItem(KEY, JSON.stringify(profiles));

  const deleteProfile = (index) => {
    const p = profiles[index];
    if (!p) return;
    if (profiles.length <= 1) return alert('You must keep at least one profile.');
    if (!confirm(`Delete profile "${p.name}"? This cannot be undone.`)) return;

    profiles.splice(index, 1);
    if (activeProfile === p.name) {
      activeProfile = profiles[0].name;
      localStorage.setItem(ACTIVE_KEY, activeProfile);
    }
    save();
    render();
  };

  const editProfile = (index) => {
    const p = profiles[index];
    if (!p) return;
    const name = prompt('Profile name:', p.name);
    if (!name) return;
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return;

    const oldName = p.name;
    p.name = trimmed;
    p.initial = trimmed[0].toUpperCase();

    if (activeProfile === oldName) {
      activeProfile = trimmed;
      localStorage.setItem(ACTIVE_KEY, trimmed);
    }

    save();
    render();
  };

  const selectProfile = (p) => {
    if (manageMode) return;
    activeProfile = p.name;
    localStorage.setItem(ACTIVE_KEY, p.name);
    if (window.sfToast) window.sfToast(`Switched to ${p.name}'s profile`);
    setTimeout(() => {
      location.href = 'home.html';
    }, 250);
  };

  function render() {
    if (!grid) return;
    grid.innerHTML = '';

    profiles.forEach((p, i) => {
      const isActive = p.name === activeProfile;
      const el = document.createElement('div');
      el.className = 'profile' + (isActive ? ' profile-active' : '') + (manageMode ? ' profile-manage-mode' : '');
      el.dataset.name = p.name;

      el.innerHTML = `
        ${isActive ? '<span class="profile-active-badge">✓</span>' : ''}
        <div class="profile-avatar ${p.avatar}">${p.initial}</div>
        <p>${p.name}</p>
        ${manageMode ? `
          <div class="profile-manage-actions">
            <button class="profile-edit" data-i="${i}" title="Edit profile" aria-label="Edit ${p.name}">✎</button>
            <button class="profile-delete" data-i="${i}" title="Delete profile" aria-label="Delete ${p.name}">🗑</button>
          </div>
        ` : ''}
      `;

      const avatar = el.querySelector('.profile-avatar');
      avatar.onclick = () => selectProfile(p);

      const editBtn = el.querySelector('.profile-edit');
      if (editBtn) editBtn.onclick = (e) => { e.stopPropagation(); editProfile(i); };

      const delBtn = el.querySelector('.profile-delete');
      if (delBtn) delBtn.onclick = (e) => { e.stopPropagation(); deleteProfile(i); };

      grid.appendChild(el);
    });

    if (!manageMode && profiles.length < 5) {
      const add = document.createElement('div');
      add.className = 'profile add-profile';
      add.innerHTML = '<div class="profile-avatar add-avatar">+</div><p>Add Profile</p>';
      add.onclick = addProfile;
      grid.appendChild(add);
    }
  }

  function addProfile() {
    if (profiles.length >= 5) return alert('You can have up to 5 profiles.');
    const name = prompt('New profile name:');
    if (!name) return;
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return;

    const colors = ['avatar-red', 'avatar-blue', 'avatar-green', 'avatar-kids'];
    const newProfile = {
      name: trimmed,
      avatar: colors[profiles.length % colors.length],
      initial: trimmed[0].toUpperCase()
    };
    profiles.push(newProfile);
    save();
    render();
  }

  if (manage) {
    manage.onclick = () => {
      manageMode = !manageMode;
      manage.textContent = manageMode ? 'Done' : 'Manage Profiles';
      manage.classList.toggle('manage-active', manageMode);
      render();
    };
  }

  render();
})();
