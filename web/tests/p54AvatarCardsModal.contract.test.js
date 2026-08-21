'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const avatarCss=read('public/css/profileAvatarFrameIntegrityCurrent.css'),createCss=read('public/css/cardsCreateEntryCurrent.css'),shim=read('public/css/p54.css'),history=read('public/js/p54.js'),cards=read('public/js/domains/cardsLibrary.js'),profile=read('public/js/domains/profileUI.js'),stats=read('public/js/domains/statsUI.js'),index=read('public/index.html'),release=read('lib/releaseP54.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('integridade visual de avatar/moldura vive em owner canônico',()=>{
 assert.match(avatarCss,/avatar-frame\.public-avatar-frame>\.user-avatar/);
 assert.match(avatarCss,/border:0!important/);
 assert.match(avatarCss,/background:transparent!important/);
 assert.match(avatarCss,/profile-modal-avatar\[class\*="frame-"\][\s\S]*box-sizing:content-box!important/);
 assert.match(shim,/profileAvatarFrameIntegrityCurrent\.css/);
});

test('grid estático P54 foi supersedido pelo lifecycle estrutural de profileUI',()=>{
 assert.match(profile,/grid\.classList\.add\('p57-live-frame-grid','p58-live-frame-grid'\)/);
 assert.match(profile,/grid\.classList\.remove\('profile-modal-frame-grid'\)/);
 assert.doesNotMatch(shim,/profile-modal-frame-grid/);
 assert.doesNotMatch(avatarCss,/profile-modal-frame-grid/);
});

test('cardsLibrary é owner da criação e CSS base vive em cardsCreateEntryCurrent',()=>{
 assert.match(cards,/cards-library/);
 assert.match(cards,/p54-create-card-entry p56-create-card-entry p57-create-card-entry/);
 assert.match(cards,/Criar nova Carta de Jogador/);
 assert.match(cards,/openCreator/);
 assert.match(createCss,/\.cards-library>\.p54-create-card-entry/);
 assert.match(shim,/cardsCreateEntryCurrent\.css/);
});

test('statsUI permanece sem extrato ou renderer de carteira',()=>{
 assert.match(stats,/HomeScreen\.renderStats=render/);
 assert.doesNotMatch(stats,/dirtyBalance|wallet|ledger|transaction_type|TRANSACTION_LABELS/);
 assert.doesNotMatch(avatarCss,/p54-stats-ledger|ledger-row|ledger-body/);
 assert.doesNotMatch(createCss,/p54-stats-ledger|ledger-row|ledger-body/);
});

test('P54 é histórico não executável, shim visual, e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.match(index,/css\/p54\.css\?v=1\.4\.71/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p54\.js\?v=1\.4\.71"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p54\.js/);
 assert.match(shim,/^\/\* COMPAT P54/);
 assert.match(release,/APP_VERSION='v1\.4\.54'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P54_RELEASE|releaseP54/);
 assert.match(notifications,/P53_RELEASE/);
});
