/* ============================================================
   Round Screen (Player View)
   ============================================================ */
const RoundScreen = {
  selectedCard: null,

  render(container, data = {}) {
    const blackCard = data.blackCard || App.state.currentBlackCard || 'Carta preta aparecerá aqui';
    const hand = data.hand || App.state.hand || [];
    const roundNumber = data.roundNumber || App.state.roundNumber || 1;
    const hasPlayed = data.hasPlayed || false;

    container.innerHTML = `
      <div class="round-screen">
        <div class="round-header" style="position: relative;">
          <button id="leave-match-btn" class="btn btn-secondary btn-sm" style="position: absolute; top: -10px; left: 0; border: none; background: transparent; color: var(--text-muted); padding: 5px; font-size: 0.85rem;">🚪 Sair</button>
          
          <div class="round-number" style="font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span>Rodada ${roundNumber}</span>
            <span style="font-size: 0.9rem; background: var(--bg-surface); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-light);">Sala: ${App.state.roomCode}</span>
          </div>
          <p class="round-info">Escolha a melhor carta para completar a frase</p>
          ${App.state.isCreator ? `
            <div style="text-align: center; margin-top: 15px;">
              <button id="end-match-btn" class="btn btn-danger btn-sm" style="padding: 6px 16px; font-size: 0.85rem; border-radius: 20px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">🚪 Encerrar Partida</button>
            </div>
          ` : ''}
        </div>

        <div class="black-card-area" id="black-card-area"></div>

        <div id="hand-section" class="hand-section">
          ${hasPlayed ? `
            <div class="waiting-message">
              <div class="spinner"></div>
              <p>Carta enviada! Aguardando outros jogadores...</p>
              <div class="submission-counter" id="submission-counter"></div>
            </div>
          ` : `
            <div class="hand-label">Sua Mão</div>
            <div class="card-hand" id="card-hand"></div>
            <div class="submit-area">
              <button id="play-card-btn" class="btn btn-primary btn-lg" disabled>
                Enviar Carta
              </button>
            </div>
          `}
        </div>

        <div class="submission-counter" id="submission-counter-bottom"></div>
      </div>
    `;

    // Render black card
    const blackCardArea = document.getElementById('black-card-area');
    if (blackCardArea) {
      blackCardArea.appendChild(CardComponent.createBlackCard(blackCard, { large: true }));
    }

    // Render hand
    if (!hasPlayed) {
      const handContainer = document.getElementById('card-hand');
      if (handContainer) {
        hand.forEach((cardText, i) => {
          const card = CardComponent.createSelectableWhiteCard(cardText, i, (index, cardEl) => {
            this.selectCard(index, cardEl);
          });
          handContainer.appendChild(card);
        });
      }
    }

    // End match button (Creator only)
    const endMatchBtn = document.getElementById('end-match-btn');
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

    // Leave match button
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

    // Show scoreboard
    if (App.state.scores && App.state.scores.length > 0) {
      Scoreboard.show(App.state.scores || []);
    }

    this.init();
  },

  selectCard(index, cardEl) {
    const handContainer = document.getElementById('card-hand');
    const playBtn = document.getElementById('play-card-btn');
    if (!handContainer || !playBtn) return;

    // Deselect previous
    handContainer.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));

    if (this.selectedCard === index) {
      // Deselect
      this.selectedCard = null;
      playBtn.disabled = true;
    } else {
      // Select
      this.selectedCard = index;
      cardEl.classList.add('selected');
      playBtn.disabled = false;
    }
  },

  submitCard() {
    if (this.selectedCard === null) return;

    Modal.show({
      title: 'Enviar esta carta?',
      message: `"${App.state.hand[this.selectedCard]}"`,
      confirmText: 'Enviar! 🃏',
      cancelText: 'Voltar',
      onConfirm: () => {
        SocketClient.playCard(App.state.roomCode, this.selectedCard);

        if (App.state.isLocalMode) {
          this.selectedCard = null;
          App.handleLocalNextTurn();
        } else {
          // Show waiting state
          const handSection = document.getElementById('hand-section');
          if (handSection) {
            handSection.innerHTML = `
              <div class="waiting-message">
                <div class="spinner"></div>
                <p>Carta enviada! Aguardando outros jogadores...</p>
                <div class="submission-counter" id="submission-counter"></div>
              </div>
            `;
          }
          this.selectedCard = null;
        }
      },
    });
  },

  updateSubmissionCount(count, total) {
    const counter = document.getElementById('submission-counter');
    const counterBottom = document.getElementById('submission-counter-bottom');
    const text = `${count}/${total} cartas recebidas`;
    if (counter) counter.textContent = text;
    if (counterBottom) counterBottom.textContent = text;
  },

  init() {
    const playBtn = document.getElementById('play-card-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.submitCard();
      });
    }
  },
};
