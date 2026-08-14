'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../lib/buffEngine.js'),'utf8');

test('consumo acontece dentro da mesma transação que persiste ativação e efeito',()=>{
 const effect=source.indexOf('UPDATE rooms SET current_round');
 const activation=source.indexOf('INSERT INTO buff_activations');
 const consume=source.indexOf('UPDATE buff_inventory SET quantity=quantity-1');
 assert.ok(effect>=0&&activation>effect&&consume>activation);
 assert.match(source,/isolationMode:'Serializable'/);
});

test('feature flag e buffsEnabled são validados antes de aplicar efeito',()=>{
 const feature=source.indexOf("BUFFS_FEATURE_ENABLED==='false'");
 const room=source.indexOf("!room?.buffsEnabled");
 const apply=source.indexOf('function applyEffect');
 assert.ok(feature>=0&&room>feature&&apply>room);
});

test('Foi sem querer querendo reverte estatística da resposta recolhida',()=>{
 assert.match(source,/withdrawnUseQueries/);
 assert.match(source,/times_used=GREATEST\(0,uc\.times_used-1\)/);
 assert.match(source,/used_count=GREATEST\(0,used_count-1\)/);
});

test('Mão de Vaca persiste escolha pendente e bloqueia resposta\/resultado',()=>{
 assert.match(source,/pendingTrim/);
 assert.match(source,/Devolva duas cartas da Mão de Vaca antes de responder/);
 assert.match(source,/assertCanResolveRound/);
});
