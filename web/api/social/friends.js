const{sql}=require('../../lib/db');
const{withErrors,ok,fail,getBody}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const presence=require('../../lib/presence');

module.exports=withErrors(async(req,res)=>{
  const user=await requireUser(req,res);if(!user)return;
  if(req.method==='GET'){
    await presence.ensure();
    const friends=await sql`SELECT f.id,f.updated_at,u.id user_id,u.username,u.display_name,u.avatar_data,u.bio,p.last_seen_at,
      COALESCE(p.last_seen_at > now() - (${presence.ONLINE_WINDOW_SECONDS} * interval '1 second'),false) AS online
      FROM friendships f JOIN users u ON u.id=CASE WHEN f.user_a=${user.id} THEN f.user_b ELSE f.user_a END
      LEFT JOIN user_presence p ON p.user_id=u.id
      WHERE (f.user_a=${user.id} OR f.user_b=${user.id}) AND f.status='accepted'
      ORDER BY online DESC,lower(u.display_name),lower(u.username)`;
    const incoming=await sql`SELECT f.id,f.created_at,u.id user_id,u.username,u.display_name,u.avatar_data
      FROM friendships f JOIN users u ON u.id=f.requested_by
      WHERE (f.user_a=${user.id} OR f.user_b=${user.id}) AND f.status='pending' AND f.requested_by<>${user.id}
      ORDER BY f.created_at DESC`;
    const outgoing=await sql`SELECT f.id,f.created_at,u.id user_id,u.username,u.display_name,u.avatar_data
      FROM friendships f JOIN users u ON u.id=CASE WHEN f.user_a=${user.id} THEN f.user_b ELSE f.user_a END
      WHERE (f.user_a=${user.id} OR f.user_b=${user.id}) AND f.status='pending' AND f.requested_by=${user.id}
      ORDER BY f.created_at DESC`;
    return ok(res,{friends,incoming,outgoing,onlineCount:friends.filter(x=>x.online).length,onlineWindowSeconds:presence.ONLINE_WINDOW_SECONDS});
  }
  if(req.method!=='POST')return fail(res,405,'Método não permitido.');
  const{action,username,friendshipId}=getBody(req);
  if(action==='request'){
    const handle=String(username||'').trim().toLowerCase().replace(/^@/,'');
    if(!handle)return fail(res,400,'Digite o usuário da pessoa.');
    const rows=await sql`SELECT id,username,display_name FROM users WHERE lower(username)=${handle} LIMIT 1`;
    if(!rows.length)return fail(res,404,'Usuário não encontrado.');
    const target=rows[0];if(String(target.id)===String(user.id))return fail(res,400,'Você já é seu próprio problema.');
    const a=Number(user.id)<Number(target.id)?user.id:target.id,b=Number(user.id)<Number(target.id)?target.id:user.id;
    const existing=(await sql`SELECT * FROM friendships WHERE user_a=${a} AND user_b=${b} LIMIT 1`)[0];
    if(existing?.status==='accepted')return fail(res,409,'Vocês já são amigos.');
    if(existing?.status==='pending'){
      if(String(existing.requested_by)!==String(user.id)){
        await sql`UPDATE friendships SET status='accepted',updated_at=now() WHERE id=${existing.id}`;
        return ok(res,{accepted:true,message:`${target.display_name} agora é seu amigo.`});
      }
      return fail(res,409,'Pedido de amizade já enviado.');
    }
    await sql`INSERT INTO friendships(user_a,user_b,requested_by,status) VALUES(${a},${b},${user.id},'pending')
      ON CONFLICT(user_a,user_b) DO UPDATE SET requested_by=EXCLUDED.requested_by,status='pending',updated_at=now()`;
    return ok(res,{requested:true,message:`Pedido enviado para @${target.username}.`});
  }
  const id=Number(friendshipId);if(!Number.isInteger(id)||id<=0)return fail(res,400,'Amizade inválida.');
  const row=(await sql`SELECT * FROM friendships WHERE id=${id} AND (user_a=${user.id} OR user_b=${user.id}) LIMIT 1`)[0];
  if(!row)return fail(res,404,'Pedido não encontrado.');
  if(action==='accept'){
    if(row.status!=='pending'||String(row.requested_by)===String(user.id))return fail(res,400,'Este pedido não pode ser aceito.');
    await sql`UPDATE friendships SET status='accepted',updated_at=now() WHERE id=${id}`;return ok(res,{accepted:true});
  }
  if(action==='decline'){
    if(row.status!=='pending')return fail(res,400,'Este pedido não está pendente.');
    await sql`DELETE FROM friendships WHERE id=${id}`;return ok(res,{declined:true});
  }
  if(action==='remove'){
    await sql`DELETE FROM friendships WHERE id=${id}`;return ok(res,{removed:true});
  }
  return fail(res,400,'Ação inválida.');
});
