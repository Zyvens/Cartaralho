'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const p74=read('public/js/p74.js'),css=read('public/css/p74.css'),creator=read('api/admin/creator-tools.js'),index=read('public/index.html'),release=read('lib/releaseP76.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P76 mantém o mostrador como filho direto e auto-recuperável da tag da Home',()=>{
 assert.doesNotThrow(()=>new Function(p74));
 assert.match(p74,/document\.getElementById\('home-account'\)/);
 assert.match(p74,/root\.querySelector\('\.p74-wallet-slot,\.home-account-balance,\.p49-balance-slot/);
 assert.match(p74,/new MutationObserver/);
 assert.match(p74,/observer\.observe\(host,\{childList:true,subtree:true\}\)/);
 assert.match(css,/#home-account>\.account-strip\.p74-account-strip>\.p74-wallet-slot/);
 assert.doesNotMatch(css,/body\[data-cart-screen="home"\]/);
});

test('P76 usa o saldo autenticado no primeiro paint sem depender do Mercado Paralelo',()=>{
 assert.match(p74,/user\?\.dirty_balance/);
 assert.match(p74,/localStorage\.getItem\(`cartaralho_dirty_balance_/);
 assert.doesNotMatch(p74,/canonicalizeBalance/);
 assert.doesNotMatch(p74,/\/api\/marketplace/);
});

test('recompensa individual do Megafone transporta e aplica o saldo exato',()=>{
 assert.match(creator,/rewardPayload\.balance=Number\(balance\)/);
 assert.match(p74,/channel\.bind\('balance_updated',onBalanceRealtime\)/);
 assert.match(p74,/channel\.bind\('admin_megaphone',onAdminMegaphone\)/);
 assert.match(p74,/if\(data\?\.balance!==null[\s\S]*ensureBalance\(exact\)/);
});

test('recompensa global sem saldo único confirma pelo endpoint leve da carteira',()=>{
 assert.match(p74,/scheduleAuthoritative\('p74-admin-reward',0\)/);
 assert.match(p74,/\/api\/profile\/wallet\?_fresh=/);
});

test('P76 permanece no histórico quando P77 assume a versão atual',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.76'/);
 assert.match(version,/releaseP77/);
 assert.match(notifications,/P76_RELEASE/);
 assert.ok(index.includes('css/p74.css?v=1.4.77'));
 assert.ok(index.includes('js/p74.js?v=1.4.77'));
});
