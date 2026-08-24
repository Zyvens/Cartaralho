'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../api/rooms/ready.js'),'utf8');

test('owner de prontidão compila após hardening concorrente',()=>assert.doesNotThrow(()=>new Function(src)));

test('prontidão recarrega a sala e faz retry bounded somente para ROOM_CONFLICT',()=>{
 assert.match(src,/const MAX_READY_ATTEMPTS=3/);
 assert.match(src,/for\(let attempt=1;attempt<=MAX_READY_ATTEMPTS;attempt\+\+\)/);
 assert.match(src,/const room=await roomStore\.loadRoom\(code\)/);
 assert.match(src,/err\?\.code!==['"]ROOM_CONFLICT['"]\|\|attempt===MAX_READY_ATTEMPTS/);
 assert.match(src,/throw err/);
});

test('retry reaplica a mutação sobre snapshot fresco sem forçar revision stale',()=>{
 const load=src.indexOf('roomStore.loadRoom(code)'),set=src.indexOf('readiness.setReady(room,userId,ready)'),save=src.indexOf('roomStore.saveRoom(room)');
 assert.ok(load>=0&&set>load&&save>set);
 assert.doesNotMatch(src,/room\.revision\s*[+\-=]/);
 assert.doesNotMatch(src,/revision\s*:/);
});

test('Mão de Vaca e broadcast compacto permanecem na trajetória funcional',()=>{
 assert.match(src,/readiness\.contributionStatus\(room,userId\)/);
 assert.match(src,/acceptNoContribution!==true/);
 assert.match(src,/NO_CONTRIBUTION_LOOT_WARNING/);
 assert.match(src,/cards_submitted/);
 assert.match(src,/playerStatuses/);
 assert.doesNotMatch(src,/player_list_update/);
});

test('evento realtime é emitido somente depois de persistência bem-sucedida',()=>{
 const persisted=src.indexOf('const persisted=await persistReadiness'),broadcast=src.lastIndexOf('await broadcast(');
 assert.ok(persisted>=0&&broadcast>persisted);
 const broadcastCalls=(src.match(/await broadcast\(/g)||[]).length;
 assert.equal(broadcastCalls,1);
});
