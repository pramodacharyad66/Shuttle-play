import { state, updateUser } from '../state.js';
import { callApi } from '../api.js';

export function renderProfile(container) {
  const user = state.user;

  container.innerHTML = `
    <div class="card" style="text-align:center;">
      <div class="profile-photo-wrap">
        ${user.photoUrl
          ? `<img src="${escapeAttr(user.photoUrl)}" alt="Profile photo" class="profile-photo" />`
          : `<div class="profile-photo profile-photo--placeholder">${initials(user.name)}</div>`}
        <label class="photo-upload-btn" for="photo-input">Change photo</label>
        <input type="file" id="photo-input" accept="image/jpeg,image/png" hidden />
      </div>
      <p id="photo-status" class="field-hint" hidden></p>
    </div>

    <div class="card">
      <div class="card-title">Your details</div>
      <form id="profile-form" class="auth-form" novalidate>
        <label class="field-label">Name
          <input type="text" id="profile-name" value="${escapeAttr(user.name)}" required />
        </label>
        <label class="field-label">Nickname
          <input type="text" id="profile-nickname" value="${escapeAttr(user.nickname || '')}" />
        </label>
        <p class="auth-error" id="profile-error" hidden></p>
        <p class="field-hint" id="profile-success" hidden>Saved.</p>
        <button type="submit" class="btn btn-primary btn-block" id="profile-save">Save changes</button>
      </form>
    </div>

    <div class="card">
      <div class="card-title">Account</div>
      <p style="color: var(--spl-text-secondary); font-size: var(--text-sm);">
        Mobile: ${escapeAttr(user.mobile)}<br/>
        Role: ${escapeAttr(user.role)}
      </p>
    </div>
  `;

  // --- Save name/nickname ---
  const form = container.querySelector('#profile-form');
  const errorEl = container.querySelector('#profile-error');
  const successEl = container.querySelector('#profile-success');
  const saveBtn = container.querySelector('#profile-save');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    successEl.hidden = true;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const name = container.querySelector('#profile-name').value.trim();
    const nickname = container.querySelector('#profile-nickname').value.trim();

    try {
      const updated = await callApi('profile.update', { name, nickname });
      updateUser(updated);
      successEl.hidden = false;
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save changes';
    }
  });

  // --- Photo upload ---
  const photoInput = container.querySelector('#photo-input');
  const photoStatus = container.querySelector('#photo-status');

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      photoStatus.textContent = 'Photo must be under 2MB.';
      photoStatus.hidden = false;
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      photoStatus.textContent = 'Please choose a JPEG or PNG image.';
      photoStatus.hidden = false;
      return;
    }

    photoStatus.textContent = 'Uploading…';
    photoStatus.hidden = false;

    try {
      const base64Data = await fileToBase64(file);
      const result = await callApi('profile.uploadPhoto', { base64Data, mimeType: file.type });
      updateUser({ photoUrl: result.photoUrl });
      photoStatus.hidden = true;
      renderProfile(container); // re-render to show the new photo
    } catch (err) {
      photoStatus.textContent = err.message;
      photoStatus.hidden = false;
    }
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:image/jpeg;base64,XXXX" — strip the prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function escapeAttr(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
