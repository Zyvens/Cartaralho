'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p35.css'),js=read('public/js/p35.js'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P35 JS crítico compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Asas mantêm 45 graus e são espelhadas para fora do círculo',()=>{
 assert.match(css,/frame-cosmetic-asas::before\{transform:translateY\(-50%\) scaleX\(-1\) rotate\(45deg\)!important\}/);
 assert.match(css,/frame-cosmetic-asas::after\{transform:translateY\(-50%\) rotate\(45deg\)!important\}/);
});

test('Central transforma Atualizações e Prêmios em spoilers nativos',()=>{
 assert.match(js,/document\.createElement\('details'\)/);
 assert.match(js,/document\.createElement\('summary'\)/);
 assert.match(js,/notifications-spoiler/);
 assert.match(js,/notifications-spoiler-summary/);
 assert.match(js,/dataSection|dataset\.section/);
 assert.match(js,/querySelectorAll\(':scope > section'\)/);
});

test('Spoilers têm cabeçalho, contagem, seta e conteúdo abaixo',()=>{
 assert.match(css,/\.notifications-spoiler-summary\{/);
 assert.match(css,/\.notifications-spoiler-meta small\{/);
 assert.match(css,/\.notifications-spoiler-chevron\{/);
 assert.match(css,/\.notifications-spoiler\[open\] \.notifications-spoiler-chevron\{transform:rotate\(180deg\)/);
 assert.match(css,/\.notifications-spoiler-content\{padding:12px!important\}/);
});

test('P35 permanece carregado após P34 com cache-busting próprio',()=>{
 assert.match(index,/css\/p35\.css\?v=1\.4\.35/);
 assert.match(index,/js\/p35\.js\?v=1\.4\.35/);
 assert.match(index,/js\/notificationsUI\.js\?v=1\.4\.35/);
 assert.ok(index.indexOf('css/p35.css?v=1.4.35')>index.indexOf('css/p34.css?v=1.4.34'));
 assert.ok(index.indexOf('js/p35.js?v=1.4.35')>index.indexOf('js/p34.js?v=1.4.34'));
});

test('Central mantém o release P35 e o histórico recente',()=>{
 assert.match(notifications,/release:p35/);
 assert.match(notifications,/release:p34/);
 assert.match(notifications,/release:p33/);
});
