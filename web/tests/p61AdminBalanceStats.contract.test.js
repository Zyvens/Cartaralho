'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p61.js'),index=read('public/index.html'),release=read('lib/releaseP61.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

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

test('P61 não possui mais renderer nem código de extrato em Estatísticas',()=>{
 assert.doesNotMatch(js,/renderStats|ledgerHtml|p61-stats-ledger|transactionLabel|TRANSACTION_LABELS|transaction_type/);
 assert.doesNotMatch(index,/css\/p61\.css/);
});

test('P61 permanece versionado como v1.4.61 mesmo após releases posteriores',()=>{
 const p61=index.indexOf('js/p61.js?v=1.4.70'),p58=index.indexOf('js/p58.js?v=1.4.58');
 assert.ok(p61>p58);
 assert.match(release,/APP_VERSION='v1\.4\.61'/);
 assert.match(version,/releaseP(?:61|6[2-9]|70)/);
 assert.match(notifications,/releaseP61/);
 assert.match(notifications,/P60_RELEASE/);
});
