'use strict';
const c=require('./marketplaceCommon');
const BEST_WORLD_RANK_VERSION='best-world-v1';
async function getState(userId){
 const id=c.uid(userId),b=await c.balances(id);
 const[catalog,purchases,packCards,ledger,buffInventory]=await Promise.all([
  c.sql`SELECT product_key,name,description,category,product_kind,price,config,catalog_version,sort_order FROM market_catalog WHERE enabled=true ORDER BY sort_order,product_key`,
  c.sql`SELECT id,purchase_id,product_key,product_name,price_paid,catalog_version,item_count,grants,created_at FROM market_purchases WHERE user_id=${id} ORDER BY created_at DESC,id DESC LIMIT 30`,
  c.sql`SELECT cc.id canonical_card_id,cc.card_type,cc.display_text,o.acquisition_source,o.acquired_at,COALESCE((SELECT json_agg(COALESCE(u.display_name,a.author_name_snapshot,u.username,'Criador desconhecido') ORDER BY a.authored_at,a.user_id) FROM canonical_card_authors a LEFT JOIN users u ON u.id=a.user_id WHERE a.canonical_card_id=cc.id),'[]'::json) authors FROM canonical_card_ownerships o JOIN canonical_cards cc ON cc.id=o.canonical_card_id WHERE o.user_id=${id} AND o.acquisition_source IN('pack_random','pack_best_world') ORDER BY o.acquired_at DESC LIMIT 50`,
  c.sql`SELECT amount,transaction_type,reference_type,reference_id,metadata,created_at FROM dirty_coin_ledger WHERE user_id=${id} ORDER BY created_at DESC,id DESC LIMIT 50`,
  c.sql`SELECT bi.buff_key,bi.quantity,bi.updated_at,mc.name,mc.description,mc.price FROM buff_inventory bi JOIN market_catalog mc ON mc.product_key=bi.buff_key WHERE bi.user_id=${id} AND bi.quantity>0 ORDER BY mc.sort_order,mc.product_key`
 ]);
 return{catalog,purchases,packCards,ledger,buffInventory,...b,rankVersion:BEST_WORLD_RANK_VERSION,buffsFeatureEnabled:process.env.BUFFS_FEATURE_ENABLED!=='false'};
}
module.exports={BEST_WORLD_RANK_VERSION,getState};
