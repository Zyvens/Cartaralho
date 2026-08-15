'use strict';
const crypto=require('crypto');
const{sql}=require('./db');
const cleanCards=require('./cleanCards');
const canonicalSubmission=require('./canonicalSubmission');
const{canonicalCardType,legacyCardType,normalizeBlackCardDisplay,cleanDisplayText,canonicalIdentity}=require('./cardIdentity');

function prepare(type,text){
 const cardType=canonicalCardType(type);
 const displayText=cardType==='black'?normalizeBlackCardDisplay(text,{requireGap:true}):cleanDisplayText(text);
 const limit=cardType==='black'?200:120;
 if(!displayText)throw new Error('Digite o texto da carta.');
 if(displayText.length>limit)throw new Error(`A carta deve ter no máximo ${limit} caracteres.`);
 const identity=canonicalIdentity(cardType,displayText);
 return{...identity,legacyType:legacyCardType(cardType)};
}
function activePlayers(room){return Array.from(room?.players?.values?.()||[]).filter(p=>p&&p.active!==false&&p.userId);}
async function legacyCreatedInRoom(userId,canonicalCardId,roomCode){
 if(!canonicalCardId||!roomCode)return false;
 const rows=await sql`SELECT 1 FROM canonical_card_creation_events WHERE canonical_card_id=${canonicalCardId} AND user_id=${Number(userId)} AND match_id=${String(roomCode)} LIMIT 1`;
 return rows.length>0;
}
async function classifyForUser(room,userId,type,texts,{checkInventory=true}={}){
 const cardType=canonicalCardType(type),owned=[],drafts=[],seen=new Set();
 for(const raw of texts||[]){
  const card=prepare(cardType,raw),key=card.normalizedText;
  if(seen.has(key))throw new Error('A mesma carta não pode aparecer duas vezes na sua seleção.');
  seen.add(key);
  const inferred=await canonicalSubmission.inferSubmittedCard({type:card.legacyType,text:card.displayText,userId});
  if(inferred.alreadyOwned){
   if(room?.playerCardsEnabled===false&&!(await legacyCreatedInRoom(userId,inferred.canonicalCard?.id,room?.code)))throw new Error('Esta sala não permite usar Cartas de Jogador já possuídas. Apenas cartas preparadas para esta partida podem ser levadas.');
   owned.push({...card,canonicalCardId:inferred.canonicalCard?.id||null});
  }else{
   if(room?.cardCreationEnabled===false)throw new Error('A criação de novas cartas está desativada nesta sala.');
   drafts.push({...card,canonicalCardId:inferred.canonicalCard?.id||null});
  }
 }
 let inventory=null;
 if(checkInventory&&drafts.length){
  inventory=await cleanCards.getInventory(userId);
  const balance=cardType==='black'?Number(inventory.blackBalance||0):Number(inventory.whiteBalance||0);
  if(drafts.length>balance)throw new Error(`Você preparou ${drafts.length} Carta${drafts.length===1?'':'s'} ${cardType==='black'?'Preta':'Branca'}${drafts.length===1?'':'s'}, mas possui apenas ${balance} Carta${balance===1?'':'s'} Limpa${balance===1?'':'s'} ${balance===1?'disponível':'disponíveis'}.`);
 }
 return{cardType,owned,drafts,inventory};
}
async function preview(room,userId,type,text){
 const card=prepare(type,text);
 if(room?.cardCreationEnabled===false)return{status:'creation_disabled'};
 const inferred=await canonicalSubmission.inferSubmittedCard({type:card.legacyType,text:card.displayText,userId});
 if(inferred.alreadyOwned)return{status:'duplicate_owned',card,canonicalCardId:inferred.canonicalCard?.id||null};
 const inventory=await cleanCards.getInventory(userId),balance=card.cardType==='black'?Number(inventory.blackBalance||0):Number(inventory.whiteBalance||0);
 if(balance<1)return{status:'insufficient_clean_cards',card,inventory};
 return{status:'draft',card:{...card,canonicalCardId:inferred.canonicalCard?.id||null},inventory};
}
async function classifyRoom(room){
 const drafts=[],byUser=new Map();
 for(const player of activePlayers(room)){
  const black=await classifyForUser(room,player.userId,'blackCards',player.blackCards||[]),white=await classifyForUser(room,player.userId,'whiteCards',player.whiteCards||[]);
  const userDrafts=[...black.drafts,...white.drafts].map(card=>({...card,userId:Number(player.userId),creatorName:player.nickname||''}));
  drafts.push(...userDrafts);byUser.set(String(player.userId),{black,white,drafts:userDrafts});
 }
 return{drafts,byUser};
}
function creationId(roomCode,draft){return`p25_${crypto.createHash('sha256').update(`${String(roomCode)}|${Number(draft.userId)}|${draft.cardType}|${draft.normalizedText}`).digest('hex').slice(0,28)}`;}
function commitQuery(roomCode,draft){
 const id=creationId(roomCode,draft);
 return sql`WITH r AS (SELECT create_paid_player_card(${Number(draft.userId)},${draft.cardType},${draft.normalizedText},${draft.displayText},${String(roomCode)},${String(draft.creatorName||'')},${id}) result) SELECT result,1/(CASE WHEN result->>'status'='created' THEN 1 ELSE 0 END) committed FROM r`;
}
function commitQueries(roomCode,drafts){return(drafts||[]).map(draft=>commitQuery(roomCode,draft));}
module.exports={prepare,classifyForUser,preview,classifyRoom,creationId,commitQuery,commitQueries};
