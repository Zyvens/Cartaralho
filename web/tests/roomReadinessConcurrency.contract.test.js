'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../api/rooms/ready.js'),'utf8');
const lifecycle=fs.readFileSync(path.join(__dirname,'../public/js/core/roomSocketLifecycle.js'),'utf8');
const appState=fs.readFileSync(path.join(__dirname,'../public/js/core/appState.js'),'utf8');

test('owners de prontidão/realtime compilam após hardening concorrente',()=>{assert.doesNotThrow(()=>new Function(src));assert.doesNotThrow(()=>new Function(lifecycle));assert.doesNotThrow(()=>new Function(appState));});

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

test('snapshot de prontidão carrega a revisão persistida e cliente rejeita entrega stale',()=>{
 assert.match(src,/const roomRevision=Number\(room\.revision\|\|0\)/);
 assert.match(src,/\{playerStatuses:statuses,roomRevision,changed:false,readyChanged:true/);
 assert.match(src,/state:room\.state,roomRevision,playerStatuses:statuses/);
 assert.match(lifecycle,/const incomingRevision=Number\(data\.roomRevision\|\|0\),currentRevision=Number\(app\.state\.roomRevision\|\|0\)/);
 assert.match(lifecycle,/if\(incomingRevision&&incomingRevision<currentRevision\)return/);
 assert.match(lifecycle,/if\(incomingRevision\)app\.state\.roomRevision=incomingRevision/);
 assert.ok((appState.match(/roomRevision:0/g)||[]).length>=2);
});
