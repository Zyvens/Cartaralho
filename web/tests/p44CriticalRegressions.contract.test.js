'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const legacyCss=read('public/css/p44.css'),cards=read('public/js/domains/cardsLibrary.js'),admin=read('public/js/domains/adminUI.js'),topBase=read('public/css/topControlsBaseCurrent.css'),topNav=read('public/css/topNavigationCurrent.css'),topPixel=read('public/css/topControlsPixelCurrent.css'),detail=read('public/css/cardDetailCurrent.css'),recycling=read('lib/cardRecycling.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP44.js');

test('Admin atual não depende do MutationObserver histórico P41',()=>{
 assert.match(admin,/CartDomains\.claim\('adminUI'/);
 assert.doesNotMatch(admin,/MutationObserver/);
 assert.match(admin,/function ensure\(\)/);
 assert.match(admin,/creator-admin-fab/);
});

test('detalhe P41 foi supersedido pela ficha P56 e é removido antes da abertura',()=>{
 assert.match(cards,/document\.getElementById\('p41-card-detail-overlay'\)\?\.remove\(\)/);
 assert.match(cards,/overlay\.className='p56-card-detail-overlay'/);
 assert.match(detail,/\.p56-card-detail-overlay[\s\S]*z-index:65000/);
 assert.match(legacyCss,/^\/\* HISTORICAL P44/);
});

test('navegação superior P44 foi supersedida pela trajetória P45→P47',()=>{
 assert.match(topBase,/height:44px!important/);
 assert.match(topNav,/height:40px!important/);
 assert.match(topPixel,/transform:none!important/);
 assert.match(topPixel,/#app\.screen-enter:has\(button\.back-button\)/);
});

test('reciclagem tipa parâmetros usados em jsonb_build_object',()=>{
 assert.match(recycling,/jsonb_build_object\('cardCount',\$\{ids\.length\}::int,'rewardPerCard',\$\{p\.rewardPerCard\}::int\)/);
 assert.match(recycling,/\$\{reward\}::int/);
});

test('P44 permanece como proveniência sem CSS funcional e P75 é corrente',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.44'/);
 assert.match(notifications,/releaseP44/);
 assert.match(index,/css\/p44\.css\?v=1\.4\.44/);
 assert.match(legacyCss,/HISTORICAL P44/);
 assert.doesNotMatch(legacyCss,/\{[^*]/);
 assert.match(version,/releaseP75/);
});
