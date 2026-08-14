'use strict';
const{GAME_STATES,MIN_PLAYERS}=require('./constants');
const contribution=require('./playerContribution');
const PRE_START=new Set([GAME_STATES.AGUARDANDO_JOGADORES,GAME_STATES.CADASTRO_CARTAS,GAME_STATES.PRONTA_PARA_INICIAR]);
const activePlayers=room=>Array.from(room?.players?.entries?.()||[]).filter(([,p])=>p?.active!==false);
function sync(room){
 if(!room||!PRE_START.has(room.state))return{allReady:false,activeCount:0,state:room?.state||null,preStart:false};
 const active=activePlayers(room),activeCount=active.length,allReady=activeCount>=MIN_PLAYERS&&active.every(([,p])=>p.cardsReady===true);
 room.state=activeCount<MIN_PLAYERS?GAME_STATES.AGUARDANDO_JOGADORES:allReady?GAME_STATES.PRONTA_PARA_INICIAR:GAME_STATES.CADASTRO_CARTAS;
 return{allReady,activeCount,state:room.state,preStart:true};
}
function contributionStatus(room,playerId){
 const p=room?.players?.get(String(playerId));
 if(!p||p.active===false)throw new Error('Você não está nesta sala.');
 return contribution.status(room,p);
}
function setReady(room,playerId,ready){
 if(!room||!PRE_START.has(room.state))throw new Error('A prontidão só pode ser alterada antes da partida começar.');
 const p=room.players?.get(String(playerId));
 if(!p||p.active===false)throw new Error('Você não está nesta sala.');
 p.cardsReady=ready===true;
 const contributionState=p.cardsReady?contribution.freeze(room,p):(contribution.clearFreeze(p),contribution.status(room,p));
 return{ready:p.cardsReady,...contributionState,...sync(room)};
}
module.exports={PRE_START,activePlayers,sync,contributionStatus,setReady};
