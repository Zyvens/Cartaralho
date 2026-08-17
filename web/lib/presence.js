'use strict';
const{sql}=require('./db');
let ready=null;
function ensure(){
 if(!ready)ready=(async()=>{
  try{await sql`CREATE TABLE IF NOT EXISTS user_presence(user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now())`;}
  catch(e){if(!['23505','42P07'].includes(String(e?.code||'')))throw e;}
  try{await sql`CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen_at DESC)`;}
  catch(e){if(!['23505','42P07','42710'].includes(String(e?.code||'')))throw e;}
 })().catch(e=>{ready=null;throw e;});
 return ready;
}
async function heartbeat(userId){await ensure();await sql`INSERT INTO user_presence(user_id,last_seen_at) VALUES(${Number(userId)},now()) ON CONFLICT(user_id) DO UPDATE SET last_seen_at=EXCLUDED.last_seen_at`;}
module.exports={ensure,heartbeat,ONLINE_WINDOW_SECONDS:120};
