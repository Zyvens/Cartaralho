'use strict';
const{withErrors,ok,fail,getBody}=require('../../lib/http');
const{requireAdmin}=require('../../lib/adminAuth');
const{sql}=require('../../lib/db');

module.exports=withErrors(async(req,res)=>{
 if(!requireAdmin(req,res))return;
 if(req.method!=='POST')return fail(res,405,'Método não permitido. Use POST.');
 const{userId,entitlementKey}=getBody(req),id=Number(userId),key=String(entitlementKey||'');
 if(!Number.isInteger(id)||id<=0)return fail(res,400,'userId inválido.');
 if(key!=='o-criador')return fail(res,400,'Este endpoint administrativo aceita somente o entitlement O Criador. Betinha é exclusivo do snapshot Beta congelado.');
 const user=(await sql`SELECT id,username,display_name FROM users WHERE id=${id} LIMIT 1`)[0];if(!user)return fail(res,404,'Usuário não encontrado.');
 await sql`INSERT INTO special_entitlements(user_id,entitlement_key,entitlement_type,source_type,metadata) VALUES(${id},'o-criador','title','admin',jsonb_build_object('version','p11-v1')) ON CONFLICT(user_id,entitlement_key) DO NOTHING`;
 const grant=(await sql`SELECT user_id,entitlement_key,source_type,granted_at FROM special_entitlements WHERE user_id=${id} AND entitlement_key='o-criador' LIMIT 1`)[0];
 ok(res,{entitlement:grant,user});
});
