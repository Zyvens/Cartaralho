/* ============================================================
   Game Over Screen
   ============================================================ */
const GameOverScreen = {
  render(container, data = {}) {
    const winner = data.winner || '???';
    const ranking = data.ranking || [];

    container.innerHTML = `
      <div class="gameover-screen">
        <div class="confetti-container" id="confetti-container"></div>

        <div class="trophy-icon">🏆</div>

        <h1 class="gameover-title">
          <span class="gradient-text">🎉 Fim de Jogo!</span>
        </h1>

        <div class="gameover-winner">
          <span class="gradient-text">${winner}</span> venceu!
        </div>

        <div class="ranking-table" id="ranking-table"></div>

        <div class="gameover-actions">
          <button id="play-again-btn" class="btn btn-primary btn-lg">
            <span class="btn-icon-emoji">🔄</span>
            Jogar Novamente
          </button>
          <button id="go-home-btn" class="btn btn-secondary btn-lg">
            Voltar ao Menu
          </button>
        </div>
      </div>
    `;

    // Render ranking
    const rankingTable = document.getElementById('ranking-table');
    if (rankingTable) {
      ranking.forEach((p, i) => {
        const pos = i + 1;
        let rankClass = '';
        let medal = '';
        if (pos === 1) { rankClass = 'gold'; medal = '🥇'; }
        else if (pos === 2) { rankClass = 'silver'; medal = '🥈'; }
        else if (pos === 3) { rankClass = 'bronze'; medal = '🥉'; }

        const item = document.createElement('div');
        item.className = `ranking-item ${rankClass}`;
        item.style.animationDelay = `${i * 0.1}s`;
        item.innerHTML = `
          <div class="ranking-position">${medal || pos}</div>
          <div class="ranking-name">${p.nickname}</div>
          <div class="ranking-score">${p.score} pts</div>
        `;
        rankingTable.appendChild(item);
      });
    }

    // Hide scoreboard
    Scoreboard.hide();

    // Confetti
    this.launchConfetti();

    this.init();
  },

  launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#fbbf24'];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 10;
      const left = Math.random() * 100;
      const duration = 2 + Math.random() * 3;
      const delay = Math.random() * 2;
      const shape = Math.random() > 0.5 ? '50%' : '0';

      piece.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;
      container.appendChild(piece);
    }

    // Clean up confetti after animation
    setTimeout(() => {
      if (container) container.innerHTML = '';
    }, 7000);
  },

  init() {
    const playAgainBtn = document.getElementById('play-again-btn');
    const goHomeBtn = document.getElementById('go-home-btn');

    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        // Reset state and go home
        App.resetState();
        App.showScreen('home');
      });
    }

    if (goHomeBtn) {
      goHomeBtn.addEventListener('click', () => {
        App.resetState();
        App.showScreen('home');
      });
    }
  },
};
