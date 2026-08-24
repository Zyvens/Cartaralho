'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base=read('public/js/marketplaceUI.js'),account=read('public/js/domains/accountUI.js'),domain=read('public/js/domains/marketplaceUI.js');

test('account owner compila e monta entrada do Mercado junto da Home autenticada',()=>{
 assert.doesNotThrow(()=>new Function(account));
 assert.match(account,/MarketUI\?\.ensureHomeButton\?\.\(\)/);
 assert.match(account,/CartMarketplaceDomain\?\.mountBalance\?\.\(\)/);
});

test('shell do Mercado mantém função de entrada sem MutationObserver global',()=>{
 assert.doesNotThrow(()=>new Function(base));
 assert.match(base,/ensureHomeButton\(\)/);
 assert.match(base,/marketplace-menu-btn/);
 assert.doesNotMatch(base,/MutationObserver/);
 assert.doesNotMatch(base,/setTimeout\(\(\)=>M\.ensureHomeButton/);
});

test('ownership financeiro permanece no domain e não foi deslocado para accountUI',()=>{
 for(const token of ['applyBalance','refreshBalance','bindRealtime','patchTransactionResponses','installRecycling'])assert.match(domain,new RegExp(token));
 assert.doesNotMatch(account,/AuthClient\.request\(`?\/api\/profile\/wallet/);
 assert.doesNotMatch(account,/balance_updated/);
});
