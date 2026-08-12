/* ============================================================
   Lobby Screen
   ============================================================ */
const LobbyScreen = {
  render(container, data = {}) {
    const code = App.state.roomCode || data.code || '------';
    const isCreator = App.state.isCreator;

    const myPlayer = App.state.players.find(p => p.nickname === App.state.nickname);
    const myCardsReady = myPlayer && myPlayer.cardsReady;

    container.innerHTML = `
      <div class="lobby-screen">
        <div class="room-code-display">
          <h3 style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: var(--space-sm);">
            Código da Mesa ${App.state.isLocalMode ? '(Local)' : ''}
          </h3>
          <div class="room-code-value" id="room-code-copy" title="Clique para copiar">
            ${code}
            <span class="copy-icon">📋</span>
          </div>
          <p class="room-code-hint">${App.state.isLocalMode ? 'Adicione os jogadores abaixo.' : 'Compartilhe o código com seus amigos!'}</p>
          
          <div id="connection-info-container" style="display:none; margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px;" id="connection-info-label"></p>
            <div style="display:flex; justify-content:space-between; align-items:center; overflow:hidden;">
              <strong id="connection-info-url" style="color: var(--accent-primary); letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; width: 100%;">Gerando link...</strong>
              <button id="copy-connection-btn" class="btn btn-secondary btn-sm" style="margin-left:10px; flex-shrink:0;" disabled>Copiar</button>
            </div>
          </div>
        </div>

        <div class="lobby-content">
          ${App.state.isLocalMode ? `
            <div class="lobby-section" style="margin-bottom: var(--space-lg);">
              <div class="input-group" style="display:flex; gap:10px;">
                <input type="text" id="new-local-player-input" class="input" placeholder="Novo Jogador" maxlength="20" autocomplete="off" spellcheck="false" style="margin-bottom:0;">
                <button id="add-local-player-btn" class="btn btn-secondary">Adicionar</button>
              </div>
            </div>
          ` : ''}

          <div class="lobby-section">
            <div class="lobby-section-header">
              <h3>👥 Jogadores</h3>
              <span class="player-count" id="player-count">0/0</span>
            </div>
            <div id="lobby-player-list"></div>
          </div>

          <div id="lobby-status" class="lobby-status">
            Aguardando jogadores...
          </div>

          <div class="lobby-actions">
            ${App.state.isLocalMode ? `
              <button id="register-cards-btn" class="btn btn-secondary btn-lg btn-block" style="margin-bottom: var(--space-sm);">
                <span class="btn-icon-emoji">✏️</span>
                ${(App.state.config && App.state.config.sharedLocalPool) ? 'Cadastrar Cartas da Mesa' : 'Cadastrar Cartas dos Jogadores'}
              </button>
            ` : (myCardsReady ? `
              <button class="btn btn-success btn-lg btn-block" disabled style="margin-bottom: var(--space-sm);">
                <span class="btn-icon-emoji">✅</span>
                Cartas Cadastradas
              </button>
            ` : `
              <button id="register-cards-btn" class="btn btn-secondary btn-lg btn-block" style="margin-bottom: var(--space-sm);">
                <span class="btn-icon-emoji">✏️</span>
                Cadastrar Cartas
              </button>
            `)}
            ${isCreator ? `
              <button id="start-game-btn" class="btn btn-primary btn-lg btn-block" disabled style="margin-bottom: var(--space-sm);">
                <span class="btn-icon-emoji">🚀</span>
                Iniciar Partida
              </button>
              <button id="cancel-room-btn" class="btn btn-danger btn-lg btn-block">
                <span class="btn-icon-emoji">❌</span>
                Cancelar Partida
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    this.init();
    // Render initial player list if we have data
    if (App.state.players && App.state.players.length > 0) {
      this.update(App.state.players);
    }
  },

  update(players, state) {
    const listContainer = document.getElementById('lobby-player-list');
    const countEl = document.getElementById('player-count');
    const statusEl = document.getElementById('lobby-status');
    const startBtn = document.getElementById('start-game-btn');

    if (!listContainer) return;

    // Update player list
    PlayerList.render(listContainer, players, { 
      showStatus: true, 
      showScore: false,
      canEdit: App.state.isLocalMode && App.state.isCreator,
      onEdit: async (oldNick) => {
        const newNick = await Modal.prompt('Renomear Jogador', `Novo nome para ${oldNick}:`, oldNick);
        if (newNick && newNick.trim().length >= 2 && newNick !== oldNick) {
          if (App.state.players.find(p => p.nickname === newNick.trim())) {
            Toast.warning('Nickname já existe!');
            return;
          }
          SocketClient.renameLocalPlayer(oldNick, newNick.trim(), App.state.roomCode);
        }
      },
      onDelete: async (nick) => {
        const confirmed = await Modal.confirm('Remover Jogador', `Tem certeza que deseja remover ${nick}?`);
        if (confirmed) {
          SocketClient.kickLocalPlayer(nick, App.state.roomCode);
        }
      }
    });

    // Update count
    const maxPlayers = App.state.maxPlayers || '?';
    if (countEl) countEl.textContent = `${players.length}/${maxPlayers}`;

    // Check if all players have submitted cards
    const allReady = players.length >= 3 && players.every(p => p.cardsReady);
    if (statusEl) {
      if (allReady) {
        statusEl.className = 'lobby-status all-ready';
        statusEl.textContent = '✅ Todos prontos! A partida pode começar!';
      } else {
        statusEl.className = 'lobby-status';
        const waitingCount = players.filter(p => !p.cardsReady).length;
        statusEl.textContent = `Aguardando ${waitingCount} jogador${waitingCount !== 1 ? 'es' : ''} cadastrar cartas...`;
      }
    }

    // Enable/disable start button
    if (startBtn) {
      startBtn.disabled = !allReady;
    }
  },

  init() {
    // Info de Conexão
    const connContainer = document.getElementById('connection-info-container');
    const connLabel = document.getElementById('connection-info-label');
    const connUrl = document.getElementById('connection-info-url');
    const connCopy = document.getElementById('copy-connection-btn');
    
    if (connContainer && App.state.isCreator) {
      if (App.state.playMode === 'online') {
        // Online build: the room already lives in the cloud, so the link to
        // share is just this page's own URL — no tunnel needed. Whoever
        // opens it types the room code (also shown) to join.
        connContainer.style.display = 'block';
        connLabel.textContent = 'Link Online:';
        const shareUrl = window.location.origin + '/';
        connUrl.textContent = `${shareUrl}  (código: ${App.state.roomCode})`;
        connCopy.onclick = () => {
          navigator.clipboard.writeText(shareUrl);
          Toast.success('Link copiado! Compartilhe junto com o código da mesa.');
        };
      } else if (App.state.playMode === 'local-multi') {
        connContainer.style.display = 'block';
        connLabel.textContent = 'Acesso Wi-Fi Local:';
        fetch('/api/ip')
        .then(res => res.json())
        .then(data => {
          if (data.ip && data.ip !== 'localhost') {
            const ipLink = `http://${data.ip}:14273`;
            connUrl.textContent = ipLink;
            connCopy.onclick = () => {
              navigator.clipboard.writeText(ipLink);
              Toast.success('IP copiado!');
            };
          } else {
            connUrl.textContent = 'Erro ao ler IP local';
          }
        })
        .catch(() => { connUrl.textContent = 'Erro na conexão'; });
      }
    }

    // Copy room code
    const codeEl = document.getElementById('room-code-copy');
    if (codeEl) {
      codeEl.addEventListener('click', () => {
        const code = App.state.roomCode;
        navigator.clipboard.writeText(code).then(() => {
          Toast.success('Código copiado!');
        }).catch(() => {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = code;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          Toast.success('Código copiado!');
        });
      });
    }

    // Local mode Add Player
    const addLocalBtn = document.getElementById('add-local-player-btn');
    const newLocalInput = document.getElementById('new-local-player-input');
    if (addLocalBtn && newLocalInput) {
      addLocalBtn.addEventListener('click', () => {
        const nick = newLocalInput.value.trim();
        if (!nick || nick.length < 2) {
          Toast.warning('O nickname deve ter pelo menos 2 caracteres.');
          return;
        }
        if (App.state.players.find(p => p.nickname === nick)) {
          Toast.warning('Este nickname já está na mesa.');
          return;
        }
        if (App.state.players.length >= App.state.maxPlayers) {
          Toast.warning('A mesa está cheia.');
          return;
        }
        
        addLocalBtn.disabled = true;
        // Create secondary connection for local player
        SocketClient.createLocalSocket(nick, App.state.roomCode, () => {
          Toast.success(nick + ' adicionado!');
          newLocalInput.value = '';
          addLocalBtn.disabled = false;
        });
      });
      newLocalInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') addLocalBtn.click();
      });
    }

    // Register Cards
    const registerCardsBtn = document.getElementById('register-cards-btn');
    if (registerCardsBtn) {
      registerCardsBtn.addEventListener('click', () => {
        if (App.state.isLocalMode) {
          if (App.state.config && App.state.config.sharedLocalPool) {
            // Apenas o host cria para todo mundo
            SocketClient.setActiveLocalPlayer(App.state.nickname);
            App.showScreen('cardCreation', { bypassBlindScreen: true, sharedPool: true });
          } else {
            // Find first player who needs to register
            const pending = App.state.players.filter(p => !p.cardsReady);
            if (pending.length > 0) {
              SocketClient.setActiveLocalPlayer(pending[0].nickname);
              App.showScreen('cardCreation', { bypassBlindScreen: false });
            } else {
              Toast.info('Todos já cadastraram as cartas!');
            }
          }
        } else {
          App.showScreen('cardCreation');
        }
      });
    }

    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const pCount = App.state.players.length;
        const max = App.state.maxPlayers;
        
        if (pCount < max) {
          Modal.show({
            title: 'Jogar com menos pessoas?',
            message: `A sala foi configurada para ${max} jogadores, mas temos apenas ${pCount}. Deseja começar a partida mesmo assim?`,
            confirmText: `Continuar com ${pCount} 🎮`,
            cancelText: 'Voltar e aguardar',
            onConfirm: () => {
              startBtn.disabled = true;
              startBtn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:#fff"></div> Atualizando regras...';
              SocketClient.updateRoomConfig(App.state.roomCode, { maxPlayers: pCount });
              
              // Pequeno delay para garantir que o server atualizou
              setTimeout(() => {
                SocketClient.startGame(App.state.roomCode);
              }, 500);
            },
          });
        } else {
          Modal.show({
            title: 'Iniciar Partida?',
            message: 'Todos os jogadores já cadastraram suas cartas. Deseja iniciar a partida agora?',
            confirmText: 'Iniciar! 🎮',
            cancelText: 'Ainda não',
            onConfirm: () => {
              startBtn.disabled = true;
              startBtn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:#fff"></div> Iniciando...';
              SocketClient.startGame(App.state.roomCode);
            },
          });
        }
      });
    }

    // Cancel room button
    const cancelBtn = document.getElementById('cancel-room-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', async () => {
        const confirmed = await Modal.confirm('Atenção', 'Tem certeza que deseja cancelar a partida? Todos os jogadores serão expulsos.');
        if (confirmed) {
          cancelBtn.disabled = true;
          cancelBtn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:#fff"></div> Cancelando...';
          SocketClient.emit('cancel_room', { code: App.state.roomCode });
        }
      });
    }
  },
};
