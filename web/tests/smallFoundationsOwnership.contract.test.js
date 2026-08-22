'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fixes=read('public/js/metaFixes.js'),identity=read('public/js/domains/identityUI.js'),roomLifecycle=read('public/js/core/roomSocketLifecycle.js'),preview=read('public/js/rewardPreviewUI.js'),roomRules=read('public/js/roomRulesUI.js'),rewards=read('public/js/domains/rewardsUI.js'),room=read('public/js/domains/roomUI.js');

test('metaFixes conserva Perfil Público mas não registra placar duplicado',()=>{
 assert.match(fixes,/HomeScreen\.renderPublicProfile=async/);
 assert.match(fixes,/MetaFixesPublicProfile/);
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
