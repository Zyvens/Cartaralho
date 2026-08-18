'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p65.js'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),progression=read('api/profile/progression.js'),ui=read('public/js/cardProgressionUI.js'),rules=read('lib/cardProgressionRules.js'),release=read('lib/releaseP65.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P65 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('mostrador mantém uma única estrutura canônica',()=>{
 assert.match(js,/slots\.filter\(x=>x!==slot\)\.forEach\(x=>x\.remove\(\)\)/);
 assert.match(js,/slot\.replaceChildren\(\)/);
 assert.match(js,/value\.className='p49-balance-value'/);
 assert.match(js,/HomeScreen\.renderAccount=function\(\.\.\.args\)\{const out=base\(\.\.\.args\);canonicalizeBalance\(\);return out;\}/);
 assert.match(js,/cartaralho:balance-updated/);
});

test('contorno volta a usar presença externa individual por partida',()=>{
 assert.match(progression,/borderScore=Number\(r\.external_presence_matches\|\|0\)/);
 assert.match(cards,/external_presence_matches/);
 assert.match(cards,/borderState\(meta\?\.external_presence_matches\|\|0\)/);
 assert.doesNotMatch(cards,/ownedDistinctCards/);
 assert.doesNotMatch(progression,/ownedDistinctCards/);
 assert.doesNotMatch(cards,/borderTier:cardBorderTier\(c\.duplicate_creation_count\)/);
});

test('UI distingue contorno de alcance e adoção por Espólio',()=>{
 assert.match(js,/partidas com presença externa/);
 assert.match(js,/outro jogador traz esta mesma Carta Canônica/);
 assert.match(ui,/Partidas distintas em que outro jogador trouxe esta mesma Carta Canônica/);
 assert.match(ui,/Alcance: .* proprietários/);
 assert.match(ui,/adoções por Espólio/);
});

test('thresholds de contorno permanecem centralizados',()=>{
 assert.match(rules,/BORDER_THRESHOLDS=\[\{key:'copper',label:'Bronze',min:5\},\{key:'silver',label:'Prata',min:15\},\{key:'gold',label:'Ouro',min:40\},\{key:'platinum',label:'Platina',min:100\}\]/);
});

test('P65 carrega por último e publica versão atual',()=>{
 assert.ok(index.indexOf('js/p65.js?v=1.4.65')>index.indexOf('js/p64.js?v=1.4.64'));
 assert.ok(index.includes('cardProgressionUI.js?v=1.4.65'));
 assert.match(release,/APP_VERSION='v1\.4\.65'/);
 assert.match(version,/releaseP65/);
 assert.match(notifications,/releaseP65/);
 assert.match(notifications,/P64_RELEASE/);
});
