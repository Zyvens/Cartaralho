'use strict';
const{GAME_STATES,MIN_PLAYERS}=require('./constants');
const{validateCards}=require('./validators');
const canonicalSubmission=require('./canonicalSubmission');
const playerStats=require('./playerStats');
const activeEntries=room=>Array.from(room.players.entries()).filter(([,p])=>p.active!==false);
async function assertOwned(userId,type,texts){for(const raw of texts||[]){const text=String(raw||'').trim();if(!text)continue;const x=await canonicalSubmission.inferSubmittedCard({type,text,userId});if(!x.canonicalCard||!x.alreadyOwned)throw new Error('Esta Carta de Jogador ainda não pertence à sua coleção. Crie ou adquira a carta antes de levá-la para a mesa.');}}
async function submitCards(room,playerId,blackCards,whiteCards){
 const p=room.players.get(String(playerId));
 if(!p||p.active===false)throw new Error('Você não está nesta sala.');
 if(p.cardsReady)throw new Error('Você já concluiu suas Cartas de Jogador.');
 if(![GAME_STATES.CADASTRO_CARTAS,GAME_STATES.AGUARDANDO_JOGADORES].includes(room.state))throw new Error('Não é possível enviar cartas neste momento.');
 const v=validateCards(blackCards,whiteCards);if(!v.valid)throw new Error(v.error);
 if(p.userId){await assertOwned(p.userId,'blackCards',blackCards);await assertOwned(p.userId,'whiteCards',whiteCards);}
 p.blackCards=(blackCards||[]).map(x=>x.trim());p.whiteCards=(whiteCards||[]).map(x=>x.trim());p.cardsReady=true;
 if(p.userId){await playerStats.registerSubmittedCards(room,p,'blackCards',p.blackCards,[]);await playerStats.registerSubmittedCards(room,p,'whiteCards',p.whiteCards,[]);}
 const active=activeEntries(room),allReady=active.every(([,x])=>x.cardsReady);if(allReady&&active.length>=MIN_PLAYERS)room.state=GAME_STATES.PRONTA_PARA_INICIAR;
 return{room,allReady};
}
module.exports={submitCards};
