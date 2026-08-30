'use strict';
const{sql}=require('../../lib/db');
const{withErrors,ok,fail,requireMethod,getBody}=require('../../lib/http');
const{normalizeUsername,normalizeEmail,hashPassword,verifyPassword,createSession,createRecoveryCode,tokenHash}=require('../../lib/auth');
const{ensureAccountProvisioned}=require('../../lib/accountProvisioning');

const USERNAME_RE=/^[a-z0-9_.-]{3,24}$/;
const RECOVERY_MESSAGE='Guarde este código. Ele permite recuperar sua conta caso você perca a senha.';

async function userByUsername(username){
 return(await sql`SELECT id,username,display_name,email,password_hash,avatar_data,bio,created_at FROM users WHERE lower(username)=${username} LIMIT 1`)[0]||null;
}
async function userByEmail(email){
 if(!email)return null;
 return(await sql`SELECT id,username,email FROM users WHERE lower(email)=lower(${email}) LIMIT 1`)[0]||null;
}
async function publicUser(userId,dirtyBalance=0){
 const row=(await sql`SELECT id,username,display_name,email,avatar_data,bio,created_at FROM users WHERE id=${userId} LIMIT 1`)[0]||null;
 if(row)row.dirty_balance=Number(dirtyBalance||0);
 return row;
}
async function finishRegistration(user,{accountRecovered=false}={}){
 const recoveryCode=createRecoveryCode(),recoveryHash=tokenHash(recoveryCode);
 await sql`UPDATE users SET recovery_hash=${recoveryHash} WHERE id=${user.id}`;
 const setup=await ensureAccountProvisioned(user.id);
 const hydrated=await publicUser(user.id,setup.dirtyBalance);
 const token=await createSession(user.id);
 return{token,user:hydrated||user,recoveryCode,recoveryMessage:RECOVERY_MESSAGE,accountRecovered,setupIncomplete:!setup.complete};
}

module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'POST'))return;
 const{username,password,displayName,email}=getBody(req),normalized=normalizeUsername(username),mail=normalizeEmail(email),name=String(displayName||username||'').trim();
 if(!USERNAME_RE.test(normalized))return fail(res,400,'Usuário deve ter 3 a 24 caracteres: letras, números, ponto, hífen ou _.');
 const reservedQa=/^qa_(host|player|third)_/i.test(normalized);
 if(reservedQa&&process.env.CARTARALHO_ALLOW_QA_ACCOUNTS!=='1')return fail(res,403,'Contas QA são reservadas a ambientes de teste isolados.');
 if(String(password||'').length<6)return fail(res,400,'A senha deve ter pelo menos 6 caracteres.');
 if(name.length<2||name.length>24)return fail(res,400,'Nome de exibição deve ter 2 a 24 caracteres.');
 if(mail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))return fail(res,400,'E-mail inválido.');

 const existingUser=await userByUsername(normalized),existingEmail=await userByEmail(mail);
 if(existingEmail&&(!existingUser||String(existingEmail.id)!==String(existingUser.id)))return fail(res,409,'Usuário ou e-mail já cadastrado.');
 if(existingUser){
  if(!(await verifyPassword(password,existingUser.password_hash)))return fail(res,409,'Usuário ou e-mail já cadastrado.');
  const result=await finishRegistration(existingUser,{accountRecovered:true});
  return ok(res,result);
 }

 const passwordHash=await hashPassword(password),recoveryCode=createRecoveryCode(),recoveryHash=tokenHash(recoveryCode);
 const rows=await sql`INSERT INTO users(username,display_name,email,password_hash,recovery_hash) VALUES(${normalized},${name},${mail},${passwordHash},${recoveryHash}) RETURNING id,username,display_name,email,avatar_data,bio,created_at`;
 const user=rows[0],setup=await ensureAccountProvisioned(user.id),hydrated=await publicUser(user.id,setup.dirtyBalance),token=await createSession(user.id);
 ok(res,{token,user:hydrated||user,recoveryCode,recoveryMessage:RECOVERY_MESSAGE,accountRecovered:false,setupIncomplete:!setup.complete});
});
