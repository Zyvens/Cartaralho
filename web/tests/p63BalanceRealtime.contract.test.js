'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const marketUI=read('public/js/domains/marketplaceUI.js'),index=read('public/index.html'),release=read('lib/releaseP63.js'),version=read('api/version.js'),realtime=read('lib/balanceRealtimeP63.js');

test('owner canônico de carteira/realtime compila e está executável',()=>{
 assert.doesNotThrow(()=>new Function(marketUI));
 assert.match(marketUI,/CartDomains\.claim\('marketplaceUI','domains\/marketplaceUI\.js'/);
 assert.match(index,/<script src="js\/domains\/marketplaceUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p63\.js\?v=1\.4\.63"><\/script>/);
});

test('backend mantém evento transacional de saldo separado de mensagens globais',()=>{
 assert.match(realtime,/broadcastGlobal\('balance_updated'/);
});

test('cliente mantém assinatura do saldo até o canal realtime estar pronto',()=>{
 assert.match(marketUI,/channel\.bind\('balance_updated',onBalanceUpdated\)/);
 assert.match(marketUI,/retryTimer=setTimeout\(\(\)=>\{retryTimer=null;bindRealtime\(\);\},500\)/);
 assert.match(marketUI,/SocketClient\._waitReady\(\)/);
});

test('saldo recebido atualiza Home e Mercado imediatamente e depois reconcilia',()=>{
 assert.match(marketUI,/function applyBalance\(value,/);
 assert.match(marketUI,/mountBalance\(v\)/);
 assert.match(marketUI,/MarketUI\.data\.dirtyBalance=v/);
 assert.match(marketUI,/if\(MarketUI\.overlay\)MarketUI\.render\(\)/);
 assert.match(marketUI,/setTimeout\(\(\)=>refreshBalance\(data\.reason\|\|'balance_updated'\),20\)/);
});

test('respostas de transações próprias atualizam o saldo sem esperar realtime',()=>{
 assert.match(marketUI,/admin_reward_response/);
 assert.match(marketUI,/card_recycling_response/);
 assert.match(marketUI,/clean_card_response/);
 assert.match(marketUI,/marketplace_response/);
});

test('P63 permanece como proveniência histórica e P74 é a release corrente',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.63'/);
 assert.match(version,/releaseP74/);
});
