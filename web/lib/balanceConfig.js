'use strict';

const DEFAULTS={
  version:'metagame-v1.4-p16',
  reward:{
    engineVersion:'dirty-coins-v1',
    pointsMin:3,pointsMax:20,playersMin:3,playersMax:10,
    pointsBaseline:10,playersBaseline:6,
    pointsExponent:1.35,playersExponent:.80,multiplierExponent:1.35,
    survivalCoefficient:50,minimumParticipation:.70,
    placementBase:[150,75,40],consolation:1
  },
  durationClasses:[
    {key:'relampago',min:0,label:'Relâmpago',icon:'⚡',duration:'muito curta'},
    {key:'casual',min:.5,label:'Casual',icon:'🎴',duration:'curta'},
    {key:'padrao',min:.9,label:'Padrão',icon:'🎯',duration:'moderada'},
    {key:'longa',min:1.25,label:'Longa',icon:'🕒',duration:'longa'},
    {key:'maratona',min:2,label:'Maratona',icon:'🏃',duration:'muito longa'},
    {key:'insana',min:3,label:'Insana',icon:'☠️',duration:'muito longa'}
  ],
  loot:{placementBase:[10,7,5],otherBase:3},
  recycling:{batchSize:10,rewardPerBatch:250},
  bestWorld:{winsLog:2,winRate:3,minWinRateUses:5,presenceLog:1.3,adoptionsLog:1.5,reachLog:1.1,ageLog:.5,ageSeconds:2592000}
};

function clone(v){return JSON.parse(JSON.stringify(v));}
function mergeKnown(base,over){
  if(Array.isArray(base))return Array.isArray(over)?clone(over):clone(base);
  if(base&&typeof base==='object'){
    const out={};
    for(const[k,v]of Object.entries(base))out[k]=mergeKnown(v,over&&typeof over==='object'?over[k]:undefined);
    return out;
  }
  if(over===undefined||over===null)return base;
  if(typeof base==='number'){const n=Number(over);return Number.isFinite(n)?n:base;}
  return typeof over===typeof base?over:base;
}
function parseOverrides(raw){
  if(!raw)return{};
  if(typeof raw==='object')return raw;
  try{const x=JSON.parse(String(raw));return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}catch(_){return{};}
}
function buildConfig(raw){return mergeKnown(DEFAULTS,parseOverrides(raw));}
function deepFreeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.freeze(v);for(const x of Object.values(v))deepFreeze(x);}return v;}
const CONFIG=deepFreeze(buildConfig(process.env.BALANCE_OVERRIDES_JSON));

module.exports={DEFAULTS,CONFIG,buildConfig,parseOverrides};
