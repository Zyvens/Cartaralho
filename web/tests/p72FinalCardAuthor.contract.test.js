'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const p56=read('public/js/p56.js'),p57=read('public/js/p57.js'),stats=read('api/profile/stats.js'),cards=read('api/profile/cards-v14.js'),index=read('public/index.html'),release=read('lib/releaseP72.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P57 é carregado depois de P56 e é o renderer final de Minhas Cartas',()=>{
 assert.ok(index.indexOf('js/p57.js?v=1.4.72')>index.indexOf('js/p56.js?v=1.4.71'));
 assert.match(p57,/ProfessionalUI\.renderCards=render/);
 assert.match(p57,/HomeScreen\.renderCards=render/);
 assert.match(p57,/MetaUI\.renderCards=render/);
 assert.match(p57,/CartP56\.Library\.render=render/);
});

test('renderer final nasce com Criado por usuário e não gera mais o rodapé técnico',()=>{
 assert.match(p57,/const creatorLabel=c=>/);
 assert.match(p57,/o\.creatorUsername\|\|c\?\.creator_username\|\|o\.creatorName\|\|c\?\.creator_name/);
 assert.match(p57,/<small>Criado por \$\{esc\(creatorLabel\(c\)\)\}<\/small>/);
 assert.doesNotMatch(p57,/contorno \$\{label\(c\.borderTier\)\}/);
 assert.match(cards,/creatorUsername/);
 assert.match(cards,/creator_username/);
});

test('P56 também não reintroduz o rodapé técnico em caminhos alternativos',()=>{
 assert.match(p56,/<small>Criado por \$\{esc\(creatorLabel\(c\)\)\}<\/small>/);
 assert.doesNotMatch(p56,/<small>\$\{tier\(c\.materialTier\)\} · contorno/);
});

test('Estatísticas continua semanticamente separada da carteira',()=>{
 assert.doesNotMatch(stats,/getEconomy|economyUiEnabled|\beconomy\b/);
 assert.deepEqual(['public/js/p69.js','public/js/p70.js','public/css/p61.css'].map(p=>fs.existsSync(path.join(root,p))),[false,false,false]);
});

test('P72 permanece no histórico e P73 assume a versão atual',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.72'/);
 assert.match(version,/releaseP73/);
 assert.match(notifications,/releaseP73/);
 assert.match(notifications,/P72_RELEASE/);
});
