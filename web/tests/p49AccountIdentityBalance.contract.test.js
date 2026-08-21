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

test('saldo nasce no primeiro paint do dirty_balance autenticado e não depende de Cartas Limpas',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.match(js,/function knownBalance\(\)/);
 assert.match(js,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(js,/setBalance\(value,\{loading:false\}\)/);
 assert.match(js,/\/api\/profile\/wallet\?_fresh=/);
 assert.doesNotMatch(js,/AuthClient\.cleanCards\(\)/);
 assert.match(js,/localStorage\.setItem\(cacheKey\(\)/);
 assert.match(js,/HomeScreen\.renderAccount=function/);
});

test('P49 permanece carregado e preservado após releases futuros',()=>{
 assert.match(index,/css\/p49\.css\?v=1\.4\.49/);
 assert.match(index,/js\/p49\.js\?v=1\.4\.75/);
 assert.ok(index.indexOf('css/p49.css?v=1.4.49')>index.indexOf('css/p48Friends.css?v=1.4.48'));
 assert.ok(index.indexOf('js/p49.js?v=1.4.75')>index.indexOf('js/p48Friends.js?v=1.4.48'));
 assert.match(version,/releaseP(?:49|[5-9]\d)/);
 assert.match(notifications,/releaseP(?:49|[5-9]\d)/);
 assert.match(notifications,/P49_RELEASE|releaseP49/);
 assert.match(notifications,/P48_RELEASE/);
});
