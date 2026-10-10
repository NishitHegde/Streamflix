(() => {
  const email = document.getElementById('index-email');
  const getStarted = document.getElementById('index-get-started');
  const modal = document.getElementById('sf-signup-modal');
  const modalForm = document.getElementById('sf-signup-form');
  const modalEmail = document.getElementById('sf-signup-email');
  const close = document.getElementById('sf-signup-close');
  if (!email || !getStarted) return;

  const validEmail = el => el && el.validity.valid && el.value.trim().length > 0;
  const update = () => {
    const ready = validEmail(email);
    getStarted.disabled = !ready;
    getStarted.classList.toggle('is-ready', ready);
    getStarted.setAttribute('aria-disabled', String(!ready));
  };

  const openSignupModal = (prefill = '') => {
    if (!modal) return;
    if (prefill && !modalEmail.value) modalEmail.value = prefill;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sf-modal-open');
    setTimeout(() => modalEmail?.focus(), 30);
  };

  const closeSignupModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sf-modal-open');
  };

  const goToSignup = value => {
    const clean = value.trim();
    sessionStorage.setItem('streamflixPendingEmail', clean);
    location.href = 'signup.html';
  };

  email.addEventListener('input', update);
  email.addEventListener('change', update);
  email.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (validEmail(email)) goToSignup(email.value);
      else email.reportValidity();
    }
  });

  // Bottom email CTA remains functional. A valid email goes straight to signup.
  getStarted.addEventListener('click', () => {
    if (!validEmail(email)) {
      email.focus();
      email.reportValidity();
      return;
    }
    goToSignup(email.value);
  });

  // Only Sign In and Sign Up/Get Started and theme/menu toggles are directly enabled.
  document.querySelectorAll('a, button').forEach(el => {
    if (el === getStarted || el.closest('#sf-signup-modal') || el.matches('.sf-signup-close')) return;
    const isExempt = el.matches('.sf-theme-btn, .sf-menu-btn, a[href="login.html"], a[href="signup.html"], .landing-nav a, .auth-header a');
    if (isExempt) return;
    el.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openSignupModal(email.value.trim());
    }, true);
  });

  modalForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!validEmail(modalEmail)) {
      modalEmail.reportValidity();
      return;
    }
    goToSignup(modalEmail.value);
  });

  close?.addEventListener('click', closeSignupModal);
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeSignupModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeSignupModal();
  });

  update();
})();
