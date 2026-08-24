'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reward=require('../lib/rewardEngineRules'),loot=require('../lib/matchLootRules'),{CONFIG}=require('../lib/balanceConfig');
const advanced=read('lib/advancedRewards.js'),matchLoot=read('lib/matchLoot.js'),contribution=read('lib/playerContribution.js');

test('premiação base e elegibilidade econômica permanecem centralizadas',()=>{
 assert.deepEqual(CONFIG.reward.placementBase,[150,75,40]);assert.equal(CONFIG.reward.consolation,1);assert.equal(reward.MINIMUM_PARTICIPATION,.70);
 assert.deepEqual(CONFIG.loot.placementBase,[10,7,5]);assert.equal(CONFIG.loot.otherBase,3);
});

test('colocação, sobrevivência e consolação são componentes independentes',()=>{
 const curve={placement:[150,75,40],survival:25};
 assert.deepEqual(reward.payoutForPosition(1,5,curve,true),{placement:150,survival:25,consolation:0,total:175});
 assert.deepEqual(reward.payoutForPosition(5,5,curve,true),{placement:0,survival:25,consolation:1,total:26});
 assert.deepEqual(reward.payoutForPosition(5,5,curve,false),{placement:0,survival:0,consolation:1,total:1});
 assert.deepEqual(reward.payoutForPosition(3,3,curve,false),{placement:40,survival:0,consolation:0,total:40});
});

test('Espólio escala por esforço mas nunca supera cartas elegíveis',()=>{
 assert.equal(loot.baseLootQuota(1),10);assert.equal(loot.baseLootQuota(2),7);assert.equal(loot.baseLootQuota(3),5);assert.equal(loot.baseLootQuota(4),3);
 assert.equal(loot.requestedLootQuota(1,1),10);assert.equal(loot.requestedLootQuota(4,2),6);
 assert.equal(loot.finalLootQuota(1,1,4),4);assert.equal(loot.finalLootQuota(1,1,20),10);assert.equal(loot.finalLootQuota(4,2,3),3);
});

test('Mão de Vaca de contribuição só existe quando criação de Cartas de Jogador está ativa',()=>{
 assert.match(contribution,/room\?\.cardCreationEnabled!==false/);
 assert.match(contribution,/lootEligible=!contributionRequired\|\|contributionCount>0/);
 assert.match(matchLoot,/contribution\.requirementEnabled\(room\)/);
 assert.match(matchLoot,/contribution\.finalEligibility\(room,p\)/);
 assert.match(matchLoot,/eligible_count=0,quota=0,status='empty'/);
});

test('partida inválida não gera recompensa nem Espólio econômico válido',()=>{
 assert.match(advanced,/valid=!!\(validForRewards&&part\.totalRounds>0&&eligible\.length>=3\)/);
 assert.match(matchLoot,/valid:validForRewards!==false&&rounds>0&&players>=3/);
 assert.match(matchLoot,/settle_match_loot\(\$\{room\.code\},\$\{e\.valid\}/);
});

test('Saqueador redistribui somente o pote de colocação',()=>{
 assert.match(advanced,/pot\+=reward\.placement/);
 assert.match(advanced,/placement=raiders\.length\?0:Number\(r\.placement_reward\|\|0\)/);
 assert.match(advanced,/survival=Number\(r\.survival_reward\|\|0\)/);
 assert.match(advanced,/consolation=Number\(r\.consolation_reward\|\|0\)/);
 assert.match(advanced,/match_saqueador/);assert.match(advanced,/WINDOW_SECONDS=15/);
});

test('liquidação e claim permanecem idempotentes',()=>{
 assert.match(advanced,/ON CONFLICT\(idempotency_key\) DO NOTHING/);
 assert.match(advanced,/isolationMode:'Serializable'/);
 assert.match(matchLoot,/claim_match_loot\(/);
 assert.match(matchLoot,/if\(result\.status==='ok'&&!result\.replayed\)/);
});
