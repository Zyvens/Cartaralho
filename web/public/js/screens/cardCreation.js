/* ============================================================
   Card Creation Screen
   ============================================================ */
const CardCreationScreen = {
  blackCards: [],
  whiteCards: [],
  activeTab: 'black',

  render(container, data = {}) {
    const maxBlack = App.state.blackCardsPerPlayer || 5;
    const maxWhite = App.state.whiteCardsPerPlayer || 20;

    // Restore previously created cards if returning
    if (data.blackCards) this.blackCards = data.blackCards;
    if (data.whiteCards) this.whiteCards = data.whiteCards;

    const activePlayer = App.state.isLocalMode ? SocketClient.activeNickname : App.state.nickname;

    if (App.state.isLocalMode && !data.bypassBlindScreen) {
      container.innerHTML = `
        <div class="lobby-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh;">
          <h2 class="gradient-text" style="font-size:2.5rem; margin-bottom:1rem;">Vez de: ${activePlayer}</h2>
          <p style="color:var(--text-muted); margin-bottom:2rem;">Passe o celular para <strong>${activePlayer}</strong> e clique em Começar.</p>
          <button id="blind-start-btn" class="btn btn-primary btn-lg">Começar Cadastro</button>
        </div>
      `;
      document.getElementById('blind-start-btn').addEventListener('click', () => {
        this.render(container, { ...data, bypassBlindScreen: true });
      });
      return;
    }

    const hasRecoveredCards = this.blackCards.length > 0 || this.whiteCards.length > 0;
    const recoveryBanner = hasRecoveredCards ? `
      <div class="alert alert-info" style="margin-bottom: var(--space-md); padding: var(--space-sm); background-color: rgba(65, 105, 225, 0.2); border-radius: 8px; text-align: center;">
        <span style="display:block; margin-bottom: 5px;"><strong>💡 Rascunhos Recuperados!</strong></span>
        <span style="font-size: 0.9rem;">Recuperamos algumas cartas que não foram enviadas para o jogo ainda. Clique em enviar para adicioná-las ao deck do jogo ou exclua as cartas.</span>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="card-creation-screen">
        ${App.state.isLocalMode ? '' : '<button class="back-button" id="back-btn">← Voltar ao Lobby</button>'}

        <h2 class="text-center" style="margin-bottom: var(--space-xs);">
          <span class="gradient-text">${data.sharedPool ? 'Cartas da Mesa' : 'Cartas de ' + activePlayer}</span>
        </h2>
        <p class="text-center" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: var(--space-md);">
          Crie suas cartas para a partida
        </p>

        ${recoveryBanner}

        <div class="tabs">
          <button class="tab ${this.activeTab === 'black' ? 'active' : ''}" data-tab="black">
            🖤 Cartas Pretas
          </button>
          <button class="tab ${this.activeTab === 'white' ? 'active' : ''}" data-tab="white">
            🤍 Cartas Brancas
          </button>
        </div>

        <div id="tab-content"></div>

        <div style="margin-top: var(--space-xl);">
          <button id="submit-cards-btn" class="btn btn-primary btn-lg btn-block">
            <span class="btn-icon-emoji">✅</span>
            Concluir Cadastro
          </button>
        </div>
      </div>
    `;

    this.renderTabContent();
    this.init();
  },

  renderTabContent() {
    const content = document.getElementById('tab-content');
    if (!content) return;

    const maxBlack = App.state.blackCardsPerPlayer || 5;
    const maxWhite = App.state.whiteCardsPerPlayer || 20;

    if (this.activeTab === 'black') {
      const count = this.blackCards.length;
      const pct = Math.min((count / maxBlack) * 100, 100);
      content.innerHTML = `
        <p class="creation-instruction">
          Crie frases com uma lacuna usando <strong>______</strong> (underlines). A lacuna será preenchida por cartas brancas dos outros jogadores.
        </p>

        <div class="creation-input-row">
          <div class="input-group">
            <input type="text" id="black-card-input" class="input" placeholder=" " maxlength="200" autocomplete="off">
            <label for="black-card-input" class="input-label">Ex: O segredo da felicidade é ______</label>
          </div>
          <button id="add-black-btn" class="btn btn-primary" ${count >= maxBlack ? 'disabled' : ''}>Adicionar</button>
        </div>

        <div class="card-counter">
          <div class="card-counter-text"><span>${count}</span>/${maxBlack} cartas pretas</div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>

        <div class="created-cards-grid" id="black-cards-grid"></div>
      `;

      // Render existing black cards
      const grid = document.getElementById('black-cards-grid');
      this.blackCards.forEach((text, i) => {
        const card = CardComponent.createDeletableCard(text, 'black', () => {
          this.removeCard('black', i);
        });
        grid.appendChild(card);
      });

      // Add card handler
      const addBtn = document.getElementById('add-black-btn');
      const input = document.getElementById('black-card-input');
      const addBlack = () => {
        this.addCard('black', input, addBtn);
      };
      addBtn.addEventListener('click', addBlack);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBlack(); });
      input.focus();

    } else {
      const count = this.whiteCards.length;
      const pct = Math.min((count / maxWhite) * 100, 100);
      content.innerHTML = `
        <p class="creation-instruction">
          Crie palavras ou frases curtas que completem as lacunas das cartas pretas. Quanto mais engraçado, melhor!
        </p>

        <div class="creation-input-row">
          <div class="input-group">
            <input type="text" id="white-card-input" class="input" placeholder=" " maxlength="120" autocomplete="off">
            <label for="white-card-input" class="input-label">Ex: Um pato de borracha gigante</label>
          </div>
          <button id="add-white-btn" class="btn btn-primary" ${count >= maxWhite ? 'disabled' : ''}>Adicionar</button>
        </div>

        <div class="card-counter">
          <div class="card-counter-text"><span>${count}</span>/${maxWhite} cartas brancas</div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>

        <div class="created-cards-grid" id="white-cards-grid"></div>
      `;

      // Render existing white cards
      const grid = document.getElementById('white-cards-grid');
      this.whiteCards.forEach((text, i) => {
        const card = CardComponent.createDeletableCard(text, 'white', () => {
          this.removeCard('white', i);
        });
        grid.appendChild(card);
      });

      // Add card handler
      const addBtn = document.getElementById('add-white-btn');
      const input = document.getElementById('white-card-input');
      const addWhite = () => {
        this.addCard('white', input, addBtn);
      };
      addBtn.addEventListener('click', addWhite);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addWhite(); });
      input.focus();
    }
  },

  addCard(type, input, addBtn) {
    const maxBlack = App.state.blackCardsPerPlayer || 5;
    const maxWhite = App.state.whiteCardsPerPlayer || 20;
    const text = input.value.trim();

    if (!text) {
      Toast.warning('Digite o texto da carta.');
      input.focus();
      return;
    }

    if (type === 'black') {
      if (this.blackCards.length >= maxBlack) {
        Toast.warning(`Máximo de ${maxBlack} cartas pretas atingido.`);
        return;
      }
      this.blackCards.push(text);
    } else {
      if (this.whiteCards.length >= maxWhite) {
        Toast.warning(`Máximo de ${maxWhite} cartas brancas atingido.`);
        return;
      }
      this.whiteCards.push(text);
    }

    input.value = '';
    input.focus();
    this.renderTabContent();
    Toast.success('Carta adicionada!');
  },

  removeCard(type, index) {
    if (type === 'black') {
      this.blackCards.splice(index, 1);
    } else {
      this.whiteCards.splice(index, 1);
    }
    this.renderTabContent();
  },

  switchTab(tab) {
    this.activeTab = tab;
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    this.renderTabContent();
  },

  submit() {
    const maxBlack = App.state.blackCardsPerPlayer || 5;
    const maxWhite = App.state.whiteCardsPerPlayer || 20;
    const useStandardDeck = App.state.useStandardDeck;

    // Se usar o deck nativo, mínimo de cartas criadas é 0
    const minBlack = useStandardDeck ? 0 : maxBlack;
    const minWhite = useStandardDeck ? 0 : maxWhite;

    if (this.blackCards.length < minBlack) {
      Toast.warning(useStandardDeck 
        ? `Você precisa criar pelo menos ${minBlack} carta preta.`
        : `Você deve criar exatamente ${minBlack} cartas pretas.`);
      this.switchTab('black');
      return;
    }
    if (this.whiteCards.length < minWhite) {
      Toast.warning(useStandardDeck 
        ? `Você precisa criar pelo menos ${minWhite} carta branca.`
        : `Você deve criar exatamente ${minWhite} cartas brancas.`);
      this.switchTab('white');
      return;
    }

    const totalCards = this.blackCards.length + this.whiteCards.length;

    if (useStandardDeck && totalCards === 0) {
      Modal.show({
        title: 'Sem Cartas Novas?',
        message: 'Deseja prosseguir sem cadastrar nenhuma carta ao jogo?',
        confirmText: 'Prosseguir ✅',
        cancelText: 'Voltar',
        onConfirm: () => {
          this.doSubmit();
        }
      });
      return;
    }

    Modal.show({
      title: 'Enviar Cartas?',
      message: `Você criou ${this.blackCards.length} carta${this.blackCards.length !== 1 ? 's' : ''} preta${this.blackCards.length !== 1 ? 's' : ''} e ${this.whiteCards.length} carta${this.whiteCards.length !== 1 ? 's' : ''} branca${this.whiteCards.length !== 1 ? 's' : ''}. Deseja enviar?`,
      confirmText: 'Enviar! ✅',
      cancelText: 'Revisar',
      onConfirm: () => {
        this.doSubmit();
      },
    });
  },

  doSubmit() {
    const btn = document.getElementById('submit-cards-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:#fff"></div> Enviando...';
    }
    SocketClient.submitCards(App.state.roomCode, this.blackCards, this.whiteCards);
  },

  init() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        App.showScreen('lobby');
      });
    }

    // Submit
    const submitBtn = document.getElementById('submit-cards-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.submit();
      });
    }
  },
};
