'use strict';
const{CONFIG}=require('./balanceConfig');
const R=CONFIG.reward,REWARD_ENGINE_VERSION=R.engineVersion,MINIMUM_PARTICIPATION=R.minimumParticipation;
const clamp=(min,max,value)=>Math.max(min,Math.min(max,Number(value)||0));
function effortIndex(pointsToWin,effectivePlayers){const p=clamp(R.pointsMin,R.pointsMax,pointsToWin),n=clamp(R.playersMin,R.playersMax,effectivePlayers);return Math.pow(p/R.pointsBaseline,R.pointsExponent)*Math.pow(n/R.playersBaseline,R.playersExponent);}
function rewardCurve(pointsToWin,effectivePlayers){const effort=effortIndex(pointsToWin,effectivePlayers),multiplier=Math.pow(effort,R.multiplierExponent),survival=Math.max(0,Math.round(R.survivalCoefficient*(multiplier-1)));return{engineVersion:REWARD_ENGINE_VERSION,effort,multiplier,survival,placement:R.placementBase.map(x=>Math.round(x*multiplier))};}
function payoutForPosition(position,totalPlayers,curve,survivalEligible){const placement=position>=1&&position<=3?curve.placement[position-1]:0,survival=survivalEligible?curve.survival:0,consolation=totalPlayers>3&&position===totalPlayers?R.consolation:0;return{placement,survival,consolation,total:placement+survival+consolation};}
module.exports={REWARD_ENGINE_VERSION,MINIMUM_PARTICIPATION,clamp,effortIndex,rewardCurve,payoutForPosition};
