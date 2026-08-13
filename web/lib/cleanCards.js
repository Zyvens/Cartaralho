'use strict';
const{sql}=require('./db');
const{canonicalIdentity}=require('./cardIdentity');

const UNIT_PRICE=200;
function normalizeType(type){const t=String(type||'').trim();if(t==='white'||t==='whiteCards')return'white';if(t==='black'||t==='blackCards')return'black';return null;}
function cleanResult(row){const r=row&&typeof row==='object'?row:{};return{...r,whiteBalance:Number(r.whiteBalance||0),blackBalance:Number(r.blackBalance||0),dirtyBalance:r.dirtyBalance===undefined?undefined:Number(r.dirtyBalance||0),price:r.price===undefined?UNIT_PRICE:Number(r.price||UNIT_PRICE)};}
async function ensureStarterCleanCards(userId){const rows=await sql`SELECT grant_starter_clean_cards(${Number(userId)}) result`;return cleanResult(rows[0]?.result);}
async function getInventory(userId,limit=20){await ensureStarterCleanCards(userId);const wallet=(await sql`SELECT white_balance,black_balance,updated_at FROM clean_card_wallets WHERE user_id=${Number(userId)}`)[0]||{},dirty=(await sql`SELECT balance FROM dirty_coin_wallets WHERE user_id=${Number(userId)}`)[0]||{},ledger=await sql`SELECT card_type,amount,transaction_type,reference_type,reference_id,metadata,created_at FROM clean_card_ledger WHERE user_id=${Number(userId)} ORDER BY created_at DESC,id DESC LIMIT ${Math.max(1,Math.min(50,Number(limit)||20))}`;return{whiteBalance:Number(wallet.white_balance||0),blackBalance:Number(wallet.black_balance||0),dirtyBalance:Number(dirty.balance||0),unitPrice:UNIT_PRICE,updatedAt:wallet.updated_at||null,ledger};}
async function purchase(userId,type,purchaseId){const cardType=normalizeType(type);if(!cardType)return{status:'invalid_type'};const rows=await sql`SELECT purchase_clean_card(${Number(userId)},${cardType},${String(purchaseId||'')}) result`;return cleanResult(rows[0]?.result);}
async function create({userId,type,text,matchId,creatorName,creationId}){const cardType=normalizeType(type);if(!cardType)return{status:'invalid_type'};const identity=canonicalIdentity(cardType,text);const rows=await sql`SELECT create_paid_player_card(${Number(userId)},${cardType},${identity.normalizedText},${identity.displayText},${String(matchId||'')},${String(creatorName||'')},${String(creationId||'')}) result`;return cleanResult(rows[0]?.result);}
module.exports={UNIT_PRICE,normalizeType,ensureStarterCleanCards,getInventory,purchase,create};
