'use strict';
const{sql}=require('./db');
const{CONFIG}=require('./balanceConfig');
function uid(v){const n=Number(v);if(!Number.isInteger(n)||n<=0)throw new Error('Usuário inválido.');return n;}
function policy(){return{rewardPerCard:Math.max(1,Math.trunc(Number(CONFIG.recycling.rewardPerCard)||25))};}
async function ensureWallet(userId){await sql`INSERT INTO dirty_coin_wallets(user_id,balance) VALUES(${userId},0) ON CONFLICT(user_id) DO NOTHING`;}
async function list(userId){
 const id=uid(userId),p=policy();await ensureWallet(id);
 const cards=await sql`SELECT cc.id AS canonical_card_id,cc.card_type,cc.display_text,o.acquisition_source,o.acquired_at,COALESCE(uc.is_favorite,false) AS is_favorite,COALESCE(authors.names,'') AS authors FROM canonical_card_ownerships o JOIN canonical_cards cc ON cc.id=o.canonical_card_id LEFT JOIN user_cards uc ON uc.id=o.legacy_user_card_id LEFT JOIN LATERAL(SELECT string_agg(COALESCE(a.author_name_snapshot,u.display_name,'Anônimo'),' / ' ORDER BY COALESCE(a.author_name_snapshot,u.display_name,'Anônimo')) AS names FROM canonical_card_authors a LEFT JOIN users u ON u.id=a.user_id WHERE a.canonical_card_id=cc.id)authors ON true WHERE o.user_id=${id} ORDER BY COALESCE(uc.is_favorite,false) DESC,o.acquired_at DESC,cc.id DESC`;
 const wallet=(await sql`SELECT balance FROM dirty_coin_wallets WHERE user_id=${id}`)[0];
 return{cards:cards.map(c=>({canonicalCardId:Number(c.canonical_card_id),type:c.card_type,text:c.display_text,acquisitionSource:c.acquisition_source,acquiredAt:c.acquired_at,isFavorite:!!c.is_favorite,authors:c.authors||''})),policy:p,balance:Number(wallet?.balance||0)};
}
async function existing(userId,recyclingId){return(await sql`SELECT recycling_id,card_count,reward,card_ids,created_at FROM card_recycling_batches WHERE user_id=${userId} AND recycling_id=${recyclingId} LIMIT 1`)[0]||null;}
function shapeBatch(row,balance,replayed=false){return{replayed,recyclingId:row.recycling_id,cardCount:Number(row.card_count||0),reward:Number(row.reward||0),cardIds:(row.card_ids||[]).map(Number),createdAt:row.created_at||null,balance:Number(balance||0)};}
async function recycle(userId,cardIds,recyclingId){
 const id=uid(userId),p=policy(),rid=String(recyclingId||'').trim(),ids=[...new Set((Array.isArray(cardIds)?cardIds:[]).map(Number).filter(Number.isInteger).filter(x=>x>0))];
 if(rid.length<8||rid.length>120)throw new Error('Identificador de reciclagem inválido.');
 if(ids.length<1)throw new Error('Selecione pelo menos 1 carta para reciclar.');
 const reward=ids.length*p.rewardPerCard;await ensureWallet(id);
 const old=await existing(id,rid);if(old){const w=(await sql`SELECT balance FROM dirty_coin_wallets WHERE user_id=${id}`)[0];return shapeBatch(old,w?.balance,true);}
 const idsJson=JSON.stringify(ids),ledgerKey=`recycle:${id}:${rid}`;
 const rows=await sql`WITH requested AS(SELECT DISTINCT value::bigint AS card_id FROM jsonb_array_elements_text(${idsJson}::jsonb)),eligible AS MATERIALIZED(SELECT o.id AS ownership_id,o.canonical_card_id,o.legacy_user_card_id,cc.card_type,cc.display_text FROM canonical_card_ownerships o JOIN canonical_cards cc ON cc.id=o.canonical_card_id JOIN requested r ON r.card_id=o.canonical_card_id WHERE o.user_id=${id}),validated AS(SELECT COUNT(*)::int AS n FROM eligible),batch AS(INSERT INTO card_recycling_batches(user_id,recycling_id,card_count,reward,card_ids) SELECT ${id},${rid},${ids.length},${reward},${idsJson}::jsonb WHERE(SELECT n FROM validated)=${ids.length} ON CONFLICT(user_id,recycling_id) DO NOTHING RETURNING id),removed AS(DELETE FROM canonical_card_ownerships o USING eligible e,batch b WHERE o.id=e.ownership_id RETURNING e.canonical_card_id,e.legacy_user_card_id,e.card_type,e.display_text),legacy AS(UPDATE user_cards uc SET owned=false,is_favorite=false,updated_at=now() FROM removed r WHERE uc.user_id=${id} AND((r.legacy_user_card_id IS NOT NULL AND uc.id=r.legacy_user_card_id) OR(uc.type=CASE WHEN r.card_type='white' THEN 'whiteCards' ELSE 'blackCards' END AND uc.text=r.display_text)) RETURNING uc.id),ledger AS(INSERT INTO dirty_coin_ledger(user_id,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata) SELECT ${id},${reward},'card_recycling',${ledgerKey},'card_recycling',${rid},jsonb_build_object('cardCount',${ids.length},'rewardPerCard',${p.rewardPerCard}) FROM batch ON CONFLICT(idempotency_key) DO NOTHING RETURNING amount),wallet AS(UPDATE dirty_coin_wallets SET balance=balance+COALESCE((SELECT SUM(amount) FROM ledger),0),updated_at=now() WHERE user_id=${id} RETURNING balance) SELECT EXISTS(SELECT 1 FROM batch) AS processed,(SELECT COUNT(*)::int FROM removed) AS recycled,COALESCE((SELECT balance FROM wallet),(SELECT balance FROM dirty_coin_wallets WHERE user_id=${id}),0)::int AS balance`;
 const out=rows[0]||{};
 if(!out.processed){const replay=await existing(id,rid);if(replay){const w=(await sql`SELECT balance FROM dirty_coin_wallets WHERE user_id=${id}`)[0];return shapeBatch(replay,w?.balance,true);}throw new Error('Uma ou mais cartas selecionadas não estão mais na sua coleção. Atualize a Reciclagem e tente novamente.');}
 const batch=await existing(id,rid);return shapeBatch(batch||{recycling_id:rid,card_count:ids.length,reward,card_ids:ids},out.balance,false);
}
module.exports={policy,list,recycle};
