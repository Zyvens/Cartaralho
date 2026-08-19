'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p68.js'),css=read('public/css/p68.css'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),release=read('lib/releaseP68.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P68 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('histórico expõe data, avistamentos, jogadas, vitórias e derrotas',()=>{
 assert.match(cards,/global_plays/);
 assert.match(cards,/global_wins/);
 assert.match(cards,/globalLosses/);
 assert.match(cards,/createdAt/);
 assert.match(cards,/externalPresenceMatches/);
 assert.match(js,/CRIADO POR/);
 assert.match(js,/DATA/);
 assert.match(js,/PRIMEIRA MESA/);
 assert.match(js,/AVISTADA EM JOGOS/);
 assert.match(js,/PESSOAS QUE POSSUEM/);
 assert.match(js,/MESAS VISITADAS/);
 assert.match(js,/MESAS VENCEDORAS/);
 assert.match(js,/MESAS PERDEDORAS/);
});

test('classe usa o menor tier entre Fundo e Borda',()=>{
 assert.match(js,/Math\.min\(tierRank\(card\?\.materialTier\),tierRank\(card\?\.borderTier\)\)/);
 assert.match(js,/common',label:'Comum'/);
 assert.match(js,/uncommon',label:'Incomum'/);
 assert.match(js,/rare',label:'Rara'/);
 assert.match(js,/epic',label:'Épica'/);
 assert.match(js,/legendary',label:'Lendária'/);
});

test('Super Trunfo exige Lendária e coeficiente global seguro >= 80%',()=>{
 assert.match(js,/if\(losses===0\)return wins>0\?1:null/);
 assert.match(js,/Number\.isFinite\(value\)\?value:null/);
 assert.match(js,/rank>=4&&coefficient!==null&&coefficient>=\.8/);
 assert.match(js,/label:'Super Trunfo'/);
});

test('pill de cor é removida e substituída por raridade somente no detalhe',()=>{
 assert.match(js,/Branca\|Preta/);
 assert.match(js,/p68-rarity-pill/);
 assert.match(js,/tags\.prepend\(pill\)/);
 assert.match(css,/p68-rarity-pill-super-trunfo/);
});

test('modal recebe tema sutil por raridade',()=>{
 for(const key of['common','uncommon','rare','epic','legendary','super-trunfo'])assert.match(css,new RegExp(`p68-rarity-${key}`));
 assert.match(css,/--p68-rarity-rgb/);
});

test('P68 é a versão atual e carrega por último',()=>{
 assert.ok(index.indexOf('css/p68.css?v=1.4.68')>index.indexOf('css/p66.css?v=1.4.66'));
 assert.ok(index.indexOf('js/p68.js?v=1.4.68')>index.indexOf('js/p67.js?v=1.4.67'));
 assert.match(release,/APP_VERSION='v1\.4\.68'/);
 assert.match(version,/releaseP68/);
 assert.match(notifications,/releaseP68/);
 assert.match(notifications,/P67_RELEASE/);
});
