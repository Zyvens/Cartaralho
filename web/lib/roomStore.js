const { sql } = require('./db');

function rowsToRoom(roomRow, playerRows) {
  const players = new Map();
  for (const p of playerRows) {
    players.set(p.id, {
      userId: p.user_id || null,
      nickname: p.nickname,
      score: p.score,
      hand: p.hand || [],
      cardsReady: p.cards_ready,
      blackCards: p.black_cards || [],
      whiteCards: p.white_cards || [],
      connected: p.connected,
      lastActive: new Date(p.last_active).getTime(),
    });
  }

  let currentRound = null;
  if (roomRow.current_round) {
    const cr = roomRow.current_round;
    currentRound = {
      number: cr.number,
      blackCard: cr.blackCard,
      hostIndex: cr.hostIndex,
      hostId: cr.hostId,
      submissions: new Map(Object.entries(cr.submissions || {})),
      winnerId: cr.winnerId || null,
      winnerCard: cr.winnerCard || null,
    };
  }

  return {
    code: roomRow.code,
    creatorId: roomRow.creator_id,
    state: roomRow.state,
    maxPlayers: roomRow.max_players,
    blackCardsPerPlayer: roomRow.black_cards_per_player,
    whiteCardsPerPlayer: roomRow.white_cards_per_player,
    pointsToWin: roomRow.points_to_win,
    handSize: roomRow.hand_size,
    useStandardDeck: roomRow.use_standard_deck,
    cardCreationEnabled: roomRow.card_creation_enabled !== false,
    blackDeck: roomRow.black_deck || [],
    whiteDeck: roomRow.white_deck || [],
    playerOrder: roomRow.player_order || [],
    currentRound,
    players,
  };
}

async function loadRoom(code) {
  if (!code) return null;
  const upperCode = String(code).toUpperCase().trim();
  const roomRows = await sql`SELECT * FROM rooms WHERE code = ${upperCode}`;
  if (!roomRows.length) return null;
  const playerRows = await sql`SELECT * FROM players WHERE room_code = ${upperCode}`;
  return rowsToRoom(roomRows[0], playerRows);
}

function serializeCurrentRound(round) {
  if (!round) return null;
  return { number: round.number, blackCard: round.blackCard, hostIndex: round.hostIndex, hostId: round.hostId,
    submissions: Object.fromEntries(round.submissions || new Map()), winnerId: round.winnerId || null, winnerCard: round.winnerCard || null };
}

async function insertRoom(room) {
  const code = room.code.toUpperCase().trim();
  await sql`INSERT INTO rooms (code,creator_id,state,max_players,black_cards_per_player,white_cards_per_player,points_to_win,hand_size,use_standard_deck,card_creation_enabled,black_deck,white_deck,player_order,current_round,updated_at)
            VALUES (${code},${room.creatorId},${room.state},${room.maxPlayers},${room.blackCardsPerPlayer},${room.whiteCardsPerPlayer},${room.pointsToWin},${room.handSize},${room.useStandardDeck},${room.cardCreationEnabled !== false},${JSON.stringify(room.blackDeck)},${JSON.stringify(room.whiteDeck)},${JSON.stringify(room.playerOrder)},${room.currentRound ? JSON.stringify(serializeCurrentRound(room.currentRound)) : null},now())`;
  await syncPlayers(room);
}

async function saveRoom(room) {
  const code = room.code.toUpperCase().trim();
  await sql`UPDATE rooms SET state=${room.state},max_players=${room.maxPlayers},black_cards_per_player=${room.blackCardsPerPlayer},white_cards_per_player=${room.whiteCardsPerPlayer},points_to_win=${room.pointsToWin},hand_size=${room.handSize},use_standard_deck=${room.useStandardDeck},card_creation_enabled=${room.cardCreationEnabled !== false},black_deck=${JSON.stringify(room.blackDeck)},white_deck=${JSON.stringify(room.whiteDeck)},player_order=${JSON.stringify(room.playerOrder)},current_round=${room.currentRound ? JSON.stringify(serializeCurrentRound(room.currentRound)) : null},updated_at=now() WHERE code=${code}`;
  await syncPlayers(room);
}

async function syncPlayers(room) {
  const code = room.code.toUpperCase().trim();
  const ids = Array.from(room.players.keys());
  for (const [id,p] of room.players) {
    await sql`INSERT INTO players (id,room_code,user_id,nickname,score,hand,cards_ready,black_cards,white_cards,connected,last_active)
              VALUES (${id},${code},${p.userId || null},${p.nickname},${p.score},${JSON.stringify(p.hand)},${p.cardsReady},${JSON.stringify(p.blackCards)},${JSON.stringify(p.whiteCards)},${p.connected},to_timestamp(${p.lastActive/1000}))
              ON CONFLICT (id,room_code) DO UPDATE SET user_id=EXCLUDED.user_id,nickname=EXCLUDED.nickname,score=EXCLUDED.score,hand=EXCLUDED.hand,cards_ready=EXCLUDED.cards_ready,black_cards=EXCLUDED.black_cards,white_cards=EXCLUDED.white_cards,connected=EXCLUDED.connected,last_active=EXCLUDED.last_active`;
  }
  if (ids.length) await sql`DELETE FROM players WHERE room_code=${code} AND id != ALL(${ids})`;
  else await sql`DELETE FROM players WHERE room_code=${code}`;
}

async function deleteRoom(code) { await sql`DELETE FROM rooms WHERE code=${String(code).toUpperCase().trim()}`; }
async function roomExists(code) { const rows=await sql`SELECT 1 FROM rooms WHERE code=${String(code).toUpperCase().trim()}`; return rows.length>0; }
module.exports={loadRoom,insertRoom,saveRoom,deleteRoom,roomExists};
