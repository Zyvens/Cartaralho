'use strict';
const{GAME_STATES}=require('./constants');
const PRE_START=new Set([GAME_STATES.AGUARDANDO_JOGADORES,GAME_STATES.CADASTRO_CARTAS,GAME_STATES.PRONTA_PARA_INICIAR]);
const clampInt=(min,max,value,fallback)=>Math.max(min,Math.min(max,Math.round(Number.isFinite(Number(value))?Number(value):fallback)));
function initial(config={}){return{maxPlayers:clampInt(3,10,config.maxPlayers,6),pointsToWin:clampInt(3,20,config.pointsToWin,10),handSize:clampInt(5,15,config.handSize,5),useStandardDeck:config.useStandardDeck!==false,cardCreationEnabled:config.cardCreationEnabled!==false,playerCardsEnabled:config.playerCardsEnabled!==false,afkEnabled:config.afkEnabled!==false,buffsEnabled:config.buffsEnabled===true,narratorEnabled:config.narratorEnabled===true};}
function apply(room,playerId,partial={}){
 const key=String(playerId);
 if(!room||room.creatorId!==key||!room.players?.has(key))throw new Error('Apenas o criador da sala pode alterar as regras.');
 if(!PRE_START.has(room.state)||room.rewardConfigSnapshot)throw new Error('As regras da mesa não podem ser alteradas depois que a partida começou.');
 const active=Array.from(room.players.values()).filter(p=>p.active!==false).length;
 if(Object.prototype.hasOwnProperty.call(partial,'maxPlayers')){const next=clampInt(3,10,partial.maxPlayers,room.maxPlayers);if(next<active)throw new Error('O máximo de jogadores não pode ser menor que os participantes atuais.');room.maxPlayers=next;}
 if(Object.prototype.hasOwnProperty.call(partial,'pointsToWin'))room.pointsToWin=clampInt(3,20,partial.pointsToWin,room.pointsToWin);
 if(Object.prototype.hasOwnProperty.call(partial,'handSize'))room.handSize=clampInt(5,15,partial.handSize,room.handSize);
 if(Object.prototype.hasOwnProperty.call(partial,'useStandardDeck'))room.useStandardDeck=partial.useStandardDeck!==false;
 if(Object.prototype.hasOwnProperty.call(partial,'cardCreationEnabled'))room.cardCreationEnabled=partial.cardCreationEnabled!==false;
 if(Object.prototype.hasOwnProperty.call(partial,'playerCardsEnabled'))room.playerCardsEnabled=partial.playerCardsEnabled!==false;
 if(Object.prototype.hasOwnProperty.call(partial,'afkEnabled'))room.afkEnabled=partial.afkEnabled!==false;
 if(Object.prototype.hasOwnProperty.call(partial,'buffsEnabled'))room.buffsEnabled=partial.buffsEnabled===true;
 if(Object.prototype.hasOwnProperty.call(partial,'narratorEnabled'))room.narratorEnabled=partial.narratorEnabled===true;
 return room;
}
function publicConfig(room){return{maxPlayers:room.maxPlayers,pointsToWin:room.pointsToWin,handSize:room.handSize,useStandardDeck:room.useStandardDeck!==false,cardCreationEnabled:room.cardCreationEnabled!==false,playerCardsEnabled:room.playerCardsEnabled!==false,afkEnabled:room.afkEnabled!==false,buffsEnabled:room.buffsEnabled===true,narratorEnabled:room.narratorEnabled===true,rewardConfigSnapshot:room.rewardConfigSnapshot||null};}
module.exports={PRE_START,initial,apply,publicConfig};
