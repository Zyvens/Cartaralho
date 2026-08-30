'use strict';
const{sql}=require('../../lib/db');
const{withErrors,ok,fail,requireMethod,getBody}=require('../../lib/http');
const{normalizeUsername,verifyPassword,createSession}=require('../../lib/auth');
const{ensureAccountProvisioned}=require('../../lib/accountProvisioning');

module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'POST'))return;
 const{username,password}=getBody(req),q=normalizeUsername(username);
 const rows=await sql`SELECT u.id,u.username,u.display_name,u.email,u.avatar_data,u.bio,u.equipped_title_key,u.equipped_frame_key,u.xp,u.password_hash,u.created_at,COALESCE(w.balance,0)::int dirty_balance FROM users u LEFT JOIN dirty_coin_wallets w ON w.user_id=u.id WHERE lower(u.username)=${q} OR lower(u.email)=lower(${q}) LIMIT 1`,user=rows[0];
 if(!user||!(await verifyPassword(password||'',user.password_hash)))return fail(res,401,'Usuário/e-mail ou senha inválidos.');
 await sql`UPDATE users SET last_login_at=now() WHERE id=${user.id}`;
 const setup=await ensureAccountProvisioned(user.id);
 if(setup.complete||setup.dirtyBalance)user.dirty_balance=Number(setup.dirtyBalance||0);
 const token=await createSession(user.id);
 delete user.password_hash;
 ok(res,{token,user,setupIncomplete:!setup.complete});
});
