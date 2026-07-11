import { state } from '../state.js';
import { callApi } from '../api.js';

function canPost() {
  return ['SuperAdmin', 'GameLead', 'FinanceLead'].includes(state.user.role);
}

export function renderAnnouncements(container) {
  container.innerHTML = `
    ${canPost() ? `
      <div class="card">
        <div class="card-title">Post an announcement</div>
        <form id="announcement-form" class="auth-form" novalidate>
          <label class="field-label">Title
            <input type="text" id="ann-title" required />
          </label>
          <label class="field-label">Message
            <textarea id="ann-body" rows="3" required style="width:100%; font-family: inherit; font-size: var(--text-base); color: var(--spl-text-primary); background: var(--spl-bg-elevated); border: 1px solid var(--spl-border); border-radius: var(--radius-sm); padding: var(--space-3) var(--space-4); resize: vertical;"></textarea>
          </label>
          <label style="display:flex; align-items:center; gap: var(--space-2); font-size: var(--text-sm); color: var(--spl-text-secondary);">
            <input type="checkbox" id="ann-pinned" style="width:auto;" /> Pin to top
          </label>
          <p class="auth-error" id="ann-error" hidden></p>
          <button type="submit" class="btn btn-primary btn-block">Post</button>
        </form>
      </div>
    ` : ''}
    <div id="announcements-list"><div class="skeleton" style="height: 80px; margin-bottom: var(--space-4);"></div></div>
  `;

  const form = container.querySelector('#announcement-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = container.querySelector('#ann-error');
      errorEl.hidden = true;

      const title = container.querySelector('#ann-title').value.trim();
      const body = container.querySelector('#ann-body').value.trim();
      const pinned = container.querySelector('#ann-pinned').checked;

      try {
        await callApi('announcements.create', { title, body, pinned });
        form.reset();
        loadAnnouncements(container);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
      }
    });
  }

  loadAnnouncements(container);
}

async function loadAnnouncements(container) {
  const listEl = container.querySelector('#announcements-list');
  try {
    const items = await callApi('announcements.list', {});
    if (items.length === 0) {
      listEl.innerHTML = '<div class="card"><p style="color: var(--spl-text-muted);">No announcements yet.</p></div>';
      return;
    }
    listEl.innerHTML = items.map((a) => `
      <div class="card ${a.pinned ? 'card--live' : ''}">
        ${a.pinned ? '<div class="card-title">📌 Pinned</div>' : ''}
        <h3>${escapeHtml(a.title)}</h3>
        <p style="color: var(--spl-text-secondary); margin-top: var(--space-2);">${escapeHtml(a.body)}</p>
        <p style="font-size: var(--text-xs); color: var(--spl-text-muted); margin-top: var(--space-3);">
          ${escapeHtml(a.authorName)} &middot; ${formatDate(a.createdAt)}
          ${canPost() ? `<button type="button" class="link-btn" data-delete="${a.announcementId}" style="margin-left: var(--space-3);">Remove</button>` : ''}
        </p>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this announcement?')) return;
        try {
          await callApi('announcements.delete', { announcementId: btn.dataset.delete });
          loadAnnouncements(container);
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<div class="card"><p class="auth-error">${escapeHtml(err.message)}</p></div>`;
  }
}

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (err) {
    return '';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
