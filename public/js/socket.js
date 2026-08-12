/* ============================================================
   Socket.IO Client Wrapper
   ============================================================ */
const SocketClient = {
  socket: null,
  localSockets: {}, // map of nickname -> socket (for local mode)
  activeNickname: null,
  sessionId: null,

  init() {
    this.sessionId = localStorage.getItem('cartalho_session_id');
    if (!this.sessionId) {
      this.sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('cartalho_session_id', this.sessionId);
    }

    this.socket = io({
      query: { sessionId: this.sessionId }
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Conectado:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Desconectado:', reason);
      Toast.warning('Conexão perdida. Tentando reconectar...');
    });

    this.socket.on('reconnect', () => {
      Toast.success('Reconectado!');
    });
  },

  createLocalSocket(nickname, code, onJoined) {
    const localSessionId = this.sessionId + '_' + encodeURIComponent(nickname);
    const newSocket = io({
      query: { sessionId: localSessionId }
    });
    this.localSockets[nickname] = newSocket;
    
    newSocket.on('connect', () => {
      newSocket.emit('join_room', { nickname, code });
    });
    
    newSocket.on('room_joined', (data) => {
      if(onJoined) onJoined(data);
    });
    
    // Bubble up generic errors for local sockets
    newSocket.on('error', (err) => {
      Toast.error(err.message || 'Erro no jogador local');
    });

    newSocket.on('new_round', (data) => {
      App.state.localPlayersData = App.state.localPlayersData || {};
      App.state.localPlayersData[nickname] = data;
    });
    
    return newSocket;
  },

  getActiveSocket() {
    if (App.state.isLocalMode && this.activeNickname && this.localSockets[this.activeNickname]) {
      return this.localSockets[this.activeNickname];
    }
    return this.socket;
  },

  setActiveLocalPlayer(nickname) {
    this.activeNickname = nickname;
  },

  /* ---------- Emit Methods ---------- */

  createRoom(nickname, config) {
    this.socket.emit('create_room', { nickname, config });
  },

  updateRoomConfig(code, partialConfig) {
    this.socket.emit('update_room_config', { code, partialConfig });
  },

  joinRoom(nickname, code) {
    this.socket.emit('join_room', { nickname, code });
  },

  renameLocalPlayer(oldNickname, newNickname, code) {
    this.socket.emit('rename_local_player', { oldNickname, newNickname, code });
  },

  kickLocalPlayer(nickname, code) {
    this.socket.emit('kick_local_player', { nickname, code });
  },

  submitCards(code, blackCards, whiteCards) {
    this.getActiveSocket().emit('submit_cards', { code, blackCards, whiteCards });
  },

  startGame(code) {
    this.socket.emit('start_game', { code }); // Host always starts the game using the main socket
  },

  playCard(code, cardIndex) {
    this.getActiveSocket().emit('play_card', { code, cardIndex });
  },

  pickWinner(code, submissionIndex) {
    this.getActiveSocket().emit('pick_winner', { code, submissionIndex }); // Host picks winner
  },

  /* ---------- Listen Methods ---------- */

  on(event, callback) {
    // For listening, we usually just want to listen on the main socket.
    // The main socket (host) receives all state updates!
    this.socket.on(event, callback);
  },

  off(event, callback) {
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  },

  emit(event, data) {
    this.socket.emit(event, data);
  }
};
