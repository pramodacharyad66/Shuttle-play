export function renderPendingApproval(container, { name, onBackToLogin }) {
  container.innerHTML = `
    <div class="auth-card card" style="text-align: center;">
      <div class="pending-icon">🏸</div>
      <h1 class="auth-title">Thanks${name ? ', ' + escapeHtml(name) : ''}!</h1>
      <p class="auth-subtitle">
        Your request has been sent to the group admin. You'll be able to log in
        as soon as they approve you — no need to register again.
      </p>
      <button type="button" class="btn btn-secondary btn-block" id="back-to-login">Back to login</button>
    </div>
  `;
  container.querySelector('#back-to-login').addEventListener('click', onBackToLogin);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
