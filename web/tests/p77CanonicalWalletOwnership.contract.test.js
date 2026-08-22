'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const auth=read('public/js/auth.js'),home=read('public/js/screens/home.js'),socket=read('public/js/socket.js'),market=read('public/js/domains/marketplaceUI.js'),account=read('public/js/domains/accountUI.js'),css=read('public/css/accountCurrent.css'),creator=read('api/admin/creator-tools.js'),release=read('lib/releaseP77.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P77 reconhece os bindings lexicais reais mas os owners canônicos usam identificadores diretos',()=>{
 assert.match(auth,/const AuthClient=/);assert.match(home,/const HomeScreen=/);assert.match(socket,/const SocketClient=/);
 assert.match(market,/AuthClient\?\.user/);assert.match(market,/SocketClient\._waitReady\(\)/);assert.doesNotMatch(market,/window\.AuthClient\?\.user/);
 assert.match(account,/const base=HomeScreen\.renderAccount\.bind\(HomeScreen\)/);assert.doesNotMatch(account,/window\.HomeScreen\.renderAccount/);
});

test('carteira nasce no render autenticado a partir de dirty_balance/cache sem carregar Mercado inteiro',()=>{
 assert.match(market,/AuthClient\?\.user\?\.dirty_balance/);assert.match(market,/localStorage\.getItem\(cacheKey\(\)\)/);
 assert.match(account,/HomeScreen\.renderAccount=function/);assert.match(account,/decorate\(\);queueMicrotask\(decorate\);requestAnimationFrame\(decorate\)/);
 assert.match(market,/mountBalance\(v\)/);assert.doesNotMatch(market,/AuthClient\.request\('\/api\/marketplace'\)/);
});

test('tag de carteira é filha direta da account strip e não depende do estado CSS da tela',()=>{
 assert.match(market,/root\.insertBefore\(slot,actions\|\|null\)/);assert.match(market,/p74-wallet-slot/);
 assert.match(css,/#home-account>\.account-strip\.p74-account-strip>\.p74-wallet-slot/);
 assert.doesNotMatch(css,/body\[data-cart-screen="home"\]/);
});

test('realtime aplica saldo exato e confirma pela carteira leve',()=>{
 assert.match(market,/channel\.bind\('balance_updated',onBalanceUpdated\)/);assert.match(market,/channel\.bind\('admin_megaphone'/);
 assert.match(market,/applyBalance\(exact,\{source:'admin_reward'/);assert.match(market,/\/api\/profile\/wallet\?_fresh=/);assert.match(market,/walletRefreshPromise/);
});

test('Megafone individual transporta saldo confirmado pelo backend canônico',()=>{
 assert.match(creator,/rewardPayload\.balance=Number\(balance\)/);assert.match(creator,/notifyBalanceUpdated/);
});

test('P77 é versão corrente e P76/P75 continuam no histórico da Central',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.77'/);assert.match(version,/releaseP77/);assert.match(notifications,/P76_RELEASE/);assert.match(notifications,/P75_RELEASE/);
});
