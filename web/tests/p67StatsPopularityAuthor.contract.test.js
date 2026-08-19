'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p67.js'),progressUi=read('public/js/cardProgressionUI.js'),index=read('public/index.html'),cards=read('api/profile/cards-v14.js'),progression=read('api/profile/progression.js'),rules=read('lib/cardProgressionRules.js'),auth=read('lib/auth.js'),release=read('lib/releaseP67.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P67 e UI de progressão compilam',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.doesNotThrow(()=>new Function(progressUi));
});

test('modal de Estatísticas é protegido contra qualquer extrato tardio sem afetar outros painéis',()=>{
 assert.match(js,/HomeScreen\.renderStats=renderStats/);
 assert.match(js,/MetaUI\.renderStats\(panel\)/);
 assert.match(js,/const root=panel\.querySelector\('\.home-form\.profile-panel'\)\|\|panel/);
 assert.match(js,/\.p61-stats-ledger,\.p54-stats-ledger/);
 assert.match(js,/new MutationObserver\(\(\)=>purgeStatsEconomy\(root\)\)/);
 assert.match(js,/statsObserver\.observe\(root,/);
 assert.match(js,/queueMicrotask\(\(\)=>purgeStatsEconomy\(root\)\)/);
 assert.doesNotMatch(js,/Saldo:/);
});

test('Fundo e Borda usam a mesma régua 10 30 60 100 sem off-by-one',()=>{
 const ladder="[{key:'copper',label:'Bronze',min:10},{key:'silver',label:'Prata',min:30},{key:'gold',label:'Ouro',min:60},{key:'platinum',label:'Platina',min:100}]";
 assert.ok(rules.includes(`MATERIAL_THRESHOLDS=${ladder}`));
 assert.ok(rules.includes(`BORDER_THRESHOLDS=${ladder}`));
 assert.match(auth,/cardProgressionRules\.tierFor\(n,'material'\)/);
 assert.match(auth,/cardProgressionRules\.tierFor\(n,'border'\)/);
 assert.match(auth,/cardProgressionRules\.progressFor\(value,kind\)/);
 assert.doesNotMatch(auth,/target\+1-n/);
});

test('Borda mede somente coletas por Espólio e preserva alcance global separado',()=>{
 assert.match(progression,/borderScore=Number\(r\.adoption_count\|\|0\)/);
 assert.match(progression,/worldHolders:reach/);
 assert.match(progression,/lootCollectors/);
 assert.match(cards,/acquisition_source='match_loot'/);
 assert.match(cards,/borderState\(lootCollectors\)/);
 assert.match(js,/coletas por Espólio por outros jogadores/);
 assert.match(js,/popularidade da carta/);
});

test('rodapé da carta exibe somente autoria',()=>{
 assert.match(js,/small\.textContent=`Criado por \$\{creatorLabel\(c\)\}`/);
 assert.match(js,/o\.creatorUsername\|\|o\.creatorName/);
 assert.doesNotMatch(js,/Fundo \$\{label\(c\.materialTier\)\}/);
});

test('P67 é a versão atual e carrega depois de P66',()=>{
 assert.ok(index.indexOf('js/p67.js?v=1.4.67')>index.indexOf('js/p66.js?v=1.4.66'));
 assert.ok(index.includes('cardProgressionUI.js?v=1.4.67'));
 assert.match(release,/APP_VERSION='v1\.4\.67'/);
 assert.match(version,/releaseP67/);
 assert.match(notifications,/releaseP67/);
 assert.match(notifications,/P66_RELEASE/);
});
