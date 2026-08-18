'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p61.js'),css=read('public/css/p61.css'),index=read('public/index.html'),release=read('lib/releaseP61.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P61 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('aviso administrativo consulta a versão atual do servidor',()=>{
 assert.match(js,/async function serverVersion\(\)/);
 assert.match(js,/AuthClient\.request\('\/api\/version'\)/);
 assert.match(js,/#admin-update-send/);
 assert.match(js,/Nova atualização \$\{current\} disponível/);
 assert.doesNotMatch(js,/Nova atualização v1\.4\.41 disponível/);
});

test('prêmio administrativo sincroniza o saldo do destinatário em tempo real',()=>{
 assert.match(js,/channel\.bind\('admin_megaphone'/);
 assert.match(js,/data\.kind!==['"]reward['"]/);
 assert.match(js,/AuthClient\.request\('\/api\/marketplace'\)/);
 assert.match(js,/CartP49\?\.setBalance\?\.\(v,\{loading:false\}\)/);
 assert.match(js,/MarketUI\.data\.dirtyBalance=v/);
 assert.match(js,/MarketUI\.render\(\)/);
 assert.match(js,/cartaralho:balance-updated/);
});

test('Estatísticas usa o mesmo payload e nunca exibe transaction_type cru',()=>{
 assert.match(js,/const d=await AuthClient\.stats\(\)/);
 assert.match(js,/economy=d\.economy\|\|\{\}/);
 assert.match(js,/card_recycling:'Reciclagem de cartas'/);
 assert.match(js,/admin_reward:'Prêmio recebido da administração'/);
 assert.match(js,/return TRANSACTION_LABELS\[type\]\|\|'Movimentação de moedas'/);
 assert.match(js,/HomeScreen\.renderStats=renderStats/);
 assert.doesNotMatch(js,/\$\{esc\(type\)\}/);
 assert.doesNotMatch(js,/\|\|type\|\|/);
});

test('extrato de Estatísticas nasce contraído e é expansível',()=>{
 assert.match(js,/<details class="p61-stats-ledger">/);
 assert.doesNotMatch(js,/<details class="p61-stats-ledger" open/);
 assert.match(css,/\.p61-stats-ledger>summary/);
 assert.match(css,/\.p61-stats-ledger\[open\] \.p61-ledger-summary i/);
});

test('P61 permanece versionado como v1.4.61 mesmo após releases posteriores',()=>{
 assert.ok(index.indexOf('css/p61.css?v=1.4.61')>index.indexOf('css/p60.css?v=1.4.60'));
 assert.ok(index.indexOf('js/p61.js?v=1.4.61')>index.indexOf('js/p58.js?v=1.4.58'));
 assert.match(release,/APP_VERSION='v1\.4\.61'/);
 assert.match(version,/APP_VERSION/);
 assert.match(notifications,/releaseP61/);
 assert.match(notifications,/P60_RELEASE/);
});
