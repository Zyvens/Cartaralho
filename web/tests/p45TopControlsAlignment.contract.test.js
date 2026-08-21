'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/topControlsBaseCurrent.css'),compat=read('public/css/p45.css'),index=read('public/index.html'),release=read('lib/releaseP45.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),recycling=read('public/js/marketplaceRecycling.js');

test('Missões, Admin e Voltar compartilham o contrato geométrico inicial de P45',()=>{assert.match(css,/\.mission-fab,\s*\.creator-admin-fab,\s*#back-play\.p42-home-back\{/);assert.match(css,/height:44px!important/);assert.match(css,/min-height:44px!important/);assert.match(css,/padding:0 14px!important/);assert.match(css,/border-radius:999px!important/);});
test('posicionamento lateral continua espelhado',()=>{assert.match(css,/\.mission-fab\{right:12px!important;left:auto!important\}/);assert.match(css,/\.creator-admin-fab,\s*#back-play\.p42-home-back\{left:12px!important;right:auto!important\}/);});
test('mobile preserva o estágio P45 antes do refinamento P46',()=>{assert.match(css,/@media\(max-width:620px\)[\s\S]*height:44px!important/);assert.match(compat,/COMPAT P45/);assert.match(compat,/@import url\('\.\/topControlsBaseCurrent\.css'\)/);assert.doesNotMatch(compat,/height:44px/);});
test('reciclagem sincroniza imediatamente saldo do Mercado e da Home',()=>{assert.match(recycling,/syncBalances\(m\)/);assert.match(recycling,/cartaralho:wallet-updated/);});
test('P45 permanece na posição histórica enquanto P75 é a cabeça atual',()=>{assert.match(index,/css\/p45\.css\?v=1\.4\.45/);assert.ok(index.indexOf('css/p45.css?v=1.4.45')>index.indexOf('css/p44.css?v=1.4.44'));assert.match(release,/APP_VERSION='v1\.4\.45'/);assert.match(notifications,/P45_RELEASE/);assert.match(version,/releaseP75/);});
