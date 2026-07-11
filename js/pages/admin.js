import { callApi } from '../api.js';

const ROLES = ['Player', 'GameLead', 'FinanceLead', 'SuperAdmin'];
const ROLE_LABELS = { Player: 'Player', GameLead: 'Game Lead', FinanceLead: 'Finance Lead', SuperAdmin: 'Super Admin' };

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
    renderUserLists(container, contentEl, users);
  } catch (err) {
    contentEl.innerHTML = `<div class="card"><p class="auth-error">${escapeHtml(err.message)}</p></div>`;
  }
}

function renderUserLists(rootContainer, contentEl, users) {
  const pending = users.filter((u) => u.status === 'pending');
  const active = users.filter((u) => u.status === 'approved');
  const removed = users.filter((u) => u.status === 'removed');

  contentEl.innerHTML = `
    <div class="card">
      <div class="card-title">Pending requests (${pending.length})</div>
      ${pending.length === 0
        ? '<p style="color: var(--spl-text-muted);">No pending requests right now.</p>'
        : pending.map((u) => pendingRow(u)).join('')}
    </div>
    <div class="card">
      <div class="card-title">Active members (${active.length})</div>
      ${active.map((u) => activeRow(u)).join('') || '<p style="color: var(--spl-text-muted);">None yet.</p>'}
    </div>
    ${removed.length > 0 ? `
      <div class="card">
        <div class="card-title">Removed (${removed.length})</div>
        ${removed.map((u) => `<div class="user-row"><span>${escapeHtml(u.name)}</span></div>`).join('')}
      </div>
    ` : ''}
  `;

  contentEl.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const roleSelect = contentEl.querySelector(`select[data-role-for="${btn.dataset.approve}"]`);
      const role = roleSelect ? roleSelect.value : 'Player';
      try {
        await callApi('users.approve', { userId: btn.dataset.approve, role });
        loadUsers(rootContainer);
      } catch (err) {
        alert(err.message);
      }
    });
  });

  contentEl.querySelectorAll('[data-reject]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Reject/remove this member?')) return;
      try {
        await callApi('users.reject', { userId: btn.dataset.reject });
        loadUsers(rootContainer);
      } catch (err) {
        alert(err.message);
      }
    });
  });

  contentEl.querySelectorAll('[data-update-role]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const roleSelect = contentEl.querySelector(`select[data-role-for="${btn.dataset.updateRole}"]`);
      try {
        await callApi('users.assignRole', { userId: btn.dataset.updateRole, role: roleSelect.value });
        loadUsers(rootContainer);
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

function roleSelectHtml(userId, currentRole) {
  return `
    <select data-role-for="${userId}" class="role-select">
      ${ROLES.map((r) => `<option value="${r}" ${r === currentRole ? 'selected' : ''}>${ROLE_LABELS[r]}</option>`).join('')}
    </select>
  `;
}

function pendingRow(user) {
  return `
    <div class="user-row user-row--wrap">
      <div>
        <div class="user-row-name">${escapeHtml(user.name)}${user.nickname ? ` (${escapeHtml(user.nickname)})` : ''}</div>
        <div class="user-row-meta">${escapeHtml(user.mobile)}</div>
      </div>
      <div class="user-row-actions">
        ${roleSelectHtml(user.userId, 'Player')}
        <button type="button" class="btn btn-primary" data-approve="${user.userId}" style="min-height:36px; padding:6px 16px; font-size: var(--text-sm);">Approve</button>
        <button type="button" class="btn btn-secondary" data-reject="${user.userId}" style="min-height:36px; padding:6px 16px; font-size: var(--text-sm);">Reject</button>
      </div>
    </div>
  `;
}

function activeRow(user) {
  return `
    <div class="user-row user-row--wrap">
      <div>
        <div class="user-row-name">${escapeHtml(user.name)}${user.nickname ? ` (${escapeHtml(user.nickname)})` : ''}</div>
        <div class="user-row-meta">${escapeHtml(user.mobile)}</div>
      </div>
      <div class="user-row-actions">
        ${roleSelectHtml(user.userId, user.role)}
        <button type="button" class="btn btn-secondary" data-update-role="${user.userId}" style="min-height:36px; padding:6px 16px; font-size: var(--text-sm);">Update</button>
        <button type="button" class="btn btn-secondary" data-reject="${user.userId}" style="min-height:36px; padding:6px 16px; font-size: var(--text-sm);">Remove</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
