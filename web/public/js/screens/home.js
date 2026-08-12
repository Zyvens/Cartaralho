/* ============================================================
   Home Screen
   ============================================================ */
const HomeScreen = {
  render(container) {
    container.innerHTML = `
      <div class="home-screen">
        <div class="home-bg-cards" id="dynamic-bg-container"></div>
        <div class="home-content">
          <div class="home-logo">
            <img src="assets/images/logo.png" alt="Cartaralho" class="logo-image">
          </div>
          <p class="home-subtitle">Jogo de Cartas</p>

          <!-- Menu Principal -->
          <div class="home-form" id="mode-selection">
            <button id="btn-mode-online" class="btn btn-primary btn-lg btn-block" style="margin-bottom: var(--space-md);">
              <span class="btn-icon-emoji">🌍</span> Jogar Online
            </button>
            <button id="btn-mode-local" class="btn btn-secondary btn-lg btn-block">
              <span class="btn-icon-emoji">📱</span> Jogar Local
            </button>
          </div>

          <!-- Sub-menu Local -->
          <div class="home-form" id="local-mode-selection" style="display: none;">
            <button id="btn-back-local-menu" class="btn btn-secondary btn-sm" style="margin-bottom: var(--space-md); border:none; padding:0;">← Voltar</button>
            <button id="btn-local-single" class="btn btn-primary btn-lg btn-block" style="margin-bottom: var(--space-md);">
              <span class="btn-icon-emoji">📱</span> 1 Dispositivo para Todos
            </button>
            <button id="btn-local-multi" class="btn btn-secondary btn-lg btn-block" style="margin-bottom: var(--space-md);">
              <span class="btn-icon-emoji">💻</span> Vários Dispositivos
            </button>
            <button id="btn-local-server" class="btn btn-secondary btn-lg btn-block">
              <span class="btn-icon-emoji">🖥️</span> Ativar: Servidor Local
            </button>
          </div>

          <!-- Formulário Padrão (Usado para Online e Local Multi) -->
          <div class="home-form" id="standard-form" style="display: none;">
            <button id="btn-back-standard" class="btn btn-secondary btn-sm" style="margin-bottom: var(--space-md); border:none; padding:0;">← Voltar</button>
            <h3 id="standard-form-title" style="text-align:center; margin-bottom:15px; color:var(--accent-primary);"></h3>
            
            <div class="input-group">
              <input type="text" id="nickname-input" class="input" placeholder=" " maxlength="20" autocomplete="off" spellcheck="false">
              <label for="nickname-input" class="input-label">Seu Nickname</label>
            </div>
            <button id="create-room-btn" class="btn btn-primary btn-lg btn-block">
              <span class="btn-icon-emoji">🎴</span> Criar Mesa
            </button>
            <div class="divider"><span>ou</span></div>
            <div class="input-group">
              <input type="text" id="room-code-input" class="input input-code" placeholder=" " maxlength="6" autocomplete="off" spellcheck="false">
              <label for="room-code-input" class="input-label">Código da Mesa</label>
            </div>
            <button id="join-room-btn" class="btn btn-secondary btn-lg btn-block">Entrar na Mesa</button>
          </div>

          <!-- Formulário Local 1 Celular -->
          <div class="home-form" id="local-single-form" style="display: none;">
            <button id="btn-back-single" class="btn btn-secondary btn-sm" style="margin-bottom: var(--space-md); border:none; padding:0;">← Voltar</button>
            <h3 style="text-align:center; margin-bottom:15px; color:var(--accent-primary);">1 Celular</h3>
            <div class="input-group">
              <input type="text" id="local-host-input" class="input" placeholder=" " maxlength="20" autocomplete="off" spellcheck="false">
              <label for="local-host-input" class="input-label">Nome do Host</label>
            </div>
            <button id="create-single-btn" class="btn btn-primary btn-lg btn-block">
              <span class="btn-icon-emoji">📱</span> Criar Mesa
            </button>
          </div>
        </div>

        <footer class="home-footer">
          <p>Crie suas cartas. Jogue com amigos. Ria muito. 🃏</p>
        </footer>
        
        <button id="home-admin-btn" class="admin-login-btn" title="Painel de Administração">⚙️</button>
      </div>
    `;
    this.init();
  },

  init() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && SocketClient.socket) {
      SocketClient.socket.emit('set_host_mode', { mode: 'waiting' });
    }

    let pendingPlayMode = 'online';

    const modeSelection = document.getElementById('mode-selection');
    const localModeSelection = document.getElementById('local-mode-selection');
    const standardForm = document.getElementById('standard-form');
    const localSingleForm = document.getElementById('local-single-form');
    
    const nicknameInput = document.getElementById('nickname-input');
    const codeInput = document.getElementById('room-code-input');
    const hostInput = document.getElementById('local-host-input');
    
    const standardTitle = document.getElementById('standard-form-title');

    document.getElementById('btn-mode-online').addEventListener('click', () => {
      pendingPlayMode = 'online';
      standardTitle.textContent = 'Jogo Online';
      modeSelection.style.display = 'none';
      standardForm.style.display = 'block';
      nicknameInput.focus();
    });

    document.getElementById('btn-mode-local').addEventListener('click', () => {
      modeSelection.style.display = 'none';
      localModeSelection.style.display = 'block';
    });

    document.getElementById('btn-local-single').addEventListener('click', () => {
      pendingPlayMode = 'local-single';
      localModeSelection.style.display = 'none';
      localSingleForm.style.display = 'block';
      hostInput.focus();
    });

    document.getElementById('btn-local-multi').addEventListener('click', () => {
      pendingPlayMode = 'local-multi';
      standardTitle.textContent = 'Vários Dispositivos';
      localModeSelection.style.display = 'none';
      standardForm.style.display = 'block';
      nicknameInput.focus();
    });

    document.getElementById('btn-local-server').addEventListener('click', () => {
      App.state.playMode = 'local-server';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        SocketClient.emit('set_host_mode', { mode: 'local-server' });
      }
      App.showScreen('serverDash');
    });

    document.getElementById('btn-back-local-menu').addEventListener('click', () => {
      localModeSelection.style.display = 'none';
      modeSelection.style.display = 'block';
    });

    document.getElementById('btn-back-standard').addEventListener('click', () => {
      standardForm.style.display = 'none';
      if (pendingPlayMode === 'online') {
        modeSelection.style.display = 'block';
      } else {
        localModeSelection.style.display = 'block';
      }
    });

    document.getElementById('btn-back-single').addEventListener('click', () => {
      localSingleForm.style.display = 'none';
      localModeSelection.style.display = 'block';
    });

    const savedNick = localStorage.getItem('cartalho_nickname');
    if (savedNick) {
      nicknameInput.value = savedNick;
      hostInput.value = savedNick;
    }

    codeInput.addEventListener('input', () => {
      codeInput.value = codeInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    });

    document.getElementById('create-room-btn').addEventListener('click', () => {
      const nickname = nicknameInput.value.trim();
      if (!nickname || nickname.length < 2) {
        Toast.warning('O nickname deve ter pelo menos 2 caracteres.');
        nicknameInput.focus();
        return;
      }
      App.state.nickname = nickname;
      App.state.playMode = pendingPlayMode;
      App.state.isLocalMode = (pendingPlayMode !== 'online'); 
      localStorage.setItem('cartalho_nickname', nickname);
      App.showScreen('createRoom');
    });

    document.getElementById('create-single-btn').addEventListener('click', () => {
      const nickname = hostInput.value.trim();
      if (!nickname || nickname.length < 2) {
        Toast.warning('O nickname deve ter pelo menos 2 caracteres.');
        hostInput.focus();
        return;
      }
      App.state.nickname = nickname;
      App.state.playMode = 'local-single';
      App.state.isLocalMode = true;
      localStorage.setItem('cartalho_nickname', nickname);
      App.showScreen('createRoom');
    });

    document.getElementById('join-room-btn').addEventListener('click', () => {
      const nickname = nicknameInput.value.trim();
      const code = codeInput.value.trim();

      if (!nickname || nickname.length < 2) {
        Toast.warning('O nickname deve ter pelo menos 2 caracteres.');
        nicknameInput.focus();
        return;
      }
      if (!code || code.length < 4) {
        Toast.warning('Digite o código da mesa.');
        codeInput.focus();
        return;
      }

      const joinBtn = document.getElementById('join-room-btn');
      joinBtn.disabled = true;
      joinBtn.innerHTML = 'Conectando...';

      App.state.nickname = nickname;
      App.state.playMode = pendingPlayMode;
      App.state.isLocalMode = (pendingPlayMode !== 'online');
      localStorage.setItem('cartalho_nickname', nickname);

      SocketClient.joinRoom(nickname, code);

      setTimeout(() => {
        if (App.state.currentScreen === 'home') {
          joinBtn.disabled = false;
          joinBtn.innerHTML = 'Entrar na Mesa';
        }
      }, 5000);
    });

    const adminBtn = document.getElementById('home-admin-btn');
    if (adminBtn) {
      adminBtn.addEventListener('click', async () => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
          App.showScreen('admin');
        } else {
          const pass = await Modal.prompt('Autenticação', 'Digite a senha de administrador:');
          if (pass === 'admin123') {
            App.showScreen('admin');
          } else if (pass !== null) {
            Toast.error('Senha incorreta.');
          }
        }
      });
    }

    this.initDynamicBackground();
  },

  initDynamicBackground() {
    const container = document.getElementById('dynamic-bg-container');
    if (!container) return;

    fetch('/api/sample-cards')
      .then(res => res.json())
      .then(data => {
        if (!data.blackCards || !data.whiteCards) return;
        const allCards = [
          ...data.blackCards.map(c => ({ text: c.text, type: 'black' })),
          ...data.whiteCards.map(c => ({ text: c.text, type: 'white' }))
        ];

        // Se não houver cartas, não faz nada
        if (allCards.length === 0) return;

        // Limita para no máximo 6 cartas flutuando ao mesmo tempo
        const MAX_CARDS = 6;
        let currentCards = 0;

        const spawnCard = () => {
          if (currentCards >= MAX_CARDS) return;
          if (!document.getElementById('dynamic-bg-container')) return; // se saiu da tela home

          currentCards++;
          const cardData = allCards[Math.floor(Math.random() * allCards.length)];
          const cardEl = document.createElement('div');
          
          // Estilo base da carta flutuante dinamicamente
          cardEl.className = `dynamic-floating-card ${cardData.type}`;
          
          // Posição, rotação e escala aleatórias
          const posX = Math.random() * 80 + 10; // 10% a 90%
          const posY = Math.random() * 80 + 10; // 10% a 90%
          const rot = (Math.random() - 0.5) * 40; // -20deg a 20deg
          const scale = Math.random() * 0.4 + 0.6; // 0.6 a 1.0

          cardEl.style.left = `${posX}%`;
          cardEl.style.top = `${posY}%`;
          cardEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
          
          // Estrutura interna semelhante às cartas normais
          cardEl.innerHTML = `
            <div class="card-watermark">Cartaralho</div>
            <div class="card-text">${cardData.text}</div>
          `;

          container.appendChild(cardEl);

          // Animar entrada e saída
          setTimeout(() => {
            cardEl.style.opacity = '1';
            cardEl.style.transform = `translate(-50%, -50%) rotate(${rot + (Math.random() * 10 - 5)}deg) scale(${scale + 0.05})`;
          }, 100);

          // Remover depois de um tempo aleatório
          const duration = Math.random() * 4000 + 4000; // 4 a 8 segundos
          setTimeout(() => {
            cardEl.style.opacity = '0';
            setTimeout(() => {
              if (cardEl.parentNode) {
                cardEl.parentNode.removeChild(cardEl);
                currentCards--;
              }
            }, 1000); // tempo do fadeOut
          }, duration);
        };

        // Spawn inicial
        for(let i=0; i<3; i++) {
          setTimeout(spawnCard, Math.random() * 2000);
        }

        // Loop contínuo
        this.bgInterval = setInterval(spawnCard, 2500);
      })
      .catch(err => console.error('Erro ao carregar sample-cards:', err));
  },
};
