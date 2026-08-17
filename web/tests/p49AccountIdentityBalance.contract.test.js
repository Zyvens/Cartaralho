'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p49.css'),js=read('public/js/p49.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P49 alinha nome, usuário e título como uma única identidade',()=>{
 assert.match(css,/\.home-account-bar \.home-account-identity>strong/);
 assert.match(css,/text-align:left!important/);
 assert.match(css,/\.home-account-bar \.home-account-identity>span[\s\S]*text-align:right!important/);
 assert.match(css,/\.account-equipped-title[\s\S]*margin:7px 0 0!important[\s\S]*text-align:right!important/);
 assert.match(css,/justify-content:center!important/);
});

test('saldo reserva o espaço no primeiro paint e hidrata sem remontar a Home',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.match(js,/ensureBalanceSlot/);
 assert.match(js,/p49-balance-slot/);
 assert.match(js,/cachedBalance\(\)/);
 assert.match(js,/AuthClient\.cleanCards\(\)/);
 assert.match(js,/localStorage\.setItem\(cacheKey\(\)/);
 assert.match(js,/HomeScreen\.renderAccount=function/);
});

test('P49 carrega por último e publica v1.4.49',()=>{
 assert.match(index,/css\/p49\.css\?v=1\.4\.49/);
 assert.match(index,/js\/p49\.js\?v=1\.4\.49/);
 assert.ok(index.indexOf('css/p49.css?v=1.4.49')>index.indexOf('css/p48Friends.css?v=1.4.48'));
 assert.ok(index.indexOf('js/p49.js?v=1.4.49')>index.indexOf('js/p48Friends.js?v=1.4.48'));
 assert.match(version,/releaseP49/);
 assert.match(notifications,/releaseP49/);
 assert.match(notifications,/P48_RELEASE/);
});
