'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p69.js'),index=read('public/index.html'),release=read('lib/releaseP69.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P69 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Estatísticas usa renderer sem carteira e remove qualquer extrato tardio',()=>{
 assert.match(js,/HomeScreen\.renderStats=renderStatsOnly/);
 assert.match(js,/MetaUI\?\.renderStats/);
 assert.match(js,/\.p61-stats-ledger,\.p54-stats-ledger/);
 assert.match(js,/new MutationObserver\(\(\)=>purgeStatsEconomy\(root\)\)/);
 assert.match(js,/CartP54\.mountStatsLedger=panel=>/);
});

test('Minhas Cartas mantém autoria após qualquer redraw e remove De Jogador redundante',()=>{
 assert.match(js,/footer\.textContent=`Criado por \$\{creatorLabel\(data\)\}`/);
 assert.match(js,/\.card-origin-tag\.player/);
 assert.match(js,/new MutationObserver\(\(\)=>decorateLibrary\(panel,lastCards\)\)/);
 assert.match(js,/L\.render=async function\(panel,\.\.\.args\)/);
 assert.match(js,/L\.consolidate\?\.\(\)/);
});

test('cache bust dos renderizadores antigos acompanha o hotfix',()=>{
 assert.ok(index.includes('js/p54.js?v=1.4.69'));
 assert.ok(index.includes('js/p56.js?v=1.4.69'));
 assert.ok(index.includes('js/p61.js?v=1.4.69'));
 assert.ok(index.indexOf('js/p69.js?v=1.4.69')>index.indexOf('js/p68.js?v=1.4.68'));
});

test('P69 é a versão atual',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.69'/);
 assert.match(version,/releaseP69/);
 assert.match(notifications,/releaseP69/);
 assert.match(notifications,/P68_RELEASE/);
});
