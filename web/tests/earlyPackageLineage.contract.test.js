'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const revisions=read('db/README_REVISIONS.md');
const requiredFiles=[
 'db/metagame_v1_4_package1.sql','db/metagame_v1_4_package3.sql','db/metagame_v1_4_package3_grant.sql','db/metagame_v1_4_package3_purchase.sql','db/metagame_v1_4_package3_creation.sql','db/metagame_v1_4_package4.sql','db/metagame_v1_4_package5.sql','db/metagame_v1_4_package6.sql','db/metagame_v1_4_package6_claim.sql','db/metagame_v1_4_package6_settle.sql','db/metagame_v1_4_package7.sql','db/metagame_v1_4_package8.sql','db/metagame_v1_4_package9.sql','db/metagame_v1_4_package10.sql','db/metagame_v1_4_package11.sql','db/metagame_v1_4_package12.sql'
];
const currentOwners=[
 'lib/canonicalCards.js','lib/cardOrigins.js','lib/balanceConfig.js','lib/rewardEngineRules.js','lib/advancedRewards.js','lib/cleanCards.js','lib/cardProgressionRules.js','lib/cardProgressionService.js','lib/marketplace.js','lib/matchLoot.js','lib/roomConfig.js','lib/buffDefinitions.js','lib/buffEngine.js','lib/advancedBuffEngine.js','lib/advancedRoundEngine.js','lib/achievementService.js','lib/missionService.js','lib/prestigeService.js','lib/telemetry.js'
];
const historicalContracts=[
 'tests/audioIntegrationP13.contract.test.js','tests/p14RoomPolish.contract.test.js','tests/p15LayoutSummary.contract.test.js','tests/p16ReadyRecycling.contract.test.js','tests/p17FrameRarity.contract.test.js','tests/p18ContributionNotifications.contract.test.js','tests/p19Integrity.contract.test.js','tests/p20PublicCosmeticsShowcase.contract.test.js','tests/p21SmallBugsUI.contract.test.js','tests/p22RewardGenesisMobile.contract.test.js','tests/p23ProfileGenesisSave.contract.test.js','tests/p24AchievementCopyHomeOrder.contract.test.js','tests/p25MobileMenuSingleSave.contract.test.js','tests/p26GenesisFrame.contract.test.js','tests/p27HomeOrderGenesis.contract.test.js','tests/p28MusicGenesis.contract.test.js','tests/p29GenesisAtomicOrbit.contract.test.js','tests/p30GenesisPlatinumStar.contract.test.js','tests/p31GenesisSixStars.contract.test.js','tests/p32PolishAudioAmigo.contract.test.js'
];

test('README de revisões declara P01-P12 em ordem causal e como migrations aditivas',()=>{
 let previous=-1;for(let n=1;n<=12;n++){const tag=`P${String(n).padStart(2,'0')}`,at=revisions.indexOf(tag);assert.ok(at>previous,`${tag} ausente ou fora de ordem`);previous=at;}
 assert.match(revisions,/scripts são aditivos\/idempotentes/);
 assert.match(revisions,/preservam cartas e estatísticas existentes/);
});

test('artefatos persistentes P01-P12 continuam rastreáveis',()=>{
 for(const file of requiredFiles)assert.equal(fs.existsSync(path.join(root,file)),true,file);
 assert.match(revisions,/P02: Economia e Match Reward Engine — estruturas consolidadas em `professional_revision\.sql`/);
});

test('responsabilidades P01-P12 possuem implementação canônica atual sem depender do nome do pacote',()=>{
 for(const file of currentOwners)assert.equal(fs.existsSync(path.join(root,file)),true,file);
 assert.match(read('lib/roomConfigP7.js'),/module\.exports=require\('\.\/roomConfig'\)/);
 assert.match(read('lib/matchStartP6.js'),/module\.exports=require\('\.\/matchStart'\)/);
 assert.match(read('lib/matchSubmitP6.js'),/module\.exports=require\('\.\/matchSubmit'\)/);
});

test('P13-P32 possuem contratos históricos contínuos até o estado atual',()=>{
 for(const file of historicalContracts)assert.equal(fs.existsSync(path.join(root,file)),true,file);
 assert.equal(historicalContracts.length,20);
});

test('trajetórias P26-P32 da Gênese e Amigo preservam correções posteriores em vez de reativar patches',()=>{
 const genesis=read('public/js/domains/genesisFrameUI.js'),amigo=read('lib/amigoDeMerda.js'),api=read('api/buffs.js');
 assert.match(genesis,/CartDomains\.claim\('genesisFrameUI'/);
 assert.match(amigo,/room\.whiteDeck\.push\(\.\.\.target\.hand\.splice\(0\)\)/);
 assert.match(api,/buffKey==='buff_amigo_de_merda'\?await amigo\.activate/);
 assert.doesNotMatch(api,/amigoDeMerdaP32/);
});
