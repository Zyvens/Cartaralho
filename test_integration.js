/**
 * Cartalho — Integration Test (Fixed)
 * Simulates 3 players through the full game flow
 */
const { io } = require('socket.io-client');

const URL = 'http://localhost:3000';
let roomCode;
let testsPassed = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    testsPassed++;
    console.log(`  ✅ ${message}`);
  } else {
    console.log(`  ❌ FALHOU: ${message}`);
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForEvent(socket, event, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timeout waiting for ${event}`));
    }, timeout);
    const handler = (data) => {
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(data);
    };
    socket.on(event, handler);
  });
}

function connectPlayer(name) {
  return new Promise((resolve) => {
    const socket = io(URL, { forceNew: true });
    socket.on('connect', () => {
      console.log(`  [${name}] Conectado: ${socket.id}`);
      resolve(socket);
    });
  });
}

async function run() {
  console.log('\n🃏 Cartalho Integration Test\n');

  // 1. Connect 3 players
  console.log('--- Conectando jogadores ---');
  const p1 = await connectPlayer('Alice');
  const p2 = await connectPlayer('Bob');
  const p3 = await connectPlayer('Carol');
  assert(p1.connected, 'Player1 conectado');
  assert(p2.connected, 'Player2 conectado');
  assert(p3.connected, 'Player3 conectado');

  // 2. Player1 creates room
  console.log('\n--- Criando sala ---');
  const createPromise = waitForEvent(p1, 'room_created');
  p1.emit('create_room', {
    nickname: 'Alice',
    config: { maxPlayers: 6, blackCardsPerPlayer: 3, whiteCardsPerPlayer: 10 }
  });
  const createData = await createPromise;
  roomCode = createData.code;
  assert(roomCode && roomCode.length === 6, `Sala criada: ${roomCode}`);

  // 3. Player2 and Player3 join
  console.log('\n--- Entrando na sala ---');
  const join2Promise = waitForEvent(p2, 'room_joined');
  p2.emit('join_room', { nickname: 'Bob', code: roomCode });
  await join2Promise;
  assert(true, 'Player2 (Bob) entrou');

  const join3Promise = waitForEvent(p3, 'room_joined');
  p3.emit('join_room', { nickname: 'Carol', code: roomCode });
  await join3Promise;
  assert(true, 'Player3 (Carol) entrou');
  await wait(200);

  // 4. All submit cards
  console.log('\n--- Cadastrando cartas ---');
  const blacks = ['O segredo da vida é ______', 'Ninguém esperava ______', 'Na escola aprendi ______'];
  const whites = ['um pato', 'café frio', 'internet discada', 'banana', 'fim do mundo',
                   'piada sem graça', 'unicórnio', 'pizza com abacaxi', 'chefe dormindo', 'gato ninja'];

  for (const [player, name] of [[p1, 'Alice'], [p2, 'Bob'], [p3, 'Carol']]) {
    const subPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timeout for ${name}`)), 5000);
      const handler = (data) => {
        const myStatus = data.playerStatuses.find(s => s.nickname === name);
        if (myStatus && myStatus.cardsReady) {
          clearTimeout(timeout);
          player.off('cards_submitted', handler);
          resolve(myStatus);
        }
      };
      player.on('cards_submitted', handler);
    });
    player.emit('submit_cards', { code: roomCode, blackCards: blacks, whiteCards: whites });
    const myStatus = await subPromise;
    assert(myStatus && myStatus.cardsReady, `${name} cadastrou cartas`);
  }
  await wait(200);

  // 5. Start game — REGISTER LISTENERS BEFORE EMITTING
  console.log('\n--- Iniciando jogo ---');
  
  // Set up listeners for all 3 players BEFORE starting
  const p1RoundPromise = waitForEvent(p1, 'new_round');
  const p2RoundPromise = waitForEvent(p2, 'new_round');
  const p3RoundPromise = waitForEvent(p3, 'new_round');
  const startPromise = waitForEvent(p1, 'game_started');

  p1.emit('start_game', { code: roomCode });
  
  const startData = await startPromise;
  assert(startData.message === 'O jogo começou!', 'Jogo iniciou');

  const [r1, r2, r3] = await Promise.all([p1RoundPromise, p2RoundPromise, p3RoundPromise]);
  assert(r1.roundNumber === 1, 'Rodada 1');
  assert(r1.blackCard, `Carta preta: "${r1.blackCard}"`);
  assert(r1.hand.length === 5, `Player1 tem ${r1.hand.length} cartas`);
  assert(r2.hand.length === 5, `Player2 tem ${r2.hand.length} cartas`);
  assert(r3.hand.length === 5, `Player3 tem ${r3.hand.length} cartas`);

  // Figure out who's host
  const allRounds = [
    { socket: p1, name: 'Alice', data: r1 },
    { socket: p2, name: 'Bob', data: r2 },
    { socket: p3, name: 'Carol', data: r3 },
  ];
  const host = allRounds.find(p => p.data.isHost);
  const players = allRounds.filter(p => !p.data.isHost);
  assert(host, `Host: ${host.name}`);
  assert(players.length === 2, `${players.length} jogadores ativos`);

  // 6. Non-host players play cards
  console.log('\n--- Jogando cartas ---');

  // Set up all_cards_played listener on host BEFORE players play
  const allPlayedPromise = waitForEvent(host.socket, 'all_cards_played');

  for (const p of players) {
    const playPromise = waitForEvent(p.socket, 'card_played');
    p.socket.emit('play_card', { code: roomCode, cardIndex: 0 });
    const playData = await playPromise;
    assert(playData.submissionCount > 0, `${p.name} jogou (${playData.submissionCount}/${playData.totalExpected})`);
    await wait(100);
  }

  // Wait for host to receive all submissions
  const allPlayedData = await allPlayedPromise;
  assert(allPlayedData.submissions.length === 2, `Host recebeu ${allPlayedData.submissions.length} submissões`);
  assert(allPlayedData.submissions[0].card, `Submissão 1: "${allPlayedData.submissions[0].card}"`);

  // 7. Host picks winner
  console.log('\n--- Host escolhendo vencedor ---');
  const resultPromise = waitForEvent(p1, 'round_result');
  host.socket.emit('pick_winner', { code: roomCode, submissionIndex: 0 });
  const resultData = await resultPromise;
  assert(resultData.winnerNickname, `Vencedor: ${resultData.winnerNickname}`);
  assert(resultData.winnerCard, `Carta: "${resultData.winnerCard}"`);
  assert(resultData.scores.length === 3, `Placar com ${resultData.scores.length} jogadores`);
  assert(!resultData.gameOver, 'Jogo continua');

  // 8. Wait for next round auto-advance
  console.log('\n--- Aguardando próxima rodada ---');
  const nextRoundPromise = waitForEvent(p1, 'new_round', 8000);
  const nextRound = await nextRoundPromise;
  assert(nextRound.roundNumber === 2, `Rodada ${nextRound.roundNumber} iniciou automaticamente`);

  // Summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Resultado: ${testsPassed}/${totalTests} testes passaram`);
  if (testsPassed === totalTests) {
    console.log(`  🎉 TODOS OS TESTES PASSARAM!`);
  } else {
    console.log(`  ⚠️  ${totalTests - testsPassed} testes falharam`);
  }
  console.log(`${'═'.repeat(50)}\n`);

  p1.disconnect();
  p2.disconnect();
  p3.disconnect();
  
  process.exit(testsPassed === totalTests ? 0 : 1);
}

run().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
