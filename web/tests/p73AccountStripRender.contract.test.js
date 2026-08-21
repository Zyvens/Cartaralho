'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p73.js'),css=read('public/css/p73.css'),index=read('public/index.html'),release=read('lib/releaseP73.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P73 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Perfil e Sair deixam de herdar o marcador mobile legado que escondia seus spans',()=>{
 assert.match(js,/classList\.remove\('home-header-button'\)/);
 assert.match(js,/p56-account-action-icon/);
 assert.match(js,/p56-account-action-copy/);
 assert.match(css,/p56-account-action-icon[\s\S]*display:grid!important/);
 assert.match(css,/@media\(max-width:620px\)[\s\S]*p56-account-action-copy[\s\S]*display:none!important/);
});

test('carteira é reconciliada no render síncrono e após o decorator profissional, sem esperar outra chamada HTTP',()=>{
 assert.match(js,/CartP65\?\.canonicalizeBalance/);
 assert.match(js,/AuthClient\?\.user/);
 assert.match(js,/dirty_balance/);
 assert.match(js,/HomeScreen\.renderAccount=function/);
 assert.match(js,/ProfessionalUI\.polishHome=function/);
 assert.match(js,/reconcile\(\);[\s\S]*queueMicrotask\(\(\)=>reconcile\(\)\);[\s\S]*requestAnimationFrame\(\(\)=>reconcile\(\)/);
 assert.doesNotMatch(js,/fetch\(|\/api\/wallet\/balance/);
 assert.match(js,/cartaralho:balance-updated/);
});

test('P73 permanece carregado no histórico depois do P75',()=>{
 assert.ok(index.includes('css/p73.css?v=1.4.73'));
 assert.ok(index.includes('js/p73.js?v=1.4.73'));
 assert.match(release,/APP_VERSION='v1\.4\.73'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP74/);
 assert.match(notifications,/P73_RELEASE/);
});
