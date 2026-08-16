'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p34.css'),js=read('public/js/p34.js'),rankApi=read('api/profile/rank.js'),index=read('public/index.html');

test('P34 JS crítico compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Voltar da criação fica fixo no canto superior esquerdo do viewport',()=>{
 assert.match(css,/\.create-room-screen>\.back-button\{[\s\S]*position:fixed!important[\s\S]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)!important[\s\S]*left:12px!important/);
});

test('Asas restauram geometria inicial do P14 com 45 graus e reflexo',()=>{
 assert.match(css,/frame-cosmetic-asas::before,[\s\S]*frame-cosmetic-asas::after\{[\s\S]*top:50%!important[\s\S]*bottom:auto!important[\s\S]*z-index:-1!important[\s\S]*font-size:1\.65em!important/);
 assert.match(css,/frame-cosmetic-asas::before\{[\s\S]*right:72%!important[\s\S]*left:auto!important[\s\S]*translateY\(-50%\) rotate\(45deg\)!important/);
 assert.match(css,/frame-cosmetic-asas::after\{[\s\S]*left:72%!important[\s\S]*right:auto!important[\s\S]*translateY\(-50%\) scaleX\(-1\) rotate\(45deg\)!important/);
});

test('Rank usa os globais lexicais reais em vez de window.AuthClient/window.HomeScreen',()=>{
 assert.match(js,/typeof AuthClient==='undefined'/);
 assert.match(js,/typeof HomeScreen==='undefined'/);
 assert.doesNotMatch(js,/window\.AuthClient/);
 assert.doesNotMatch(js,/window\.HomeScreen/);
 assert.match(js,/equipped_frame_key/);
 assert.match(js,/equipped_title_key/);
 assert.match(js,/MetaUI\.renderRank=async function/);
 assert.match(rankApi,/u\.equipped_title_key,u\.equipped_frame_key/);
});

test('P34 carrega depois do P33',()=>{
 assert.match(index,/css\/p34\.css\?v=1\.4\.34/);
 assert.match(index,/js\/p34\.js\?v=1\.4\.34/);
 assert.ok(index.indexOf('css/p34.css?v=1.4.34')>index.indexOf('css/p33.css?v=1.4.33'));
 assert.ok(index.indexOf('js/p34.js?v=1.4.34')>index.indexOf('js/p33.js?v=1.4.33'));
});
