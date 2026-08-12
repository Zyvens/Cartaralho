/* ============================================================
   Online Client Adapter — HTTP (Vercel functions) + Pusher realtime
   Same public surface as the desktop app's socket.io wrapper
   (on/off/emit + the named action methods), so every screen file
   works unchanged against either backend.
   ============================================================ */
const ROOM_EVENTS = [
  'player_list_update', 'cards_submitted', 'all_cards_ready', 'game_started',
  'new_round', 'card_played', 'all_cards_played', 'round_result', 'game_over',
  'player_disconnected', 'player_left', 'round_skipped', 'room_cancelled', 'room_closed',
];

const HEARTBEAT_MS = 15000;

const SocketClient = {
  playerId: null,
  pusher: null,
  channel: null,
  roomCode: null,
  listeners: {},
  heartbeatTimer: null,
  _ready: null,
  _wasDisconnected: false,

  init() {
    this.playerId = localStorage.getItem('cartalho_session_id');
    if (!this.playerId) {
      this.playerId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('cartalho_session_id', this.playerId);
    }

    this._ready = fetch('/api/config')
      .then(res => res.json())
      .then(cfg => {
        if (!cfg.success) throw new Error(cfg.error || 'Falha ao carregar configuração.');
        this.pusher = new Pusher(cfg.pusherKey, { cluster: cfg.pusherCluster });

        this.pusher.connection.bind('connected', () => {
          console.log('[Pusher] Conectado');
          if (this._wasDisconnected) Toast.success('Reconectado!');
          this._wasDisconnected = false;
        });
        this.pusher.connection.bind('unavailable', () => {
          this._wasDisconnected = true;
          Toast.warning('Conexão perdida. Tentando reconectar...');
        });
      })
      .catch(err => {
        console.error('[SocketClient] init falhou:', err);
        Toast.error('Não foi possível conectar ao servidor.');
      });
  },

  async _waitReady() {
    if (this._ready) await this._ready;
  },

  async subscribeRoom(code) {
    await this._waitReady();
    if (!this.pusher) return;

    if (this.channel && this.roomCode === code) return;
    this.unsubscribeRoom();

    this.roomCode = code;
    this.channel = this.pusher.subscribe('room-' + code);

    ROOM_EVENTS.forEach(event => {
      this.channel.bind(event, data => this._handleRoomEvent(event, data));
    });

    this._startHeartbeat();
  },

  unsubscribeRoom() {
    if (this.channel) {
      this.pusher.unsubscribe('room-' + this.roomCode);
      this.channel = null;
    }
    this.roomCode = null;
    this._stopHeartbeat();
  },

  async _handleRoomEvent(event, data) {
    if (event === 'new_round') {
      try {
        const res = await fetch(`/api/game/hand?code=${this.roomCode}&playerId=${encodeURIComponent(this.playerId)}`);
        const json = await res.json();
        this._emit('new_round', { ...data, hand: json.hand || [], isHost: !!json.isHost });
      } catch (err) {
        this._emit('new_round', { ...data, hand: [], isHost: data.hostId === this.playerId });
      }
      return;
    }

    if (event === 'round_result') {
      this._emit(event, data);
      const code = this.roomCode;
      const roundNumber = data.roundNumber;
      if (!data.gameOver && code) {
        setTimeout(() => {
          fetch('/api/game/next-round', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, expectedRoundNumber: roundNumber }),
          }).catch(() => {});
        }, 5000 + Math.floor(Math.random() * 800));
      }
      return;
    }

    if (event === 'game_over' || event === 'room_cancelled' || event === 'room_closed') {
      this._emit(event, data);
      this.unsubscribeRoom();
      return;
    }

    this._emit(event, data);
  },

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (!this.roomCode) return;
      fetch('/api/rooms/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: this.playerId, code: this.roomCode }),
      }).catch(() => {});
    }, HEARTBEAT_MS);
  },

  _stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  },

  async _post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: this.playerId, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Erro de comunicação com o servidor.');
    }
    return data;
  },

  /* ---------- Listen Methods ---------- */

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  off(event, callback) {
    if (!this.listeners[event]) return;
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      this.listeners[event] = [];
    }
  },

  _emit(event, data) {
    (this.listeners[event] || []).forEach(cb => {
      try { cb(data); } catch (err) { console.error(`[SocketClient] listener error for ${event}:`, err); }
    });
  },

  /* ---------- Generic emit (matches the old socket.emit(event, data, cb) call sites) ---------- */

  emit(event, data, callback) {
    if (event === 'leave_room') {
      this._post('/api/rooms/leave', { code: this.roomCode })
        .then(res => { this.unsubscribeRoom(); if (callback) callback(res); })
        .catch(err => { this.unsubscribeRoom(); if (callback) callback({ success: false, error: err.message }); });
      return;
    }

    if (event === 'cancel_room' || event === 'end_room') {
      this._post('/api/rooms/end', { code: (data && data.code) || this.roomCode, mode: event === 'end_room' ? 'end' : 'cancel' })
        .then(res => { if (callback) callback(res); })
        .catch(err => { if (callback) callback({ success: false, error: err.message }); });
      return;
    }

    // 'cancel_game', 'set_host_mode', etc: no server-side handler in the
    // online build either (the desktop app doesn't wire 'cancel_game' up
    // server-side, and host-mode/tunnel concepts don't apply once every
    // room already lives online). Safe no-ops.
    if (callback) callback({ success: false });
  },

  /* ---------- Action Methods ---------- */

  createRoom(nickname, config) {
    this._post('/api/rooms/create', { nickname, config })
      .then(async data => {
        await this.subscribeRoom(data.code);
        this._emit('room_created', data);
      })
      .catch(err => this._emit('error', { message: err.message }));
  },

  updateRoomConfig(code, partialConfig) {
    this._post('/api/rooms/config', { code, partialConfig }).catch(() => {});
  },

  joinRoom(nickname, code) {
    const upperCode = (code || '').toUpperCase().trim();
    this._post('/api/rooms/join', { nickname, code: upperCode })
      .then(async data => {
        await this.subscribeRoom(data.code);
        this._emit('room_joined', data);
      })
      .catch(err => this._emit('error', { message: err.message }));
  },

  submitCards(code, blackCards, whiteCards) {
    this._post('/api/cards/submit', { code, blackCards, whiteCards })
      .catch(err => this._emit('error', { message: err.message }));
  },

  startGame(code) {
    this._post('/api/game/start', { code })
      .catch(err => this._emit('error', { message: err.message }));
  },

  playCard(code, cardIndex) {
    this._post('/api/game/play', { code, cardIndex })
      .catch(err => this._emit('error', { message: err.message }));
  },

  pickWinner(code, submissionIndex) {
    this._post('/api/game/pick-winner', { code, submissionIndex })
      .catch(err => this._emit('error', { message: err.message }));
  },

  /* ---------- Local (same-device, pass-and-play) — not available online ---------- */

  createLocalSocket(nickname, code, onJoined) {
    Toast.warning('Jogadores locais (mesmo aparelho) não estão disponíveis na versão online. Cada jogador entra do seu próprio celular/computador.');
  },

  renameLocalPlayer() {},
  kickLocalPlayer() {},
  setActiveLocalPlayer() {},
  getActiveSocket() { return this; },
};
