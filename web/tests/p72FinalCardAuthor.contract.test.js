'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const library=read('public/js/domains/cardsLibrary.js'),statsUi=read('public/js/domains/statsUI.js'),p56=read('public/js/p56.js'),p57=read('public/js/p57.js'),stats=read('api/profile/stats.js'),cards=read('api/profile/cards-v14.js'),index=read('public/index.html'),release=read('lib/releaseP72.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owner canônico de Minhas Cartas substitui os renderers históricos P56/P57',()=>{
 assert.doesNotThrow(()=>new Function(library));
 assert.match(library,/HomeScreen\.renderCards=render/);
 assert.match(library,/ProfessionalUI\.renderCards=render/);
 assert.match(library,/MetaUI\.renderCards=render/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p56\.js[^\"]*"><\/script>/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p57\.js[^\"]*"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p(?:56|57)\.js/);
});

test('renderer final mantém Criado por usuário e não reintroduz rodapé técnico',()=>{
 assert.match(library,/const creatorLabel=c=>/);
 assert.match(library,/o\.creatorUsername\|\|c\?\.creator_username\|\|o\.creatorName\|\|c\?\.creator_name/);
 assert.match(library,/<small>Criado por \$\{esc\(creatorLabel\(c\)\)\}<\/small>/);
 assert.doesNotMatch(library,/contorno \$\{[^}]*borderTier/);
 assert.match(cards,/creatorUsername/);
 assert.match(cards,/creator_username/);
});

test('P56/P57 preservam a proveniência histórica sem voltar a dominar runtime',()=>{
 assert.match(p56,/Criado por/);
 assert.match(p57,/Criado por/);
 assert.doesNotMatch(index,/<script src="js\/p56\.js/);
 assert.doesNotMatch(index,/<script src="js\/p57\.js/);
});

test('Estatísticas continua semanticamente separada da carteira',()=>{
 assert.doesNotThrow(()=>new Function(statsUi));
 assert.doesNotMatch(stats,/getEconomy|economyUiEnabled|\beconomy\b/);
 assert.doesNotMatch(statsUi,/ledger|transaction_type|dirty_balance|wallet/i);
 assert.deepEqual(['public/js/p69.js','public/js/p70.js','public/css/p61.css'].map(p=>fs.existsSync(path.join(root,p))),[false,false,false]);
});

test('P72 permanece no histórico e P74 assume a versão atual',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.72'/);
 assert.match(version,/releaseP74/);
 assert.match(notifications,/P73_RELEASE/);
 assert.match(notifications,/P72_RELEASE/);
});
