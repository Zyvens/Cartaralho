'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('public/index.html'),domainDir=path.join(root,'public/js/domains');
const domainFiles=fs.readdirSync(domainDir).filter(x=>x.endsWith('.js')).sort(),sources=Object.fromEntries(domainFiles.map(name=>[name,read(`public/js/domains/${name}`)]));
const publicProfileBridge=read('public/js/metaFixes.js');
const requiredOwners={
 'accountUI.js':'accountUI','adminUI.js':'adminUI','achievementsUI.js':'achievementsUI','audioUI.js':'audioUI','buffsUI.js':'buffsUI','cardCreationUI.js':'cardCreationUI','cardProgression.js':'cardProgression','cardsLibrary.js':'cardsLibrary','cosmeticsUI.js':'cosmeticsUI','gameplayUI.js':'gameplayUI','genesisFrameUI.js':'genesisFrameUI','identityUI.js':'identityUI','marketplaceCatalogUI.js':'marketplaceCatalogUI','marketplaceUI.js':'marketplaceUI','missionsUI.js':'missionsUI','navigationUI.js':'navigationUI','notificationsUI.js':'notificationsUI','profileUI.js':'profileUI','rankUI.js':'rankUI','rewardsUI.js':'rewardsUI','roomUI.js':'roomUI','showcaseUI.js':'showcaseUI','socialUI.js':'socialUI','statsUI.js':'statsUI','uiPolishUI.js':'uiPolishUI'
};

test('todos os owners compilam e o registry carrega antes deles',()=>{
 assert.doesNotThrow(()=>new Function(read('public/js/core/domainRegistry.js')));
 for(const [name,source] of Object.entries(sources))assert.doesNotThrow(()=>new Function(source),name);
 const registry=index.indexOf('js/core/domainRegistry.js?v=domain-2');
 const positions=domainFiles.map(name=>index.indexOf(`js/domains/${name}?v=domain-2`));
 assert.ok(positions.every(x=>x>=0),'todo arquivo de domínio deve estar no index');
 assert.ok(registry>=0&&registry<Math.min(...positions),'domainRegistry deve carregar antes dos owners');
});

test('cada arquivo de domínio declara exatamente um owner único',()=>{
 const seen=new Map();
 for(const [name,source] of Object.entries(sources)){
  const claims=[...source.matchAll(/CartDomains\.claim\('([^']+)'\s*,\s*'([^']+)'/g)];
  assert.equal(claims.length,1,`${name} deve reivindicar exatamente um domínio`);
  const owner=claims[0][1];assert.equal(seen.has(owner),false,`domínio duplicado: ${owner}`);seen.set(owner,name);
 }
 for(const [name,expected] of Object.entries(requiredOwners)){const source=sources[name];assert.ok(source,`arquivo obrigatório ausente: ${name}`);assert.match(source,new RegExp(`CartDomains\\.claim\\('${expected}'`),`${name} registrou domínio inesperado`);}
});

test('PXX numérico P33-P74 não executa mais e histórico permanece rastreável',()=>{
 assert.doesNotMatch(index,/<script\s+src="js\/p(?:\d+|48Friends)\.js/i);
 for(const name of['p33','p37','p48','p57','p68','p73','p74'])assert.match(index,new RegExp(`type="application/x-cartaralho-legacy" src="js/${name}\\.js`));
 assert.match(index,/p57\.js\?v=1\.4\.72/);
 assert.match(index,/p74\.js\?v=1\.4\.74/);
});

test('patches históricos nomeados absorvidos também não executam',()=>{
 for(const name of['gameplayP19','roomP14Sync','profileAppearanceP19','revisionConsolidated','refinementP13','audioIntegrationP13','musicRecoveryP28','cleanCardStacksFix','cosmeticUI','identityP20','profileAppearanceP20','playerShowcaseP20','homeMenuP24','uiP25','homeMenuP27','genesisFrameP29']){
  assert.doesNotMatch(index,new RegExp(`<script\\s+src="js/${name}\\.js`),`${name} não pode ser executável`);
  assert.match(index,new RegExp(`type="application/x-cartaralho-legacy" src="js/${name}\\.js`),`${name} deve permanecer rastreável nesta fase`);
 }
});

test('writers finais críticos de HomeScreen e App são únicos entre os owners',()=>{
 const contracts={
  renderAccount:['accountUI.js'],renderCards:['cardsLibrary.js'],renderStats:['statsUI.js'],renderHistory:['historyUI.js'],openPanel:['appPanelUI.js'],register:['registrationUI.js']
 };
 for(const [method,expected] of Object.entries(contracts)){
  const re=new RegExp(`HomeScreen\\.${method}\\s*=`),writers=Object.entries(sources).filter(([,s])=>re.test(s)).map(([n])=>n);
  assert.deepEqual(writers,expected,`${method} deve ter writer único`);
 }
 const navigation=Object.entries(sources).filter(([,s])=>/App\.showScreen\s*=/.test(s)).map(([n])=>n);
 assert.deepEqual(navigation,['navigationUI.js']);
 assert.match(sources['navigationUI.js'],/interceptNavigation/);
 assert.match(sources['showcaseUI.js'],/interceptNavigation\(name,data/);
 assert.doesNotMatch(sources['showcaseUI.js'],/App\.showScreen\s*=/);
});

test('Perfil Público possui um único writer no bridge explícito e nenhum domain o reembrulha',()=>{
 assert.match(publicProfileBridge,/HomeScreen\.renderPublicProfile=render/);
 const domainWriters=Object.entries(sources).filter(([,s])=>/HomeScreen\.renderPublicProfile\s*=/.test(s)).map(([n])=>n);
 assert.deepEqual(domainWriters,[]);
 assert.match(sources['identityUI.js'],/decoratePublicProfile\(panel,userId\)/);
});

test('P73/P74 pertencem agora a account e marketplace',()=>{
 const account=sources['accountUI.js'],market=sources['marketplaceUI.js'];
 assert.match(account,/p74-account-strip/);
 assert.match(account,/p56-profile-action/);
 assert.match(account,/p56-logout-action/);
 assert.match(account,/Perfil/);assert.match(account,/Sair/);
 assert.match(market,/p74-wallet-slot/);
 assert.match(market,/knownBalance/);
 assert.match(market,/balance_updated/);
 assert.match(market,/admin_reward/);
});

test('cosméticos têm owner canônico e nomenclatura de progressão atual',()=>{
 const cosmetics=sources['cosmeticsUI.js'];
 assert.match(cosmetics,/MIN|Nível 5|cosmeticMinimumLevel/);
 assert.match(cosmetics,/Compra permanente/);
 assert.match(cosmetics,/Bronze, Prata, Ouro e Platina/);
 assert.doesNotMatch(cosmetics,/Copper|Silver|Gold|Platinum/);
 assert.match(cosmetics,/O Criador/);assert.match(cosmetics,/Betinha/);
 assert.doesNotMatch(index,/<script\s+src="js\/cosmeticUI\.js/);
});

test('Minhas Cartas nasce no owner correto e preserva autoria',()=>{
 const cards=sources['cardsLibrary.js'];
 assert.match(cards,/HomeScreen\.renderCards=render/);
 assert.match(cards,/ProfessionalUI\.renderCards=render/);
 assert.match(cards,/MetaUI\.renderCards=render/);
 assert.match(cards,/Criado por \$\{esc\(creatorLabel\(c\)\)\}/);
 assert.match(cards,/black-card-gap/);
});

test('criação de cartas preserva somente a pilha da cor ativa',()=>{
 const creation=sources['cardCreationUI.js'];
 assert.match(creation,/enforceSingleCleanStack/);
 assert.match(creation,/clean-stack-white/);
 assert.match(creation,/clean-stack-black/);
 assert.match(creation,/el\.hidden=type!=='white'/);
 assert.match(creation,/el\.hidden=type!=='black'/);
 assert.match(creation,/gridTemplateColumns='minmax\(0,1fr\)'/);
});

test('Estatísticas não possui economia e Mercado é o owner do extrato',()=>{
 const stats=sources['statsUI.js'],market=sources['marketplaceUI.js'];
 assert.doesNotMatch(stats,/ledger|transaction_type|dirtyBalance|Moedas Sujas/i);
 assert.match(market,/openLedger/);assert.match(market,/\/api\/profile\/wallet/);assert.match(market,/installRecycling/);
});

test('progressão de cartas mantém Fundo, Borda, raridade e Super Trunfo',()=>{
 const progression=sources['cardProgression.js'];
 assert.match(progression,/personalRoundWins/);assert.match(progression,/lootCollectors/);assert.match(progression,/Super Trunfo/);assert.match(progression,/decorateDetail/);
 assert.match(progression,/Bronze/);assert.match(progression,/Prata/);assert.match(progression,/Ouro/);assert.match(progression,/Platina/);
});

test('molduras do perfil são Bronze, Prata, Ouro e Platina e continuam equipáveis',()=>{
 const profile=sources['profileUI.js'],api=read('api/profile/metagame.js'),settings=read('api/profile/settings.js');
 assert.match(profile,/bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'/);
 assert.match(profile,/pode ser equipada livremente/);
 assert.match(api,/silver:\{name:'Prata'/);assert.match(api,/gold:\{name:'Ouro'/);assert.match(api,/platinum:\{name:'Platina'/);
 assert.match(settings,/frameKey/);assert.match(settings,/syncUnlocks/);assert.match(settings,/canEquipFrame/);
});

test('BUFFs e recompensa final permanecem ligados ao engine server-side',()=>{
 const defs=read('lib/buffDefinitions.js'),engine=read('lib/advancedBuffEngine.js'),round=read('lib/advancedRoundEngine.js'),rewards=read('lib/advancedRewards.js');
 assert.match(defs,/Que Poder, Filho da Puta/);assert.match(defs,/Saqueador/);
 assert.match(engine,/rr\.quePoder=/);assert.match(engine,/temporaryCard/);assert.match(round,/winnerScoringUserId/);assert.match(round,/scoringId=q\?String\(r\.hostId\)/);
 assert.match(rewards,/WINDOW_SECONDS=15/);assert.match(rewards,/placement=raiders\.length\?0/);assert.match(rewards,/survival_reward/);assert.match(rewards,/consolation_reward/);assert.match(rewards,/match_saqueador/);
});
