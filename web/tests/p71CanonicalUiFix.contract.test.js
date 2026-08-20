'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const library=read('public/js/domains/cardsLibrary.js'),statsUi=read('public/js/domains/statsUI.js'),p54=read('public/js/p54.js'),p56=read('public/js/p56.js'),p61=read('public/js/p61.js'),p62=read('public/js/p62.js'),p67=read('public/js/p67.js'),stats=read('api/profile/stats.js'),cards=read('api/profile/cards-v14.js'),index=read('public/index.html'),release=read('lib/releaseP71.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('autoria consolidada vive no owner de Minhas Cartas e mantém dados do criador',()=>{
 assert.match(library,/const creatorLabel=c=>/);
 assert.match(library,/<small>Criado por \$\{esc\(creatorLabel\(c\)\)\}<\/small>/);
 assert.doesNotMatch(library,/contorno \$\{[^}]*borderTier/);
 assert.match(cards,/creatorUsername/);
 assert.match(cards,/creator_username/);
});

test('Estatísticas canônica permanece separada da carteira',()=>{
 assert.doesNotThrow(()=>new Function(statsUi));
 assert.match(statsUi,/CartDomains\.claim\('statsUI'/);
 assert.doesNotMatch(stats,/getEconomy|economyUiEnabled|\beconomy\b/);
 assert.doesNotMatch(statsUi,/stats-ledger|transaction_type|dirty_balance|wallet|ledgerHtml/i);
 for(const source of[p54,p61,p62,p67])assert.doesNotMatch(source,/stats-ledger|ledgerHtml|transaction_type/);
});

test('hotfixes P69/P70 e stylesheet de ledger obsoleto continuam ausentes',()=>{
 assert.equal(fs.existsSync(path.join(root,'public/js/p69.js')),false);
 assert.equal(fs.existsSync(path.join(root,'public/js/p70.js')),false);
 assert.equal(fs.existsSync(path.join(root,'public/css/p61.css')),false);
 assert.doesNotMatch(index,/js\/p69\.js|js\/p70\.js|css\/p61\.css/);
});

test('módulos históricos alterados por P71 são apenas proveniência, não owners executáveis',()=>{
 for(const asset of['p54','p56','p61','p62','p67']){
  assert.match(index,new RegExp(`<script type="application\\/x-cartaralho-legacy" src="js\\/${asset}\\.js[^\\"]*"><\\/script>`),asset);
  assert.doesNotMatch(index,new RegExp(`<script src="js\\/${asset}\\.js`),asset);
 }
 assert.match(index,/js\/domains\/cardsLibrary\.js\?v=domain-2/);
 assert.match(index,/js\/domains\/statsUI\.js\?v=domain-2/);
});

test('P71 permanece no histórico após P74',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.71'/);
 assert.match(version,/releaseP74/);
 assert.match(notifications,/releaseP72/);
 assert.match(notifications,/P71_RELEASE/);
 assert.match(notifications,/P69_RELEASE/);
});
