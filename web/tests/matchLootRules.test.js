'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const{baseLootQuota,requestedLootQuota,finalLootQuota}=require('../lib/matchLootRules');

test('quotas base são 10/7/5/3',()=>{
 assert.equal(baseLootQuota(1),10);assert.equal(baseLootQuota(2),7);assert.equal(baseLootQuota(3),5);assert.equal(baseLootQuota(4),3);assert.equal(baseLootQuota(10),3);
});
test('partida padrão E=1 preserva quotas base',()=>{
 assert.equal(requestedLootQuota(1,1),10);assert.equal(requestedLootQuota(2,1),7);assert.equal(requestedLootQuota(3,1),5);assert.equal(requestedLootQuota(6,1),3);
});
test('quota cresce proporcionalmente ao esforço e nunca cai abaixo de 1',()=>{
 assert.equal(requestedLootQuota(1,2.25),23);assert.equal(requestedLootQuota(2,.5),4);assert.equal(requestedLootQuota(8,0),1);
});
test('quota final é limitada pelo pool elegível',()=>{
 assert.equal(finalLootQuota(1,3,8),8);assert.equal(finalLootQuota(2,1,2),2);assert.equal(finalLootQuota(3,1,0),0);
});
