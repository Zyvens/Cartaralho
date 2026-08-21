'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p55.js'),css=read('public/css/p55.css'),cards=read('public/js/domains/cardsLibrary.js'),market=read('public/js/domains/marketplaceUI.js'),index=read('public/index.html'),release=read('lib/releaseP55.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owner de cartas preserva o formatador canônico de lacunas usado pela Reciclagem',()=>{
 assert.match(cards,/CardComponent\._formatBlackText=function/);
 assert.match(cards,/black-card-gap/);
 assert.match(market,/CardComponent\._formatBlackText\(c\.text\)/);
 assert.match(css,/recycling-card b \.black-card-gap/);
 assert.match(css,/border-bottom:3px solid #d946ef!important/);
});

test('detalhe atual de Minhas Cartas preserva modal próprio, carta real, progressão e origem',()=>{
 assert.match(cards,/p56-card-detail-overlay/);
 assert.match(cards,/role="dialog"/);
 assert.doesNotMatch(cards,/Modal\.show\(/);
 assert.match(cards,/CardComponent\.createBlackCard/);
 assert.match(cards,/CardComponent\.createWhiteCard/);
 assert.match(cards,/PROGRESSÃO/);
 assert.match(cards,/ORIGEM/);
 assert.match(cards,/CartCardProgression\.track/);
});

test('P55 é histórico não executável; o detalhe P55 foi SUPERSEDED sem perder seu resultado',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.match(index,/css\/p55\.css\?v=1\.4\.55/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p55\.js\?v=1\.4\.55"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p55\.js/);
 assert.match(index,/marketplaceRecycling\.js\?v=1\.4\.55/);
});

test('P55 permanece no histórico e P75 é a release corrente',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.55'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P55_RELEASE/);
 assert.match(notifications,/P54_RELEASE/);
});
