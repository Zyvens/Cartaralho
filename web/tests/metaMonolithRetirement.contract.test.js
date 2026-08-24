'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('public/index.html'),base=read('public/js/metaUIBase.js'),client=read('public/js/metaClient.js'),lifecycle=read('public/js/domains/metaLifecycleUI.js'),rank=read('public/js/domains/rankUI.js'),history=read('public/js/domains/historyUI.js'),groups=read('public/js/domains/socialGroupsUI.js'),reactions=read('public/js/domains/reactionsUI.js'),spectator=read('public/js/domains/spectatorUI.js'),share=read('public/js/domains/roomShareUI.js'),missions=read('public/js/domains/missionsUI.js'),identity=read('public/js/domains/identityUI.js'),account=read('public/js/domains/accountUI.js'),nav=read('public/js/domains/navigationUI.js'),panel=read('public/js/domains/appPanelUI.js');

test('meta.js é histórico e a base mínima é executável',()=>{
 assert.ok(index.includes('<script src="js/metaUIBase.js"></script>'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/meta.js"'));
 assert.ok(!index.includes('<script src="js/meta.js"></script>'));
 assert.match(base,/var MetaUI=window\.MetaUI\|\|/);
 assert.match(client,/const MetaClient=/);
});

test('Rank e conteúdo não dependem mais do renderer do monólito',()=>{
 assert.match(rank,/async function render\(/);
 assert.doesNotMatch(rank,/MetaUI\.renderRank\.bind/);
 assert.match(history,/HomeScreen\.renderHistory=render/);
 assert.match(groups,/MetaUI\.renderFriendGroup=renderFriendGroup/);
});

test('runtime meta foi distribuído por owners canônicos',()=>{
 assert.match(lifecycle,/SocketClient\.subscribeRoom=async function/);
 assert.match(lifecycle,/channel\.bind\('reaction'/);
 assert.match(reactions,/updateReactionDock/);
 assert.match(spectator,/ensureHomeEntry/);
 assert.match(share,/addRoomShare/);
 assert.match(share,/applyDirectRoomHint/);
 assert.match(missions,/async function ensureMissionUI/);
 assert.match(identity,/BASE_TITLES/);
 assert.match(identity,/document\.__cartTitleObserver/);
});

test('Home e navegação montam features sem MetaUI.patch',()=>{
 for(const owner of ['CartSocialFoundationDomain','CartSpectatorDomain','CartRoomShareDomain','CartMissionsDomain'])assert.match(account,new RegExp(owner));
 assert.match(nav,/CartReactionsDomain\?\.updateReactionDock/);
 assert.match(nav,/CartRoomShareDomain\?\.addRoomShare/);
 assert.match(panel,/kind==='profile'\?ProfileModal\.open\('profile'\)/);
});
