/* ============================================================
   Player List Component
   ============================================================ */
const PlayerList = {
  _avatarColors: [
    '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b',
    '#ef4444', '#3b82f6', '#a855f7', '#14b8a6', '#f97316',
  ],

  _getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this._avatarColors[Math.abs(hash) % this._avatarColors.length];
  },

  /**
   * Render a player list into a container.
   * @param {HTMLElement} container
   * @param {Array} players  [{nickname, cardsReady, score, isCreator, connected}]
   * @param {object} options  { showStatus: true, showScore: false, canEdit: false, onEdit: fn, onDelete: fn }
   */
  render(container, players, options = {}) {
    const { showStatus = true, showScore = false, canEdit = false, onEdit, onDelete } = options;

    const list = document.createElement('div');
    list.className = 'player-list';

    players.forEach((p) => {
      const color = this._getColor(p.nickname);
      const initial = p.nickname.charAt(0).toUpperCase();

      let statusClass = 'waiting';
      let statusLabel = 'Aguardando...';
      if (p.connected === false) {
        statusClass = 'disconnected';
        statusLabel = 'Desconectado';
      } else if (p.cardsReady) {
        statusClass = 'ready';
        statusLabel = 'Pronto!';
      }

      const item = document.createElement('div');
      item.className = 'player-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          <div class="player-avatar" style="background:${color}">${initial}</div>
          <div class="player-info">
            <div class="player-name">
              ${p.nickname}
              ${p.isCreator ? '<span class="player-badge">👑</span>' : ''}
            </div>
            ${showStatus ? `<div class="player-status-text">${statusLabel}</div>` : ''}
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          ${showStatus ? `<div class="status-dot ${statusClass}"></div>` : ''}
          ${showScore ? `<div class="player-score">${p.score ?? 0}</div>` : ''}
          
          ${canEdit && !p.isCreator ? `
            <button class="btn btn-secondary btn-sm edit-player-btn" data-nick="${p.nickname}" title="Editar Nome" style="padding: 4px 8px; font-size: 0.8rem;">✏️</button>
            <button class="btn btn-danger btn-sm delete-player-btn" data-nick="${p.nickname}" title="Remover Jogador" style="padding: 4px 8px; font-size: 0.8rem;">🗑️</button>
          ` : ''}
        </div>
      `;
      list.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(list);

    if (canEdit) {
      container.querySelectorAll('.edit-player-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (onEdit) onEdit(btn.getAttribute('data-nick'));
        });
      });
      container.querySelectorAll('.delete-player-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (onDelete) onDelete(btn.getAttribute('data-nick'));
        });
      });
    }
  },
};
