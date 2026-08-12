const fs = require('fs');
const path = require('path');

const DECK_FILE = path.join(__dirname, 'data', 'deck.json');

class DeckManager {
  constructor() {
    this.deck = { blackCards: [], whiteCards: [] };
    this.loadDeck();
  }

  loadDeck() {
    try {
      if (fs.existsSync(DECK_FILE)) {
        const data = fs.readFileSync(DECK_FILE, 'utf8');
        this.deck = JSON.parse(data);
        
        // Assegurar compatibilidade com cartas antigas
        for (const type of ['blackCards', 'whiteCards']) {
          if (this.deck[type]) {
            this.deck[type] = this.deck[type].map(c => ({
              ...c,
              isNative: c.isNative !== undefined ? c.isNative : true,
              isHidden: c.isHidden || false
            }));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar o deck.json:', err);
    }
  }

  saveDeck() {
    try {
      fs.writeFileSync(DECK_FILE, JSON.stringify(this.deck, null, 2), 'utf8');
    } catch (err) {
      console.error('Erro ao salvar o deck.json:', err);
    }
  }

  getDeck() {
    return this.deck;
  }

  importDeck(newDeck) {
    if (!newDeck || !Array.isArray(newDeck.blackCards) || !Array.isArray(newDeck.whiteCards)) {
      throw new Error('Deck inválido');
    }
    
    // Merge de decks (ou sobrescreve, aqui vamos fazer merge)
    const addOrUpdate = (type, cards) => {
      for (const card of cards) {
        const lower = card.text.trim().toLowerCase();
        const existingIndex = this.deck[type].findIndex(c => c.text.toLowerCase() === lower);
        
        if (existingIndex >= 0) {
          // Atualiza count (soma)
          this.deck[type][existingIndex].count = (this.deck[type][existingIndex].count || 1) + (card.count || 1);
        } else {
          // Adiciona nova
          this.deck[type].push({
            text: card.text.trim(),
            count: card.count || 1,
            isNative: card.isNative || false,
            isHidden: card.isHidden || false
          });
        }
      }
    };

    addOrUpdate('blackCards', newDeck.blackCards);
    addOrUpdate('whiteCards', newDeck.whiteCards);
    this.saveDeck();
  }

  /**
   * Adiciona uma carta ou incrementa seu contador se já existir.
   * @param {'blackCards'|'whiteCards'} type 
   * @param {string} text 
   * @param {boolean} isNative
   * @returns {{ isNew: boolean, card: object }}
   */
  addCard(type, text, isNative = false) {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    
    // Procura carta existente
    const existingIndex = this.deck[type].findIndex(c => c.text.toLowerCase() === lower);
    
    if (existingIndex >= 0) {
      this.deck[type][existingIndex].count = (this.deck[type][existingIndex].count || 1) + 1;
      this.saveDeck();
      return { isNew: false, card: this.deck[type][existingIndex] };
    } else {
      const newCard = { text: trimmed, count: 1, isNative, isHidden: false };
      this.deck[type].push(newCard);
      this.saveDeck();
      return { isNew: true, card: newCard };
    }
  }

  /**
   * Alterna a visibilidade (isHidden) de uma carta.
   * @param {'blackCards'|'whiteCards'} type
   * @param {number} index
   */
  toggleHideCard(type, index) {
    if (index >= 0 && index < this.deck[type].length) {
      this.deck[type][index].isHidden = !this.deck[type][index].isHidden;
      this.saveDeck();
      return true;
    }
    return false;
  }

  /**
   * Deleta uma carta pelo índice.
   * @param {'blackCards'|'whiteCards'} type 
   * @param {number} index 
   */
  deleteCard(type, index) {
    if (index >= 0 && index < this.deck[type].length) {
      this.deck[type].splice(index, 1);
      this.saveDeck();
      return true;
    }
    return false;
  }

  /**
   * Verifica se a carta existe sem modificá-la.
   * @param {'blackCards'|'whiteCards'} type 
   * @param {string} text 
   * @returns {boolean}
   */
  cardExists(type, text) {
    const lower = text.trim().toLowerCase();
    return this.deck[type].some(c => c.text.toLowerCase() === lower);
  }

  /**
   * Retorna 'amount' cartas aleatórias, ponderadas pelo campo 'count'.
   * Ignora cartas ocultas.
   * @param {'blackCards'|'whiteCards'} type 
   * @param {number} amount 
   * @returns {string[]} Lista de textos das cartas
   */
  drawWeightedCards(type, amount) {
    const pool = this.deck[type].filter(c => !c.isHidden);
    const drawn = [];

    // Se o deck for menor que o valor solicitado, retorna tudo
    if (pool.length <= amount) {
      return pool.map(c => c.text);
    }

    for (let i = 0; i < amount; i++) {
      let totalWeight = pool.reduce((sum, c) => sum + (c.count || 1), 0);
      let randomVal = Math.random() * totalWeight;
      
      let selectedIndex = -1;
      for (let j = 0; j < pool.length; j++) {
        randomVal -= (pool[j].count || 1);
        if (randomVal <= 0) {
          selectedIndex = j;
          break;
        }
      }

      // Se falhar no arredondamento, pega a última
      if (selectedIndex === -1) selectedIndex = pool.length - 1;

      drawn.push(pool[selectedIndex].text);
      // Remove da pool para não sortear duplicado na mesma leva
      pool.splice(selectedIndex, 1);
    }

    return drawn;
  }
}

module.exports = new DeckManager();
