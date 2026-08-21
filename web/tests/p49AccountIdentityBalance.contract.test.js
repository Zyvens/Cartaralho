'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const identityCss=read('public/css/accountIdentityBaseCurrent.css'),walletCss=read('public/css/walletLoadingCurrent.css'),shim=read('public/css/p49.css'),history=read('public/js/p49.js'),account=read('public/js/domains/accountUI.js'),market=read('public/js/domains/marketplaceUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP49.js');

test('identidade-base da faixa da conta vive em owner visual canônico',()=>{
 assert.match(identityCss,/\.home-account-bar \.home-account-identity>strong/);
 assert.match(identityCss,/text-align:left!important/);
 assert.match(identityCss,/\.account-equipped-title[\s\S]*margin:7px 0 0!important/);
 assert.match(identityCss,/justify-content:center!important/);
 assert.match(shim,/accountIdentityBaseCurrent\.css/);
 assert.match(account,/home-account-identity/);
 assert.match(account,/account-equipped-title/);
});

test('slot de saldo preserva primeiro paint e resultado P75 sem hidratação pesada',()=>{
 assert.match(walletCss,/\.p49-balance-slot/);
 assert.match(walletCss,/visibility:visible!important/);
 assert.match(walletCss,/contain:layout paint/);
 assert.match(shim,/walletLoadingCurrent\.css/);
 assert.doesNotThrow(()=>new Function(history));
 assert.doesNotThrow(()=>new Function(account));
 assert.doesNotThrow(()=>new Function(market));
 assert.match(market,/p49-balance-slot/);
 assert.match(market,/knownBalance=explicit/);
 assert.match(market,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(market,/localStorage\.getItem\(cacheKey\(\)\)/);
 assert.match(account,/CartMarketplaceDomain\?\.mountBalance/);
 assert.doesNotMatch(market,/AuthClient\.cleanCards\(\)/);
 assert.doesNotMatch(account,/refreshBalance\?\.\('home_render'\)/);
});

test('P49 é histórico não executável e apenas shim de cascata visual',()=>{
 assert.match(index,/css\/p49\.css\?v=1\.4\.49/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p49\.js\?v=1\.4\.49"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p49\.js/);
 assert.match(shim,/^\/\* COMPAT P49/);
 assert.match(release,/APP_VERSION='v1\.4\.49'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P49_RELEASE|releaseP49/);
 assert.match(notifications,/P48_RELEASE/);
});
