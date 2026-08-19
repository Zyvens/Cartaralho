'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p66.js'),p67=read('public/js/p67.js'),css=read('public/css/p66.css'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),progression=read('api/profile/progression.js'),release=read('lib/releaseP66.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P66 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('fundo permanece baseado apenas em vitórias pessoais de rodada',()=>{
 assert.match(progression,/materialScore=Number\(r\.white_personal_wins\|\|0\)/);
 assert.doesNotMatch(progression,/materialScore=Number\(r\.white_personal_wins\|\|0\)\+Number\(r\.black_personal_uses/);
 assert.match(cards,/white_personal_wins/);
 assert.match(cards,/personalRoundWins/);
 assert.match(cards,/cardMaterialTier\(c\.personalRoundWins\)/);
 assert.match(p67,/rodadas vencidas com esta carta/);
});

test('P66 histórico de proprietários é supersedido pela popularidade por Espólio do P67',()=>{
 assert.match(js,/worldHolders/);
 assert.match(progression,/borderScore=Number\(r\.adoption_count\|\|0\)/);
 assert.match(cards,/acquisition_source='match_loot'/);
 assert.match(cards,/borderState\(lootCollectors\)/);
 assert.match(p67,/coletas por Espólio por outros jogadores/);
});

test('camada atual usa FUNDO e BORDA com semânticas independentes',()=>{
 assert.match(p67,/const title=background\?'FUNDO':'BORDA'/);
 assert.match(p67,/quão boa esta carta é/);
 assert.match(p67,/popularidade da carta/);
});

test('campos mobile não acionam zoom de foco e admin fica ancorado',()=>{
 assert.match(css,/@supports \(-webkit-touch-callout:none\)/);
 assert.match(css,/input,textarea,select,\.input\{font-size:16px!important\}/);
 assert.match(css,/\.creator-admin-overlay\{[\s\S]*place-items:start center!important/);
 assert.match(css,/\.creator-admin-field input,[\s\S]*font-size:16px!important/);
});

test('P66 permanece no histórico e P67 carrega por último',()=>{
 assert.ok(index.indexOf('js/p67.js?v=1.4.67')>index.indexOf('js/p66.js?v=1.4.66'));
 assert.ok(index.includes('cardProgressionUI.js?v=1.4.67'));
 assert.match(release,/APP_VERSION='v1\.4\.66'/);
 assert.match(version,/releaseP(?:66|67)/);
 assert.match(notifications,/releaseP66/);
 assert.match(notifications,/P65_RELEASE/);
});
