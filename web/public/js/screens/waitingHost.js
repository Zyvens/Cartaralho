/* ============================================================
   Waiting Host Screen (Guest aguardando host)
   ============================================================ */
const WaitingHostScreen = {
  render(container) {
    container.innerHTML = `
      <div class="home-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding: 20px; box-sizing: border-box; position: relative; overflow-y: auto;">
        <div class="home-bg-cards" id="dynamic-bg-container">
        </div>

        <div class="home-content" style="z-index: 10; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center;">
          <div class="home-logo" style="margin-bottom: 2rem;">
            <img src="assets/images/logo.png" alt="Cartaralho" class="logo-image" style="width: 100%; max-width: 500px; display: block; margin: 0 auto;">
          </div>
          
          <div class="spinner" style="margin-bottom: 1rem; width: 40px; height: 40px;"></div>
          <p class="home-subtitle" style="font-size: 1.1rem; color: var(--accent-primary); text-align: center;">
            Aguardando Host definir as regras do jogo...
          </p>
        </div>

        <footer class="home-footer" style="position: relative; margin-top: auto; padding-top: 2rem;">
          <p>Jogo hospedado localmente pelo seu amigo.</p>
        </footer>
      </div>
    `;
    this.init();
  },

  init() {
    this.handleStatus = this.handleStatus.bind(this);
    SocketClient.on('server_status_update', this.handleStatus);

    // Initial check
    fetch('/api/server-status')
      .then(res => res.json())
      .then(data => this.handleStatus(data))
      .catch(err => console.error('Erro ao checar status do servidor', err));
  },

  handleStatus(data) {
    if (App.state.currentScreen !== 'waitingHost') return;

    if (data.mode === 'online' || data.mode === 'local-multi' || data.mode === 'local-single') {
      App.state.guestCode = data.activeRoom || '';
      App.showScreen('guest');
    } else if (data.mode === 'local-server') {
      App.state.isGuest = false;
      App.showScreen('home');
    }
  },

  cleanup() {
    SocketClient.off('server_status_update', this.handleStatus);
  }
};
