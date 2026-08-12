/* ============================================================
   Scoreboard Component
   ============================================================ */
const Scoreboard = {
  container: null,
  _prevScores: {},

  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('scoreboard-container');
    }
    return this.container;
  },

  /**
   * Show scoreboard with player data.
   * @param {Array} players  [{nickname, score, isHost}]
   */
  show(players) {
    const container = this._getContainer();
    container.innerHTML = '';

    const board = document.createElement('div');
    board.className = 'scoreboard';
    board.id = 'scoreboard';
    board.innerHTML = `
      <div class="scoreboard-header">
        <h4>🏆 Placar</h4>
        <span class="scoreboard-toggle">▲</span>
      </div>
      <div class="scoreboard-body"></div>
    `;

    container.appendChild(board);

    // Toggle collapse
    board.querySelector('.scoreboard-header').addEventListener('click', () => {
      board.classList.toggle('collapsed');
    });

    // Auto-collapse on mobile after 4s
    setTimeout(() => {
      if (window.innerWidth <= 768 && board && !board.classList.contains('collapsed')) {
        board.classList.add('collapsed');
      }
    }, 4000);

    this.update(players);
  },

  /**
   * Update scores.
   */
  update(players) {
    const board = document.getElementById('scoreboard');
    if (!board) return this.show(players);

    const body = board.querySelector('.scoreboard-body');
    if (!body) return;

    // Sort by score descending
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const topScore = sorted.length > 0 ? sorted[0].score : 0;

    body.innerHTML = sorted.map((p, i) => {
      const changed = this._prevScores[p.nickname] !== undefined && this._prevScores[p.nickname] !== p.score;
      const icon = p.isHost ? '👑' : (p.score > 0 && p.score === topScore ? '⭐' : '');
      return `
        <div class="scoreboard-item ${changed ? 'highlight' : ''}">
          <span class="scoreboard-rank">${i + 1}º</span>
          ${icon ? `<span class="scoreboard-icon">${icon}</span>` : ''}
          <span class="scoreboard-name">${p.nickname}</span>
          <span class="scoreboard-score">${p.score}</span>
        </div>
      `;
    }).join('');

    // Track previous scores for highlight detection
    this._prevScores = {};
    players.forEach(p => { this._prevScores[p.nickname] = p.score; });
  },

  /**
   * Highlight a specific player (flash).
   */
  highlight(nickname) {
    const items = document.querySelectorAll('.scoreboard-item');
    items.forEach(item => {
      if (item.querySelector('.scoreboard-name')?.textContent === nickname) {
        item.classList.remove('highlight');
        void item.offsetWidth; // reflow
        item.classList.add('highlight');
      }
    });
  },

  hide() {
    const container = this._getContainer();
    container.innerHTML = '';
    this._prevScores = {};
  },
};
