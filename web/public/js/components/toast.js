/* ============================================================
   Toast Notification System
   ============================================================ */
const Toast = {
  container: null,

  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
    }
    return this.container;
  },

  _getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
    };
    return icons[type] || icons.info;
  },

  show(message, type = 'info', duration = 3500) {
    const container = this._getContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${this._getIcon(type)}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => this._dismiss(toast), duration);

    // Click to dismiss early
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      this._dismiss(toast);
    });
  },

  _dismiss(toastEl) {
    if (!toastEl || toastEl.classList.contains('toast-exit')) return;
    toastEl.classList.add('toast-exit');
    toastEl.addEventListener('animationend', () => {
      toastEl.remove();
    });
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error', 5000); },
  info(msg)    { this.show(msg, 'info'); },
  warning(msg) { this.show(msg, 'warning', 4000); },
};
