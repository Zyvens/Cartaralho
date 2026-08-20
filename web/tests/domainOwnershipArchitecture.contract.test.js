'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('public/index.html');
const domainDir=path.join(root,'public/js/domains');
const domainFiles=fs.readdirSync(domainDir).filter(x=>x.endsWith('.js')).sort();
const sources=Object.fromEntries(domainFiles.map(name=>[name,read(`public/js/domains/${name}`)]));
const expectedOwners={
 'accountUI.js':'accountUI',
 'adminUI.js':'adminUI',
 'cardCreationUI.js':'cardCreationUI',
 'cardProgression.js':'cardProgression',
 'cardsLibrary.js':'cardsLibrary',
 'marketplaceUI.js':'marketplaceUI',
 'missionsUI.js':'missionsUI',
 'navigationUI.js':'navigationUI',
 'notificationsUI.js':'notificationsUI',
 'profileUI.js':'profileUI',
 'rankUI.js':'rankUI',
 'roomUI.js':'roomUI',
 'socialUI.js':'socialUI',
 'statsUI.js':'statsUI'
};

test('arquitetura de domínio compila e registry carrega antes dos owners',()=>{
 assert.doesNotThrow(()=>new Function(read('public/js/core/domainRegistry.js')));
 for(const [name,source] of Object.entries(sources))assert.doesNotThrow(()=>new Function(source),name);
 const registry=index.indexOf('js/core/domainRegistry.js?v=domain-1');
 const firstDomain=Math.min(...Object.keys(expectedOwners).map(name=>index.indexOf(`js/domains/${name}?v=domain-1`)).filter(x=>x>=0));
 assert.ok(registry>=0&&registry<firstDomain,'domainRegistry deve carregar antes dos módulos de domínio');
});

test('cada domínio possui exatamente um owner explícito e único',()=>{
 const seen=new Map();
 for(const [name,expected] of Object.entries(expectedOwners)){
  const source=sources[name];assert.ok(source,`arquivo ausente: ${name}`);
  const claims=[...source.matchAll(/CartDomains\.claim\('([^']+)'\s*,\s*'([^']+)'/g)];
  assert.equal(claims.length,1,`${name} deve registrar exatamente um domínio`);
  assert.equal(claims[0][1],expected,`${name} registrou domínio inesperado`);
  assert.equal(seen.has(expected),false,`domínio duplicado: ${expected}`);seen.set(expected,name);
 }
 assert.equal(seen.size,Object.keys(expectedOwners).length);
});

test('cadeia pXX permanece somente como legado não executável',()=>{
 assert.doesNotMatch(index,/<script\s+src="js\/p\d+\.js/i,'nenhum pXX numérico pode executar diretamente');
 const legacy=[...index.matchAll(/<script\s+type="application\/x-cartaralho-legacy"\s+src="js\/(p\d+|p48Friends)\.js[^"<]*"><\/script>/g)];
 assert.ok(legacy.length>=25,'esperava preservar a cadeia pXX como dados legados para rastreabilidade');
 assert.match(index,/type="application\/x-cartaralho-legacy" src="js\/p57\.js\?v=1\.4\.72"/);
});

test('Minhas Cartas tem um único owner canônico com autoria no nascimento do card',()=>{
 const cards=sources['cardsLibrary.js'];
 assert.match(cards,/CartDomains\.claim\('cardsLibrary'/);
 assert.match(cards,/HomeScreen\.renderCards=render/);
 assert.match(cards,/ProfessionalUI\.renderCards=render/);
 assert.match(cards,/MetaUI\.renderCards=render/);
 assert.match(cards,/Criado por \$\{esc\(creatorLabel\(c\)\)\}/);
 assert.doesNotMatch(cards,/Padrão\s*·\s*contorno|materialTier\)\}\s*·\s*contorno/);
});

test('Estatísticas é domínio próprio e não conhece carteira nem extrato',()=>{
 const stats=sources['statsUI.js'];
 assert.match(stats,/CartDomains\.claim\('statsUI'/);
 assert.match(stats,/HomeScreen\.renderStats=render/);
 assert.doesNotMatch(stats,/ledger|economy|transaction_type|dirtyBalance|Moedas Sujas/i);
});

test('renderAccount tem um único owner entre os novos domínios',()=>{
 const assigning=Object.entries(sources).filter(([,source])=>/HomeScreen\.renderAccount\s*=/.test(source)).map(([name])=>name);
 assert.deepEqual(assigning,['accountUI.js']);
 assert.match(sources['accountUI.js'],/CartDomains\.claim\('accountUI'/);
});

test('wallet, ledger e reciclagem pertencem ao domínio marketplace',()=>{
 const market=sources['marketplaceUI.js'];
 assert.match(market,/CartDomains\.claim\('marketplaceUI'/);
 assert.match(market,/openLedger/);
 assert.match(market,/installRecycling/);
 assert.match(market,/\/api\/profile\/wallet/);
 assert.doesNotMatch(market,/HomeScreen\.renderAccount\s*=/);
});

test('progressão e raridade da carta pertencem ao mesmo domínio',()=>{
 const progression=sources['cardProgression.js'];
 assert.match(progression,/personalRoundWins/);
 assert.match(progression,/lootCollectors/);
 assert.match(progression,/Super Trunfo/);
 assert.match(progression,/decorateDetail/);
});
