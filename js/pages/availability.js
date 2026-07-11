import { state } from '../state.js';
import { callApi } from '../api.js';

function todayDateString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function renderAvailability(container) {
  const today = todayDateString();
  const user = state.user;

  container.innerHTML = `
    ${user.vacationUntil ? `
      <div class="card" style="border-color: var(--spl-warning);">
        <div class="card-title">Vacation mode</div>
        <p>You're marked away until <strong>${escapeHtml(user.vacationUntil)}</strong>.</p>
        <button type="button" class="btn btn-secondary btn-block" id="clear-vacation" style="margin-top: var(--space-3);">Turn off vacation mode</button>
      </div>
    ` : ''}

    <div class="card">
      <div class="card-title">Today — ${escapeHtml(today)}</div>
      <h2>Are you playing?</h2>
      <div class="availability-choices" style="margin-top: var(--space-4);">
        <button type="button" class="btn btn-secondary avail-choice" data-status="available">Available</button>
        <button type="button" class="btn btn-secondary avail-choice" data-status="unavailable">Not available</button>
        <button type="button" class="btn btn-secondary avail-choice" data-status="late">Running late</button>
      </div>
      <div id="late-minutes-wrap" hidden style="margin-top: var(--space-3);">
        <label class="field-label">Minutes late
          <input type="number" id="late-minutes" min="1" max="180" value="15" />
        </label>
      </div>
      <p class="field-hint" id="avail-status" hidden></p>
    </div>

    <div class="card">
      <div class="card-title">Vacation mode</div>
      <p style="color: var(--spl-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-3);">
        Going away for a while? Set a return date and you won't need to mark yourself unavailable every day.
      </p>
      <label class="field-label">I'm away until
        <input type="date" id="vacation-date" />
      </label>
      <button type="button" class="btn btn-secondary btn-block" id="set-vacation" style="margin-top: var(--space-3);">Set vacation mode</button>
    </div>

    <div class="card">
      <div class="card-title">Who's in today</div>
      <div id="availability-list"><div class="skeleton" style="height: 60px;"></div></div>
    </div>
  `;

  // --- Availability buttons ---
  const lateWrap = container.querySelector('#late-minutes-wrap');
  const statusMsg = container.querySelector('#avail-status');

  container.querySelectorAll('.avail-choice').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const status = btn.dataset.status;
      lateWrap.hidden = status !== 'late';
      if (status === 'late') return; // wait for them to confirm minutes, submitted below

      await submitAvailability(today, status, null, statusMsg, container);
    });
  });

  // Late-arrival submission happens once they've entered minutes — add a
  // small confirm affordance by submitting on blur/change of the minutes field.
  const lateInput = container.querySelector('#late-minutes');
  lateInput.addEventListener('change', async () => {
    await submitAvailability(today, 'late', Number(lateInput.value), statusMsg, container);
  });

  // --- Vacation mode ---
  container.querySelector('#set-vacation').addEventListener('click', async () => {
    const date = container.querySelector('#vacation-date').value;
    if (!date) return;
    try {
      const result = await callApi('availability.setVacation', { vacationUntil: date });
      state.user.vacationUntil = result.vacationUntil;
      renderAvailability(container);
    } catch (err) {
      alert(err.message);
    }
  });

  const clearBtn = container.querySelector('#clear-vacation');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      try {
        await callApi('availability.setVacation', { vacationUntil: '' });
        state.user.vacationUntil = '';
        renderAvailability(container);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  loadAvailabilityList(container, today);
}

async function submitAvailability(sessionDate, status, lateByMinutes, statusMsg, container) {
  statusMsg.hidden = false;
  statusMsg.textContent = 'Saving…';
  try {
    await callApi('availability.set', {
      sessionDate,
      status,
      lateByMinutes: lateByMinutes || undefined,
    });
    statusMsg.textContent = `Marked as "${status}" for today.`;
    loadAvailabilityList(container, sessionDate);
  } catch (err) {
    statusMsg.textContent = err.message;
  }
}

async function loadAvailabilityList(container, sessionDate) {
  const listEl = container.querySelector('#availability-list');
  try {
    const rows = await callApi('availability.get', { sessionDate });
    if (rows.length === 0) {
      listEl.innerHTML = '<p style="color: var(--spl-text-muted);">No one has marked their availability yet.</p>';
      return;
    }
    listEl.innerHTML = rows.map((r) => `
      <div class="user-row">
        <span>${escapeHtml(r.nickname || r.name)}</span>
        <span class="status-pill status-pill--${r.status}">${r.status === 'late' ? `Late (${r.lateByMinutes}m)` : r.status}</span>
      </div>
    `).join('');
  } catch (err) {
    listEl.innerHTML = `<p class="auth-error">${escapeHtml(err.message)}</p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
