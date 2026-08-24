'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('public/index.html'),mobile=read('public/css/mobileFormsCurrent.css'),marketCss=read('public/css/marketplace.css'),accountCss=read('public/css/accountCurrent.css'),audio=read('public/js/domains/audioUI.js'),account=read('public/js/domains/accountUI.js'),market=read('public/js/domains/marketplaceUI.js'),roomLife=read('public/js/core/roomSocketLifecycle.js'),gameLife=read('public/js/core/gameplaySocketLifecycle.js'),gameplay=read('public/js/domains/gameplayUI.js'),ready=read('api/rooms/ready.js'),finalReward=read('public/js/finalRewardUI.js'),rewards=read('public/js/domains/rewardsUI.js'),loot=read('public/js/lootUI.js');

test('release candidate preserva hardening mobile/iPhone já consolidado',()=>{
 assert.match(index,/<meta name="viewport" content="width=device-width, initial-scale=1\.0">/);
 assert.match(mobile,/@supports \(-webkit-touch-callout:none\)/);
 assert.match(mobile,/input,textarea,select,\.input\{font-size:16px!important\}/);
 assert.match(marketCss,/100dvh/);
 assert.match(marketCss,/env\(safe-area-inset-top\)/);
 assert.match(marketCss,/env\(safe-area-inset-bottom\)/);
 assert.match(marketCss,/@media\(max-height:500px\) and \(max-width:900px\)/);
 assert.match(audio,/\['touchstart','touchend','pointerdown','pointerup','click','keydown'\]/);
 assert.match(audio,/pageshow/);
 assert.match(audio,/visibilitychange/);
});

test('primeiro paint da conta preserva ícones e carteira sem fetch remoto concorrente',()=>{
 assert.match(account,/HomeScreen\.renderAccount=function/);
 assert.match(account,/CartMarketplaceDomain\?\.mountBalance\?\.\(\)/);
 assert.match(market,/knownBalance=explicit/);
 assert.match(market,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(market,/localStorage\.getItem\(cacheKey\(\)\)/);
 assert.doesNotMatch(account,/refreshBalance\?\.\('home_render'\)/);
 assert.match(market,/walletRefreshPromise/);
 assert.match(accountCss,/p56-account-action-icon[\s\S]*display:grid!important/);
 assert.match(accountCss,/p74-wallet-slot[\s\S]*visibility:visible!important/);
});

test('pipeline multiplayer crítico mantém sala, ready, grace period e rodada/game over',()=>{
 for(const evt of ['room_created','room_joined','cards_submitted','room_cancelled','player_reconnected'])assert.ok(roomLife.includes(`SocketClient.on('${evt}'`),evt);
 assert.match(ready,/NO_CONTRIBUTION_LOOT_WARNING/);
 assert.match(ready,/readiness\.setReady/);
 assert.match(ready,/broadcast\(room\.code,'cards_submitted'/);
 assert.match(gameplay,/insufficient_players_started/);
 assert.match(gameplay,/insufficient_players_cancelled/);
 assert.match(gameplay,/minimum_players_sync/);
 assert.match(gameplay,/remainingSeconds\|\|60/);
 assert.match(gameplay,/setInterval\(\(\)=>this\.tick\(\),250\)/);
 for(const evt of ['new_round','card_played','all_cards_played','round_result','game_over'])assert.ok(gameLife.includes(`SocketClient.on('${evt}'`),evt);
});

test('Saqueador e Espólio permanecem ligados ao game over sem misturar recompensas',()=>{
 assert.match(finalReward,/buff_saqueador/);
 assert.match(finalReward,/placementPot/);
 assert.match(finalReward,/finalizeRewards\(this\.code\)/);
 assert.match(finalReward,/final_reward_settled/);
 assert.match(finalReward,/CartRewardsDomain\?\.onFinalRewardSettled/);
 assert.match(rewards,/installFinalReward/);
 assert.match(rewards,/installLootGameOver/);
 assert.match(rewards,/onFinalRewardSettled/);
 assert.match(loot,/\/api\/loot/);
 assert.match(loot,/claimId:claimId\(\)/);
 assert.match(loot,/this\.selected\.size>=Number\(this\.current\.claimableQuota\|\|0\)/);
 assert.match(loot,/🧬 Criada por/);
});

test('release candidate mantém legado PXX não executável e owners canônicos executáveis',()=>{
 assert.match(index,/type="application\/x-cartaralho-legacy" src="js\/meta\.js"/);
 assert.match(index,/type="application\/x-cartaralho-legacy" src="js\/p73\.js\?v=1\.4\.73"/);
 assert.match(index,/<script src="js\/core\/socketLifecycle\.js\?v=domain-1"><\/script>/);
 assert.match(index,/<script src="js\/domains\/accountUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script src="js\/domains\/gameplayUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script src="js\/domains\/rewardsUI\.js\?v=domain-2"><\/script>/);
});
