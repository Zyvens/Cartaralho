'use strict';
function baseLootQuota(position){const p=Math.max(1,Math.trunc(Number(position)||1));if(p===1)return 10;if(p===2)return 7;if(p===3)return 5;return 3;}
function requestedLootQuota(position,effort){const base=baseLootQuota(position),e=Math.max(0,Number(effort)||0);return Math.max(1,Math.round(base*e));}
function finalLootQuota(position,effort,eligibleCount){return Math.min(Math.max(0,Math.trunc(Number(eligibleCount)||0)),requestedLootQuota(position,effort));}
module.exports={baseLootQuota,requestedLootQuota,finalLootQuota};
