'use strict';
const{withErrors,ok,fail}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const presence=require('../../lib/presence');
module.exports=withErrors(async(req,res)=>{
 const user=await requireUser(req,res);if(!user)return;
 if(req.method!=='POST')return fail(res,405,'Método não permitido.');
 await presence.heartbeat(user.id);
 ok(res,{online:true,onlineWindowSeconds:presence.ONLINE_WINDOW_SECONDS});
});
