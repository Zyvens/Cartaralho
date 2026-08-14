'use strict';
const{withErrors,ok,fail,requireMethod}=require('../../lib/http');const replay=require('../../lib/advancedReplay');
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'GET'))return;const code=String(req.query?.code||'').trim().toUpperCase();if(!code)return fail(res,400,'code é obrigatório.');const rounds=await replay.publicReplay(code);if(!rounds.length)return fail(res,404,'Replay não encontrado.');ok(res,{matchId:code,rounds});});
