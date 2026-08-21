'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const account=read('public/js/domains/accountUI.js'),market=read('public/js/domains/marketplaceUI.js'),admin=read('public/js/domains/adminUI.js'),history=read('public/js/p74.js'),css=read('public/css/p74.css'),index=read('public/index.html'),release=read('lib/releaseP74.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owners canônicos do contrato P74 compilam e o artefato histórico continua legível',()=>{
 for(const source of [account,market,admin,history])assert.doesNotThrow(()=>new Function(source));
});

test('mostrador fica como filho direto da faixa principal da conta e imediatamente antes das ações',()=>{
 assert.match(account,/querySelector\(':scope > \.account-strip'\)/);
 assert.match(account,/classList\.add\('home-account-bar','p74-account-strip'\)/);
 assert.match(account,/CartMarketplaceDomain\?\.mountBalance/);
 assert.match(account,/strip\.insertBefore\(wallet,actions\|\|null\)/);
 assert.match(account,/wallet\.nextElementSibling!==actions/);
 assert.match(market,/root\.insertBefore\(slot,actions\|\|null\)/);
 assert.match(market,/p74-wallet-slot/);
 assert.match(css,/#home-account>\.account-strip\.p74-account-strip>\.p74-wallet-slot/);
 assert.match(css,/flex-wrap:nowrap!important/);
 assert.match(css,/position:static!important/);
});

test('resultado P74 é preservado e a reconciliação remota concorrente foi SUPERSEDED por P75',()=>{
 assert.match(market,/knownBalance=explicit/);
 assert.match(market,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(market,/localStorage\.getItem\(cacheKey\(\)\)/);
 assert.match(market,/mountBalance\(explicit=null\)/);
 assert.match(account,/HomeScreen\.renderAccount=function/);
 assert.match(account,/decorate\(\);queueMicrotask\(decorate\);requestAnimationFrame\(decorate\)/);
 assert.doesNotMatch(account,/CartMarketplaceDomain\?\.refreshBalance\?\.\('home_render'\)/);
 assert.match(market,/walletRefreshPromise/);
 assert.match(market,/if\(walletRefreshPromise\)return walletRefreshPromise/);
 assert.match(market,/AuthClient\.request\(`\/api\/profile\/wallet\?_fresh=\$\{Date\.now\(\)\}`\)/);
 assert.doesNotMatch(market,/AuthClient\.request\('\/api\/marketplace'\)/);
 assert.match(market,/cartaralho:balance-updated/);
});

test('recompensa administrativa usa saldo exato quando disponível e confirma no backend',()=>{
 assert.match(admin,/d\?\.balance!==undefined/);
 assert.match(admin,/CartMarketplaceDomain\?\.applyBalance/);
 assert.match(admin,/admin_reward_response/);
 assert.match(market,/channel\.bind\('admin_megaphone'/);
 assert.match(market,/data\?\.kind==='reward'/);
 assert.match(market,/targetUserIds/);
 assert.match(market,/refreshBalance\('reward_megaphone_confirm'\)/);
});

test('P74 permanece histórico não executável e P75 é a versão atual',()=>{
 assert.ok(index.indexOf('css/p74.css?v=1.4.74')>index.indexOf('css/p73.css?v=1.4.73'));
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p73\.js\?v=1\.4\.73"><\/script>/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p74\.js\?v=1\.4\.74"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p74\.js\?v=1\.4\.74"><\/script>/);
 assert.match(release,/APP_VERSION='v1\.4\.74'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P74_RELEASE/);
 assert.match(notifications,/P73_RELEASE/);
});
