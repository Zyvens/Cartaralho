'use strict';
const{withErrors,ok,requireMethod}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const{sql}=require('../../lib/db');

module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;
 await sql`INSERT INTO dirty_coin_wallets(user_id,balance) VALUES(${user.id},0) ON CONFLICT(user_id) DO NOTHING`;
 const row=(await sql`SELECT balance,updated_at FROM dirty_coin_wallets WHERE user_id=${user.id} LIMIT 1`)[0]||{};
 ok(res,{dirtyBalance:Number(row.balance||0),updatedAt:row.updated_at||null});
});
