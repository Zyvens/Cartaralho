'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const canonical=read('public/js/canonicalCardBadge.js'),progression=read('public/js/cardProgressionUI.js'),rewards=read('public/js/domains/rewardsUI.js'),stats=read('public/js/domains/statsUI.js'),cards=read('public/js/domains/cardsLibrary.js');

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
