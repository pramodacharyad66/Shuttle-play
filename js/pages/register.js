import { register } from '../auth.js';

export function renderRegister(container, { onSwitchToLogin, onRegistered }) {
  container.innerHTML = `
    <div class="auth-card card">
      <h1 class="auth-title">Join the group</h1>
      <p class="auth-subtitle">An admin will need to approve your request before you can log in.</p>
      <form id="register-form" class="auth-form" novalidate>
        <label class="field-label">Full name
          <input type="text" id="reg-name" placeholder="e.g. Rahul Sharma" autocomplete="name" required />
        </label>
        <label class="field-label">Nickname <span class="field-optional">(optional)</span>
          <input type="text" id="reg-nickname" placeholder="e.g. Rahul" />
        </label>
        <label class="field-label">Mobile number
          <input type="tel" id="reg-mobile" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" autocomplete="tel" required />
        </label>
        <label class="field-label">Choose a 4-digit PIN
          <input type="password" id="reg-pin" inputmode="numeric" maxlength="4" placeholder="••••" required />
        </label>
        <label class="field-label">Confirm PIN
          <input type="password" id="reg-pin-confirm" inputmode="numeric" maxlength="4" placeholder="••••" required />
        </label>
        <p class="auth-error" id="register-error" hidden></p>
        <button type="submit" class="btn btn-primary btn-block" id="register-submit">Request to join</button>
      </form>
      <p class="auth-switch">Already approved? <button type="button" id="go-login" class="link-btn">Log in</button></p>
    </div>
  `;

  const form = container.querySelector('#register-form');
  const errorEl = container.querySelector('#register-error');
  const submitBtn = container.querySelector('#register-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const name = container.querySelector('#reg-name').value.trim();
    const nickname = container.querySelector('#reg-nickname').value.trim();
    const mobile = container.querySelector('#reg-mobile').value.trim();
    const pin = container.querySelector('#reg-pin').value.trim();
    const pinConfirm = container.querySelector('#reg-pin-confirm').value.trim();

    if (pin !== pinConfirm) {
      errorEl.textContent = 'PINs do not match.';
      errorEl.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      await register({ name, nickname, mobile, pin });
      onRegistered(name);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request to join';
    }
  });

  container.querySelector('#go-login').addEventListener('click', onSwitchToLogin);
}
