'use strict';
const{sql}=require('./db');
const defs=require('./prestigeDefinitions');
const id=x=>Number(x)||0;

function cosmeticRow(row){
 const cfg=row.config||{},type=cfg.cosmeticType||row.cosmetic_type,rarity=cfg.rarity||'rare',key=cfg.equipKey||row.cosmetic_key;
 return{key,productKey:row.product_key||row.cosmetic_key,name:row.name,icon:cfg.icon||(type==='frame'?'◉':'🏷️'),rarity,description:row.description||'',source:'cosmetic',isCosmetic:true,unlocked:true,progress:1,target:1,rarityInfo:defs.rarityInfo(rarity),cosmeticType:type,price:Number(row.price||0),acquiredAt:row.acquired_at||null};
}

async function owned(userId){
 return sql`SELECT co.cosmetic_key,co.cosmetic_type,co.acquisition_source,co.acquired_at,mc.product_key,mc.name,mc.description,mc.price,mc.config FROM cosmetic_ownerships co JOIN market_catalog mc ON mc.product_key=co.cosmetic_key WHERE co.user_id=${id(userId)} ORDER BY co.acquired_at,co.cosmetic_key`;
}
async function entitlements(userId){return sql`SELECT entitlement_key,source_type,snapshot_key,metadata,granted_at FROM special_entitlements WHERE user_id=${id(userId)} AND entitlement_type='title' ORDER BY granted_at,entitlement_key`;}

async function profileState(userId){
 const[rows,ents]=await Promise.all([owned(userId),entitlements(userId)]),titles=[],frames=[];
 for(const r of rows){const item=cosmeticRow(r);(item.cosmeticType==='title'?titles:frames).push(item);}
 for(const e of ents){const d=defs.SPECIAL_TITLES[e.entitlement_key];if(!d)continue;titles.push({...d,unlocked:true,progress:1,target:1,isEntitlement:true,rarityInfo:defs.rarityInfo(d.rarity),entitlementSource:e.source_type,snapshotKey:e.snapshot_key||null,grantedAt:e.granted_at});}
 return{titles,frames,ownerships:rows.map(cosmeticRow),entitlements:ents,rarities:defs.RARITIES};
}

async function canEquipTitle(userId,key){if(!key)return true;const state=await profileState(userId);return state.titles.some(x=>x.key===key&&x.unlocked);}
async function canEquipFrame(userId,key){if(!key)return true;const state=await profileState(userId);return state.frames.some(x=>x.key===key&&x.unlocked);}
async function marketGate(userId){const rows=await sql`SELECT xp FROM users WHERE id=${id(userId)} LIMIT 1`,xp=Number(rows[0]?.xp||0),level=defs.levelFromXp(xp);return{xp,level,minimumLevel:defs.MIN_COSMETIC_LEVEL,eligible:level>=defs.MIN_COSMETIC_LEVEL};}

module.exports={cosmeticRow,owned,entitlements,profileState,canEquipTitle,canEquipFrame,marketGate,...defs};
