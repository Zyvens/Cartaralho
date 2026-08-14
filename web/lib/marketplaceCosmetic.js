'use strict';
const c=require('./marketplaceCommon');
const{MIN_COSMETIC_XP}=require('./prestigeDefinitions');

function reserve(userId,productKey,purchaseId){const id=c.uid(userId),p=c.pid(purchaseId);return c.sql`
 INSERT INTO market_purchases(user_id,purchase_id,product_key,product_name,price_paid,catalog_version,product_config,item_count,grants)
 SELECT ${id},${p},mc.product_key,mc.name,mc.price,mc.catalog_version,mc.config,1,
        jsonb_build_array(jsonb_build_object('kind','cosmetic','cosmeticType',mc.config->>'cosmeticType','equipKey',mc.config->>'equipKey','rarity',mc.config->>'rarity'))
 FROM market_catalog mc
 JOIN dirty_coin_wallets w ON w.user_id=${id}
 JOIN users u ON u.id=${id}
 WHERE mc.product_key=${String(productKey||'')} AND mc.category='cosmetic'
   AND mc.product_kind IN('cosmetic_frame','cosmetic_title') AND mc.enabled=true
   AND u.xp>=${MIN_COSMETIC_XP} AND w.balance>=mc.price
   AND NOT EXISTS(SELECT 1 FROM cosmetic_ownerships co WHERE co.user_id=${id} AND co.cosmetic_key=mc.product_key)
 RETURNING id`;
}
function grant(userId,purchaseId){const id=c.uid(userId),p=c.pid(purchaseId);return c.sql`
 INSERT INTO cosmetic_ownerships(user_id,cosmetic_key,cosmetic_type,acquisition_source,purchase_pk)
 SELECT mp.user_id,mp.product_key,mp.product_config->>'cosmeticType','purchase',mp.id
 FROM market_purchases mp
 WHERE mp.user_id=${id} AND mp.purchase_id=${p}
 ON CONFLICT(user_id,cosmetic_key) DO NOTHING`;
}
async function run(userId,product,purchaseId){const id=c.uid(userId),p=c.pid(purchaseId),q=[c.walletLock(id),reserve(id,product.product_key,p),...c.chargeQueries(id,p),grant(id,p),c.finalQuery(id,p)];return c.sql.transaction(q,{isolationMode:'Serializable'});}
module.exports={run,reserve,grant};
