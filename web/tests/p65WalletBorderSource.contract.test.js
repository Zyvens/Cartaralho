'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p65.js'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),progression=read('api/profile/progression.js'),rules=read('lib/cardProgressionRules.js'),release=read('lib/releaseP65.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P65 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('mostrador mantém uma única estrutura canônica',()=>{
 assert.match(js,/slots\.filter\(x=>x!==slot\)\.forEach\(x=>x\.remove\(\)\)/);
 assert.match(js,/slot\.replaceChildren\(\)/);
 assert.match(js,/value\.className='p49-balance-value'/);
 assert.match(js,/HomeScreen\.renderAccount=function\(\.\.\.args\)\{const out=base\(\.\.\.args\);canonicalizeBalance\(\);return out;\}/);
 assert.match(js,/cartaralho:balance-updated/);
});

test('P65 não reintroduz progressão por tamanho total da coleção',()=>{
 assert.doesNotMatch(cards,/ownedDistinctCards/);
 assert.doesNotMatch(progression,/ownedDistinctCards/);
 assert.doesNotMatch(cards,/borderTier:cardBorderTier\(c\.duplicate_creation_count\)/);
});

test('thresholds continuam centralizados e podem ser supersedidos por P67',()=>{
 assert.match(rules,/BORDER_THRESHOLDS=\[\{key:'copper',label:'Bronze',min:10\},\{key:'silver',label:'Prata',min:30\},\{key:'gold',label:'Ouro',min:60\},\{key:'platinum',label:'Platina',min:100\}\]/);
});

test('P65 permanece no histórico e pode ser supersedido por releases posteriores',()=>{
 assert.ok(index.indexOf('js/p65.js?v=1.4.77')>index.indexOf('js/p64.js?v=1.4.75'));
 assert.match(release,/APP_VERSION='v1\.4\.65'/);
 assert.match(version,/releaseP77/);
 assert.match(notifications,/releaseP65/);
 assert.match(notifications,/P64_RELEASE/);
});
