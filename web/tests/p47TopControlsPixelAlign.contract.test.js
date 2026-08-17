'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p47.css'),index=read('public/index.html'),release=read('lib/releaseP47.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P47 remove deslocamentos residuais dos controles superiores',()=>{
 assert.match(css,/transform:none!important/);
 assert.match(css,/translate:none!important/);
 assert.match(css,/top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/height:40px!important/);
});

test('transição do app não cria containing block diferente para Voltar',()=>{
 assert.match(css,/#app\.screen-enter:has\(button\.back-button\)/);
 assert.match(css,/#app\.screen-exit:has\(button\.back-button\)/);
 assert.match(css,/#app\.screen-enter:has\(#back-play\.p42-home-back\)/);
});

test('P47 permanece carregado e preservado após releases futuros',()=>{
 assert.match(index,/css\/p47\.css\?v=1\.4\.47/);
 assert.ok(index.indexOf('css/p47.css?v=1.4.47')>index.indexOf('css/p46.css?v=1.4.46'));
 assert.match(release,/APP_VERSION='v1\.4\.47'/);
 assert.match(notifications,/P47_RELEASE/);
 assert.match(notifications,/P46_RELEASE/);
 assert.match(version,/releaseP\d+/);
});
