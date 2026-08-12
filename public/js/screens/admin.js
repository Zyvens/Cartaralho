const AdminScreen = {
  deck: { blackCards: [], whiteCards: [] },
  filter: 'all',

  render(container) {
    container.innerHTML = `
      <div class="admin-screen">
        <header class="admin-header">
          <h2>Painel de Administração</h2>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="AdminScreen.importBackup()" title="Importar Backup">📥 Importar</button>
            <button class="btn btn-secondary btn-sm" onclick="AdminScreen.exportBackup()" title="Exportar Backup">📤 Exportar</button>
            <button id="admin-back-btn" class="btn btn-secondary btn-sm">Voltar</button>
          </div>
        </header>

        <div class="admin-filters" style="display:flex; gap:10px; justify-content:center; margin-bottom: 20px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" id="filter-all" onclick="AdminScreen.setFilter('all')">Todas</button>
          <button class="btn btn-sm btn-secondary" id="filter-native" onclick="AdminScreen.setFilter('native')">Nativas</button>
          <button class="btn btn-sm btn-secondary" id="filter-custom" onclick="AdminScreen.setFilter('custom')">De Jogadores</button>
        </div>

        <div class="admin-content">
          <div class="admin-section">
            <div class="admin-section-header">
              <h3>Cartas Pretas <div id="black-counter" style="font-size:0.85rem; color:var(--text-muted); font-weight:normal; margin-top:4px;"></div></h3>
              <button class="btn btn-primary btn-sm" onclick="AdminScreen.addCard('blackCards')">+ Nova</button>
            </div>
            <div class="admin-list" id="admin-black-list">Carregando...</div>
          </div>

          <div class="admin-section">
            <div class="admin-section-header">
              <h3>Cartas Brancas <div id="white-counter" style="font-size:0.85rem; color:var(--text-muted); font-weight:normal; margin-top:4px;"></div></h3>
              <button class="btn btn-primary btn-sm" onclick="AdminScreen.addCard('whiteCards')">+ Nova</button>
            </div>
            <div class="admin-list" id="admin-white-list">Carregando...</div>
          </div>
        </div>
      </div>
    `;
    this.loadDeck();
    
    document.getElementById('admin-back-btn').addEventListener('click', () => {
      App.showScreen('home');
    });
  },

  async loadDeck() {
    try {
      const response = await fetch('/api/admin/deck', {
        headers: { 'Authorization': 'admin:admin123' }
      });
      if (!response.ok) throw new Error('Não autorizado');
      
      const deck = await response.json();
      this.deck = deck;
      this.updateUI();
    } catch (err) {
      Toast.error('Erro ao carregar o baralho. Senha incorreta?');
      App.showScreen('home');
    }
  },

  setFilter(filter) {
    this.filter = filter;
    document.getElementById('filter-all').className = filter === 'all' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('filter-native').className = filter === 'native' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    document.getElementById('filter-custom').className = filter === 'custom' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    this.updateUI();
  },

  updateUI() {
    this.renderList('admin-black-list', this.deck.blackCards, 'blackCards');
    this.renderList('admin-white-list', this.deck.whiteCards, 'whiteCards');
    
    const bc = this.deck.blackCards || [];
    const wc = this.deck.whiteCards || [];
    
    document.getElementById('black-counter').innerText = 
      `(Total: ${bc.length} | Nativas: ${bc.filter(c=>c.isNative).length} | Jogadores: ${bc.filter(c=>!c.isNative).length})`;
    document.getElementById('white-counter').innerText = 
      `(Total: ${wc.length} | Nativas: ${wc.filter(c=>c.isNative).length} | Jogadores: ${wc.filter(c=>!c.isNative).length})`;
  },

  checkMinimum(type) {
    const minCards = type === 'blackCards' ? 5 : 20;
    const visibleCards = (this.deck[type] || []).filter(c => !c.isHidden).length;
    if (visibleCards <= minCards) {
      Toast.error(`Mínimo alcançado! São necessárias pelo menos ${minCards} cartas visíveis para jogar.`);
      return false;
    }
    return true;
  },

  renderList(elementId, cards, type) {
    const list = document.getElementById(elementId);
    if (!cards || cards.length === 0) {
      list.innerHTML = '<p class="admin-empty">Nenhuma carta.</p>';
      return;
    }

    let filteredCards = cards.map((c, i) => ({ ...c, originalIndex: i }));
    if (this.filter === 'native') filteredCards = filteredCards.filter(c => c.isNative);
    if (this.filter === 'custom') filteredCards = filteredCards.filter(c => !c.isNative);

    if (filteredCards.length === 0) {
      list.innerHTML = '<p class="admin-empty">Nenhuma carta neste filtro.</p>';
      return;
    }

    filteredCards.sort((a, b) => (b.count || 1) - (a.count || 1));

    list.innerHTML = filteredCards.map(c => `
      <div class="admin-card-item" style="${c.isHidden ? 'opacity: 0.5; border: 1px dashed rgba(255,255,255,0.2);' : ''}">
        <div class="admin-card-text">
          ${c.text} 
          ${c.isHidden ? '<span class="badge" style="background:#555; font-size:0.7rem; margin-left:5px;">Oculta</span>' : ''}
          ${c.isNative ? '' : '<span class="badge" style="background:var(--accent-secondary); font-size:0.7rem; margin-left:5px; color:#111;">Criada</span>'}
        </div>
        <div class="admin-card-actions">
          <span class="admin-card-count" title="Vezes repetida">x${c.count || 1}</span>
          <button class="btn btn-secondary btn-sm" title="Ocultar/Exibir" onclick="AdminScreen.toggleHideCard('${type}', ${c.originalIndex})">
            ${c.isHidden ? '👁️' : '🙈'}
          </button>
          <button class="btn btn-danger btn-sm" title="Excluir permanentemente" onclick="AdminScreen.deleteCard('${type}', ${c.originalIndex})">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  async addCard(type) {
    const isBlack = type === 'blackCards';
    const modalHTML = `
      <div id="admin-card-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div style="background:#1a1a24; padding:24px; border-radius:16px; width:400px; max-width:90%; box-shadow:0 10px 40px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.1);">
          <h3 style="margin-top:0; color:var(--text-light); font-size:1.4rem; margin-bottom:1rem;">Criar Carta ${isBlack ? 'Preta' : 'Branca'}</h3>
          
          <div style="margin-bottom:20px;">
            <input type="text" id="admin-card-input" class="input" placeholder="Digite o texto da carta..." maxlength="150" style="width:100%; box-sizing:border-box;">
            <small style="color:var(--text-muted); display:block; margin-top:8px;">Para cartas pretas, use "_" (underline) para as lacunas.</small>
          </div>

          <div style="display:flex; justify-content:center; margin-bottom:24px; min-height: 220px;" id="admin-card-preview-container">
            <!-- Preview renders here -->
          </div>

          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button id="admin-modal-cancel" class="btn btn-secondary btn-sm" style="padding:10px 20px;">Cancelar</button>
            <button id="admin-modal-confirm" class="btn btn-primary btn-sm" style="padding:10px 20px;">Criar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('admin-card-modal');
    const input = document.getElementById('admin-card-input');
    const previewContainer = document.getElementById('admin-card-preview-container');

    const updatePreview = () => {
      previewContainer.innerHTML = '';
      const text = input.value || 'Texto da carta...';
      const cardEl = isBlack 
        ? CardComponent.createBlackCard(text) 
        : CardComponent.createWhiteCard(text);
      cardEl.style.transform = 'scale(1.2)';
      cardEl.style.margin = '10px 0';
      previewContainer.appendChild(cardEl);
    };

    updatePreview();

    input.addEventListener('input', updatePreview);
    
    // Auto focus
    setTimeout(() => input.focus(), 100);

    return new Promise((resolve) => {
      const close = () => {
        modal.remove();
        resolve();
      };

      document.getElementById('admin-modal-cancel').addEventListener('click', close);
      document.getElementById('admin-modal-confirm').addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) {
          Toast.warning('Digite algo!');
          return;
        }

        try {
          const response = await fetch('/api/admin/deck', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'admin:admin123'
            },
            body: JSON.stringify({ type, text })
          });
          if (!response.ok) throw new Error('Falha ao adicionar');
          this.loadDeck();
          Toast.success('Carta adicionada!');
          close();
        } catch (err) {
          Toast.error('Erro ao adicionar carta.');
        }
      });
    });
  },

  async toggleHideCard(type, index) {
    const isCurrentlyHidden = this.deck[type][index].isHidden;
    // Se estiver tentando ocultar (não estava oculta), checa mínimo
    if (!isCurrentlyHidden && !this.checkMinimum(type)) return;

    try {
      const response = await fetch(`/api/admin/deck/${type}/${index}/hide`, {
        method: 'PATCH',
        headers: { 'Authorization': 'admin:admin123' }
      });
      if (!response.ok) throw new Error('Falha ao ocultar');
      this.loadDeck();
    } catch (err) {
      Toast.error('Erro ao ocultar carta.');
    }
  },

  async deleteCard(type, index) {
    const isCurrentlyHidden = this.deck[type][index].isHidden;
    // Se a carta estiver visível, excluir ela afeta o mínimo de cartas visíveis
    if (!isCurrentlyHidden && !this.checkMinimum(type)) return;

    const confirmed = await Modal.confirm('Atenção', 'Tem certeza que deseja excluir permanentemente esta carta?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/deck/${type}/${index}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin:admin123' }
      });
      if (!response.ok) throw new Error('Falha ao excluir');
      this.loadDeck();
      Toast.success('Carta excluída!');
    } catch (err) {
      Toast.error('Erro ao excluir carta.');
    }
  },
  
  exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.deck, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cartalho_backup.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    Toast.success('Backup exportado com sucesso.');
  },

  importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async event => {
        try {
          const content = JSON.parse(event.target.result);
          if (!content.blackCards || !content.whiteCards) {
            throw new Error('Formato JSON inválido. Faltam blackCards ou whiteCards.');
          }

          const response = await fetch('/api/admin/deck/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'admin:admin123'
            },
            body: JSON.stringify(content)
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Erro ao importar backup.');
          }

          Toast.success('Backup importado com sucesso!');
          this.loadDeck(); // recarrega do servidor
        } catch (err) {
          Toast.error(err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
};
window.AdminScreen = AdminScreen;
