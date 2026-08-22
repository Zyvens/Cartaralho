'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const account=read('public/js/domains/accountUI.js'),market=read('public/js/domains/marketplaceUI.js'),auth=read('lib/auth.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP75.js'),index=read('public/index.html');

test('P75 compila nos owners e mantém dirty_balance no usuário autenticado',()=>{
 assert.doesNotThrow(()=>new Function(account));
 assert.doesNotThrow(()=>new Function(market));
 assert.match(auth,/COALESCE\(w\.balance,0\)::int dirty_balance/);
 assert.match(market,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(market,/knownBalance=explicit/);
});

test('primeiro paint monta o saldo conhecido sem iniciar leitura remota concorrente',()=>{
 assert.match(account,/CartMarketplaceDomain\?\.mountBalance/);
 assert.match(account,/decorate\(\);queueMicrotask\(decorate\);requestAnimationFrame\(decorate\)/);
 assert.doesNotMatch(account,/refreshBalance\?\.\('home_render'\)/);
 assert.match(market,/slot\.dataset\.loading='false'/);
 assert.match(market,/const v=knownBalance\(explicit\)/);
});

test('confirmação autoritativa usa somente a carteira leve e coalesce chamadas simultâneas',()=>{
 assert.match(market,/walletRefreshPromise=null/);
 assert.match(market,/if\(walletRefreshPromise\)return walletRefreshPromise/);
 assert.match(market,/\/api\/profile\/wallet\?_fresh=/);
 assert.doesNotMatch(market,/AuthClient\.cleanCards\(\)/);
 assert.doesNotMatch(market,/AuthClient\.request\('\/api\/marketplace'\)/);
 assert.match(market,/\.finally\(\(\)=>\{walletRefreshPromise=null;\}\)/);
});

test('eventos e respostas transacionais continuam atualizando imediatamente antes da confirmação',()=>{
 assert.match(market,/channel\.bind\('balance_updated',onBalanceUpdated\)/);
 assert.match(market,/channel\.bind\('admin_megaphone'/);
 assert.match(market,/applyBalance\(exact,\{source:data\.reason\|\|'balance_updated'\}\)/);
 assert.match(market,/admin_reward_response/);
 assert.match(market,/card_recycling_response/);
 assert.match(market,/clean_card_response/);
 assert.match(market,/marketplace_response/);
});

test('release P75 é atual sem reativar P74 histórico',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.75'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P74_RELEASE/);
 assert.match(index,/type="application\/x-cartaralho-legacy" src="js\/p74\.js\?v=1\.4\.74"/);
 assert.doesNotMatch(index,/<script src="js\/p74\.js/);
});
