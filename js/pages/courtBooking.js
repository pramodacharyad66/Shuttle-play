import { state } from '../state.js';
import { callApi } from '../api.js';

function todayDateString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function canEditBooking() {
  return ['SuperAdmin', 'GameLead'].includes(state.user.role);
}

export function renderCourtBooking(container) {
  const today = todayDateString();

  container.innerHTML = `
    <div class="card">
      <div class="card-title">Today's court</div>
      <div id="booking-display"><div class="skeleton" style="height: 80px;"></div></div>
    </div>

    ${canEditBooking() ? `
      <div class="card">
        <div class="card-title">${'Update booking'}</div>
        <form id="booking-form" class="auth-form" novalidate>
          <label class="field-label">Court name
            <input type="text" id="booking-court" placeholder="e.g. Court 3, XYZ Sports Arena" required />
          </label>
          <label class="field-label">Time slot
            <input type="text" id="booking-time" placeholder="e.g. 7:00 PM – 9:00 PM" required />
          </label>
          <label class="field-label">Status
            <select id="booking-status">
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <p class="auth-error" id="booking-error" hidden></p>
          <button type="submit" class="btn btn-primary btn-block">Save booking</button>
        </form>
      </div>
    ` : ''}
  `;

  loadBooking(container, today);

  const form = container.querySelector('#booking-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = container.querySelector('#booking-error');
      errorEl.hidden = true;

      const courtName = container.querySelector('#booking-court').value.trim();
      const timeSlot = container.querySelector('#booking-time').value.trim();
      const status = container.querySelector('#booking-status').value;

      try {
        await callApi('courtBooking.set', { sessionDate: today, courtName, timeSlot, status });
        loadBooking(container, today);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
      }
    });
  }
}

async function loadBooking(container, sessionDate) {
  const displayEl = container.querySelector('#booking-display');
  try {
    const booking = await callApi('courtBooking.get', { sessionDate });
    if (!booking) {
      displayEl.innerHTML = `<p style="color: var(--spl-text-muted);">No court booked yet for today.</p>`;
      return;
    }
    displayEl.innerHTML = `
      <h2>${escapeHtml(booking.courtName)}</h2>
      <p style="color: var(--spl-text-secondary); margin-top: var(--space-2);">${escapeHtml(booking.timeSlot)}</p>
      <div style="display:flex; gap: var(--space-2); align-items:center; margin-top: var(--space-3);">
        <span class="status-pill status-pill--${booking.status === 'confirmed' ? 'available' : booking.status === 'cancelled' ? 'unavailable' : 'late'}">${escapeHtml(booking.status)}</span>
        <span style="font-size: var(--text-xs); color: var(--spl-text-muted);">Booked by ${escapeHtml(booking.bookedByName)}</span>
      </div>
    `;
  } catch (err) {
    displayEl.innerHTML = `<p class="auth-error">${escapeHtml(err.message)}</p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
