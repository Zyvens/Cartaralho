'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const createApi=read('api/cards/create.js'),submit=read('lib/cardSelection.js'),matchSubmit=read('lib/matchSubmitP6.js'),drafts=read('lib/pendingCardDrafts.js'),start=read('api/game/start.js'),roomStore=read('lib/roomStore.js'),cancel=read('api/rooms/end.js'),cardCreation=read('public/js/screens/cardCreation.js');

for(const[name,src]of[['api/cards/create.js',createApi],['lib/cardSelection.js',submit],['lib/matchSubmitP6.js',matchSubmit],['lib/pendingCardDrafts.js',drafts],['api/game/start.js',start],['lib/roomStore.js',roomStore],['public/js/screens/cardCreation.js',cardCreation]])test(`${name} compila no P25`,()=>assert.doesNotThrow(()=>new Function(src)));

test('lobby prepara carta sem criar ownership, genealogia ou consumir Carta Limpa',()=>{
 assert.match(createApi,/pendingCardDrafts\.preview/);
 assert.doesNotMatch(createApi,/cleanCards\.create\s*\(/);
 assert.match(createApi,/draft:true/);
 assert.match(createApi,/só será registrada e consumirá 1 Carta Limpa quando a partida começar/);
 assert.doesNotMatch(submit,/registerSubmittedCards/);
 assert.doesNotMatch(matchSubmit,/registerSubmittedCards/);
});

test('seleção pré-partida aceita rascunho somente quando há Carta Limpa suficiente',()=>{
 assert.match(matchSubmit,/pendingCardDrafts\.classifyForUser/);
 assert.match(drafts,/drafts\.length>balance/);
 assert.match(drafts,/cleanCards\.getInventory\(userId\)/);
 assert.match(drafts,/room\?\.cardCreationEnabled===false/);
});

test('start é o ponto único que efetiva inventário, consumo e genealogia',()=>{
 assert.match(start,/pendingCardDrafts\.classifyRoom\(room\)/);
 assert.match(start,/deferPersistence:true/);
 assert.match(start,/pendingCardDrafts\.commitQueries\(room\.code,draftState\.drafts\)/);
 assert.match(start,/roomStore\.saveRoom\(room,\{transactionQueries\}\)/);
 assert.match(drafts,/create_paid_player_card/);
 assert.match(drafts,/result->>'status'='created'/);
});

test('commit das cartas e mudança de estado da sala compartilham a mesma transação serializável',()=>{
 assert.match(roomStore,/async function saveRoom\(room,\{transactionQueries=\[\]\}=\{\}\)/);
 assert.match(roomStore,/\.\.\.playerUpserts\(room\),\.\.\.extras/);
 assert.match(roomStore,/sql\.transaction\(q,\{isolationMode:'Serializable'\}\)/);
});

test('cancelar sala antes do start apenas apaga o rascunho de sala e não executa refund compensatório',()=>{
 assert.match(cancel,/room_cancelled/);
 assert.match(cancel,/roomStore\.deleteRoom\(room\.code\)/);
 assert.doesNotMatch(cancel,/clean_card_ledger|clean_card_wallets|canonical_card_ownerships|canonical_card_creation_events|refund/i);
});

test('editor possui somente um Salvar e voltar ao Lobby quando está editável',()=>{
 assert.doesNotMatch(cardCreation,/id=\\?"back-btn\\?"[^\n]*Salvar e voltar ao Lobby/);
 assert.match(cardCreation,/id=\\?"save-cards-btn\\?"[^\n]*Salvar e voltar ao Lobby/);
 assert.match(cardCreation,/rascunhos até o início da partida/);
 assert.match(cardCreation,/Se a sala for cancelada, o rascunho desaparece sem custo/);
});

test('remover um rascunho libera a reserva local sem alterar o backend',()=>{
 assert.match(cardCreation,/pendingCount\(type\)/);
 assert.match(cardCreation,/availableClean\(type\)/);
 assert.match(cardCreation,/list\.splice\(i,1\);this\.syncCreatedHere\(\);this\.renderTabContent\(\)/);
 assert.doesNotMatch(cardCreation,/this\.library=\(await AuthClient\.cards\(\)\)/);
});
