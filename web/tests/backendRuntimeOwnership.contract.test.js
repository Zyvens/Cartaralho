'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

const owners={
 creatorAdmin:read('lib/creatorAdmin.js'),
 balanceRealtime:read('lib/balanceRealtime.js'),
 cardCollectionProgress:read('lib/cardCollectionProgress.js')
};
const compat={
 creatorAdminP37:read('lib/creatorAdminP37.js'),
 balanceRealtimeP63:read('lib/balanceRealtimeP63.js'),
 cardCollectionProgressP64:read('lib/cardCollectionProgressP64.js')
};
const creatorApi=read('api/admin/creator-tools.js');

test('owners backend canônicos compilam sem depender do nome de pacote',()=>{
 for(const source of Object.values(owners))assert.doesNotThrow(()=>new Function(source));
 assert.match(owners.creatorAdmin,/CREATOR_ADMIN_USER_ID=1/);
 assert.match(owners.balanceRealtime,/notifyBalanceUpdated/);
 assert.match(owners.cardCollectionProgress,/distinctOwnedCards/);
});

test('aliases PXX não duplicam regra e apontam para owners canônicos',()=>{
 assert.match(compat.creatorAdminP37,/module\.exports=require\('\.\/creatorAdmin'\)/);
 assert.match(compat.balanceRealtimeP63,/module\.exports=require\('\.\/balanceRealtime'\)/);
 assert.match(compat.cardCollectionProgressP64,/module\.exports=require\('\.\/cardCollectionProgress'\)/);
 assert.doesNotMatch(compat.creatorAdminP37,/sql\.transaction/);
 assert.doesNotMatch(compat.balanceRealtimeP63,/broadcastGlobal\('balance_updated'/);
 assert.doesNotMatch(compat.cardCollectionProgressP64,/SELECT COUNT/);
});

test('API administrativa usa diretamente owners backend sem sufixo PXX',()=>{
 assert.match(creatorApi,/require\('\.\.\/\.\.\/lib\/creatorAdmin'\)/);
 assert.match(creatorApi,/require\('\.\.\/\.\.\/lib\/balanceRealtime'\)/);
 assert.doesNotMatch(creatorApi,/creatorAdminP37|balanceRealtimeP63/);
});
