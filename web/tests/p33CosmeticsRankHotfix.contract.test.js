'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p33.css'),js=read('public/js/p33.js'),rankApi=read('api/profile/rank.js'),index=read('public/index.html');

test('P33 JS crítico compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Voltar da criação de mesa fica ancorado no topo',()=>{
 assert.match(css,/\.create-room-screen>\.back-button\{[\s\S]*position:absolute!important[\s\S]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important/);
 assert.match(css,/\.create-room-screen\{[\s\S]*padding-top:calc\(env\(safe-area-inset-top,0px\) \+ 72px\)!important/);
});

test('Asas obedecem rotação de 90 graus e espelhamento nos dois lados',()=>{
 assert.match(css,/frame-cosmetic-asas::before\{[\s\S]*rotate\(90deg\) scaleX\(-1\)!important/);
 assert.match(css,/frame-cosmetic-asas::after\{[\s\S]*rotate\(-90deg\) scaleX\(-1\)!important/);
});

test('Fita Isolante Premium vira fita amarela e preta de contenção',()=>{
 assert.match(css,/frame-cosmetic-fita-isolante\{[\s\S]*repeating-linear-gradient\(135deg,#facc15 0 12px,#111214 12px 24px\)!important/);
});

test('Cintilante altera continuamente o hue da foto e vence o filter none legado',()=>{
 assert.match(css,/@property --p33-cintilante-hue/);
 assert.match(css,/frame-cosmetic-cintilante img\{[\s\S]*filter:saturate\(1\.5\) hue-rotate\(var\(--p33-cintilante-hue\)\)!important/);
 assert.match(css,/animation:p33CintilantePhotoRGB 5\.4s linear infinite!important/);
 assert.match(css,/@keyframes p33CintilantePhotoRGB\{[\s\S]*360deg/);
});

test('Rank renderiza moldura e título equipados',()=>{
 assert.match(js,/equipped_frame_key/);
 assert.match(js,/equipped_title_key/);
 assert.match(js,/rank-avatar-frame/);
 assert.match(js,/rank-equipped-title/);
 assert.match(js,/MetaUI\.renderRank=async function/);
 assert.match(rankApi,/hall[\s\S]*equipped_title_key[\s\S]*equipped_frame_key/);
});

test('P33 é carregado depois do P32',()=>{
 assert.match(index,/css\/p33\.css\?v=1\.4\.33/);
 assert.match(index,/js\/p33\.js\?v=1\.4\.33/);
 assert.ok(index.indexOf('css/p33.css?v=1.4.33')>index.indexOf('css/p32.css?v=1.4.32'));
 assert.ok(index.indexOf('js/p33.js?v=1.4.33')>index.indexOf('js/genesisFrameP29.js?v=1.4.31'));
});
