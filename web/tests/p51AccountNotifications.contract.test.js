'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p51.css'),js=read('public/js/p51.js'),index=read('public/index.html'),release=read('lib/releaseP51.js'),version=read('api/version.js'),notifications=read('api/notifications.js');
test('identidade alinha usuário e título à esquerda do nome',()=>{assert.match(css,/home-account-identity>span,[\s\S]*account-equipped-title[\s\S]*text-align:left!important/);});
test('Últimas atualizações permanece em uma linha',()=>{assert.match(css,/notifications-spoiler-heading[\s\S]*white-space:nowrap!important/);assert.match(css,/text-overflow:ellipsis!important/);});
test('pill de novidade vem antes de registros e seta',()=>{assert.match(js,/insertBefore\(pill,meta\)/);assert.match(css,/notifications-section-new[\s\S]*order:2/);assert.match(css,/notifications-spoiler-meta[\s\S]*order:3/);});
test('registros e seta usam largura fixa compartilhada',()=>{assert.match(css,/notifications-spoiler-meta[\s\S]*width:118px!important/);assert.match(css,/notifications-spoiler-meta small[\s\S]*width:76px!important[\s\S]*text-align:right!important/);});
test('P51 compila, carrega após P50 e publica versão',()=>{assert.doesNotThrow(()=>new Function(js));assert.ok(index.indexOf('css/p51.css?v=1.4.51')>index.indexOf('css/p50.css?v=1.4.50'));assert.ok(index.indexOf('js/p51.js?v=1.4.51')>index.indexOf('js/p50.js?v=1.4.50'));assert.match(release,/APP_VERSION='v1\.4\.51'/);assert.match(version,/releaseP51/);assert.match(notifications,/releaseP51/);assert.match(notifications,/P50_RELEASE/);});
