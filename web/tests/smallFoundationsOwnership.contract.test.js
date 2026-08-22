'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fixes=read('public/js/metaFixes.js'),identity=read('public/js/domains/identityUI.js'),roomLifecycle=read('public/js/core/roomSocketLifecycle.js'),preview=read('public/js/rewardPreviewUI.js'),roomRules=read('public/js/roomRulesUI.js'),rewards=read('public/js/domains/rewardsUI.js'),room=read('public/js/domains/roomUI.js'),loot=read('public/js/lootUI.js'),account=read('public/js/domains/accountUI.js');

test('metaFixes é o único writer do Perfil Público; identity apenas fornece decoração',()=>{
 assert.match(fixes,/async function render\(panel,userId\)/);
 assert.match(fixes,/HomeScreen\.renderPublicProfile=render/);
 assert.match(fixes,/owner:'publicProfileUI'/);
 assert.doesNotMatch(identity,/HomeScreen\.renderPublicProfile\s*=/);
 assert.match(identity,/avatarHtml\(player,size=48/);
 assert.match(identity,/decoratePublicProfile\(panel,userId\)/);
 assert.doesNotMatch(fixes,/SocketClient\.on\('player_list_update'/);
 assert.match(identity,/SocketClient\.on\('player_list_update'/);
 assert.match(roomLifecycle,/SocketClient\.on\('player_list_update'/);
});

test('RewardPreviewUI continua foundation autoritativa sem writer concorrente',()=>{
 assert.match(preview,/const RewardPreviewUI=/);
 assert.match(preview,/\/api\/rooms\/preview/);
 assert.match(preview,/Object\.defineProperty\(RewardPreviewUI,'card'/);
 assert.match(rewards,/RewardPreviewUI\.__domainOwned=true/);
});

test('RoomRulesUI continua foundation única das regras de sala',()=>{
 for(const key of ['cardCreationEnabled','playerCardsEnabled','buffsEnabled','narratorEnabled','afkEnabled'])assert.match(roomRules,new RegExp(key));
 assert.match(roomRules,/openEditor\(config=/);
 assert.match(room,/RoomRulesUI/);
});

test('LootUI é foundation de Espólio sem reassumir renderers globais',()=>{
 assert.match(loot,/window\.CartLootFoundation=\{LootUI\}/);
 assert.doesNotMatch(loot,/HomeScreen\.renderAccount\s*=/);
 assert.doesNotMatch(loot,/GameOverScreen\.render\s*=/);
 assert.match(account,/LootUI\?\.injectHome\?\.\(\)/);
 assert.match(rewards,/function installLootGameOver/);
 assert.match(rewards,/LootUI\?\.attachGameOver\?\.\(matchId\)/);
 assert.match(rewards,/GameOverScreen\.__domainLoot/);
});
