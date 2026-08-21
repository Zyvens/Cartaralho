'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

const owners={
 creatorAdmin:read('lib/creatorAdmin.js'),
 balanceRealtime:read('lib/balanceRealtime.js'),
 cardCollectionProgress:read('lib/cardCollectionProgress.js'),
 matchStart:read('lib/matchStart.js'),
 matchSubmit:read('lib/matchSubmit.js'),
 roomConfig:read('lib/roomConfig.js')
};
const compat={
 creatorAdminP37:read('lib/creatorAdminP37.js'),
 balanceRealtimeP63:read('lib/balanceRealtimeP63.js'),
 cardCollectionProgressP64:read('lib/cardCollectionProgressP64.js'),
 matchStartP6:read('lib/matchStartP6.js'),
 matchSubmitP6:read('lib/matchSubmitP6.js'),
 roomConfigP7:read('lib/roomConfigP7.js')
};
const creatorApi=read('api/admin/creator-tools.js');

test('owners backend canônicos compilam sem depender do nome de pacote',()=>{
 for(const source of Object.values(owners))assert.doesNotThrow(()=>new Function(source));
 assert.match(owners.creatorAdmin,/CREATOR_ADMIN_USER_ID=1/);
 assert.match(owners.balanceRealtime,/notifyBalanceUpdated/);
 assert.match(owners.cardCollectionProgress,/distinctOwnedCards/);
 assert.match(owners.matchStart,/async function startGame/);
 assert.match(owners.matchSubmit,/async function submitCards/);
 assert.match(owners.roomConfig,/function publicConfig/);
});

test('aliases PXX não duplicam regra e apontam para owners canônicos',()=>{
 const expected={creatorAdminP37:'creatorAdmin',balanceRealtimeP63:'balanceRealtime',cardCollectionProgressP64:'cardCollectionProgress',matchStartP6:'matchStart',matchSubmitP6:'matchSubmit',roomConfigP7:'roomConfig'};
 for(const[key,target]of Object.entries(expected)){
  assert.match(compat[key],new RegExp(`module\\.exports=require\\('\\.\\/${target}'\\)`));
 }
 assert.doesNotMatch(compat.creatorAdminP37,/sql\.transaction/);
 assert.doesNotMatch(compat.balanceRealtimeP63,/broadcastGlobal\('balance_updated'/);
 assert.doesNotMatch(compat.cardCollectionProgressP64,/SELECT COUNT/);
 assert.doesNotMatch(compat.matchStartP6,/async function startGame/);
 assert.doesNotMatch(compat.matchSubmitP6,/async function submitCards/);
 assert.doesNotMatch(compat.roomConfigP7,/function publicConfig/);
});

test('API administrativa usa diretamente owners backend sem sufixo PXX',()=>{
 assert.match(creatorApi,/require\('\.\.\/\.\.\/lib\/creatorAdmin'\)/);
 assert.match(creatorApi,/require\('\.\.\/\.\.\/lib\/balanceRealtime'\)/);
 assert.doesNotMatch(creatorApi,/creatorAdminP37|balanceRealtimeP63/);
});
