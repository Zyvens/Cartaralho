'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p45.css'),index=read('public/index.html'),release=read('lib/releaseP45.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),recycling=read('public/js/marketplaceRecycling.js');

test('Missões, Admin e Voltar compartilham o mesmo contrato geométrico',()=>{
 assert.match(css,/\.mission-fab,\s*\.creator-admin-fab,\s*#back-play\.p42-home-back\{/);
 assert.match(css,/top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/height:44px!important/);
 assert.match(css,/min-height:44px!important/);
 assert.match(css,/padding:0 14px!important/);
 assert.match(css,/border-radius:999px!important/);
 assert.match(css,/align-items:center!important/);
 assert.match(css,/line-height:1!important/);
});

test('posicionamento lateral continua espelhado e não sobrepõe Missões',()=>{
 assert.match(css,/\.mission-fab\{right:12px!important;left:auto!important\}/);
 assert.match(css,/\.creator-admin-fab,\s*#back-play\.p42-home-back\{left:12px!important;right:auto!important\}/);
});

test('mobile preserva exatamente o mesmo eixo vertical e altura',()=>{
 assert.match(css,/@media\(max-width:620px\)[\s\S]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/@media\(max-width:620px\)[\s\S]*height:44px!important/);
});

test('reciclagem sincroniza imediatamente saldo do Mercado e da Home',()=>{
 assert.match(recycling,/syncBalances\(m\)/);
 assert.match(recycling,/#market-dirty-balance/);
 assert.match(recycling,/\.home-account-balance/);
 assert.match(recycling,/cartaralho:wallet-updated/);
 assert.match(recycling,/await m\.load\(\);this\.syncBalances\(m\)/);
 assert.match(index,/marketplaceRecycling\.js\?v=1\.4\.(?:4[5-9]|[5-9]\d)/);
});

test('P45 permanece preservado como camada histórica após releases futuras',()=>{
 assert.match(index,/css\/p45\.css\?v=1\.4\.45/);
 assert.ok(index.indexOf('css/p45.css?v=1.4.45')>index.indexOf('css/p44.css?v=1.4.44'));
 assert.match(release,/APP_VERSION='v1\.4\.45'/);
 assert.match(notifications,/P45_RELEASE/);
 assert.match(notifications,/P44_RELEASE/);
 assert.match(version,/releaseP\d+/);
});
