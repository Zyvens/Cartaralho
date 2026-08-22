'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const adminUI=read('public/js/domains/adminUI.js'),marketUI=read('public/js/domains/marketplaceUI.js'),statsUI=read('public/js/domains/statsUI.js'),index=read('public/index.html'),release=read('lib/releaseP61.js'),version=read('api/version.js');

test('owners canônicos de admin, carteira e estatísticas compilam e estão ativos',()=>{
 assert.doesNotThrow(()=>new Function(adminUI));
 assert.doesNotThrow(()=>new Function(marketUI));
 assert.doesNotThrow(()=>new Function(statsUI));
 assert.match(index,/<script src="js\/domains\/adminUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script src="js\/domains\/marketplaceUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script src="js\/domains\/statsUI\.js\?v=domain-2"><\/script>/);
});

test('aviso administrativo consulta a versão atual do servidor',()=>{
 assert.match(adminUI,/async function serverVersion\(\)/);
 assert.match(adminUI,/AuthClient\.request\('\/api\/version'\)/);
 assert.match(adminUI,/#admin-update-send/);
 assert.match(adminUI,/Nova atualização \$\{current\} disponível/);
});

test('prêmio administrativo entrega saldo exato ao owner da carteira',()=>{
 assert.match(adminUI,/CartMarketplaceDomain\?\.applyBalance/);
 assert.match(adminUI,/source:'admin_reward_response'/);
 assert.match(adminUI,/CartMarketplaceDomain\?\.refreshBalance/);
 assert.match(marketUI,/cartaralho:balance-updated/);
 assert.match(marketUI,/MarketUI\.data\.dirtyBalance=v/);
});

test('Estatísticas permanecem sem renderer de wallet ou extrato',()=>{
 assert.match(statsUI,/HomeScreen\.renderStats=render/);
 assert.doesNotMatch(statsUI,/dirtyBalance|wallet|ledger|transaction_type|transactionLabel|TRANSACTION_LABELS/);
 assert.doesNotMatch(index,/css\/p61\.css/);
});

test('P61 JS é proveniência histórica e P75 é a release corrente',()=>{
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p61\.js\?v=1\.4\.71"><\/script>/);
 assert.match(release,/APP_VERSION='v1\.4\.61'/);
 assert.match(version,/releaseP75/);
});
