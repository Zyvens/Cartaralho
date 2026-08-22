'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const canonical=read('public/js/canonicalCardBadge.js'),progression=read('public/js/cardProgressionUI.js'),rewards=read('public/js/domains/rewardsUI.js'),stats=read('public/js/domains/statsUI.js'),cards=read('public/js/domains/cardsLibrary.js'),credits=read('public/js/creditsPolish.js'),polish=read('public/js/domains/uiPolishUI.js'),missionLegacy=read('public/js/missionLayoutSafe.js'),missions=read('public/js/domains/missionsUI.js'),grace=read('public/js/minimumPlayersGrace.js'),gameplay=read('public/js/domains/gameplayUI.js'),refinement=read('public/js/uiRefinement2.js'),prestige=read('public/js/prestigeUI.js'),identity=read('public/js/domains/identityUI.js'),profile=read('public/js/domains/profileUI.js'),market=read('public/js/domains/marketplaceUI.js'),recycling=read('public/js/marketplaceRecycling.js');

test('canonicalCardBadge é owner apenas da autoria original',()=>{
 assert.match(canonical,/CARTA ORIGINAL/);
 assert.match(canonical,/p57-library-card-shell/);
 assert.doesNotMatch(canonical,/renderAccount\s*=/);
 assert.doesNotMatch(canonical,/renderStats\s*=/);
 assert.doesNotMatch(canonical,/dirty-coins-balance/);
 assert.doesNotMatch(canonical,/SocketClient\.on\('game_over'/);
});

test('payout pós-partida pertence a rewardsUI',()=>{
 assert.match(rewards,/SocketClient\.on\('game_over',notifyMatchPayout\)/);
 assert.match(rewards,/Moedas Sujas nesta partida/);
 assert.match(rewards,/payoutListenerRegistered/);
});

test('progressão antiga não compete mais com a biblioteca canônica',()=>{
 assert.doesNotMatch(progression,/HomeScreen\.renderCards\s*=/);
 assert.match(cards,/HomeScreen\.renderCards=render/);
 assert.match(cards,/CartCardProgression\.track\('material'/);
 assert.match(cards,/CartCardProgression\.track\('border'/);
});

test('Meu Legado sobrevive sobre o renderer final de Estatísticas',()=>{
 assert.match(stats,/HomeScreen\.renderStats=render/);
 assert.match(progression,/addEventListener\('load',installStatsExtension/);
 assert.match(progression,/my-card-legacy/);
 assert.match(progression,/\/api\/profile\/legacy/);
 assert.match(progression,/SocketClient\.on\('round_result',celebrateOriginalPlay\)/);
});

test('creditsPolish não é mais writer e UI polish preserva o resultado',()=>{
 assert.match(credits,/status:'SUPERSEDED'/);
 assert.doesNotMatch(credits,/addEventListener\('click'/);
 assert.match(polish,/ensureCreditsProducedBy/);
 assert.match(polish,/Produzido por:/);
 assert.match(polish,/\[data-panel=\\"credits\\"\]/);
});

test('missionLayoutSafe foi supersedido e missão canônica preserva moedas XP e BUFF',()=>{
 assert.match(missionLegacy,/status:'SUPERSEDED'/);
 assert.doesNotMatch(missionLegacy,/MetaUI\.missionRow\s*=/);
 assert.doesNotMatch(missionLegacy,/ProfileModal\.missionCard\s*=/);
 assert.match(missions,/p52-mission-coin-pill/);
 assert.match(missions,/mission-xp-pill/);
 assert.match(missions,/buffReward/);
 assert.match(missions,/p10-mission-buff/);
});

test('minimum player grace mantém UI sem listeners e gameplay owns os bindings uma vez',()=>{
 assert.match(grace,/const MinimumPlayersGrace=/);
 assert.match(grace,/remainingSeconds\|\|60/);
 assert.match(grace,/setInterval\(\(\)=>this\.tick\(\),250\)/);
 assert.doesNotMatch(grace,/SocketClient\.on\(/);
 for(const event of ['insufficient_players_started','insufficient_players_cancelled','minimum_players_sync'])assert.match(gameplay,new RegExp(`SocketClient\\.on\\('${event}'`));
 for(const event of ['game_over','room_closed','room_cancelled'])assert.match(gameplay,new RegExp(`'${event}'`));
 assert.match(gameplay,/__domainMinimumPlayersGrace/);
});

test('uiRefinement2 foi supersedido sem perder copy/identidade e sem renderer concorrente de Cartas',()=>{
 assert.match(refinement,/status:'SUPERSEDED'/);
 assert.doesNotMatch(refinement,/ProfessionalUI\.renderCards\s*=/);
 assert.match(polish,/polishHomeCopy/);
 assert.match(polish,/Abra uma mesa/);
 assert.match(polish,/polishPlayIdentity/);
 assert.match(polish,/APELIDO DA PARTIDA/);
 assert.match(cards,/HomeScreen\.renderCards=render/);
});

test('prestigeUI foi absorvido por identidade/perfil',()=>{
 assert.match(prestige,/status:'SUPERSEDED'/);
 for(const key of ['cliente-preferencial','lavador-de-moedinhas','patrocinador-do-caos','dinheiro-nao-compra-talento','herdeiro-do-cartaralho','patrimonio-inexplicavel','o-criador','betinha'])assert.match(identity,new RegExp(key));
 assert.match(identity,/celestial/);
 assert.match(profile,/rarity-celestial/);
 assert.doesNotMatch(prestige,/MetaUI\.titleName\s*=/);
 assert.doesNotMatch(prestige,/ProfileModal\.rarityLegend\s*=/);
});

test('reciclagem não pode achatar o markup canônico da carteira após pagamento',()=>{
 assert.match(recycling,/this\.syncBalances\(m\)/,'recycle ainda delega a sincronização');
 assert.match(market,/R\.syncBalances=function\(m\)/,'domain substitui o sincronizador histórico');
 assert.match(market,/applyBalance\(v,\{source:'recycling_sync'/);
 assert.match(market,/cartaralho:wallet-updated/);
 const owned=market.match(/R\.syncBalances=function\(m\)[\s\S]*?return ok;\};/i)?.[0]||'';
 assert.doesNotMatch(owned,/\.textContent\s*=\s*`?🪙/);
 assert.match(market,/p65-balance-icon/);
 assert.match(market,/p49-balance-value/);
});
