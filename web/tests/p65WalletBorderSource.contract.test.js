'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const marketUI=read('public/js/domains/marketplaceUI.js'),cardProgression=read('public/js/domains/cardProgression.js'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),progression=read('api/profile/progression.js'),rules=read('lib/cardProgressionRules.js'),release=read('lib/releaseP65.js'),version=read('api/version.js');

test('owners canônicos de carteira e progressão compilam e estão ativos',()=>{
 assert.doesNotThrow(()=>new Function(marketUI));
 assert.doesNotThrow(()=>new Function(cardProgression));
 assert.match(index,/<script src="js\/domains\/marketplaceUI\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script src="js\/domains\/cardProgression\.js\?v=domain-2"><\/script>/);
 assert.match(index,/<script type="application\/x-cartaralho-legacy" src="js\/p65\.js\?v=1\.4\.65"><\/script>/);
});

test('mostrador mantém uma única estrutura canônica',()=>{
 assert.match(marketUI,/slots\.filter\(x=>x!==slot\)\.forEach\(x=>x\.remove\(\)\)/);
 assert.match(marketUI,/slot\.className='home-account-balance p49-balance-slot p62-market-ledger-shortcut p74-wallet-slot'/);
 assert.match(marketUI,/p49-balance-value/);
 assert.match(marketUI,/cartaralho:balance-updated/);
});

test('progressão de borda não volta a depender do tamanho total da coleção',()=>{
 assert.doesNotMatch(cards,/ownedDistinctCards/);
 assert.doesNotMatch(progression,/ownedDistinctCards/);
 assert.doesNotMatch(cards,/borderTier:cardBorderTier\(c\.duplicate_creation_count\)/);
 assert.match(cardProgression,/c\?\.lootCollectors/);
 assert.match(cardProgression,/coletas por Espólio por outros jogadores/);
});

test('thresholds continuam centralizados e labels atuais são Bronze, Prata, Ouro e Platina',()=>{
 assert.match(rules,/BORDER_THRESHOLDS=\[\{key:'copper',label:'Bronze',min:10\},\{key:'silver',label:'Prata',min:30\},\{key:'gold',label:'Ouro',min:60\},\{key:'platinum',label:'Platina',min:100\}\]/);
 assert.match(cardProgression,/copper:'Bronze'/);
 assert.match(cardProgression,/silver:'Prata'/);
 assert.match(cardProgression,/gold:'Ouro'/);
 assert.match(cardProgression,/platinum:'Platina'/);
});

test('P65 permanece como proveniência histórica e P74 é a release corrente',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.65'/);
 assert.match(version,/releaseP74/);
});
