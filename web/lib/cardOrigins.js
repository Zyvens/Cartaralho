const{sql}=require('./db');
const{normalizeCardText}=require('./cardIdentity');

async function ensureOrigin(type,text,{creatorUserId=null,creatorName=null,roomCode=null}={}){
 const clean=String(text||'').trim();if(!clean)return null;const key=normalizeCardText(clean);
 let row=(await sql`SELECT * FROM card_origins WHERE type=${type} AND text_key=${key} LIMIT 1`)[0];
 if(!row){
  await sql`INSERT INTO card_origins(type,text_key,text,creator_user_id,creator_name_snapshot,first_room_code) VALUES(${type},${key},${clean},${creatorUserId},${creatorName||null},${roomCode||null}) ON CONFLICT(type,text_key) DO NOTHING`;
  row=(await sql`SELECT * FROM card_origins WHERE type=${type} AND text_key=${key} LIMIT 1`)[0];
 }else if(!row.creator_user_id&&creatorUserId&&roomCode&&String(row.first_room_code||'')===String(roomCode)){
  await sql`UPDATE card_origins SET creator_user_id=${creatorUserId},creator_name_snapshot=COALESCE(creator_name_snapshot,${creatorName||null}) WHERE id=${row.id} AND creator_user_id IS NULL`;
  row=(await sql`SELECT * FROM card_origins WHERE id=${row.id} LIMIT 1`)[0];
 }
 return row;
}
async function registerSubmitted(room,player,type,allTexts,createdTexts=[]){const created=new Set((createdTexts||[]).map(normalizeCardText));for(const text of allTexts||[])await ensureOrigin(type,text,{creatorUserId:created.has(normalizeCardText(text))?player.userId:null,creatorName:created.has(normalizeCardText(text))?player.nickname:null,roomCode:room.code});}
async function markRecreated(type,text,creatingUserId){const key=normalizeCardText(text);await sql`UPDATE card_origins SET recreated_count=recreated_count+1 WHERE type=${type} AND text_key=${key} AND (creator_user_id IS NULL OR creator_user_id<>${creatingUserId})`;}
async function visitRoom(roomCode,type,texts){const unique=new Map();for(const raw of texts||[]){const text=String(raw||'').trim();if(text)unique.set(normalizeCardText(text),text);}for(const[key,text]of unique){await ensureOrigin(type,text,{roomCode});await sql`INSERT INTO card_room_presence(room_code,type,text_key,text) VALUES(${roomCode},${type},${key},${text}) ON CONFLICT DO NOTHING`;}}
async function getOrigin(type,text){const key=normalizeCardText(text),rows=await sql`SELECT co.*,u.display_name creator_display_name,u.username creator_username,(SELECT COUNT(DISTINCT room_code)::int FROM card_room_presence crp WHERE crp.type=co.type AND crp.text_key=co.text_key) tables_visited,(SELECT COUNT(*)::int FROM user_cards uc WHERE uc.type=co.type AND lower(regexp_replace(trim(uc.text),'\\s+',' ','g'))=${key} AND uc.owned=true) holders FROM card_origins co LEFT JOIN users u ON u.id=co.creator_user_id WHERE co.type=${type} AND co.text_key=${key} LIMIT 1`;return rows[0]||null;}
module.exports={ensureOrigin,registerSubmitted,markRecreated,visitRoom,getOrigin};
