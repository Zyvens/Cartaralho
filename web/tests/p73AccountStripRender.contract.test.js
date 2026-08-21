'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const account=read('public/js/domains/accountUI.js'),market=read('public/js/domains/marketplaceUI.js'),history=read('public/js/p73.js'),accountCss=read('public/css/account.css'),historyCss=read('public/css/p73.css'),index=read('public/index.html'),release=read('lib/releaseP73.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owners canônicos do contrato P73 compilam e o artefato histórico continua legível',()=>{
 for(const source of [account,market,history])assert.doesNotThrow(()=>new Function(source));
});

test('Perfil e Sair não herdam o marcador mobile legado que escondia seus spans',()=>{
 assert.match(account,/classList\.remove\('home-header-button'\)/);
 assert.match(account,/p56-account-action-icon/);
 assert.match(account,/p56-account-action-copy/);
 assert.match(account,/aria-label/);
 assert.match(accountCss,/p56-account-action-icon[\s\S]*display:grid!important/);
 assert.match(accountCss,/@media\(max-width:620px\)[\s\S]*p56-account-action-copy[\s\S]*display:none!important/);
});

test('CSS P73 foi absorvido por account.css e o arquivo histórico não possui regras',()=>{
 assert.match(accountCss,/home-account-balance[\s\S]*display:inline-flex!important/);
 assert.match(historyCss,/HISTORICAL P73/);
 assert.doesNotMatch(historyCss,/\{[^}]*display:/);
});

test('carteira aparece no primeiro render usando saldo conhecido; fetch no home_render foi SUPERSEDED por P75',()=>{
 assert.match(market,/knownBalance=explicit/);
 assert.match(market,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(market,/localStorage\.getItem\(cacheKey\(\)\)/);
 assert.match(account,/HomeScreen\.renderAccount=function/);
 assert.match(account,/ProfessionalUI\?\.polishHome\?\.\(\)/);
 assert.match(account,/CartMarketplaceDomain\?\.mountBalance\?\.\(\)/);
 assert.match(account,/decorate\(\);queueMicrotask\(decorate\);requestAnimationFrame\(decorate\)/);
 assert.doesNotMatch(account,/refreshBalance\?\.\('home_render'\)/);
 assert.match(market,/walletRefreshPromise/);
 assert.match(market,/cartaralho:balance-updated/);
});

test('P73 permanece histórico não executável e P75 é a cabeça atual',()=>{
 assert.ok(index.includes('css/p73.css?v=1.4.73'));
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p73\.js\?v=1\.4\.73"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p73\.js\?v=1\.4\.73"><\/script>/);
 assert.match(release,/APP_VERSION='v1\.4\.73'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP75/);
 assert.match(notifications,/P73_RELEASE/);
});
