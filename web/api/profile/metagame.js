'use strict';
const{withErrors,ok,requireMethod}=require('../../lib/http');
const{requireUser}=require('../../lib/auth');
const{syncUnlocks,RARITIES}=require('../../lib/metaGame');
const{syncMissions}=require('../../lib/missionService');
const{sql}=require('../../lib/db');
const prestige=require('../../lib/prestigeService');
const p19=require('../../lib/achievementBackfillP19');

const SPECIAL_FRAMES={
 'mission-weekly':{key:'mission-weekly',name:'Missão Cumprida',icon:'🎯',rarity:'superrare',description:'Complete todas as missões semanais legadas de uma mesma semana.',target:1,progress:1,unlocked:true},
 'xp-10000':{key:'xp-10000',name:'Viciado(a) Oficial',icon:'⚡',rarity:'legendary',description:'Acumule 10.000 XP em missões e Legado.',target:1,progress:1,unlocked:true},
 'genese-celestial':{...prestige.SPECIAL_FRAMES['genese-celestial'],target:1,progress:1,unlocked:true,isEntitlement:true}
};
const PROGRESSION_FRAMES={
 bronze:{name:'Bronze',description:'Tenha 5 cartas Bronze no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.'},
 silver:{name:'Prata',description:'Tenha 5 cartas Prata no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.'},
 gold:{name:'Ouro',description:'Tenha 5 cartas Ouro no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.'},
 platinum:{name:'Platina',description:'Tenha 5 cartas Platina no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.'}
};
const normalizeFrame=f=>PROGRESSION_FRAMES[f?.key]?{...f,...PROGRESSION_FRAMES[f.key],progressionFrame:true}:f;
const RARITY_LABELS={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário',celestial:'Celestial'};
const RARITY_ORDER={common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6};
function rarityInfo(key){if(key==='celestial')return prestige.rarityInfo('celestial');const base=RARITIES[key]||RARITIES.common||{};return{...base,label:RARITY_LABELS[key]||base.label||'Comum'};}
const byRarity=(a,b)=>(RARITY_ORDER[a?.rarity]||99)-(RARITY_ORDER[b?.rarity]||99)||String(a?.name||'').localeCompare(String(b?.name||''),'pt-BR');

module.exports=withErrors(async(req,res)=>{
 if(!requireMethod(req,res,'GET'))return;
 const user=await requireUser(req,res);if(!user)return;
 await p19.sync(user.id);
 const[state,missions,p11]=await Promise.all([syncUnlocks(user.id),syncMissions(user.id),prestige.profileState(user.id)]);
 const fresh=(await sql`SELECT equipped_title_key,equipped_frame_key,xp FROM users WHERE id=${user.id}`)[0]||{};
 const extra=await sql`SELECT unlock_key FROM user_unlocks WHERE user_id=${user.id} AND unlock_type='frame' UNION SELECT entitlement_key AS unlock_key FROM special_entitlements WHERE user_id=${user.id} AND entitlement_type='frame'`;
 const titles=[...state.titles.map(t=>({...t,rarityInfo:rarityInfo(t.rarity)})),...p11.titles];
 const frames=[...state.frames.map(f=>normalizeFrame({...f,rarityInfo:rarityInfo(f.rarity)})),...p11.frames.map(normalizeFrame)];
 const achievements=(state.achievements||[]).map(a=>({...a,rarityInfo:rarityInfo(a.rarity)}));
 const specialKeys=new Set(extra.map(r=>r.unlock_key));
 if(fresh.equipped_frame_key&&SPECIAL_FRAMES[fresh.equipped_frame_key])specialKeys.add(fresh.equipped_frame_key);
 for(const key of specialKeys){const f=SPECIAL_FRAMES[key];if(f&&!frames.some(x=>x.key===f.key))frames.push({...f,rarityInfo:rarityInfo(f.rarity)});}
 titles.sort(byRarity);frames.sort(byRarity);achievements.sort(byRarity);
 const rarities={...Object.fromEntries(Object.keys(RARITIES).map(k=>[k,rarityInfo(k)])),celestial:prestige.rarityInfo('celestial')};
 ok(res,{rarities,metrics:state.metrics,titles,frames,achievements,equipped:{titleKey:fresh.equipped_title_key||null,frameKey:fresh.equipped_frame_key||null},xp:Number(fresh.xp||missions.xp||0),level:Math.floor(Number(fresh.xp||missions.xp||0)/1000)+1,missions:missions.missions,newUnlocks:state.newUnlocks||[],royalties:state.royalties||[],achievementsV2Enabled:process.env.ACHIEVEMENTS_V2_ENABLED!=='false',cosmeticsFeatureEnabled:process.env.COSMETICS_FEATURE_ENABLED!=='false',prestige:{ownerships:p11.ownerships,entitlements:p11.entitlements}});
});
