'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('public/js/uiP25.js'),index=read('public/index.html'),cards=read('public/js/screens/cardCreation.js'),createApi=read('api/cards/create.js'),notifications=read('lib/appNotifications.js');

test('P25 UI compila e é carregado por último com URL nova para Safari/PWA',()=>{
 assert.doesNotThrow(()=>new Function(ui));
 assert.match(index,/js\/homeMenuP24\.js/);
 assert.match(index,/js\/uiP25\.js\?v=1\.4\.25/);
 assert.ok(index.indexOf('js/uiP25.js?v=1.4.25')>index.indexOf('js/homeMenuP24.js'));
});

test('ordem visual e DOM da Home é autoritativa inclusive no mobile',()=>{
 const expected=['#marketplace-menu-btn','#notifications-menu-btn','#friends-menu-btn','[data-panel="cards"]','[data-panel="rank"]','[data-panel="history"]','[data-panel="stats"]','#audio-settings-menu-btn','[data-panel="credits"]'];
 let previous=-1;
 for(const selector of expected){const at=ui.indexOf(`'${selector}'`);assert.ok(at>previous,`${selector} fora de ordem`);previous=at;}
 assert.match(ui,/style\.setProperty\('order',String\(index\+1\),'important'\)/);
 assert.match(ui,/current\.every\(\(node,index\)=>node===nodes\[index\]\)/);
 assert.match(ui,/if\(!already\)nodes\.forEach\(node=>actions\.appendChild\(node\)\)/);
 assert.match(ui,/observe\(actions,\{childList:true\}\)/);
 assert.doesNotMatch(ui,/observe\(document\.body/);
 assert.match(ui,/pageshow/);assert.match(ui,/visibilitychange/);assert.match(ui,/orientationchange/);
 assert.match(ui,/'#friends-menu-btn':'Amigos de Merda'/);
 assert.match(ui,/'\[data-panel="stats"\]':'Estatística'/);
});

test('editor mantém apenas o botão inferior de salvar quando está editável',()=>{
 assert.match(ui,/removeRedundantCardEditorSave/);
 assert.match(ui,/const bottom=screen\.querySelector\('#save-cards-btn'\)/);
 assert.match(ui,/const top=screen\.querySelector\('#back-btn'\)/);
 assert.match(ui,/bottom&&top&&\/salvar\\s\+e\\s\+voltar\\s\+ao\\s\+lobby/i);
 assert.match(ui,/top\.remove\(\)/);
 assert.match(cards,/id="save-cards-btn"/);
 assert.match(cards,/saveAndReturn/);
 assert.match(cards,/if\(this\.readyLocked\).*← Voltar ao Lobby/s);
});

test('decisão de produto preserva criação imediata de cartas como no modelo anterior',()=>{
 assert.match(cards,/AuthClient\.createPaidCard\(/);
 assert.match(cards,/if\(d\.inventory\)this\.cleanInventory=/);
 assert.match(createApi,/result=await cleanCards\.create\(\{userId:user\.id,type:cardType,text:display,matchId:room\.code/);
 assert.doesNotMatch(createApi,/draft|reservation|reserve/i);
});

test('Central registra P25 sem apagar P24',()=>{
 assert.match(notifications,/APP_VERSION='v1\.4\.25'/);
 assert.match(notifications,/release:p25/);
 assert.match(notifications,/release:p24/);
});
