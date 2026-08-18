'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p64.js'),index=read('public/index.html'),release=read('lib/releaseP64.js'),version=read('api/version.js'),notifications=read('api/notifications.js'),wallet=read('api/profile/wallet.js'),auth=read('lib/auth.js'),login=read('api/auth/login.js'),realtime=read('lib/balanceRealtimeP63.js');

test('P64 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('saldo nasce junto com a identidade usando estado/cache local',()=>{
 assert.match(js,/function primeBalance\(\)/);
 assert.match(js,/readCachedBalance\(\)/);
 assert.match(js,/HomeScreen\.renderAccount=function/);
 assert.match(js,/primeBalance\(\);queueMicrotask/);
 assert.match(auth,/dirty_balance/);
 assert.match(login,/dirty_balance/);
});

test('wallet possui endpoint leve e reconciliação autoritativa',()=>{
 assert.match(wallet,/SELECT balance,updated_at FROM dirty_coin_wallets/);
 assert.match(js,/\/api\/profile\/wallet\?_fresh=/);
 assert.match(js,/applyBalance\(v,\{source\}\)/);
 assert.match(js,/MarketUI\.data\.dirtyBalance=v/);
});

test('saldo reage a transação e mantém fallback independente',()=>{
 assert.match(js,/channel\.bind\('balance_updated',onBalanceUpdated\)/);
 assert.match(js,/channel\.bind\('admin_megaphone',onRewardMegaphone\)/);
 assert.match(js,/reward_toast_fallback/);
 assert.match(js,/admin_reward_response/);
 assert.match(js,/targetUser&&targetUser===meUser/);
 assert.doesNotMatch(realtime,/balance:Number\.isFinite\(Number\(balance\)\)\?Number\(balance\):null/);
});

test('P64 permanece no histórico e pode ser supersedido por P65',()=>{
 assert.ok(index.indexOf('js/p64.js?v=1.4.64')>index.indexOf('js/p63.js?v=1.4.63'));
 assert.match(release,/APP_VERSION='v1\.4\.64'/);
 assert.match(version,/releaseP(?:64|65)/);
 assert.match(notifications,/releaseP64/);
 assert.match(notifications,/P63_RELEASE/);
});
