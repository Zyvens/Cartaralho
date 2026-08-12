/* ============================================================
   Server Dashboard Screen (Para Jogo Local "Vários Celulares")
   ============================================================ */
const ServerDashScreen = {
  render(container) {
    container.innerHTML = `
      <div class="server-dash-screen" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center;">
        
        <h2 class="gradient-text" style="font-size: 2.5rem; margin-bottom: 0.5rem; animation: impact-zoom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;">
          Vários Dispositivos
        </h2>
        
        <p style="color:var(--text-muted); margin-bottom: 2rem;">Servidor Local Ativo e Aguardando Jogadores</p>

        <div style="margin-bottom: 2rem; position:relative;">
          <div class="spinner" style="width:60px; height:60px; border-width: 4px; border-top-color: var(--primary);"></div>
        </div>

        <div class="info-box" style="background:var(--bg-secondary); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom: 2rem; width: 100%; max-width: 400px;">
          <p style="margin-bottom: 10px; font-weight:bold; color:var(--text-secondary);">Acesse nos dispositivos:</p>
          <div style="display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.3); padding:15px; border-radius:8px;">
            <span id="server-ip-display" style="font-family:monospace; font-size:1.1rem; color:var(--primary); letter-spacing: 1px; margin-bottom:12px; text-align:center; word-break:break-word;">Carregando...</span>
            <button id="copy-ip-btn" class="btn btn-secondary" style="padding: 8px 30px; font-size: 0.95rem;">
              Copiar
            </button>
          </div>
        </div>

        <button id="back-to-home-btn" class="btn btn-secondary btn-lg" style="margin-top:1rem;">
          Retornar ao Menu Principal
        </button>

      </div>
    `;

    this.init();
  },

  async init() {
    // Fetch IP
    const display = document.getElementById('server-ip-display');
    let localUrl = '';

    try {
      const res = await fetch('/api/ip');
      const data = await res.json();
      if (data.ip) {
        localUrl = 'http://' + data.ip + ':14273';
        display.textContent = localUrl;
      } else {
        display.textContent = 'Erro ao obter IP';
      }
    } catch (err) {
      display.textContent = 'Erro de rede';
    }

    // Copy Button
    document.getElementById('copy-ip-btn').addEventListener('click', () => {
      if (localUrl) {
        navigator.clipboard.writeText(localUrl).then(() => {
          Toast.success('Endereço copiado para a área de transferência!');
        });
      }
    });

    // Back Button
    document.getElementById('back-to-home-btn').addEventListener('click', async () => {
      try {
        const res = await fetch('/api/admin/active-rooms');
        const data = await res.json();
        const count = data.count || 0;
        
        let msg = 'Deseja encerrar o servidor?';
        if (count > 0) {
          msg = `Deseja realmente encerrar todas as ${count} partidas em andamento?`;
        }
        
        const confirmed = await Modal.confirm('Atenção', msg);
        if (confirmed) {
          SocketClient.socket.emit('cancel_all_rooms');
          App.showScreen('home');
        }
      } catch(e) {
        const confirmed = await Modal.confirm('Atenção', 'Deseja encerrar o servidor?');
        if (confirmed) {
          SocketClient.socket.emit('cancel_all_rooms');
          App.showScreen('home');
        }
      }
    });
  }
};
