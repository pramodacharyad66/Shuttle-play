import { state, isAdmin } from '../state.js';
import { logout } from '../auth.js';

export function renderHome(container) {
  const user = state.user;

  container.innerHTML = `
    <div class="card card--live">
      <div class="card-title">You're in</div>
      <h2>Hey, ${escapeHtml(user.nickname || user.name)} 👋</h2>
      <p style="color: var(--spl-text-secondary); margin-top: var(--space-2);">
        Logged in as <strong>${escapeHtml(user.role)}</strong>. The real dashboard
        (today's session, matches, payments…) arrives in later phases — this
        confirms your login and session are working end to end.
      </p>
    </div>

    ${isAdmin() ? `
      <div class="card">
        <div class="card-title">Admin</div>
        <p style="margin-bottom: var(--space-3); color: var(--spl-text-secondary);">
          You're a Super Admin — approve new members here.
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
