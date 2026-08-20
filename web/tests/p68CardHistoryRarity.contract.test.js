'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const progression=read('public/js/domains/cardProgression.js'),history=read('public/js/p68.js'),css=read('public/css/p68.css'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),release=read('lib/releaseP68.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owner canônico de progressão compila e P68 histórico continua legível',()=>{
 assert.doesNotThrow(()=>new Function(progression));
 assert.doesNotThrow(()=>new Function(history));
 assert.match(progression,/CartDomains\.claim\('cardProgression'/);
});

test('histórico final expõe data, avistamentos, jogadas, vitórias e derrotas',()=>{
 assert.match(cards,/global_plays/);
 assert.match(cards,/global_wins/);
 assert.match(cards,/globalLosses/);
 assert.match(cards,/createdAt/);
 assert.match(cards,/externalPresenceMatches/);
 for(const label of['CRIADO POR','DATA','PRIMEIRA MESA','AVISTADA EM JOGOS','PESSOAS QUE POSSUEM','MESAS VISITADAS','MESAS VENCEDORAS','MESAS PERDEDORAS'])assert.ok(progression.includes(label),label);
});

test('raridade final usa o menor tier entre Fundo e Borda',()=>{
 assert.match(progression,/Math\.min\(tierRank\(card\?\.materialTier\),tierRank\(card\?\.borderTier\)\)/);
 for(const pair of[["common","Comum"],["uncommon","Incomum"],["rare","Rara"],["epic","Épica"],["legendary","Lendária"]])assert.ok(progression.includes(`key:'${pair[0]}',label:'${pair[1]}'`));
});

test('Super Trunfo exige topo de progressão e coeficiente global seguro >= 80%',()=>{
 assert.match(progression,/if\(losses===0\)return wins>0\?1:null/);
 assert.match(progression,/Number\.isFinite\(v\)\?v:null/);
 assert.match(progression,/rank>=4&&coefficient!==null&&coefficient>=\.8/);
 assert.match(progression,/label:'Super Trunfo'/);
});

test('detalhe troca pill de cor por raridade e aplica tema sutil',()=>{
 assert.match(progression,/Branca\|Preta/);
 assert.match(progression,/p68-rarity-pill/);
 assert.match(progression,/tags\.prepend\(pill\)/);
 assert.match(progression,/p68-rarity-themed/);
 for(const key of['common','uncommon','rare','epic','legendary','super-trunfo'])assert.match(css,new RegExp(`p68-rarity-${key}`));
 assert.match(css,/--p68-rarity-rgb/);
});

test('P68 permanece histórico não executável e P74 continua atual',()=>{
 assert.ok(index.includes('css/p68.css?v=1.4.68'));
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p68\.js[^\"]*"><\/script>/);
 assert.doesNotMatch(index,/<script src="js\/p68\.js/);
 assert.match(index,/js\/domains\/cardProgression\.js\?v=domain-2/);
 assert.match(release,/APP_VERSION='v1\.4\.68'/);
 assert.match(version,/releaseP74/);
 assert.match(notifications,/releaseP68/);
 assert.match(notifications,/P67_RELEASE/);
});
