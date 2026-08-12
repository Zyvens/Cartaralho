/* ============================================================
   Host / Judge Screen
   ============================================================ */
const HostScreen = {
  selectedSubmission: null,

  render(container, data = {}) {
    const blackCard = data.blackCard || App.state.currentBlackCard || '';
    const roundNumber = data.roundNumber || App.state.roundNumber || 1;
    const submissions = data.submissions || App.state.submissions || null;

    container.innerHTML = `
      <div class="host-screen">
        <div class="host-badge">👑 Você é o Jurado desta rodada!</div>

        <div class="round-header" style="position: relative;">
          <button id="leave-match-btn" class="btn btn-secondary btn-sm" style="position: absolute; top: -10px; left: 0; border: none; background: transparent; color: var(--text-muted); padding: 5px; font-size: 0.85rem;">🚪 Sair</button>
          
          <div class="round-number" style="font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span>Rodada ${roundNumber}</span>
            <span style="font-size: 0.9rem; background: var(--bg-surface); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-light);">Sala: ${App.state.roomCode}</span>
          </div>
          <p class="round-info">Escolha a melhor resposta</p>
          ${App.state.isCreator ? `
            <div style="text-align: center; margin-top: 15px;">
              <button id="end-match-btn-host" class="btn btn-danger btn-sm" style="padding: 6px 16px; font-size: 0.85rem; border-radius: 20px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">🚪 Encerrar Partida</button>
            </div>
          ` : ''}
        </div>

        <div class="black-card-area" id="black-card-area"></div>

        <div id="host-content">
          ${submissions ? '' : `
            <div class="waiting-message">
              <div class="spinner"></div>
              <p>Aguardando respostas dos jogadores...</p>
              <div class="submission-counter" id="submission-counter"></div>
            </div>
          `}
        </div>

        <div id="pick-winner-area" class="submit-area" style="display:none;">
          <button id="pick-winner-btn" class="btn btn-primary btn-lg" disabled>
            <span class="btn-icon-emoji">🏆</span>
            Escolher Vencedor
          </button>
        </div>
      </div>
    `;

    // Render black card
    const blackCardArea = document.getElementById('black-card-area');
    if (blackCardArea) {
      blackCardArea.appendChild(CardComponent.createBlackCard(blackCard, { large: true }));
    }

    // If we already have submissions, show them
    if (submissions) {
      this.showSubmissions(submissions);
    }

    // Scoreboard
    if (App.state.scores && App.state.scores.length > 0) {
      Scoreboard.show(App.state.scores);
    }

    const endMatchBtn = document.getElementById('end-match-btn-host');
    if (endMatchBtn) {
      endMatchBtn.addEventListener('click', () => {
        Modal.show({
          title: 'Encerrar Partida',
          message: 'Tem certeza que deseja encerrar a partida para todos?',
          confirmText: 'Sim, Encerrar',
          cancelText: 'Cancelar',
          onConfirm: () => {
            SocketClient.emit('cancel_game', { code: App.state.roomCode });
          }
        });
      });
    }

    const leaveMatchBtn = document.getElementById('leave-match-btn');
    if (leaveMatchBtn) {
      leaveMatchBtn.addEventListener('click', () => {
        Modal.show({
          title: 'Sair da Partida',
          message: 'Tem certeza que deseja abandonar a partida?',
          confirmText: 'Sim, Sair',
          cancelText: 'Cancelar',
          onConfirm: () => {
            SocketClient.emit('leave_room', null, (res) => {
              App.resetState();
              App.showScreen('home');
            });
          }
        });
      });
    }

    this.init();
  },

  showSubmissions(submissions) {
    const content = document.getElementById('host-content');
    if (!content) return;

    content.innerHTML = `
      <h3 class="text-center" style="margin-bottom: var(--space-lg); color: var(--text-secondary);">
        Escolha a melhor resposta:
      </h3>
      <div class="submissions-grid" id="submissions-grid"></div>
    `;

    const grid = document.getElementById('submissions-grid');
    submissions.forEach((submission, i) => {
      // submissions can be [{index, card}] objects or plain strings
      const cardText = typeof submission === 'string' ? submission : submission.card;
      const cardIndex = typeof submission === 'string' ? i : (submission.index !== undefined ? submission.index : i);
      const card = CardComponent.createAnonymousCard(cardText, i, (index, cardEl) => {
        this.selectSubmission(index, cardEl);
      });
      card.style.animationDelay = `${i * 0.1}s`;
      grid.appendChild(card);
    });

    const pickArea = document.getElementById('pick-winner-area');
    if (pickArea) pickArea.style.display = 'flex';
  },

  selectSubmission(index, cardEl) {
    const grid = document.getElementById('submissions-grid');
    const pickBtn = document.getElementById('pick-winner-btn');
    if (!grid || !pickBtn) return;

    // Deselect all
    grid.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));

    if (this.selectedSubmission === index) {
      this.selectedSubmission = null;
      pickBtn.disabled = true;
    } else {
      this.selectedSubmission = index;
      cardEl.classList.add('selected');
      pickBtn.disabled = false;
    }
  },

  pickWinner() {
    if (this.selectedSubmission === null) return;

    Modal.show({
      title: 'Escolher vencedor?',
      message: 'Tem certeza que deseja escolher esta carta como vencedora da rodada?',
      confirmText: 'Confirmar! 🏆',
      cancelText: 'Voltar',
      onConfirm: () => {
        SocketClient.pickWinner(App.state.roomCode, this.selectedSubmission);
        const pickBtn = document.getElementById('pick-winner-btn');
        if (pickBtn) {
          pickBtn.disabled = true;
          pickBtn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:#fff"></div> Escolhendo...';
        }
        this.selectedSubmission = null;
      },
    });
  },

  updateSubmissionCount(count, total) {
    const counter = document.getElementById('submission-counter');
    if (counter) counter.textContent = `${count}/${total} respostas recebidas`;
  },

  init() {
    const pickBtn = document.getElementById('pick-winner-btn');
    if (pickBtn) {
      pickBtn.addEventListener('click', () => {
        this.pickWinner();
      });
    }
  },
};
