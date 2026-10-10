(() => {
  const defaults = {name:'Nishit', email:'member@example.com', plan:'Premium', price:'₹649/month', payment:'No payment method added', billing:'Not scheduled', pin:false, maturity:'All maturity levels', language:'English', autoplayNext:true, autoplayPreview:false};
  const state = {...defaults, ...JSON.parse(localStorage.getItem('streamflixAccount') || '{}')};
  const save = () => localStorage.setItem('streamflixAccount', JSON.stringify(state));
  const activeProfileName = localStorage.getItem('streamflixProfile') || state.name || 'Nishit';
  if ($('accountName')) $('accountName').textContent = activeProfileName;
  if ($('accountEmail')) $('accountEmail').textContent = state.email || 'member@example.com';
  if ($('accountAvatar')) $('accountAvatar').textContent = activeProfileName.charAt(0).toUpperCase();
  $('planText').textContent = `${state.plan} · ${state.price}`; $('paymentText').textContent = state.payment; $('billingText').textContent = state.billing;
  $('pinText').textContent = state.pin ? 'Enabled' : 'Not enabled'; $('maturityText').textContent = state.maturity; $('languageText').textContent = state.language;
  $('autoplayNext').checked = !!state.autoplayNext; $('autoplayPreview').checked = !!state.autoplayPreview;
  $('autoplayNext').onchange = e => {state.autoplayNext=e.target.checked;save(); toast('Autoplay next episode updated');};
  $('autoplayPreview').onchange = e => {state.autoplayPreview=e.target.checked;save();toast('Preview autoplay updated');};
  const modal=$('accountModal'), body=$('modalBody'), title=$('modalTitle');
  const open=(t,html,onSave)=>{title.textContent=t;body.innerHTML=html;modal.classList.add('show');const form=body.querySelector('form');if(form)form.onsubmit=e=>{e.preventDefault();onSave(new FormData(form));modal.classList.remove('show');save();location.reload();};};
  $('modalClose').onclick=()=>modal.classList.remove('show'); modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show');};
  document.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>{
    const a=btn.dataset.action;
    if(a==='payment') open('Payment method',`<form><p class="modal-note">This demo stores payment details only in your browser. Never enter real card details.</p><label>Payment type<select name="type"><option>UPI</option><option>Debit/Credit Card</option></select></label><label>Display name<input name="value" required placeholder="e.g. UPI ending 1234"></label><button class="btn primary" type="submit">Save payment method</button></form>`,f=>{state.payment=`${f.get('type')} · ${f.get('value')}`});
    if(a==='billing') open('Billing details',`<div class="modal-info"><strong>${state.plan} plan</strong><p>${state.price}</p><p>Your demo billing history is stored locally. No real charge is made.</p><button class="btn outline" onclick="this.closest('.modal-backdrop').classList.remove('show')">Done</button></div>`);
    if(a==='pin') open('Profile PIN',`<form><label>4-digit PIN<input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="1234" ${state.pin?'value=""':''} required></label><button class="btn primary" type="submit">Save PIN</button></form>`,f=>{state.pin=true});
    if(a==='maturity') open('Maturity restrictions',`<form><label>Viewing level<select name="maturity"><option ${state.maturity==='All maturity levels'?'selected':''}>All maturity levels</option><option ${state.maturity==='Teens and below'?'selected':''}>Teens and below</option><option ${state.maturity==='Kids only'?'selected':''}>Kids only</option></select></label><button class="btn primary" type="submit">Save preference</button></form>`,f=>{state.maturity=f.get('maturity')});
    if(a==='language') open('Display language',`<form><label>Language<select name="language"><option>English</option><option>Hindi</option><option>Marathi</option><option>Kannada</option></select></label><button class="btn primary" type="submit">Save language</button></form>`,f=>{state.language=f.get('language')});
    if(a==='password') open('Change password',`<form><label>Current password<input type="password" required></label><label>New password<input type="password" minlength="6" required></label><label>Confirm password<input type="password" minlength="6" required></label><button class="btn primary" type="submit">Update password</button></form>`,()=>toast('Password updated for this demo'));
    if(a==='allDevices' && confirm('Sign out of all Streamflix devices?')) {localStorage.removeItem('streamflixProfile');localStorage.setItem('streamflixLoggedIn','false');location.href='login.html';}
  });
  const signOutBtn = $('signOutBtn');
  if (signOutBtn) {
    signOutBtn.onclick = (e) => {
      e.preventDefault();
      if (!confirm('Sign out of Streamflix?')) return;
      localStorage.removeItem('streamflixProfile');
      localStorage.setItem('streamflixLoggedIn','false');
      location.href='login.html';
    };
  }
  $('deleteAccountBtn').onclick=()=>{if(confirm('Delete this local demo account and all saved settings?')){localStorage.clear();location.href='index.html';}};
  window.toast=msg=>{let t=document.querySelector('.account-toast');if(!t){t=document.createElement('div');t.className='account-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)};
})();
