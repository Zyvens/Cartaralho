'use strict';
const c=require('./marketplaceCommon');

function reserve(userId,productKey,purchaseId){
 const id=c.uid(userId),p=c.pid(purchaseId);
 return c.sql`INSERT INTO market_purchases(user_id,purchase_id,product_key,product_name,price_paid,catalog_version,product_config)
 SELECT ${id},${p},x.product_key,x.name,x.price,x.catalog_version,x.config
 FROM market_catalog x JOIN dirty_coin_wallets w ON w.user_id=${id}
 WHERE x.product_key=${productKey} AND x.enabled=true AND x.category='clean_cards' AND w.balance>=x.price
 RETURNING id`;
}

async function run(userId,product,purchaseId){
 const id=c.uid(userId),p=c.pid(purchaseId);
 const q=[
  c.walletLock(id),
  reserve(id,product.product_key,p),
  ...c.chargeQueries(id,p),
  c.sql`UPDATE clean_card_wallets cw SET
    white_balance=cw.white_balance+COALESCE((mp.product_config->>'white')::int,0),
    black_balance=cw.black_balance+COALESCE((mp.product_config->>'black')::int,0),
    updated_at=now()
   FROM market_purchases mp
   WHERE mp.user_id=${id} AND mp.purchase_id=${p} AND cw.user_id=mp.user_id`,
  c.sql`INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
   SELECT mp.user_id,'white',(mp.product_config->>'white')::int,'purchase',${`purchase:market:${id}:${p}:white`},'market_purchase',mp.id::text,jsonb_build_object('productKey',mp.product_key)
   FROM market_purchases mp
   WHERE mp.user_id=${id} AND mp.purchase_id=${p} AND COALESCE((mp.product_config->>'white')::int,0)>0`,
  c.sql`INSERT INTO clean_card_ledger(user_id,card_type,amount,transaction_type,idempotency_key,reference_type,reference_id,metadata)
   SELECT mp.user_id,'black',(mp.product_config->>'black')::int,'purchase',${`purchase:market:${id}:${p}:black`},'market_purchase',mp.id::text,jsonb_build_object('productKey',mp.product_key)
   FROM market_purchases mp
   WHERE mp.user_id=${id} AND mp.purchase_id=${p} AND COALESCE((mp.product_config->>'black')::int,0)>0`,
  c.sql`UPDATE market_purchases mp SET
    item_count=COALESCE((mp.product_config->>'white')::int,0)+COALESCE((mp.product_config->>'black')::int,0),
    grants=jsonb_build_array(jsonb_build_object('kind','clean_cards','white',COALESCE((mp.product_config->>'white')::int,0),'black',COALESCE((mp.product_config->>'black')::int,0)))
   WHERE mp.user_id=${id} AND mp.purchase_id=${p}`,
  c.finalQuery(id,p)
 ];
 return c.sql.transaction(q,{isolationMode:'Serializable'});
}
module.exports={run};
