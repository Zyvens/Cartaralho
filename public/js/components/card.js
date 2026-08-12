/* ============================================================
   Card Component
   ============================================================ */
const CardComponent = {

  /**
   * Create a black (prompt) card.
   * @param {string} text
   * @param {object} options  { large, winner, animated, mini }
   * @returns {HTMLElement}
   */
  createBlackCard(text, options = {}) {
    const card = document.createElement('div');
    const classes = ['game-card', 'black'];
    if (options.large) classes.push('card-large');
    if (options.mini) classes.push('card-mini');
    if (options.winner) classes.push('winner');
    if (options.animated === false) card.style.animation = 'none';
    card.className = classes.join(' ');
    card.innerHTML = `
      <div class="card-text">${this._formatBlackText(text)}</div>
      <div class="card-watermark">
        CARTA PARA CA<span style="color:white; text-decoration:underline;">RTA</span>RALHO
      </div>
    `;
    return card;
  },

  /**
   * Create a white (response) card.
   */
  createWhiteCard(text, options = {}) {
    const card = document.createElement('div');
    const classes = ['game-card', 'white'];
    if (options.large) classes.push('card-large');
    if (options.mini) classes.push('card-mini');
    if (options.winner) classes.push('winner');
    if (options.animated === false) card.style.animation = 'none';
    card.className = classes.join(' ');
    card.innerHTML = `
      <div class="card-text">${text}</div>
      <div class="card-watermark" style="color: #000; opacity: 0.5;">
        CARTA PARA CA<span style="color:#ef4444; text-decoration:underline;">RTA</span>RALHO
      </div>
    `;
    return card;
  },

  /**
   * Create a selectable white card (for the player's hand).
   */
  createSelectableWhiteCard(text, index, onClick) {
    const card = this.createWhiteCard(text);
    card.classList.add('selectable');
    card.dataset.index = index;
    card.addEventListener('click', () => {
      if (typeof onClick === 'function') onClick(index, card);
    });
    return card;
  },

  /**
   * Create an anonymous white card (for host voting).
   */
  createAnonymousCard(text, index, onClick) {
    const card = this.createWhiteCard(text, { large: true });
    card.classList.add('selectable');
    card.dataset.index = index;
    card.addEventListener('click', () => {
      if (typeof onClick === 'function') onClick(index, card);
    });
    return card;
  },

  /**
   * Create a mini card with a delete button (for card creation screen).
   */
  createDeletableCard(text, type, onDelete) {
    const card = type === 'black'
      ? this.createBlackCard(text, { mini: true })
      : this.createWhiteCard(text, { mini: true });
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'card-delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof onDelete === 'function') onDelete();
    });
    card.style.position = 'relative';
    card.appendChild(deleteBtn);
    return card;
  },

  /** Highlight blanks in black card text */
  _formatBlackText(text) {
    return text.replace(/_{3,}/g, '<span style="border-bottom:2px solid rgba(139,92,246,0.6);padding:0 0.5em;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
  },
};
