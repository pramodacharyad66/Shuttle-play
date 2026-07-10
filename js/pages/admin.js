import { callApi } from '../api.js';

export function renderAdmin(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Admin</div>
      <h2>Manage members</h2>
      <a href="#/" class="link-btn" style="display:inline-block; margin-top:var(--space-2);">&larr; Back to home</a>
    </div>
    <div id="admin-content">
      <div class="skeleton" style="height: 80px; margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 80px;"></div>
    </div>
  `;

  loadUsers(container);
}

async function loadUsers(container) {
  const contentEl = container.querySelector('#admin-content');
  try {
    const users = await callApi('users.list', {});
    renderUserLists(contentEl, users);
  } catch (err) {
    contentEl.innerHTML = `<div class="card"><p class="auth-error">${escapeHtml(err.message)}</p></div>`;
  }
}

function renderUserLists(contentEl, users) {
  const pending = users.filter((u) => u.status === 'pending');
  const active = users.filter((u) => u.status === 'approved');
  const removed = users.filter((u) => u.status === 'removed');

  contentEl.innerHTML = `
    <div class="card">
      <div class="card-title">Pending requests (${pending.length})</div>
      ${pending.length === 0
        ? '<p style="color: var(--spl-text-muted);">No pending requests right now.</p>'
        : pending.map((u) => userRow(u, true)).join('')}
    </div>
    <div class="card">
      <div class="card-title">Active members (${active.length})</div>
      ${active.map((u) => userRow(u, false)).join('') || '<p style="color: var(--spl-text-muted);">None yet.</p>'}
    </div>
    ${removed.length > 0 ? `
      <div class="card">
        <div class="card-title">Removed (${removed.length})</div>
        ${removed.map((u) => `<div class="user-row"><span>${escapeHtml(u.name)}</span></div>`).join('')}
      </div>
    ` : ''}
  `;

  contentEl.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', () => handleAction(contentEl, btn.dataset.approve, 'users.approve'));
  });
  contentEl.querySelectorAll('[data-reject]').forEach((btn) => {
    btn.addEventListener('click', () => handleAction(contentEl, btn.dataset.reject, 'users.reject'));
  });
}

function userRow(user, showActions) {
  return `
    <div class="user-row">
      <div>
        <div class="user-row-name">${escapeHtml(user.name)}${user.nickname ? ` (${escapeHtml(user.nickname)})` : ''}</div>
        <div class="user-row-meta">${escapeHtml(user.mobile)} &middot; ${escapeHtml(user.role)}</div>
      </div>
      ${showActions ? `
        <div class="user-row-actions">
          <button type="button" class="btn btn-primary" data-approve="${user.userId}" style="min-height:36px; padding:6px 16px; font-size: var(--text-sm);">Approve</button>
          <button type="button" class="btn btn-secondary" data-reject="${user.userId}" style="min-height:36px; padding:6px 16px; font-size: var(--text-sm);">Reject</button>
        </div>
      ` : ''}
    </div>
  `;
}

async function handleAction(contentEl, userId, action) {
  try {
    await callApi(action, { userId });
    loadUsers(contentEl.closest('#view'));
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
