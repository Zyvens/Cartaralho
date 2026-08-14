/* ============================================================
   Result Screen
   ============================================================ */
const ResultScreen = {
  _timer: null,

  render(container, data = {}) {
    const blackCard = data.blackCard || '';
    const winnerCards = Array.isArray(data.winnerCards) && data.winnerCards.length
      ? data.winnerCards
      : (Array.isArray(App.state.currentWinnerCards) && App.state.currentWinnerCards.length
        ? App.state.currentWinnerCards
        : [data.winnerCard || '']);
    const winnerNickname = data.winnerNickname || '???';
    const scores = data.scores || App.state.scores || [];
    const roundNumber = data.roundNumber || App.state.roundNumber || 1;

    container.innerHTML = `
      <div class="result-screen">
        <div style="position: relative; width: 100%; text-align: center;">
          <button id="leave-match-btn" class="btn btn-secondary btn-sm" style="position: absolute; top: 0; left: 0; border: none; background: transparent; color: var(--text-muted); padding: 5px; font-size: 0.85rem; z-index: 10;">🚪 Sair</button>
          <div class="round-number">Resultado — Rodada ${roundNumber}</div>
        </div>

        <div class="result-cards ${winnerCards.length > 1 ? 'has-double-answer' : ''}">
          <div id="result-black-card"></div>
          <div id="result-winner-card" class="result-winner-cards count-${winnerCards.length}"></div>
        </div>

        <div class="result-winner-text">
          🏆 <span class="result-winner-name">${winnerNickname}</span> venceu a rodada!
        </div>

        <div class="result-timer" id="result-timer">
          Próxima rodada em <strong id="timer-seconds">5</strong>s...
          <div class="timer-bar">
            <div class="timer-bar-fill" id="timer-bar-fill" style="width: 100%"></div>
          </div>
        </div>
      </div>
    `;

    const blackCardArea = document.getElementById('result-black-card');
    if (blackCardArea) blackCardArea.appendChild(CardComponent.createBlackCard(blackCard, { large: true }));

    const winnerCardArea = document.getElementById('result-winner-card');
    if (winnerCardArea) {
      winnerCards.filter(Boolean).forEach((card,index) => {
        const el=CardComponent.createWhiteCard(card, { large: winnerCards.length===1, winner: true });
        if(winnerCards.length>1){el.classList.add('result-combo-card');el.setAttribute('aria-label',`Carta vencedora ${index+1} de ${winnerCards.length}`);}
        winnerCardArea.appendChild(el);
      });
    }

    if (scores.length > 0) {
      App.state.scores = scores;
      Scoreboard.update(scores);
      Scoreboard.highlight(winnerNickname);
    }

    this.startTimer();
    this.init();
  },

  startTimer() {
    let seconds = 5;
    const timerEl = document.getElementById('timer-seconds');
    const barEl = document.getElementById('timer-bar-fill');

    if (barEl) {
      setTimeout(() => { barEl.style.width = '0%'; }, 50);
      barEl.style.transition = 'width 5s linear';
    }

    this._timer = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }, 1000);
  },

  cleanup() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  init() {
    const leaveMatchBtn = document.getElementById('leave-match-btn');
    if (leaveMatchBtn) {
      leaveMatchBtn.addEventListener('click', () => {
        Modal.show({
          title: 'Sair da Partida',
          message: 'Tem certeza que deseja abandonar a partida?',
          confirmText: 'Sim, Sair',
          cancelText: 'Cancelar',
          onConfirm: () => {
            SocketClient.emit('leave_room', null, () => {
              App.resetState();
              App.showScreen('home');
            });
          }
        });
      });
    }
  },
};
