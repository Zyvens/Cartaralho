'use strict';
const{validateCards}=require('./validators');
const matchSubmit=require('./matchSubmitP6');
const readiness=require('./roomReadiness');
function clean(list){return(list||[]).map(x=>String(x||'').trim()).filter(Boolean);}
function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
async function save(room,playerId,blackCards=[],whiteCards=[]){
 if(!readiness.PRE_START.has(room?.state))throw new Error('Não é possível editar Cartas de Jogador depois que a partida começou.');
 const player=room.players?.get(String(playerId));
 if(!player||player.active===false)throw new Error('Você não está nesta sala.');
 if(player.cardsReady===true)throw new Error('Desmarque Pronto no Lobby antes de editar suas Cartas de Jogador.');
 const black=clean(blackCards),white=clean(whiteCards),validation=validateCards(black,white);if(!validation.valid)throw new Error(validation.error);
 if(player.userId){await matchSubmit.assertAllowed(room,player.userId,'blackCards',black);await matchSubmit.assertAllowed(room,player.userId,'whiteCards',white);}
 const changed=!same(player.blackCards||[],black)||!same(player.whiteCards||[],white);
 player.blackCards=black;player.whiteCards=white;
 if(changed)player.cardsReady=false;
 const state=readiness.sync(room);
 return{changed,cardsReady:player.cardsReady,blackCards:black,whiteCards:white,...state};
}
function get(room,playerId){
 const player=room?.players?.get(String(playerId));if(!player||player.active===false)throw new Error('Você não está nesta sala.');
 return{blackCards:[...(player.blackCards||[])],whiteCards:[...(player.whiteCards||[])],cardsReady:player.cardsReady===true};
}
module.exports={save,get};
