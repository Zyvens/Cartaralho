'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p60.css'),index=read('public/index.html'),release=read('lib/releaseP60.js'),version=read('api/version.js'),notifications=read('api/notifications.js');
const identity=require('../lib/cardIdentity');

test('identidade canônica ignora variação de maiúsculas/minúsculas',()=>{
 assert.equal(identity.sameCanonicalCard('white','Sua mãe','white','sua mãe'),true);
 assert.equal(identity.sameCanonicalCard('white','Sua mãe','white','sua Mãe'),true);
 assert.equal(identity.sameCanonicalCard('black','SUA MÃE ___','black','sua mãe ___'),true);
 assert.equal(identity.sameCanonicalCard('white','Sua mãe','black','sua mãe'),false);
});

test('normalização de caixa não remove acento nem pontuação',()=>{
 assert.equal(identity.sameCanonicalCard('white','mãe','white','mae'),false);
 assert.equal(identity.sameCanonicalCard('white','sua mãe','white','sua mãe!'),false);
});

test('lacuna contínua desce para a altura tipográfica do underline',()=>{
 assert.match(css,/\.black-card-gap[\s\S]*height:\.82em!important/);
 assert.match(css,/background-position:0 100%!important/);
 assert.match(css,/background-size:100% \.095em!important/);
 assert.match(css,/transform:translateY\(\.09em\)!important/);
});

test('pills de Moedas e XP têm exatamente a mesma altura',()=>{
 assert.match(css,/p52-mission-coin-pill[\s\S]*mission-xp-pill[\s\S]*height:28px!important/);
 assert.match(css,/min-height:28px!important/);
 assert.match(css,/box-sizing:border-box!important/);
 assert.match(css,/@media\(max-width:430px\)[\s\S]*height:26px!important/);
});

test('P60 permanece carregado e registrado após releases futuros',()=>{
 assert.ok(index.indexOf('css/p60.css?v=1.4.60')>index.indexOf('css/p59.css?v=1.4.59'));
 assert.match(release,/APP_VERSION='v1\.4\.60'/);
 assert.match(version,/releaseP(?:60|6[1-9]|[7-9]\d)/);
 assert.match(notifications,/releaseP(?:60|6[1-9]|[7-9]\d)/);
 assert.match(notifications,/P60_RELEASE|releaseP60/);
 assert.match(notifications,/P59_RELEASE/);
});
