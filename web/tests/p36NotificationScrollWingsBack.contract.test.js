'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p36.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('spoilers abertos possuem scroll interno próprio',()=>{
 assert.match(css,/\.notifications-spoiler-content\{[\s\S]*max-height:min\(40vh,360px\)!important[\s\S]*overflow-y:auto!important[\s\S]*overscroll-behavior:contain/);
 assert.match(css,/-webkit-overflow-scrolling:touch/);
});

test('Voltar da etapa de apelido fica alinhado à esquerda',()=>{
 assert.match(css,/#play-form>#back-play\{[\s\S]*display:flex!important[\s\S]*width:max-content!important[\s\S]*margin:0 auto 12px 0!important[\s\S]*justify-content:flex-start!important/);
});

test('Asas ficam na base e acima de foto e moldura',()=>{
 assert.match(css,/frame-cosmetic-asas::before,[\s\S]*frame-cosmetic-asas::after\{[\s\S]*top:auto!important[\s\S]*bottom:-10px!important[\s\S]*z-index:40!important/);
 assert.match(css,/frame-cosmetic-asas::before\{[\s\S]*left:-10px!important[\s\S]*scaleX\(-1\) rotate\(45deg\)!important/);
 assert.match(css,/frame-cosmetic-asas::after\{[\s\S]*right:-10px!important[\s\S]*rotate\(45deg\)!important/);
});

test('P36 é a camada CSS final publicada',()=>{
 assert.match(index,/css\/p36\.css\?v=1\.4\.36/);
 assert.ok(index.indexOf('css/p36.css?v=1.4.36')>index.indexOf('css/p35.css?v=1.4.35'));
});

test('Central publica P36',()=>{
 assert.match(notifications,/APP_VERSION='v1\.4\.36'/);
 assert.match(notifications,/release:p36/);
 assert.match(notifications,/Scroll nos spoilers, Asas em primeiro plano e Voltar alinhado/);
});
