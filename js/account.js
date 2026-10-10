(() => {
  const defaults = {
    name: 'Nishit',
    email: 'member@example.com',
    plan: 'Premium',
    price: '₹649/month',
    payment: 'No payment method added',
    billing: 'Not scheduled',
    pin: false,
    maturity: 'All maturity levels',
    language: 'English',
    autoplayNext: true,
    autoplayPreview: false
  };

  const state = { ...defaults, ...JSON.parse(localStorage.getItem('streamflixAccount') || '{}') };

  const save = () => localStorage.setItem('streamflixAccount', JSON.stringify(state));
  const $ = id => document.getElementById(id);

  function renderAccountInfo() {
    const activeProfileName = localStorage.getItem('streamflixProfile') || state.name || 'Nishit';
    if ($('accountName')) $('accountName').textContent = activeProfileName;
    if ($('accountEmail')) $('accountEmail').textContent = state.email || 'member@example.com';
    if ($('accountAvatar')) $('accountAvatar').textContent = activeProfileName.charAt(0).toUpperCase();

    if ($('planText')) $('planText').textContent = `${state.plan} · ${state.price}`;
    if ($('paymentText')) $('paymentText').textContent = state.payment;
    if ($('billingText')) $('billingText').textContent = state.billing;

    if ($('pinText')) $('pinText').textContent = state.pin ? 'Enabled' : 'Not enabled';
    if ($('maturityText')) $('maturityText').textContent = state.maturity;
    if ($('languageText')) $('languageText').textContent = state.language;

    if ($('autoplayNext')) $('autoplayNext').checked = !!state.autoplayNext;
    if ($('autoplayPreview')) $('autoplayPreview').checked = !!state.autoplayPreview;
  }

  renderAccountInfo();

  if ($('autoplayNext')) {
    $('autoplayNext').onchange = e => {
      state.autoplayNext = e.target.checked;
      save();
      toast('Autoplay next episode setting updated');
    };
  }

  if ($('autoplayPreview')) {
    $('autoplayPreview').onchange = e => {
      state.autoplayPreview = e.target.checked;
      save();
      toast('Autoplay previews setting updated');
    };
  }

  const modal = $('accountModal');
  const body = $('modalBody');
  const title = $('modalTitle');

  const openModal = (t, html, onSave) => {
    if (!modal || !body || !title) return;
    title.textContent = t;
    body.innerHTML = html;
    modal.classList.add('show');

    const form = body.querySelector('form');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        if (onSave) onSave(new FormData(form));
        modal.classList.remove('show');
        save();
        renderAccountInfo();
      };
    }
  };

  if ($('modalClose')) {
    $('modalClose').onclick = () => modal?.classList.remove('show');
  }

  if (modal) {
    modal.onclick = e => {
      if (e.target === modal) modal.classList.remove('show');
    };
  }

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const a = btn.dataset.action;

      if (a === 'payment') {
        openModal(
          'Payment method',
          `<form><p class="modal-note">Demo payment details are saved in your local browser.</p><label>Payment type<select name="type"><option>UPI</option><option>Debit/Credit Card</option></select></label><label>Display name<input name="value" required placeholder="e.g. UPI ending 1234"></label><button class="btn primary" type="submit">Save payment method</button></form>`,
          f => {
            state.payment = `${f.get('type')} · ${f.get('value')}`;
            toast('Payment method saved');
          }
        );
      }

      if (a === 'billing') {
        openModal(
          'Billing details',
          `<div class="modal-info"><strong>${state.plan} plan</strong><p>${state.price}</p><p>Demo billing history is stored locally on your device.</p><button class="btn outline" type="button" onclick="document.getElementById('accountModal').classList.remove('show')">Done</button></div>`
        );
      }

      if (a === 'pin') {
        openModal(
          'Profile PIN',
          `<form><label>4-digit PIN<input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="1234" required></label><button class="btn primary" type="submit">Save PIN</button></form>`,
          f => {
            state.pin = true;
            toast('Profile PIN enabled');
          }
        );
      }

      if (a === 'maturity') {
        openModal(
          'Maturity restrictions',
          `<form><label>Viewing level<select name="maturity"><option ${state.maturity === 'All maturity levels' ? 'selected' : ''}>All maturity levels</option><option ${state.maturity === 'Teens and below' ? 'selected' : ''}>Teens and below</option><option ${state.maturity === 'Kids only' ? 'selected' : ''}>Kids only</option></select></label><button class="btn primary" type="submit">Save preference</button></form>`,
          f => {
            state.maturity = f.get('maturity');
            toast('Maturity restrictions updated');
          }
        );
      }

      if (a === 'language') {
        openModal(
          'Display language',
          `<form><label>Language<select name="language"><option ${state.language === 'English' ? 'selected' : ''}>English</option><option ${state.language === 'Hindi' ? 'selected' : ''}>Hindi</option><option ${state.language === 'Marathi' ? 'selected' : ''}>Marathi</option><option ${state.language === 'Kannada' ? 'selected' : ''}>Kannada</option></select></label><button class="btn primary" type="submit">Save language</button></form>`,
          f => {
            state.language = f.get('language');
            toast('Display language updated');
          }
        );
      }

      if (a === 'password') {
        openModal(
          'Change password',
          `<form><label>Current password<input type="password" required></label><label>New password<input type="password" minlength="6" required></label><label>Confirm password<input type="password" minlength="6" required></label><button class="btn primary" type="submit">Update password</button></form>`,
          () => {
            toast('Password updated successfully');
          }
        );
      }

      if (a === 'allDevices') {
        if (confirm('Sign out of all Streamflix devices?')) {
          localStorage.removeItem('streamflixProfile');
          localStorage.setItem('streamflixLoggedIn', 'false');
          toast('Signed out of all devices');
          setTimeout(() => location.href = 'login.html', 400);
        }
      }
    };
  });

  const signOutBtn = $('signOutBtn');
  if (signOutBtn) {
    signOutBtn.onclick = e => {
      e.preventDefault();
      if (!confirm('Sign out of Streamflix?')) return;
      localStorage.removeItem('streamflixProfile');
      localStorage.setItem('streamflixLoggedIn', 'false');
      location.href = 'login.html';
    };
  }

  if ($('deleteAccountBtn')) {
    $('deleteAccountBtn').onclick = () => {
      if (confirm('Delete this local demo account and all saved settings?')) {
        localStorage.clear();
        location.href = 'index.html';
      }
    };
  }

  function toast(msg) {
    let t = document.querySelector('.account-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'account-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  window.toast = toast;
})();
