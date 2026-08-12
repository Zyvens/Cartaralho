const { sql } = require('./db');

function rowToCard(row) {
  return {
    id: row.id,
    text: row.text,
    count: row.count,
    isNative: row.is_native,
    isHidden: row.is_hidden,
  };
}

/** Returns { blackCards: [...], whiteCards: [...] }, shaped like the desktop deck.json. */
async function getDeck() {
  const rows = await sql`SELECT * FROM deck_cards ORDER BY id ASC`;
  const deck = { blackCards: [], whiteCards: [] };
  for (const row of rows) {
    deck[row.type].push(rowToCard(row));
  }
  return deck;
}

/** Adds a card, or bumps its count if the text already exists (case-insensitive). */
async function addCard(type, text, isNative = false) {
  const trimmed = text.trim();
  await sql`
    INSERT INTO deck_cards (type, text, count, is_native, is_hidden)
    VALUES (${type}, ${trimmed}, 1, ${isNative}, false)
    ON CONFLICT (type, text) DO UPDATE SET count = deck_cards.count + 1
  `;
}

async function importDeck(newDeck) {
  if (!newDeck || !Array.isArray(newDeck.blackCards) || !Array.isArray(newDeck.whiteCards)) {
    throw new Error('Deck inválido');
  }

  for (const type of ['blackCards', 'whiteCards']) {
    for (const card of newDeck[type]) {
      const text = card.text.trim();
      const count = card.count || 1;
      await sql`
        INSERT INTO deck_cards (type, text, count, is_native, is_hidden)
        VALUES (${type}, ${text}, ${count}, ${card.isNative || false}, ${card.isHidden || false})
        ON CONFLICT (type, text) DO UPDATE SET count = deck_cards.count + ${count}
      `;
    }
  }
}

async function toggleHideCard(id) {
  const rows = await sql`UPDATE deck_cards SET is_hidden = NOT is_hidden WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

async function deleteCard(id) {
  const rows = await sql`DELETE FROM deck_cards WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

module.exports = { getDeck, addCard, importDeck, toggleHideCard, deleteCard };
