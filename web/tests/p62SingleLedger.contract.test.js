'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p62.js'),css=read('public/css/p62.css'),index=read('public/index.html'),release=read('lib/releaseP62.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P62 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Estatísticas não possui mais painel de Moedas Sujas',()=>{
 assert.match(js,/async function renderStats\(panel\)/);
 assert.match(js,/MetaUI\.renderStats\(panel\)/);
 assert.match(js,/HomeScreen\.renderStats=renderStats/);
 assert.match(js,/\.p61-stats-ledger,\.p54-stats-ledger/);
 assert.match(css,/\.p61-stats-ledger[\s\S]*\.p54-stats-ledger[\s\S]*display:none!important/);
 assert.doesNotMatch(js,/function ledgerHtml/);
 assert.doesNotMatch(js,/transaction_type/);
});

test('mostrador de moedas abre Mercado Paralelo diretamente no Extrato',()=>{
 assert.match(js,/BALANCE_SELECTOR=['"]\.account-strip \.p49-balance-slot,\.account-strip \.home-account-balance['"]/);
 assert.match(js,/MarketUI\.open\('ledger'\)/);
 assert.match(js,/e\.stopImmediatePropagation\(\)/);
 assert.match(js,/document\.addEventListener\('click',[\s\S]*,true\)/);
 assert.match(js,/Abrir extrato de Moedas Sujas no Mercado Paralelo/);
});

test('atalho do saldo também funciona por teclado',()=>{
 assert.match(js,/document\.addEventListener\('keydown'/);
 assert.match(js,/\['Enter',' '\]\.includes\(e\.key\)/);
 assert.match(js,/role','button/);
 assert.match(js,/tabindex','0/);
});

test('P62 permanece carregado e versionado após releases posteriores',()=>{
 assert.ok(index.indexOf('css/p62.css?v=1.4.62')>index.indexOf('css/p61.css?v=1.4.61'));
 assert.ok(index.indexOf('js/p62.js?v=1.4.62')>index.indexOf('js/p61.js?v=1.4.61'));
 assert.match(release,/APP_VERSION='v1\.4\.62'/);
 assert.match(version,/APP_VERSION/);
 assert.match(notifications,/releaseP62/);
 assert.match(notifications,/P61_RELEASE/);
});
