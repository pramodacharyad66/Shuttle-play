import { state, isAdmin } from '../state.js';
import { logout } from '../auth.js';

export function renderHome(container) {
  const user = state.user;

  container.innerHTML = `
    <div class="card card--live">
      <div class="card-title">You're in</div>
      <h2>Hey, ${escapeHtml(user.nickname || user.name)} 👋</h2>
      <p style="color: var(--spl-text-secondary); margin-top: var(--space-2);">
        Logged in as <strong>${escapeHtml(user.role)}</strong>.
        ${user.vacationUntil ? `You're on vacation mode until ${escapeHtml(formatVacationDate(user.vacationUntil))}.` : ''}
      </p>
    </div>

    <div class="quick-links">
      <a href="#/availability" class="card quick-link">
        <div class="quick-link-icon">🏸</div>
        <div>Availability</div>
      </a>
      <a href="#/court" class="card quick-link">
        <div class="quick-link-icon">📍</div>
        <div>Court booking</div>
      </a>
      <a href="#/announcements" class="card quick-link">
        <div class="quick-link-icon">📣</div>
        <div>Announcements</div>
      </a>
      <a href="#/profile" class="card quick-link">
        <div class="quick-link-icon">👤</div>
        <div>Your profile</div>
      </a>
    </div>

    ${isAdmin() ? `
      <div class="card">
        <div class="card-title">Admin</div>
        <p style="margin-bottom: var(--space-3); color: var(--spl-text-secondary);">
          You're a Super Admin — approve new members and manage roles here.
        </p>
        <a href="#/admin" class="btn btn-secondary btn-block">Go to Admin panel</a>
      </div>
    ` : ''}

    <button type="button" class="btn btn-secondary btn-block" id="logout-btn">Log out</button>
  `;

  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await logout();
  });
}

function formatVacationDate(value) {
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (err) {
    return value;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
