/* ============================================================
   Cartalho — Main Application Controller
   ============================================================ */
const App = {
  state: {
    nickname: '',
    roomCode: '',
    isCreator: false,
    currentScreen: 'home',
    players: [],
    hand: [],
    currentBlackCard: null,
    isHost: false,
    scores: [],
    roundNumber: 0,
    maxPlayers: 6,
    blackCardsPerPlayer: 5,
    whiteCardsPerPlayer: 20,
    playMode: 'online', // 'online', 'local-single', 'local-multi'
    isGuest: false,
    guestCode: '',
  },

  init() {
    SocketClient.init();
    this.registerSocketEvents();

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // Padrão do Localtunnel: cartaralho-[codigo].loca.lt
    if (hostname.startsWith('cartaralho-')) {
      const parts = hostname.split('-');
      if (parts.length > 1) {
        const codePart = parts[1].split('.')[0];
        this.state.isGuest = true;
        this.state.guestCode = codePart.toUpperCase();
      }
    } else if (!isLocalhost) {
      this.state.isGuest = true;
      this.state.guestCode = '';
    }

    if (this.state.isGuest) {
      if (this.state.guestCode) {
        this.showScreen('guest');
      } else {
        this.showScreen('waitingHost');
      }
    } else {
      this.showScreen('home');
    }
  },

  resetState() {
    this.state = {
      nickname: this.state.nickname, // keep nickname
      roomCode: '',
      isCreator: false,
      currentScreen: 'home',
      players: [],
      hand: [],
      currentBlackCard: null,
      isHost: false,
      scores: [],
      roundNumber: 0,
      maxPlayers: 6,
      blackCardsPerPlayer: 5,
      whiteCardsPerPlayer: 20,
      useStandardDeck: true,
    };
    Scoreboard.hide();
    // NÃO limpa CardCreationScreen.blackCards e whiteCards aqui para manter rascunhos em caso de host drop
  },

  showScreen(name, data = {}) {
    // Clean up result timer if leaving result screen
    if (this.state.currentScreen === 'result') {
      ResultScreen.cleanup();
    }
    if (this.state.currentScreen === 'waitingHost') {
      WaitingHostScreen.cleanup();
    }

    this.state.currentScreen = name;
    const app = document.getElementById('app');

    // Fade out
    app.classList.add('screen-exit');

    setTimeout(() => {
      app.innerHTML = '';
      app.classList.remove('screen-exit');
      app.classList.add('screen-enter');

      switch (name) {
        case 'home':
          HomeScreen.render(app);
          break;
        case 'waitingHost':
          WaitingHostScreen.render(app);
          break;
        case 'guest':
          GuestScreen.render(app);
          break;
        case 'createRoom':
          CreateRoomScreen.render(app);
          break;
        case 'lobby':
          LobbyScreen.render(app, data);
          break;
        case 'serverDash':
          ServerDashScreen.render(app);
          break;
        case 'cardCreation':
          CardCreationScreen.render(app, data);
          break;
        case 'round':
          RoundScreen.render(app, data);
          break;
        case 'host':
          HostScreen.render(app, data);
          break;
        case 'result':
          ResultScreen.render(app, data);
          break;
        case 'gameOver':
          GameOverScreen.render(app, data);
          break;
        case 'admin':
          AdminScreen.render(app);
          break;
        default:
          HomeScreen.render(app);
      }

      setTimeout(() => app.classList.remove('screen-enter'), 400);
    }, 300);
  },

  handleLocalNextTurn() {
    if (!this.state.localTurnQueue) {
      // Initialize queue for this round
      const players = this.state.players.map(p => p.nickname);
      let hostNick = null;
      let nonHosts = [];
      
      // Find the host
      for (const nick of players) {
        if (this.state.localPlayersData[nick] && this.state.localPlayersData[nick].isHost) {
          hostNick = nick;
        } else {
          nonHosts.push(nick);
        }
      }
      
      this.state.localTurnQueue = nonHosts;
      this.state.localHostNick = hostNick;
    }

    if (this.state.localTurnQueue.length > 0) {
      // Next non-host player
      const nextNick = this.state.localTurnQueue.shift();
      SocketClient.setActiveLocalPlayer(nextNick);
      const data = this.state.localPlayersData[nextNick];
      
      // Render blind screen first
      const container = document.getElementById('app');
      container.innerHTML = `
        <div class="lobby-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh;">
          <h2 class="gradient-text" style="font-size:2.5rem; margin-bottom:1rem;">Vez de: ${nextNick}</h2>
          <p style="color:var(--text-muted); margin-bottom:2rem;">Escolha sua carta (o Czar é ${this.state.localHostNick})</p>
          <button id="blind-start-btn" class="btn btn-primary btn-lg">Começar</button>
        </div>
      `;
      document.getElementById('blind-start-btn').addEventListener('click', () => {
        this.showScreen('round', { blackCard: this.state.currentBlackCard, hand: data.hand, roundNumber: this.state.roundNumber });
      });
    } else {
      // All played, show host screen
      SocketClient.setActiveLocalPlayer(this.state.localHostNick);
      const container = document.getElementById('app');
      container.innerHTML = `
        <div class="lobby-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh;">
          <h2 class="gradient-text" style="font-size:2.5rem; margin-bottom:1rem;">Vez do Czar: ${this.state.localHostNick}</h2>
          <p style="color:var(--text-muted); margin-bottom:2rem;">Hora de escolher a melhor carta!</p>
          <button id="blind-start-btn" class="btn btn-primary btn-lg">Ver Cartas Jogadas</button>
        </div>
      `;
      document.getElementById('blind-start-btn').addEventListener('click', () => {
        this.showScreen('host', { blackCard: this.state.currentBlackCard, roundNumber: this.state.roundNumber });
        // The submissions might have been received while we were playing. We rely on all_cards_played event.
        // Wait, the main socket received all_cards_played and maybe updated HostScreen if it was active.
        // But HostScreen wasn't active.
      });
    }
  },

  registerSocketEvents() {
    /* ----- Room Created ----- */
    SocketClient.on('room_created', (data) => {
      // data = { code, config, players }
      this.state.roomCode = data.code;
      this.state.isCreator = true;
      this.state.config = data.config || {};
      this.state.maxPlayers = data.config?.maxPlayers || 6;
      this.state.blackCardsPerPlayer = data.config?.blackCardsPerPlayer || 5;
      this.state.whiteCardsPerPlayer = data.config?.whiteCardsPerPlayer || 20;
      this.state.useStandardDeck = data.config?.useStandardDeck !== false;
      this.state.players = data.players || [{ nickname: this.state.nickname, cardsReady: false, isCreator: true, connected: true }];
      
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost && this.state.playMode !== 'local-server') {
        SocketClient.socket.emit('set_host_mode', { mode: this.state.playMode, activeRoom: data.code });
      }

      Toast.success(`Mesa criada! Código: ${data.code}`);
      this.showScreen('lobby', { code: data.code });
    });

    /* ----- Room Joined ----- */
    SocketClient.on('room_joined', (data) => {
      // data = { code, config, players, isCreator }
      this.state.roomCode = data.code;
      this.state.config = data.config || {};
      this.state.maxPlayers = data.config?.maxPlayers || 6;
      this.state.blackCardsPerPlayer = data.config?.blackCardsPerPlayer || 5;
      this.state.whiteCardsPerPlayer = data.config?.whiteCardsPerPlayer || 20;
      this.state.useStandardDeck = data.config?.useStandardDeck !== false;
      this.state.players = data.players || [];
      this.state.isCreator = data.isCreator || false;
      Toast.success(`Entrou na sala ${data.code}`);
      this.showScreen('lobby', { code: data.code });
    });

    /* ----- Room Closed (Host dropped) ----- */
    SocketClient.on('room_closed', (data) => {
      this.state.roomCode = null;
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (hostname.endsWith('.loca.lt') || window.__isOnlineEmulator) {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
          <div class="home-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding: 20px; text-align:center;">
            <h2 style="color:var(--primary); margin-bottom: 20px;">Partida Encerrada</h2>
            <p style="font-size:1.2rem; color:var(--text-muted);">O host finalizou a sala. Feche esta janela e solicite um novo link.</p>
          </div>
        `;
      } else if (!isLocalhost && this.state.isGuest) {
        this.showScreen('waitingHost');
      } else {
        Toast.error(data.message || 'A sala foi encerrada.');
        this.resetState();
        this.showScreen('home');
      }
    });

    /* ----- Player List Update ----- */
    SocketClient.on('player_list_update', (data) => {
      // data = { players: [{nickname, cardsReady, score, isCreator, connected}] }
      this.state.players = data.players || [];

      // Update scores for scoreboard
      this.state.scores = data.players.map(p => ({
        nickname: p.nickname,
        score: p.score || 0,
        isHost: p.isHost || false,
      }));

      // Update lobby if on that screen
      if (this.state.currentScreen === 'lobby') {
        LobbyScreen.update(data.players);
      }

      // Update scoreboard during game
      if (['round', 'host', 'result'].includes(this.state.currentScreen)) {
        Scoreboard.update(this.state.scores);
      }
    });

    /* ----- Cards Submitted ----- */
    SocketClient.on('cards_submitted', (data) => {
      // data = { playerStatuses: [{nickname, cardsReady}] }
      if (data.playerStatuses) {
        // Update player statuses in state first
        this.state.players = this.state.players.map(p => {
          const status = data.playerStatuses.find(s => s.nickname === p.nickname);
          if (status) p.cardsReady = status.cardsReady;
          return p;
        });

        // Check if OUR cards were just marked ready (to navigate from cardCreation)
        const myStatus = data.playerStatuses.find(s => s.nickname === this.state.nickname);
        if (this.state.currentScreen === 'cardCreation') {
          if (App.state.isLocalMode) {
            Toast.success(`Cartas de ${SocketClient.activeNickname} cadastradas com sucesso!`);
            CardCreationScreen.blackCards = [];
            CardCreationScreen.whiteCards = [];
            const pending = this.state.players.filter(p => !p.cardsReady);
            if (pending.length > 0) {
              SocketClient.setActiveLocalPlayer(pending[0].nickname);
              this.showScreen('cardCreation', { bypassBlindScreen: false });
            } else {
              this.showScreen('lobby');
            }
          } else if (myStatus && myStatus.cardsReady) {
            Toast.success('Cartas cadastradas com sucesso!');
            CardCreationScreen.blackCards = [];
            CardCreationScreen.whiteCards = [];
            this.showScreen('lobby');
          }
        }

        // Update lobby if visible
        if (this.state.currentScreen === 'lobby') {
          LobbyScreen.update(this.state.players);
        }
      }
    });

    /* ----- All Cards Ready ----- */
    SocketClient.on('all_cards_ready', () => {
      Toast.info('Todos os jogadores cadastraram suas cartas!');
      // The start button will be enabled via player_list_update
    });

    /* ----- Game Started ----- */
    SocketClient.on('game_started', (data) => {
      // data = { message }
      Toast.success(data?.message || 'A partida começou!');
      // Wait for new_round event to transition
    });

    /* ----- New Round ----- */
    SocketClient.on('new_round', (data) => {
      this.state.roundNumber = data.roundNumber || this.state.roundNumber + 1;
      this.state.currentBlackCard = data.blackCard;
      if (data.scores) this.state.scores = data.scores;
      
      // Merge main socket data into localPlayersData to simplify
      App.state.localPlayersData = App.state.localPlayersData || {};
      App.state.localPlayersData[this.state.nickname] = data;

      if (App.state.isLocalMode) {
        // Wait briefly for all local sockets to receive their new_round event
        setTimeout(() => {
          this.handleLocalNextTurn();
        }, 300);
      } else {
        this.state.hand = data.hand || [];
        this.state.isHost = data.isHost || false;
        
        if (data.isHost) {
          this.showScreen('host', { blackCard: data.blackCard, roundNumber: this.state.roundNumber });
        } else {
          this.showScreen('round', { blackCard: data.blackCard, hand: data.hand, roundNumber: this.state.roundNumber });
        }
      }
    });

    /* ----- Card Played ----- */
    SocketClient.on('card_played', (data) => {
      // data = { submissionCount, totalExpected }
      if (this.state.currentScreen === 'round') {
        RoundScreen.updateSubmissionCount(data.submissionCount, data.totalExpected);
      }
      if (this.state.currentScreen === 'host') {
        HostScreen.updateSubmissionCount(data.submissionCount, data.totalExpected);
      }
    });

    /* ----- All Cards Played ----- */
    SocketClient.on('all_cards_played', (data) => {
      // data = { submissions: [{index, card}], blackCard }
      this.state.submissions = data.submissions; // Save for local mode
      if (this.state.currentScreen === 'host' && data.submissions) {
        HostScreen.showSubmissions(data.submissions);
      }
    });

    /* ----- Round Result ----- */
    SocketClient.on('round_result', (data) => {
      // Clear queue for next round
      this.state.localTurnQueue = null;
      
      // data = { blackCard, winnerCard, winnerNickname, scores, roundNumber }
      this.showScreen('result', {
        blackCard: data.blackCard,
        winnerCard: data.winnerCard,
        winnerNickname: data.winnerNickname,
        scores: data.scores,
        roundNumber: data.roundNumber || this.state.roundNumber,
      });
    });

    /* ----- Game Over ----- */
    SocketClient.on('game_over', (data) => {
      // data = { winnerNickname, ranking: [{nickname, score}], message }
      Scoreboard.hide();
      this.showScreen('gameOver', {
        winner: data.winnerNickname || (data.ranking && data.ranking[0] ? data.ranking[0].nickname : '???'),
        ranking: data.ranking || [],
      });
    });

    /* ----- Error ----- */
    SocketClient.on('error', (data) => {
      const msg = typeof data === 'string' ? data : (data?.message || 'Ocorreu um erro.');
      
      // Fallback para emulador online se a sala local não for encontrada
      if (msg.toLowerCase().includes('sala não encontrada') && this.state.currentScreen === 'home') {
        const codeInput = document.getElementById('room-code-input');
        if (codeInput && codeInput.value) {
          const code = codeInput.value.trim();
          Toast.info('Buscando sala na rede online...');
          
          this.showScreen('onlineEmulator', { code: code });
          
          const joinBtn = document.getElementById('join-room-btn');
          if (joinBtn) {
            joinBtn.disabled = false;
            joinBtn.innerHTML = 'Entrar na Mesa';
          }
          return;
        }
      }

      Toast.error(msg);
      
      // Re-enable buttons if error happens during creation/join
      if (this.state.currentScreen === 'home') {
        const btns = [
          document.getElementById('create-room-btn'),
          document.getElementById('join-room-btn'),
          document.getElementById('create-single-btn')
        ];
        btns.forEach(btn => {
          if (btn) {
            btn.disabled = false;
            const emoji = btn.querySelector('.btn-icon-emoji');
            if (!emoji) btn.textContent = 'Tentar novamente';
          }
        });
      }
    });

    SocketClient.on('player_disconnected', (data) => {
      Toast.warning(`${data.nickname || 'Um jogador'} desconectou.`);
    });

    SocketClient.on('player_left', (data) => {
      Toast.warning(`${data.nickname || 'Um jogador'} saiu da partida definitivamente.`);
    });

    SocketClient.on('round_skipped', (data) => {
      Toast.warning(data.message || 'Rodada pulada.');
    });

    SocketClient.on('room_cancelled', (data) => {
      this.state.roomCode = null;
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (hostname.endsWith('.loca.lt') || window.__isOnlineEmulator) {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
          <div class="home-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding: 20px; text-align:center;">
            <h2 style="color:var(--primary); margin-bottom: 20px;">Partida Cancelada</h2>
            <p style="font-size:1.2rem; color:var(--text-muted);">O host cancelou a partida. Feche esta janela e solicite um novo link.</p>
          </div>
        `;
      } else if (!isLocalhost && this.state.isGuest) {
        this.showScreen('waitingHost');
      } else {
        Toast.error(data.message || 'A partida foi cancelada/encerrada.');
        this.showScreen('home');
      }
    });

    SocketClient.on('player_abandoned', (data) => {
      let seconds = 15;
      Modal.show({
        title: '⚠️ Partida Encerrada',
        message: `${data.message}<br><br>Voltando ao início em <strong id="afk-timer">${seconds}</strong>s`,
        confirmText: 'Voltar Agora',
        onConfirm: () => {
          this.state.roomCode = null;
          this.showScreen('home');
        }
      });
      
      const interval = setInterval(() => {
        seconds--;
        const timerEl = document.getElementById('afk-timer');
        if (timerEl) timerEl.textContent = seconds;
        
        if (seconds <= 0) {
          clearInterval(interval);
          const modalWrap = document.querySelector('.modal-overlay');
          if (modalWrap) modalWrap.remove();
          this.state.roomCode = null;
          this.showScreen('home');
        }
      }, 1000);
    });

    /* ----- Player Reconnected ----- */
    SocketClient.on('player_reconnected', (data) => {
      Toast.info(`${data.nickname || 'Um jogador'} reconectou!`);
    });

    SocketClient.on('server_status_update', (data) => {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (!isLocalhost && data.mode === 'waiting' && this.state.isGuest && this.state.currentScreen !== 'waitingHost') {
        this.showScreen('waitingHost');
      }
    });

  },
};

window.App = App;
/* ----- Bootstrap ----- */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
