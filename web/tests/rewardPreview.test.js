'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const reward=require('../lib/rewardPreview');

test('6 jogadores / 10 pontos preserva a referência 1x',()=>{
 const p=reward.preview({pointsToWin:10,participants:6,handSize:5});
 assert.equal(p.effort,1);
 assert.equal(p.class.key,'padrao');
 assert.equal(p.payouts.first.total,150);
 assert.equal(p.payouts.second.total,75);
 assert.equal(p.payouts.third.total,40);
 assert.equal(p.payouts.survivalBonus,0);
 assert.equal(p.loot.first,10);
 assert.equal(p.loot.second,7);
 assert.equal(p.loot.third,5);
});

test('10 jogadores / 20 pontos reproduz Partida Insana da v1.4',()=>{
 const p=reward.preview({pointsToWin:20,participants:10,handSize:5});
 assert.equal(p.class.key,'insana');
 assert.equal(p.payouts.first.total,1178);
 assert.equal(p.payouts.second.total,718);
 assert.equal(p.payouts.third.total,503);
 assert.equal(p.payouts.survivalBonus,257);
 assert.equal(p.loot.first,38);
});

test('tamanho da mão não altera esforço, payout nem Espólio',()=>{
 const a=reward.preview({pointsToWin:15,participants:8,handSize:5});
 const b=reward.preview({pointsToWin:15,participants:8,handSize:15});
 assert.equal(a.effort,b.effort);
 assert.deepEqual(a.payouts,b.payouts);
 assert.deepEqual(a.loot,b.loot);
 assert.notEqual(a.handSize,b.handSize);
});

test('classes respeitam os thresholds centralizados',()=>{
 assert.equal(reward.matchClass(.49).key,'relampago');
 assert.equal(reward.matchClass(.5).key,'casual');
 assert.equal(reward.matchClass(.9).key,'padrao');
 assert.equal(reward.matchClass(1.25).key,'longa');
 assert.equal(reward.matchClass(2).key,'maratona');
 assert.equal(reward.matchClass(3).key,'insana');
});

test('snapshot congela participantes presentes sem reduzir a capacidade',()=>{
 const room={pointsToWin:10,maxPlayers:10,handSize:5,players:new Map([
  ['1',{active:true}],['2',{active:true}],['3',{active:true}],['4',{active:true}],['5',{active:false}]
 ])};
 const s=reward.freezeRoom(room);
 assert.equal(s.participantsAtStart,4);
 assert.equal(s.maxPlayersConfigured,10);
 assert.equal(s.pointsToWin,10);
 assert.equal(s.handSizeAtStart,5);
 assert.ok(s.effortAtStart<1);
});
