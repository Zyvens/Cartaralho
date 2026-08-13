'use strict';
const c=require('./marketplaceCommon'),clean=require('./marketplaceClean'),packs=require('./marketplacePacks');
const RETRYABLE=new Set(['40001','23505']);
async function purchase(userId,productKey,purchaseId){
 const id=c.uid(userId),key=String(productKey||''),p=c.pid(purchaseId);
 if(!id)return{status:'invalid_user'};if(p.length<8)return{status:'invalid_idempotency_key'};
 await c.balances(id);let old=await c.getPurchase(id,p);if(old)return c.shapePurchase(old,await c.balances(id),true);
 const product=await c.getProduct(key);if(!product||!product.enabled)return{status:'invalid_product'};
 for(let attempt=0;attempt<3;attempt++)try{
  const out=product.category==='clean_cards'?await clean.run(id,product,p):await packs.run(id,product,p),final=out[out.length-1]?.[0];
  if(final)return c.shapePurchase(final,{dirtyBalance:Number(final.dirty_balance||0),whiteBalance:Number(final.white_balance||0),blackBalance:Number(final.black_balance||0)},false);
  break;
 }catch(e){old=await c.getPurchase(id,p);if(old)return c.shapePurchase(old,await c.balances(id),true);if(RETRYABLE.has(String(e.code))&&attempt<2)continue;throw e;}
 const b=await c.balances(id);if(b.dirtyBalance<Number(product.price))return{status:'insufficient_dirty_coins',price:Number(product.price),...b};
 if(product.category==='card_pack'){const available=await c.availablePackCards(id),required=Number(product.config?.quantity||0);if(product.product_kind==='pack_random'&&available===0)return{status:'empty_pool',available,...b};if(product.product_kind==='pack_best_world'&&available<required)return{status:'insufficient_pool',available,required,...b};}
 return{status:'unavailable',...b};
}
module.exports={purchase};
