'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const marketUI=read('public/js/domains/marketplaceUI.js'),index=read('public/index.html'),release=read('lib/releaseP64.js'),version=read('api/version.js'),wallet=read('api/profile/wallet.js'),auth=read('lib/auth.js'),login=read('api/auth/login.js');

test('owner canônico da carteira compila e substitui o P64 executável',()=>{
 assert.doesNotThrow(()=>new Function(marketUI));
 assert.match(marketUI,/CartDomains\.claim\('marketplaceUI','domains\/marketplaceUI\.js'/);
 assert.match(index,/<script src="js\/domains\/marketplaceUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p64\.js\?v=1\.4\.64"><\/script>/);
});

test('saldo nasce junto com a identidade usando estado e cache local',()=>{
 assert.match(marketUI,/knownBalance=explicit=>/);
 assert.match(marketUI,/AuthClient\?\.user\?\.dirty_balance/);
 assert.match(marketUI,/localStorage\.getItem\(cacheKey\(\)\)/);
 assert.match(marketUI,/function mountBalance\(explicit=null\)/);
 assert.match(auth,/dirty_balance/);
 assert.match(login,/dirty_balance/);
});

test('wallet possui endpoint leve, reconciliação autoritativa e coalescing P75',()=>{
 assert.match(wallet,/SELECT balance,updated_at FROM dirty_coin_wallets/);
 assert.match(marketUI,/\/api\/profile\/wallet\?_fresh=\$\{Date\.now\(\)\}/);
 assert.match(marketUI,/walletRefreshPromise/);
 assert.match(marketUI,/if\(walletRefreshPromise\)return walletRefreshPromise/);
 assert.match(marketUI,/applyBalance\(v,\{source\}\)/);
});

test('saldo reage a realtime e mantém fallback por resposta HTTP',()=>{
 assert.match(marketUI,/channel\.bind\('balance_updated',onBalanceUpdated\)/);
 assert.match(marketUI,/channel\.bind\('admin_megaphone'/);
 assert.match(marketUI,/source:'admin_reward_response'/);
 assert.match(marketUI,/source:'card_recycling_response'/);
 assert.match(marketUI,/source:'clean_card_response'/);
 assert.match(marketUI,/source:'marketplace_response'/);
});

test('P64 permanece como proveniência histórica e P75 é a release corrente',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.64'/);
 assert.match(version,/releaseP75/);
});
