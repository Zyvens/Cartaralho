'use strict';
const MATERIAL_THRESHOLDS=[{key:'copper',label:'Bronze',min:10},{key:'silver',label:'Prata',min:30},{key:'gold',label:'Ouro',min:60},{key:'platinum',label:'Platina',min:100}];
const BORDER_THRESHOLDS=[{key:'copper',label:'Bronze',min:10},{key:'silver',label:'Prata',min:30},{key:'gold',label:'Ouro',min:60},{key:'platinum',label:'Platina',min:100}];
const LEGACY_THRESHOLDS=[{key:'nascente',label:'Nascente',min:0},{key:'espalhando',label:'Espalhando',min:4},{key:'viral',label:'Viral',min:12},{key:'classico',label:'Clássico',min:30},{key:'folclore',label:'Folclore',min:60}];
const LEGACY_WEIGHTS={reach:1,adoption:1.4,coincidence:.8,presence:1.1,wins:1.3};
function tierFor(score,kind='material'){const thresholds=kind==='border'?BORDER_THRESHOLDS:MATERIAL_THRESHOLDS,n=Math.max(0,Number(score)||0);let tier={key:'standard',label:'Sem tier',min:0};for(const t of thresholds)if(n>=t.min)tier=t;return tier;}
function progressFor(score,kind='material'){const thresholds=kind==='border'?BORDER_THRESHOLDS:MATERIAL_THRESHOLDS,n=Math.max(0,Number(score)||0),current=tierFor(n,kind),next=thresholds.find(t=>n<t.min)||null;return{score:n,tier:current.key,label:current.label,nextTier:next?.key||null,nextLabel:next?.label||null,target:next?.min||null,remaining:next?Math.max(0,next.min-n):0};}
function legacyScore({reach=0,adoption=0,coincidence=0,presence=0,wins=0}={}){const log=v=>Math.log1p(Math.max(0,Number(v)||0));return log(reach)*LEGACY_WEIGHTS.reach+log(adoption)*LEGACY_WEIGHTS.adoption+log(coincidence)*LEGACY_WEIGHTS.coincidence+log(presence)*LEGACY_WEIGHTS.presence+log(wins)*LEGACY_WEIGHTS.wins;}
function legacyLevel(score){const n=Math.max(0,Number(score)||0);let level=LEGACY_THRESHOLDS[0];for(const t of LEGACY_THRESHOLDS)if(n>=t.min)level=t;return level;}
module.exports={MATERIAL_THRESHOLDS,BORDER_THRESHOLDS,LEGACY_THRESHOLDS,LEGACY_WEIGHTS,tierFor,progressFor,legacyScore,legacyLevel};
