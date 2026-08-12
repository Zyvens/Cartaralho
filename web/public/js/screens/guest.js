/* ============================================================
   Guest Screen (Acesso Externo Restrito)
   ============================================================ */
const GuestScreen = {
  render(container) {
    const code = App.state.guestCode;
    
    container.innerHTML = `
      <div class="home-screen" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding: 20px; box-sizing: border-box; position: relative; overflow-y: auto;">
        <div class="home-bg-cards" id="dynamic-bg-container">
        </div>

        <div class="home-content" style="z-index: 10; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center;">
          <div class="home-logo" style="margin-bottom: 2rem;">
            <img src="assets/images/logo.png" alt="Cartaralho" class="logo-image" style="width: 100%; max-width: 500px; display: block; margin: 0 auto;">
          </div>
          
          ${code ? `<p class="home-subtitle" style="margin-bottom: 5px;">Mesa: <strong>${code}</strong></p>` : ''}
          <p class="home-subtitle" style="font-size: 0.9rem; color: var(--accent-primary);">Acesso via Convite</p>

          <div class="home-form" style="display: block; margin-top: 20px; width: 100%;">
            ${!code ? `
            <div class="input-group">
              <input type="text" id="guest-room-code" class="input input-code" placeholder=" " maxlength="6" autocomplete="off" spellcheck="false" style="text-align: center;">
              <label for="guest-room-code" class="input-label">Código da Mesa</label>
            </div>
            ` : ''}
            
            <div class="input-group">
              <input type="text" id="guest-nickname" class="input" placeholder=" " maxlength="20" autocomplete="off" spellcheck="false" style="text-align: center;">
              <label for="guest-nickname" class="input-label">Seu Nome/Apelido</label>
            </div>

            <button id="guest-join-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 15px;">
              <span class="btn-icon-emoji">🃏</span> Entrar na Mesa
            </button>
          </div>
        </div>

        <footer class="home-footer" style="position: relative; margin-top: auto; padding-top: 2rem;">
          <p>Jogo hospedado localmente pelo seu amigo.</p>
        </footer>
      </div>
    `;
    this.init();
  },

  init() {
    const nicknameInput = document.getElementById('guest-nickname');
    const joinBtn = document.getElementById('guest-join-btn');
    
    const savedNick = localStorage.getItem('cartalho_nickname');
    if (savedNick) {
      nicknameInput.value = savedNick;
    }

    joinBtn.addEventListener('click', () => {
      const nickname = nicknameInput.value.trim();
      if (!nickname || nickname.length < 2) {
        Toast.warning('O nickname deve ter pelo menos 2 caracteres.');
        nicknameInput.focus();
        return;
      }
      
      let finalCode = App.state.guestCode;
      if (!finalCode) {
        const codeInput = document.getElementById('guest-room-code');
        if (codeInput) {
          finalCode = codeInput.value.trim().toUpperCase();
        }
        if (!finalCode || finalCode.length !== 6) {
          Toast.warning('Digite um código de mesa válido (6 caracteres).');
          if (codeInput) codeInput.focus();
          return;
        }
      }
      
      App.state.nickname = nickname;
      App.state.guestCode = finalCode; // Update for future reconnects if needed
      App.state.isLocalMode = false;
      localStorage.setItem('cartalho_nickname', nickname);
      
      joinBtn.disabled = true;
      joinBtn.innerHTML = 'Entrando...';
      
      SocketClient.joinRoom(nickname, finalCode);
      
      // Se falhar a conexão após uns segundos, reabilita o botão
      setTimeout(() => {
        if (App.state.currentScreen === 'guest') {
          joinBtn.disabled = false;
          joinBtn.innerHTML = '<span class="btn-icon-emoji">🃏</span> Entrar na Mesa';
        }
      }, 5000);
    });
  }
};

window.GuestScreen = GuestScreen;
