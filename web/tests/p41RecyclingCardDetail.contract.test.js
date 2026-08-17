'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p41.js'),css=read('public/css/p41.css'),recycling=read('lib/cardRecycling.js'),balance=read('lib/balanceConfig.js'),migration=read('db/p41_recycling_any_count.sql'),index=read('public/index.html'),release=read('lib/releaseP41.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P41 JS compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('editor remove apenas o Salvar e voltar ao Lobby redundante do topo',()=>{
 assert.match(js,/card-creation-screen > #back-btn/);
 assert.match(js,/Salvar e voltar ao Lobby/);
 assert.match(js,/top\.remove\(\)/);
 assert.match(js,/CardCreationScreen\.render/);
});

test('reciclagem aceita qualquer quantidade e paga 25 por carta',()=>{
 assert.match(balance,/recycling:\{rewardPerCard:25\}/);
 assert.match(recycling,/rewardPerCard/);
 assert.match(recycling,/ids\.length<1/);
 assert.match(recycling,/ids\.length\*p\.rewardPerCard/);
 assert.doesNotMatch(recycling,/ids\.length%p\.batchSize/);
 assert.match(js,/n\*per/);
 assert.match(js,/Selecione uma ou mais cartas/);
});

test('confirmação da reciclagem mostra cartas pretas e brancas e duas ações claras',()=>{
 assert.match(js,/p41-recycle-confirm-overlay/);
 assert.match(js,/p41-recycle-card-preview/);
 assert.match(js,/Carta Preta/);
 assert.match(js,/Carta Branca/);
 assert.match(js,/p41-recycle-cancel/);
 assert.match(js,/p41-recycle-go/);
 assert.match(css,/p41-recycle-confirm-list/);
 assert.match(css,/p41-recycle-card-preview\.black/);
 assert.match(css,/p41-recycle-card-preview\.white/);
});

test('constraint antiga de lote é substituída por mínimo de uma carta',()=>{
 assert.match(migration,/DROP CONSTRAINT IF EXISTS card_recycling_batches_card_count_check/);
 assert.match(migration,/CHECK\(card_count>=1\)/);
});

test('Minhas Cartas usa detalhe dedicado acima do painel e sem Modal genérico redundante',()=>{
 assert.match(js,/MetaUI\.renderCards=renderMyCards/);
 assert.match(js,/p41-card-detail-overlay/);
 assert.match(js,/p41-progression-grid/);
 assert.match(js,/História desta carta/);
 assert.match(js,/Mesas visitadas/);
 assert.match(js,/Pessoas que possuem/);
 assert.match(css,/z-index:18000/);
 assert.match(css,/p41-card-detail-shell/);
});

test('Admin tem simetria com Missões e menu mostra admin • VitorIvens',()=>{
 assert.match(css,/\.creator-admin-fab,\.mission-fab/);
 assert.match(css,/min-height:44px!important/);
 assert.match(css,/padding:10px 14px!important/);
 assert.match(css,/content:'admin • VitorIvens'/);
});

test('card da conta não quebra Perfil e Sair para uma segunda linha no mobile',()=>{
 assert.match(css,/\.home-account-bar\{[\s\S]*flex-wrap:nowrap!important/);
 assert.match(css,/\.home-account-bar \.home-account-balance\{[\s\S]*padding-left:8px!important/);
 assert.match(css,/@media\(max-width:620px\)[\s\S]*min-width:82px!important;max-width:104px!important;padding:0 6px!important/);
 assert.match(css,/flex-basis:44px!important;width:44px!important;min-width:44px!important/);
 assert.match(css,/text-overflow:ellipsis!important/);
});

test('P41 publica versão e permanece preservado após releases futuros',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.41'/);
 assert.match(release,/release:p41/);
 assert.match(version,/releaseP(?:4[1-9]|[5-9]\d)/);
 assert.match(notifications,/releaseP41/);
 assert.match(notifications,/P40_RELEASE/);
 assert.match(index,/css\/p41\.css\?v=1\.4\.41/);
 assert.match(index,/js\/p41\.js\?v=1\.4\.41/);
 assert.ok(index.indexOf('css/p41.css?v=1.4.41')>index.indexOf('css/p40.css?v=1.4.40'));
 assert.ok(index.indexOf('js/p41.js?v=1.4.41')>index.indexOf('js/p40.js?v=1.4.40'));
});
