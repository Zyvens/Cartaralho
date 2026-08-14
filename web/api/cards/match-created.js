'use strict';
const{sql}=require('../../lib/db');
const{withErrors,ok,fail,requireMethod}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const roomStore=require('../../lib/roomStore');
module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;
 const code=String(req.query?.code||'').trim().toUpperCase();if(!code)return fail(res,400,'Código da sala é obrigatório.');
 const room=await roomStore.loadRoom(code);if(!room)return fail(res,404,'Sala não encontrada.');
 const member=Array.from(room.players.values()).some(p=>String(p.userId)===String(user.id));if(!member)return fail(res,403,'Você não participa desta sala.');
 const rows=await sql`SELECT DISTINCT cc.id canonical_card_id,cc.card_type,cc.display_text FROM canonical_card_creation_events e JOIN canonical_cards cc ON cc.id=e.canonical_card_id WHERE e.user_id=${user.id} AND e.match_id=${room.code} ORDER BY cc.card_type,cc.display_text`;
 ok(res,{cards:rows.map(r=>({canonicalCardId:r.canonical_card_id,type:r.card_type==='black'?'blackCards':'whiteCards',text:r.display_text}))});
});
