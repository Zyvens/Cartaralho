/* ============================================================
   Create Room Screen
   ============================================================ */
const CreateRoomScreen = {
  render(container) {
    container.innerHTML = `
      <div class="create-room-screen">
        <button class="back-button" id="back-btn">
          ← Voltar
        </button>

        <h2 class="text-center" style="margin-bottom: var(--space-xs);">
          <span class="gradient-text">Configurar Mesa</span>
        </h2>
        <p class="text-center" style="margin-bottom: var(--space-2xl); color: var(--text-muted); font-size: 0.9rem;">
          Ajuste as regras da sua partida
        </p>

        <div class="create-room-layout">
          <!-- Esquerda: Configurações -->
          <div class="config-panel">
            <div class="config-group">
              <div class="config-label">
                <span>Máximo de Jogadores</span>
                <span class="config-value" id="val-players">6</span>
              </div>
              <input type="range" id="slider-players" min="3" max="10" value="6">
            </div>

            <div class="config-group">
              <div class="config-label">
                <span>Cartas Pretas por Jogador</span>
                <span class="config-value" id="val-black">5</span>
              </div>
              <input type="range" id="slider-black" min="1" max="5" value="5">
            </div>

            <div class="config-group">
              <div class="config-label">
                <span>Cartas Brancas por Jogador</span>
                <span class="config-value" id="val-white">20</span>
              </div>
              <input type="range" id="slider-white" min="5" max="20" value="20">
            </div>

            <div class="config-group">
              <div class="config-label">
                <span>Pontos para Vencer</span>
                <span class="config-value" id="val-points">10</span>
              </div>
              <input type="range" id="slider-points" min="5" max="20" value="10">
            </div>

            <div class="config-group">
              <div class="config-label">
                <span>Cartas na Mão</span>
                <span class="config-value" id="val-hand">5</span>
              </div>
              <input type="range" id="slider-hand" min="5" max="15" value="5">
            </div>

            <div class="config-group checkbox-group">
              <label for="checkbox-standard-deck" style="cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 0;">
                <input type="checkbox" id="checkbox-standard-deck" checked>
                Incluir cartas já criadas do Cartaralho
              </label>
            </div>

            <div class="config-group checkbox-group">
              <label for="checkbox-afk" style="cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 0;">
                <input type="checkbox" id="checkbox-afk" checked>
                Encerrar partida se algum jogador abandonar ou ficar 6 min inativo
              </label>
            </div>

            ${App.state.isLocalMode ? `
            <div class="config-group checkbox-group">
              <label for="checkbox-shared-pool" style="cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 0;">
                <input type="checkbox" id="checkbox-shared-pool">
                Apenas o Host cria todas as cartas da mesa (Pool Compartilhado)
              </label>
            </div>
            ` : ''}

            <div class="config-preview">
              <h4>Resumo da Partida</h4>
              <div class="preview-row">
                <span>Jogadores</span>
                <span id="preview-players">até 6</span>
              </div>
              <div class="preview-row">
                <span>Cartas pretas</span>
                <span id="preview-black">5 por jogador</span>
              </div>
              <div class="preview-row">
                <span>Cartas brancas</span>
                <span id="preview-white">20 por jogador</span>
              </div>
              <div class="preview-row">
                <span>Rodadas estimadas</span>
                <span id="preview-rounds">~30</span>
              </div>
            </div>

            <div style="margin-top: var(--space-xl);">
              <button id="create-btn" class="btn btn-primary btn-lg btn-block">
                <span class="btn-icon-emoji">🚀</span>
                Criar Mesa
              </button>
            </div>
          </div>

          <!-- Direita/Baixo: Como Jogar -->
          <div class="rules-panel">
            <h3><span class="btn-icon-emoji">📜</span> Como Jogar</h3>
            <ul class="rules-list">
              <li>
                <strong>Criação:</strong> Antes do jogo, cada um cria <em>Cartas Brancas</em> (respostas engraçadas) e <em>Cartas Pretas</em> (perguntas com lacunas "__").
              </li>
              <li>
                <strong>O Zar:</strong> A cada rodada, um jogador é o Zar e lê uma Carta Preta.
              </li>
              <li>
                <strong>Respostas:</strong> Os outros jogadores enviam a Carta Branca mais absurda de sua mão (cada jogador tem <span id="rule-hand-size">5</span> cartas na mão) anonimamente.
              </li>
              <li>
                <strong>Vencedor:</strong> O Zar escolhe a melhor resposta e quem enviou ganha a carta preta como ponto! Vence quem atingir a pontuação limite (<span id="rule-points">10</span> cartas pretas).
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;
    this.init();
  },

  init() {
    const backBtn = document.getElementById('back-btn');
    const createBtn = document.getElementById('create-btn');

    const sliderPlayers = document.getElementById('slider-players');
    const sliderBlack = document.getElementById('slider-black');
    const sliderWhite = document.getElementById('slider-white');
    const sliderPoints = document.getElementById('slider-points');
    const sliderHand = document.getElementById('slider-hand');

    const valPlayers = document.getElementById('val-players');
    const valBlack = document.getElementById('val-black');
    const valWhite = document.getElementById('val-white');
    const valPoints = document.getElementById('val-points');
    const valHand = document.getElementById('val-hand');

    const prevPlayers = document.getElementById('preview-players');
    const prevBlack = document.getElementById('preview-black');
    const prevWhite = document.getElementById('preview-white');
    const prevRounds = document.getElementById('preview-rounds');
    
    const rulePoints = document.getElementById('rule-points');
    const ruleHandSize = document.getElementById('rule-hand-size');

    const updatePreview = () => {
      const p = sliderPlayers.value;
      const b = sliderBlack.value;
      const w = sliderWhite.value;
      const pts = sliderPoints.value;
      const hnd = sliderHand.value;

      valPlayers.textContent = p;
      valBlack.textContent = b;
      valWhite.textContent = w;
      valPoints.textContent = pts;
      valHand.textContent = hnd;
      
      rulePoints.textContent = pts;
      ruleHandSize.textContent = hnd;

      prevPlayers.textContent = `até ${p}`;
      prevBlack.textContent = `${b} por jogador`;
      prevWhite.textContent = `${w} por jogador`;
      // Estimate: total black cards in game = players * black; each round uses 1
      prevRounds.textContent = `~${p * b}`;
    };

    sliderPlayers.addEventListener('input', updatePreview);
    sliderBlack.addEventListener('input', updatePreview);
    sliderWhite.addEventListener('input', updatePreview);
    sliderPoints.addEventListener('input', updatePreview);
    sliderHand.addEventListener('input', updatePreview);

    backBtn.addEventListener('click', () => {
      App.showScreen('home');
    });

    createBtn.addEventListener('click', () => {
      const checkboxDeck = document.getElementById('checkbox-standard-deck');
      const checkboxAfk = document.getElementById('checkbox-afk');
      const checkboxSharedPool = document.getElementById('checkbox-shared-pool');
      
      const config = {
        maxPlayers: parseInt(sliderPlayers.value),
        blackCardsPerPlayer: parseInt(sliderBlack.value),
        whiteCardsPerPlayer: parseInt(sliderWhite.value),
        pointsToWin: parseInt(sliderPoints.value),
        handSize: parseInt(sliderHand.value),
        useStandardDeck: checkboxDeck.checked,
        afkEnabled: checkboxAfk ? checkboxAfk.checked : true,
        sharedLocalPool: checkboxSharedPool ? checkboxSharedPool.checked : false,
        isLocalMode: App.state.isLocalMode || false,
      };
      
      createBtn.disabled = true;
      createBtn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:#fff"></div> Criando...';
      SocketClient.createRoom(App.state.nickname, config);
    });
  },
};
