'use strict';
const playerStats=require('./playerStats');
const lootRules=require('./matchLootRules');
const clamp=(min,max,value)=>Math.max(min,Math.min(max,Number(value)||0));
const CLASSES=[
 {key:'relampago',min:0,label:'Relâmpago',icon:'⚡',duration:'muito curta'},
 {key:'casual',min:.5,label:'Casual',icon:'🎴',duration:'curta'},
 {key:'padrao',min:.9,label:'Padrão',icon:'🎯',duration:'moderada'},
 {key:'longa',min:1.25,label:'Longa',icon:'🕒',duration:'longa'},
 {key:'maratona',min:2,label:'Maratona',icon:'🏃',duration:'muito longa'},
 {key:'insana',min:3,label:'Insana',icon:'☠️',duration:'muito longa'}
];
function matchClass(effort){const e=Math.max(0,Number(effort)||0);let out=CLASSES[0];for(const row of CLASSES)if(e>=row.min)out=row;return{...out};}
function preview({pointsToWin=10,participants=6,handSize=5}={}){
 const points=Math.round(clamp(3,20,pointsToWin)),players=Math.round(clamp(3,10,participants)),hand=Math.round(clamp(5,15,handSize));
 const curve=playerStats.rewardCurve(points,players),klass=matchClass(curve.effort);
 const payout=position=>playerStats.payoutForPosition(position,players,curve,true);
 const first=payout(1),second=payout(2),third=payout(3),other=players>3?payout(4):null,last=players>3?payout(players):null;
 return{engineVersion:curve.engineVersion,pointsToWin:points,participants:players,handSize:hand,effort:curve.effort,moneyMultiplier:curve.multiplier,class:klass,payouts:{first,second,third,other,last,survivalBonus:curve.survival},loot:{first:lootRules.requestedLootQuota(1,curve.effort),second:lootRules.requestedLootQuota(2,curve.effort),third:lootRules.requestedLootQuota(3,curve.effort),other:players>3?lootRules.requestedLootQuota(4,curve.effort):0}};
}
function freezeRoom(room){
 const participants=Array.from(room.players?.values?.()||[]).filter(p=>p.active!==false).length;
 const p=preview({pointsToWin:room.pointsToWin,participants,handSize:room.handSize});
 return{engineVersion:p.engineVersion,pointsToWin:p.pointsToWin,participantsAtStart:p.participants,maxPlayersConfigured:Number(room.maxPlayers)||p.participants,handSizeAtStart:p.handSize,effortAtStart:p.effort,moneyMultiplierAtStart:p.moneyMultiplier,classKey:p.class.key,classLabel:p.class.label,frozenAt:new Date().toISOString()};
}
module.exports={CLASSES,matchClass,preview,freezeRoom};
