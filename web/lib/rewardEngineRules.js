'use strict';
const REWARD_ENGINE_VERSION='dirty-coins-v1';
const clamp=(min,max,value)=>Math.max(min,Math.min(max,Number(value)||0));
function effortIndex(pointsToWin,effectivePlayers){const p=clamp(3,20,pointsToWin),n=clamp(3,10,effectivePlayers);return Math.pow(p/10,1.35)*Math.pow(n/6,0.80);}
function rewardCurve(pointsToWin,effectivePlayers){const effort=effortIndex(pointsToWin,effectivePlayers),multiplier=Math.pow(effort,1.35),survival=Math.max(0,Math.round(50*(multiplier-1)));return{engineVersion:REWARD_ENGINE_VERSION,effort,multiplier,survival,placement:[Math.round(150*multiplier),Math.round(75*multiplier),Math.round(40*multiplier)]};}
function payoutForPosition(position,totalPlayers,curve,survivalEligible){const placement=position>=1&&position<=3?curve.placement[position-1]:0,survival=survivalEligible?curve.survival:0,consolation=totalPlayers>3&&position===totalPlayers?1:0;return{placement,survival,consolation,total:placement+survival+consolation};}
module.exports={REWARD_ENGINE_VERSION,clamp,effortIndex,rewardCurve,payoutForPosition};
