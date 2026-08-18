'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p63.js'),index=read('public/index.html'),release=read('lib/releaseP63.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),admin=read('api/admin/creator-tools.js'),market=read('api/marketplace.js'),recycling=read('api/recycling.js'),clean=read('api/cards/clean.js'),realtime=read('lib/balanceRealtimeP63.js');

test('P63 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('transação administrativa dispara balance_updated separado do megafone',()=>{
 assert.match(admin,/notifyBalanceUpdated/);
 assert.match(admin,/reason:'admin_reward'/);
 assert.match(admin,/broadcastGlobal\('admin_megaphone'/);
 assert.match(realtime,/broadcastGlobal\('balance_updated'/);
});

test('compras e reciclagem também disparam o ping transacional',()=>{
 assert.match(market,/notifyBalanceUpdated\(\{userIds:\[user\.id\],balance:r\.dirtyBalance,reason:'marketplace_purchase'\}\)/);
 assert.match(recycling,/notifyBalanceUpdated\(\{userIds:\[user\.id\],balance:result\.balance,reason:'card_recycling'\}\)/);
 assert.match(clean,/notifyBalanceUpdated\(\{userIds:\[user\.id\],balance:result\.dirtyBalance,reason:'clean_card_purchase'\}\)/);
});

test('cliente mantém assinatura do ping até o Pusher estar pronto',()=>{
 assert.match(js,/channel\.bind\('balance_updated',onBalanceUpdated\)/);
 assert.match(js,/setTimeout\(\(\)=>\{retryTimer=null;bindBalanceChannel\(\);\},500\)/);
 assert.match(js,/SocketClient\._waitReady\(\)/);
});

test('saldo recebido atualiza Home e Mercado imediatamente',()=>{
 assert.match(js,/CartP49\?\.setBalance\?\.\(v,\{loading:false\}\)/);
 assert.match(js,/document\.querySelectorAll\('\.account-strip \.p49-balance-value'\)/);
 assert.match(js,/MarketUI\.data\.dirtyBalance=v/);
 assert.match(js,/MarketUI\.render\(\)/);
 assert.match(js,/fetchAuthoritativeBalance/);
});

test('auto-prêmio e transações próprias atualizam pelo próprio retorno HTTP',()=>{
 assert.match(js,/p==='\/api\/admin\/creator-tools'/);
 assert.match(js,/targetId===me&&Number\.isFinite\(v\)/);
 assert.match(js,/p==='\/api\/recycling'/);
 assert.match(js,/p==='\/api\/cards\/clean'/);
 assert.match(js,/p==='\/api\/marketplace'/);
});

test('P63 permanece carregado antes das camadas posteriores',()=>{
 assert.ok(index.indexOf('js/p63.js?v=1.4.63')>index.indexOf('js/p62.js?v=1.4.62'));
 assert.match(release,/APP_VERSION='v1\.4\.63'/);
 assert.match(version,/releaseP(?:63|64)/);
 assert.match(notifications,/releaseP63/);
 assert.match(notifications,/P62_RELEASE/);
});
