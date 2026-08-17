'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p46.css'),index=read('public/index.html'),release=read('lib/releaseP46.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P46 usa a proporção de 40px de Configurar Mesa em todos os controles superiores',()=>{
 assert.match(css,/\.mission-fab,\s*\.creator-admin-fab,\s*#back-play\.p42-home-back,\s*button\.back-button\{/);
 assert.match(css,/top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/height:40px!important/);
 assert.match(css,/min-height:40px!important/);
 assert.match(css,/padding:0 14px!important/);
});

test('Voltar de outras telas entra no mesmo alinhamento superior',()=>{
 assert.match(css,/button\.back-button\{left:12px!important;right:auto!important\}/);
 assert.match(css,/\.mission-fab\{right:12px!important;left:auto!important\}/);
});

test('painel de Missões mantém 12px de respiro abaixo dos controles',()=>{
 assert.match(css,/\.mission-card\{[\s\S]*top:calc\(env\(safe-area-inset-top,0px\) \+ 64px\)!important/);
});

test('P46 é a camada final e publica v1.4.46',()=>{
 assert.match(index,/css\/p46\.css\?v=1\.4\.46/);
 assert.ok(index.indexOf('css/p46.css?v=1.4.46')>index.indexOf('css/p45.css?v=1.4.45'));
 assert.match(release,/APP_VERSION='v1\.4\.46'/);
 assert.match(version,/releaseP46/);
 assert.match(notifications,/releaseP46/);
 assert.match(notifications,/P45_RELEASE/);
});
