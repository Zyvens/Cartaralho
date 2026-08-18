'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p66.js'),css=read('public/css/p66.css'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),progression=read('api/profile/progression.js'),ui=read('public/js/cardProgressionUI.js'),release=read('lib/releaseP66.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P66 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('fundo progride apenas por vitórias pessoais de rodada',()=>{
 assert.match(progression,/materialScore=Number\(r\.white_personal_wins\|\|0\)/);
 assert.doesNotMatch(progression,/materialScore=Number\(r\.white_personal_wins\|\|0\)\+Number\(r\.black_personal_uses/);
 assert.match(cards,/white_personal_wins/);
 assert.match(cards,/personalRoundWins/);
 assert.match(cards,/cardMaterialTier\(c\.personalRoundWins\)/);
 assert.match(js,/rodadas vencidas com esta carta/);
 assert.match(js,/O fundo sobe quando você vence uma rodada utilizando esta carta/);
});

test('borda progride por proprietários globais distintos da Carta Canônica',()=>{
 assert.match(progression,/borderScore=Number\(r\.reach_count\|\|0\)/);
 assert.match(cards,/COUNT\(DISTINCT h\.user_id\)/);
 assert.match(cards,/borderState\(worldHolders\)/);
 assert.match(cards,/lootCollectors/);
 assert.match(js,/pessoas que possuem esta carta no mundo/);
 assert.match(ui,/Jogadores distintos que possuem esta Carta Canônica no mundo/);
});

test('camada visual chama material de FUNDO e preserva histórico de Espólio',()=>{
 assert.match(js,/const title=background\?'FUNDO':'CONTORNO'/);
 assert.match(js,/Cartas coletadas por Espólio entram automaticamente nesta contagem/);
 assert.match(cards,/Aquisições por Espólio aumentam essa circulação automaticamente/);
});

test('campos mobile não acionam zoom de foco e admin fica ancorado',()=>{
 assert.match(css,/@supports \(-webkit-touch-callout:none\)/);
 assert.match(css,/input,textarea,select,\.input\{font-size:16px!important\}/);
 assert.match(css,/\.creator-admin-overlay\{[\s\S]*place-items:start center!important/);
 assert.match(css,/\.creator-admin-field input,[\s\S]*font-size:16px!important/);
});

test('P66 carrega por último e publica versão atual',()=>{
 assert.ok(index.indexOf('css/p66.css?v=1.4.66')>index.indexOf('css/p62.css?v=1.4.62'));
 assert.ok(index.indexOf('js/p66.js?v=1.4.66')>index.indexOf('js/p65.js?v=1.4.65'));
 assert.ok(index.includes('cardProgressionUI.js?v=1.4.66'));
 assert.match(release,/APP_VERSION='v1\.4\.66'/);
 assert.match(version,/releaseP66/);
 assert.match(notifications,/releaseP66/);
 assert.match(notifications,/P65_RELEASE/);
});
