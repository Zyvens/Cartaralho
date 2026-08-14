'use strict';
const c=require('./marketplaceCommon'),clean=require('./marketplaceClean'),random=require('./marketplaceRandom'),best=require('./marketplaceBestWorld'),buff=require('./marketplaceBuff'),cosmetic=require('./marketplaceCosmetic'),prestige=require('./prestigeService');
const RETRYABLE=new Set(['40001','23505']);
function updatePack(userId,purchaseId){const id=c.uid(userId),p=c.pid(purchaseId);return c.sql`UPDATE market_purchases mp SET item_count=x.n,grants=x.grants FROM(SELECT g.purchase_pk,COUNT(*)::int n,COALESCE(jsonb_agg(jsonb_build_object('kind','player_card','canonicalCardId',cc.id,'type',cc.card_type,'text',cc.display_text,'acquisitionSource',g.acquisition_source) ORDER BY g.ordinal),'[]'::jsonb) grants FROM market_purchase_card_grants g JOIN canonical_cards cc ON cc.id=g.canonical_card_id GROUP BY g.purchase_pk)x WHERE mp.id=x.purchase_pk AND mp.user_id=${id} AND mp.purchase_id=${p}`;}
async function runPack(userId,product,purchaseId){const id=c.uid(userId),p=c.pid(purchaseId),strategy=product.product_kind==='pack_best_world'?best:random,q=[c.walletLock(id),strategy.reserve(id,product.product_key,p),...c.chargeQueries(id,p),strategy.grant(id,p),updatePack(id,p),c.finalQuery(id,p)];return c.sql.transaction(q,{isolationMode:'Serializable'});}
async function purchase(userId,productKey,purchaseId){
 const id=c.uid(userId),key=String(productKey||''),p=c.pid(purchaseId);
 if(!id)return{status:'invalid_user'};if(p.length<8)return{status:'invalid_idempotency_key'};
 await c.balances(id);let old=await c.getPurchase(id,p);if(old)return c.shapePurchase(old,await c.balances(id),true);
 const product=await c.getProduct(key);if(!product||!product.enabled)return{status:'invalid_product'};
 if(product.category==='buff'&&process.env.BUFFS_FEATURE_ENABLED==='false')return{status:'buff_feature_disabled'};
 if(product.category==='cosmetic'){
  if(process.env.COSMETICS_FEATURE_ENABLED==='false')return{status:'cosmetics_feature_disabled'};
  const gate=await prestige.marketGate(id);if(!gate.eligible)return{status:'level_locked',minimumLevel:gate.minimumLevel,level:gate.level,...await c.balances(id)};
  const own=await c.sql`SELECT 1 FROM cosmetic_ownerships WHERE user_id=${id} AND cosmetic_key=${key} LIMIT 1`;if(own.length)return{status:'already_owned',...await c.balances(id)};
 }
 for(let attempt=0;attempt<3;attempt++)try{
  const out=product.category==='clean_cards'?await clean.run(id,product,p):product.category==='buff'?await buff.run(id,product,p):product.category==='cosmetic'?await cosmetic.run(id,product,p):await runPack(id,product,p),final=out[out.length-1]?.[0];
  if(final)return c.shapePurchase(final,{dirtyBalance:Number(final.dirty_balance||0),whiteBalance:Number(final.white_balance||0),blackBalance:Number(final.black_balance||0)},false);
  break;
 }catch(e){old=await c.getPurchase(id,p);if(old)return c.shapePurchase(old,await c.balances(id),true);if(RETRYABLE.has(String(e.code))&&attempt<2)continue;throw e;}
 const b=await c.balances(id);if(product.category==='cosmetic'){
  const gate=await prestige.marketGate(id);if(!gate.eligible)return{status:'level_locked',minimumLevel:gate.minimumLevel,level:gate.level,...b};
  const own=await c.sql`SELECT 1 FROM cosmetic_ownerships WHERE user_id=${id} AND cosmetic_key=${key} LIMIT 1`;if(own.length)return{status:'already_owned',...b};
 }
 if(b.dirtyBalance<Number(product.price))return{status:'insufficient_dirty_coins',price:Number(product.price),...b};
 if(product.category==='card_pack'){const available=await c.availablePackCards(id),required=Number(product.config?.quantity||0);if(product.product_kind==='pack_random'&&available===0)return{status:'empty_pool',available,...b};if(product.product_kind==='pack_best_world'&&available<required)return{status:'insufficient_pool',available,required,...b};}
 return{status:'unavailable',...b};
}
module.exports={purchase};
