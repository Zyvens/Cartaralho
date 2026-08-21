'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const p49=read('public/js/p49.js'),p61=read('public/js/p61.js'),p63=read('public/js/p63.js'),p64=read('public/js/p64.js'),p74=read('public/js/p74.js'),home=read('public/js/screens/home.js'),auth=read('lib/auth.js'),login=read('api/auth/login.js'),wallet=read('api/profile/wallet.js'),clean=read('api/cards/clean.js'),market=read('lib/marketplaceState.js'),index=read('public/index.html'),release=read('lib/releaseP75.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('raiz P49 usa o saldo já autenticado no primeiro paint',()=>{
 assert.match(home,/await AuthClient\.restore\(\)/);
 assert.match(auth,/dirty_balance/);
 assert.match(login,/dirty_balance/);
 assert.match(p49,/function knownBalance\(\)/);
 assert.match(p49,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(p49,/setBalance\(value,\{loading:false\}\)/);
});

test('P49 não usa mais o inventário de Cartas Limpas para descobrir um único saldo',()=>{
 assert.doesNotMatch(p49,/AuthClient\.cleanCards\(\)/);
 assert.match(clean,/cleanCards\.getInventory\(user\.id,20\)/);
 assert.match(wallet,/SELECT balance,updated_at FROM dirty_coin_wallets/);
 assert.match(p49,/\/api\/profile\/wallet\?_fresh=/);
});

test('P61 e P63 deixam de carregar o Mercado Paralelo inteiro para confirmar saldo',()=>{
 for(const js of [p61,p63]){
  assert.match(js,/\/api\/profile\/wallet\?_fresh=/);
  assert.doesNotMatch(js,/AuthClient\.request\('\/api\/marketplace'\)/);
  assert.doesNotMatch(js,/AuthClient\.cleanCards\(\)/);
 }
 assert.match(market,/Promise\.all/);
 assert.match(market,/market_purchases/);
 assert.match(market,/dirty_coin_ledger/);
});

test('P64 coalesce confirmações simultâneas da carteira',()=>{
 assert.match(p64,/walletRefreshPromise/);
 assert.match(p64,/if\(walletRefreshPromise\)return walletRefreshPromise/);
 assert.match(p64,/\/api\/profile\/wallet\?_fresh=/);
});

test('P74 fica responsável por posição e não cria fetch extra no render da Home',()=>{
 assert.match(p74,/CartP64\?\.refreshBalance/);
 assert.match(p74,/\/api\/profile\/wallet\?_fresh=/);
 const patch=p74.match(/function patchHome\(\)[\s\S]*?function patchProfessionalUI/);assert.ok(patch);
 assert.doesNotMatch(patch[0],/scheduleAuthoritative|syncAuthoritative/);
});

test('P75 permanece preservado após o reforço estrutural P76',()=>{
 for(const asset of ['js/p49.js','js/p61.js','js/p63.js','js/p64.js'])assert.ok(index.includes(`${asset}?v=1.4.75`),asset);
 assert.ok(index.includes('js/p74.js?v=1.4.76'));
 assert.match(release,/APP_VERSION='v1\.4\.75'/);
 assert.match(version,/releaseP76/);
 assert.match(notifications,/P75_RELEASE/);
 assert.match(notifications,/P74_RELEASE/);
});
