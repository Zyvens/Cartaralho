'use strict';
const{withErrors,ok,fail,requireMethod,getBody}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const roomStore=require('../../lib/roomStore');
const{GAME_STATES}=require('../../lib/constants');
const cleanCards=require('../../lib/cleanCards');
const pendingCardDrafts=require('../../lib/pendingCardDrafts');

module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'POST'))return;
 const user=await requireUser(req,res);if(!user)return;
 if(process.env.PAID_CARD_CREATION_ENABLED==='false')return fail(res,503,'Criação paga temporariamente indisponível.');
 const{code,type,text}=getBody(req);
 if(!code)return fail(res,400,'Código da sala é obrigatório.');
 const room=await roomStore.loadRoom(code);
 if(!room)return fail(res,404,'Sala não encontrada.');
 const player=Array.from(room.players.values()).find(p=>String(p.userId)===String(user.id));
 if(!player||player.active===false)return fail(res,403,'Você não está ativo nesta sala.');
 if(player.cardsReady===true)return fail(res,409,'Desmarque Pronto no Lobby antes de criar ou editar Cartas de Jogador.');
 if(!room.cardCreationEnabled)return fail(res,403,'A criação de novas cartas está desativada nesta sala.');
 if(![GAME_STATES.CADASTRO_CARTAS,GAME_STATES.AGUARDANDO_JOGADORES].includes(room.state))return fail(res,409,'Não é possível preparar cartas neste momento.');
 let result;
 try{result=await pendingCardDrafts.preview(room,user.id,type,text);}
 catch(e){return fail(res,400,e.message||'Carta inválida.');}
 const cardType=result.card?.cardType||cleanCards.normalizeType(type);
 if(result.status==='duplicate_owned')return fail(res,409,'Você já possui essa Carta de Jogador. Selecione-a gratuitamente na sua coleção.');
 if(result.status==='insufficient_clean_cards')return fail(res,409,`Sem Cartas Limpas ${cardType==='black'?'Pretas':'Brancas'}. Compre 1 por ${cleanCards.UNIT_PRICE} Moedas Sujas.`);
 if(result.status!=='draft')return fail(res,400,'Não foi possível preparar esta carta.');
 ok(res,{message:'Carta preparada. Ela só será registrada e consumirá 1 Carta Limpa quando a partida começar.',draft:true,card:{type:cardType==='black'?'blackCards':'whiteCards',text:result.card.displayText,canonicalCardId:result.card.canonicalCardId||null},inventory:result.inventory});
});
