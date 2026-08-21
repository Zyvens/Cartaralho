'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p41.js'),shim=read('public/css/p41.css'),market=read('public/js/domains/marketplaceUI.js'),recycling=read('lib/cardRecycling.js'),balance=read('lib/balanceConfig.js'),migration=read('db/p41_recycling_any_count.sql'),accountCss=read('public/css/accountStripMetricsSeedCurrent.css'),adminCss=read('public/css/adminCreatorIdentityCurrent.css'),confirmCss=read('public/css/recyclingConfirmCurrent.css'),detailCss=read('public/css/cardDetailCurrent.css'),cards=read('public/js/domains/cardsLibrary.js'),topNav=read('public/css/topNavigationCurrent.css'),index=read('public/index.html'),release=read('lib/releaseP41.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P41 JS é proveniência histórica não executável',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p41\.js\?v=1\.4\.44"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p41\.js/);
});

test('reciclagem atual aceita qualquer quantidade e paga por carta',()=>{
 assert.match(balance,/recycling:\{rewardPerCard:25\}/);
 assert.match(recycling,/policy\(\).*rewardPerCard/);
 assert.match(recycling,/ids\.length<1/);
 assert.match(recycling,/ids\.length\*p\.rewardPerCard/);
 assert.doesNotMatch(recycling,/ids\.length%p\.batchSize/);
 assert.match(market,/const d=this\.data\|\|\{\},cards=d\.cards\|\|\[\],per=Number\(d\.policy\?\.rewardPerCard\)\|\|25,n=this\.selected\.size,valid=n>0,projected=n\*per/);
 assert.match(market,/Selecione uma ou mais cartas\./);
});

test('owner canônico mantém confirmação P41 com cartas pretas/brancas e duas ações',()=>{
 assert.match(market,/overlay\.className='p41-recycle-confirm-overlay'/);
 assert.match(market,/p41-recycle-confirm-shell/);
 assert.match(market,/p41-recycle-card-preview/);
 assert.match(market,/data-cancel/);
 assert.match(market,/data-go/);
 assert.match(confirmCss,/\.p41-recycle-confirm-list/);
 assert.match(confirmCss,/\.p41-recycle-card-preview\.black/);
 assert.match(confirmCss,/\.p41-recycle-card-preview\.white/);
 assert.match(shim,/recyclingConfirmCurrent\.css/);
});

test('constraint antiga de lote continua substituída por mínimo de uma carta',()=>{
 assert.match(migration,/DROP CONSTRAINT IF EXISTS card_recycling_batches_card_count_check/);
 assert.match(migration,/CHECK\(card_count>=1\)/);
});

test('detalhe P41 foi supersedido pela ficha P56/P57',()=>{
 assert.match(cards,/document\.getElementById\('p41-card-detail-overlay'\)\?\.remove\(\)/);
 assert.match(cards,/overlay\.className='p56-card-detail-overlay'/);
 assert.match(detailCss,/\.p56-card-detail-overlay/);
 assert.doesNotMatch(shim,/p41-card-detail-shell/);
});

test('Admin preserva identificação própria e geometria de topo pertence a P45→P47',()=>{
 assert.match(adminCss,/content:'admin • VitorIvens'/);
 assert.match(shim,/adminCreatorIdentityCurrent\.css/);
 assert.doesNotMatch(adminCss,/mission-fab/);
 assert.match(topNav,/\.mission-fab,[\s\S]*\.creator-admin-fab/);
 assert.match(topNav,/height:40px!important/);
});

test('account strip preserva métricas P41 na posição histórica antes de P49/P56/P74',()=>{
 assert.match(accountCss,/\.home-account-bar\{[\s\S]*flex-wrap:nowrap!important/);
 assert.match(accountCss,/\.home-account-bar \.home-account-balance\{[\s\S]*min-width:92px!important/);
 assert.match(accountCss,/@media\(max-width:620px\)[\s\S]*min-width:82px!important;max-width:104px!important/);
 assert.match(accountCss,/flex-basis:44px!important;width:44px!important;min-width:44px!important/);
 assert.match(shim,/accountStripMetricsSeedCurrent\.css/);
});

test('P41 stylesheet é shim sem regra funcional própria e P75 é corrente',()=>{
 assert.match(shim,/^\/\* COMPAT P41/);
 assert.match(shim,/accountStripMetricsSeedCurrent\.css/);
 assert.match(shim,/adminCreatorIdentityCurrent\.css/);
 assert.match(shim,/recyclingConfirmCurrent\.css/);
 assert.match(release,/APP_VERSION='v1\.4\.41'/);
 assert.match(notifications,/releaseP41/);
 assert.match(notifications,/P40_RELEASE/);
 assert.match(version,/releaseP75/);
 assert.match(index,/css\/p41\.css\?v=1\.4\.41/);
});
