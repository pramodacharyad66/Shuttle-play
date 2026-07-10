import { login } from '../auth.js';

export function renderLogin(container, { onSwitchToRegister }) {
  container.innerHTML = `
    <div class="auth-card card">
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Log in with your mobile number and PIN.</p>
      <form id="login-form" class="auth-form" novalidate>
        <label class="field-label">Mobile number
          <input type="tel" id="login-mobile" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" autocomplete="tel" required />
        </label>
        <label class="field-label">4-digit PIN
          <input type="password" id="login-pin" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="current-password" required />
        </label>
        <p class="auth-error" id="login-error" hidden></p>
        <button type="submit" class="btn btn-primary btn-block" id="login-submit">Log in</button>
      </form>
      <p class="auth-switch">New here? <button type="button" id="go-register" class="link-btn">Create an account</button></p>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorEl = container.querySelector('#login-error');
  const submitBtn = container.querySelector('#login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    const mobile = container.querySelector('#login-mobile').value.trim();
    const pin = container.querySelector('#login-pin').value.trim();

    try {
      await login({ mobile, pin });
      // A successful login updates state, which the router is subscribed
      // to — it will re-render Home automatically. Nothing more to do here.
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });

  container.querySelector('#go-register').addEventListener('click', onSwitchToRegister);
}
