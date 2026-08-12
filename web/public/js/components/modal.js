/* ============================================================
   Modal Component
   ============================================================ */
const Modal = {
  overlay: null,

  show({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, showCancel = true, isPrompt = false, defaultValue = '' }) {
    this.hide();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    let inputHtml = '';
    if (isPrompt) {
      inputHtml = `<div class="input-group" style="margin-top: 15px;">
                     <input type="text" id="modal-prompt-input" class="input" value="${defaultValue}" autocomplete="off">
                   </div>`;
    }

    overlay.innerHTML = `
      <div class="modal-box">
        <h3 class="modal-title">${title}</h3>
        <p class="modal-message">${message}</p>
        ${inputHtml}
        <div class="modal-actions">
          ${showCancel ? `<button class="btn btn-secondary modal-cancel">${cancelText}</button>` : ''}
          <button class="btn btn-primary modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;

    const inputEl = overlay.querySelector('#modal-prompt-input');
    if (inputEl) {
      inputEl.focus();
    }

    const handleConfirm = () => {
      const val = inputEl ? inputEl.value : true;
      this.hide();
      if (onConfirm) onConfirm(val);
    };

    const handleCancel = () => {
      this.hide();
      if (onCancel) onCancel(null);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleCancel();
    });

    const cancelBtn = overlay.querySelector('.modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);

    const confirmBtn = overlay.querySelector('.modal-confirm');
    confirmBtn.addEventListener('click', handleConfirm);

    this._keydownHandler = (e) => {
      if (e.key === 'Escape') handleCancel();
      if (e.key === 'Enter' && isPrompt) handleConfirm();
    };
    document.addEventListener('keydown', this._keydownHandler);
  },

  hide() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
  },

  confirm(title, message, confirmText = 'Sim', cancelText = 'Não') {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        confirmText,
        cancelText,
        showCancel: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  },

  prompt(title, message, defaultValue = '', confirmText = 'OK', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
      this.show({
        title,
        message,
        confirmText,
        cancelText,
        showCancel: true,
        isPrompt: true,
        defaultValue,
        onConfirm: (val) => resolve(val),
        onCancel: () => resolve(null)
      });
    });
  }
};
