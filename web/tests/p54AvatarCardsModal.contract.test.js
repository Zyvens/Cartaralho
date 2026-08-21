'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p54.css'),history=read('public/js/p54.js'),cards=read('public/js/domains/cardsLibrary.js'),stats=read('public/js/domains/statsUI.js'),index=read('public/index.html'),release=read('lib/releaseP54.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P54 preserva correções visuais de avatar e molduras',()=>{
 assert.match(css,/avatar-frame\.public-avatar-frame>\.user-avatar/);
 assert.match(css,/border:0!important/);
 assert.match(css,/background:transparent!important/);
 assert.match(css,/profile-modal-avatar\[class\*="frame-"\][\s\S]*box-sizing:content-box!important/);
 assert.match(css,/profile-modal-frame-item[\s\S]*contain:layout!important/);
 assert.doesNotMatch(css,/contain:layout paint!important/);
 assert.doesNotMatch(css,/translateZ\(0\)/);
});

test('cardsLibrary é owner da criação dentro de Minhas Cartas',()=>{
 assert.match(cards,/cards-library/);
 assert.match(cards,/cards-library-toolbar/);
 assert.match(cards,/p54-create-card-entry/);
 assert.match(cards,/Criar nova Carta de Jogador/);
 assert.match(cards,/openCreator/);
});

test('statsUI permanece sem extrato ou renderer de carteira',()=>{
 assert.match(stats,/HomeScreen\.renderStats=render/);
 assert.doesNotMatch(stats,/dirtyBalance|wallet|ledger|transaction_type|TRANSACTION_LABELS/);
 assert.doesNotMatch(css,/p54-stats-ledger|ledger-row|ledger-body/);
});

test('P54 é histórico não executável e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.match(index,/css\/p54\.css\?v=1\.4\.71/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p54\.js\?v=1\.4\.71"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p54\.js/);
 assert.match(release,/APP_VERSION='v1\.4\.54'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P54_RELEASE|releaseP54/);
 assert.match(notifications,/P53_RELEASE/);
});
