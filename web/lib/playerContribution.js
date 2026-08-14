'use strict';
function cleanCount(list){return(list||[]).reduce((n,v)=>n+(String(v||'').trim()?1:0),0);}
function count(player){return cleanCount(player?.blackCards)+cleanCount(player?.whiteCards);}
// Regra de produto: mesas configuradas sem criação de Cartas de Jogador não aplicam Mão de Vaca,
// mesmo que ainda permitam selecionar cartas antigas da coleção.
function requirementEnabled(room){return room?.cardCreationEnabled!==false;}
function currentEligibility(room,player){return !requirementEnabled(room)||count(player)>0;}
function status(room,player){const contributionCount=count(player),contributionRequired=requirementEnabled(room),lootEligible=!contributionRequired||contributionCount>0;return{contributionCount,contributionRequired,lootEligible,requiresConfirmation:contributionRequired&&!lootEligible};}
function freeze(room,player){const s=status(room,player);player.contributionCount=s.contributionCount;player.lootEligible=s.lootEligible;return s;}
function clearFreeze(player){if(!player)return;delete player.contributionCount;delete player.lootEligible;}
// A liquidação revalida a seleção final e as regras atuais da sala; o snapshot de Pronto é apenas feedback de Lobby.
function finalEligibility(room,player){return currentEligibility(room,player);}
module.exports={cleanCount,count,requirementEnabled,currentEligibility,status,freeze,clearFreeze,finalEligibility};
