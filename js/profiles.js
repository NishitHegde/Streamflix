(() => {
  const KEY = 'streamflixProfiles';
  const defaults = [
    {name:'Nishit',avatar:'avatar-red',initial:'N'},
    {name:'Kids',avatar:'avatar-kids',initial:'K'},
    {name:'Family',avatar:'avatar-blue',initial:'F'},
    {name:'Guest',avatar:'avatar-green',initial:'G'}
  ];

  let profiles = JSON.parse(localStorage.getItem(KEY) || 'null') || defaults;
  localStorage.setItem(KEY, JSON.stringify(profiles));

  const grid = document.querySelector('.profiles-grid');
  const manage = document.querySelector('.manage-profiles');
  let manageMode = false;

  const save = () => localStorage.setItem(KEY, JSON.stringify(profiles));

  const deleteProfile = (index) => {
    const profile = profiles[index];
    if (!profile) return;

    if (!confirm(`Delete the profile "${profile.name}"? This cannot be undone.`)) return;

    const activeProfile = localStorage.getItem('streamflixProfile');
    profiles.splice(index, 1);
    save();

    // If the deleted profile was active, clear the active profile selection.
    if (activeProfile === profile.name) localStorage.removeItem('streamflixProfile');

    render();
  };

  const edit = (index) => {
    const p = profiles[index];
    if (!p) return;
    const name = prompt('Profile name:', p.name);
    if (!name) return;
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return;

    const oldName = p.name;
    p.name = trimmed;
    p.initial = trimmed[0].toUpperCase();

    if (localStorage.getItem('streamflixProfile') === oldName) {
      localStorage.setItem('streamflixProfile', trimmed);
    }

    save();
    render();
  };

  function render() {
    if (!grid) return;
    grid.innerHTML = '';

    profiles.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'profile' + (manageMode ? ' profile-manage-mode' : '');
      el.dataset.name = p.name;
      el.innerHTML = `
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
      avatar.onclick = () => {
        if (manageMode) return;
        localStorage.setItem('streamflixProfile', p.name);
        location.href = 'home.html';
      };

      const editButton = el.querySelector('.profile-edit');
      if (editButton) {
        editButton.onclick = e => {
          e.stopPropagation();
          edit(i);
        };
      }

      const deleteButton = el.querySelector('.profile-delete');
      if (deleteButton) {
        deleteButton.onclick = e => {
          e.stopPropagation();
          deleteProfile(i);
        };
      }

      grid.appendChild(el);
    });

    if (!manageMode) {
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

    const colors = ['avatar-red','avatar-blue','avatar-green','avatar-kids'];
    profiles.push({
      name: trimmed,
      avatar: colors[profiles.length % colors.length],
      initial: trimmed[0].toUpperCase()
    });
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
    manage.style.cursor = 'pointer';
    manage.setAttribute('role', 'button');
    manage.setAttribute('tabindex', '0');
    manage.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        manage.click();
      }
    };
  }

  render();
})();
