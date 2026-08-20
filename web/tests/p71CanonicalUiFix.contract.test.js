'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const p54=read('public/js/p54.js'),p56=read('public/js/p56.js'),p61=read('public/js/p61.js'),p62=read('public/js/p62.js'),p67=read('public/js/p67.js'),stats=read('api/profile/stats.js'),cards=read('api/profile/cards-v14.js'),index=read('public/index.html'),release=read('lib/releaseP71.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P71 corrige autoria no renderer que realmente cria o rodapé',()=>{
 assert.match(p56,/const creatorLabel=c=>/);
 assert.match(p56,/<small>Criado por \$\{esc\(creatorLabel\(c\)\)\}<\/small>/);
 assert.doesNotMatch(p56,/<small>\$\{tier\(c\.materialTier\)\} · contorno/);
 assert.match(cards,/creatorUsername/);
 assert.match(cards,/creator_username/);
});

test('P71 remove carteira do contrato de Estatísticas',()=>{
 assert.doesNotMatch(stats,/getEconomy|economyUiEnabled|\beconomy\b/);
 assert.doesNotMatch(p54,/stats-ledger|mountStatsLedger|transaction_type|ledgerHtml/);
 assert.doesNotMatch(p61,/stats-ledger|ledgerHtml|renderStats|transaction_type/);
 assert.doesNotMatch(p62,/stripStatsEconomy|renderStats|stats-ledger/);
 assert.doesNotMatch(p67,/purgeStatsEconomy|renderStats|stats-ledger/);
});

test('P71 apaga hotfixes P69/P70 e stylesheet de ledger obsoleto',()=>{
 assert.equal(fs.existsSync(path.join(root,'public/js/p69.js')),false);
 assert.equal(fs.existsSync(path.join(root,'public/js/p70.js')),false);
 assert.equal(fs.existsSync(path.join(root,'public/css/p61.css')),false);
 assert.doesNotMatch(index,/js\/p69\.js|js\/p70\.js|css\/p61\.css/);
});

test('P71 elimina dependência incorreta de window para bindings lexicais críticos',()=>{
 assert.doesNotMatch(p56,/window\.HomeScreen|window\.MetaUI|window\.ProfessionalUI/);
 assert.doesNotMatch(p62,/window\.HomeScreen/);
});

test('P71 cache-busta todos os módulos alterados',()=>{
 for(const asset of ['css/p54.css','css/p62.css','js/p54.js','js/p56.js','js/p61.js','js/p62.js','js/p67.js'])assert.ok(index.includes(`${asset}?v=1.4.71`),asset);
});

test('P71 é a versão atual e preserva P69 apenas como histórico de release',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.71'/);
 assert.match(version,/releaseP71/);
 assert.match(notifications,/releaseP71/);
 assert.match(notifications,/P69_RELEASE/);
});
