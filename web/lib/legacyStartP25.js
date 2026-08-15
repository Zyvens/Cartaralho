'use strict';
const{GAME_STATES,MIN_PLAYERS}=require('./constants');
const{buildDecks,dealHands}=require('./gameLogic');
const deckStore=require('./deckStore');
const advancedRound=require('./advancedRoundEngine');
const activeEntries=room=>Array.from(room.players.entries()).filter(([,p])=>p.active!==false);
async function startGame(room,playerId){
 const key=String(playerId);if(room.creatorId!==key)throw new Error('Apenas o criador da sala pode iniciar o jogo.');
 if(room.state!==GAME_STATES.PRONTA_PARA_INICIAR)throw new Error('O jogo ainda não está pronto. Todos devem concluir a etapa de Cartas de Jogador.');
 const active=activeEntries(room);if(active.length<MIN_PLAYERS)throw new Error(`São necessários pelo menos ${MIN_PLAYERS} jogadores.`);for(const[,p]of active)if(!p.cardsReady)throw new Error('Nem todos os jogadores estão prontos.');
 const sharedBlack=[],sharedWhite=[];for(const[,p]of active){sharedBlack.push(...(p.blackCards||[]));sharedWhite.push(...(p.whiteCards||[]));}
 const host=room.players.get(room.creatorId),hostDeck=room.useStandardDeck?await deckStore.getUserDeck(host?.userId):{blackCards:[],whiteCards:[]};
 const{newBlackCards,newWhiteCards}=buildDecks(room,hostDeck);if(room.blackDeck.length<1||room.whiteDeck.length<active.length*room.handSize)throw new Error('O deck do Host + Cartas de Jogadores não possui cartas suficientes para iniciar.');
 dealHands(room);room.state=GAME_STATES.EM_ANDAMENTO;const firstIndex=room.playerOrder.findIndex(id=>room.players.get(id)?.active!==false),idx=Math.max(0,firstIndex),black=room.blackDeck.pop();if(advancedRound.enabled())advancedRound.startFirstRound(room,black,idx);else room.currentRound={number:1,blackCard:black,hostIndex:idx,hostId:room.playerOrder[idx],submissions:new Map(),winnerId:null,winnerCard:null};
 return{room,seenBlackCard:room.currentRound.blackCard,newBlackCards,newWhiteCards,sharedBlack,sharedWhite};
}
module.exports={startGame};
