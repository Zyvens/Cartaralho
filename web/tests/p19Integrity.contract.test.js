'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const advanced=require('../lib/advancedRoundEngine');
const cardIdentity=require('../lib/cardIdentity');
const{GAME_STATES}=require('../lib/constants');
const defs=require('../lib/achievementDefinitions');

const rewardUI=read('public/js/rewardPreviewUI.js'),previewApi=read('api/rooms/preview.js'),authClient=read('public/js/auth.js'),socket=read('public/js/socket.js'),http=read('lib/http.js'),lobby=read('public/js/screens/lobby.js'),cardCreation=read('public/js/screens/cardCreation.js'),stackLegacy=read('public/js/cleanCardStacksFix.js'),host=read('public/js/screens/host.js'),round=read('public/js/screens/round.js'),result=read('public/js/screens/result.js'),gameplay=read('public/js/gameplayP19.js'),narrator=read('public/js/narrator.js'),playApi=read('api/game/play.js'),handApi=read('api/game/hand.js'),advancedBuff=read('lib/advancedBuffEngine.js'),profileAppearance=read('public/js/profileAppearanceP19.js'),p19css=read('public/css/p19.css'),index=read('public/index.html'),backfill=read('lib/achievementBackfillP19.js'),metagameApi=read('api/profile/metagame.js'),statsApi=read('api/profile/stats.js'),pickWinner=read('api/game/pick-winner.js'),progression=read('lib/cardProgressionService.js');

for(const[name,src]of[['rewardPreviewUI',rewardUI],['authClient',authClient],['socket',socket],['lobby',lobby],['cardCreation',cardCreation],['host',host],['round',round],['result',result],['gameplayP19',gameplay],['narrator',narrator],['profileAppearanceP19',profileAppearance]])test(`${name} compila`,()=>assert.doesNotThrow(()=>new Function(src)));

test('APIs dinâmicas nunca dependem de resposta 304 sem corpo',()=>{
 assert.match(rewardUI,/cache:'no-store'/);assert.match(rewardUI,/r\.status===304/);assert.match(rewardUI,/_fresh/);
 assert.match(previewApi,/Cache-Control/);assert.match(previewApi,/no-store/);assert.match(previewApi,/Pragma/);
 assert.match(authClient,/cache:method==='GET'\?'no-store'/);assert.match(authClient,/res\.status===304/);assert.match(authClient,/_fresh=/);
 assert.match(socket,/async _getJSON\(path,headers=\{\}\)/);assert.match(socket,/fetch\(path,\{headers,cache:'no-store'\}\)/);assert.match(socket,/r\.status===304/);assert.match(socket,/_getJSON\('\/api\/config'\)/);assert.match(socket,/_getJSON\(`\/api\/game\/hand/);assert.match(socket,/_getJSON\(`\/api\/buffs/);
 assert.match(http,/function noStore\(res\)/);assert.match(http,/private, no-store, no-cache/);assert.match(http,/function ok\(res,data=\{\}\)\{noStore\(res\)/);assert.match(http,/function fail\(res,status,message,extra=\{\}\)\{noStore\(res\)/);
});

test('Mão de Vaca confirma em modal e não se aplica quando criação está desligada',()=>{
 const contribution=require('../lib/playerContribution');
 const withCreation={cardCreationEnabled:true},withoutCreation={cardCreationEnabled:false};
 const empty={blackCards:[],whiteCards:[]};
 assert.equal(contribution.status(withCreation,empty).requiresConfirmation,true);
 assert.equal(contribution.status(withoutCreation,empty).requiresConfirmation,false);
 assert.equal(contribution.status(withoutCreation,empty).lootEligible,true);
 assert.match(lobby,/Ficar Pronto sem Espólio/);assert.match(lobby,/Voltar e contribuir/);
});

test('pilhas de Cartas Limpas são geradas diretamente pela tela real e patch legado sai do caminho',()=>{
 assert.match(cardCreation,/cleanStack\(type,count\)/);assert.match(cardCreation,/clean-stack-sheet/);assert.match(cardCreation,/clean-stack-empty/);assert.match(cardCreation,/this\.cleanStacks\(\)/);
 assert.match(p19css,/card-creation-screen \.clean-stack-visual/);assert.match(p19css,/width:70px!important/);assert.match(p19css,/clean-stack-white \.clean-stack-sheet/);assert.match(p19css,/clean-stack-black \.clean-stack-sheet/);
 assert.match(stackLegacy,/typeof CardCreationScreen\.cleanStack==='function'/);assert.match(stackLegacy,/__cleanStacksSourceAuthoritative=true/);
});

test('Carta Preta aceita uma ou duas lacunas e rejeita a terceira',()=>{
 assert.equal(cardIdentity.normalizeBlackCardDisplay('A _ B'),'A ______ B');
 assert.equal(cardIdentity.normalizeBlackCardDisplay('_ ou __________'),'______ ou ______');
 assert.throws(()=>cardIdentity.normalizeBlackCardDisplay('_ / _ / _'),/no máximo 2 lacunas/i);
 assert.equal(cardIdentity.whiteCardsRequiredForBlack('Uma ______'),1);
 assert.equal(cardIdentity.whiteCardsRequiredForBlack('Uma ______ e ______'),2);
 assert.match(cardCreation,/gaps>2/);assert.match(cardCreation,/no máximo 2 lacunas/);
});

test('round engine exige duas brancas e revela cada dupla como uma resposta',()=>{
 const players=new Map([
  ['1',{active:true,connected:true,score:0,hand:[]}],
  ['2',{active:true,connected:true,score:0,hand:['A','B','C']}],
  ['3',{active:true,connected:true,score:0,hand:['D','E','F']}]
 ]);
 const room={state:GAME_STATES.EM_ANDAMENTO,players,playerOrder:['1','2','3'],currentRound:null,blackDeck:[],whiteDeck:[]};
 advanced.startFirstRound(room,'______ com ______',0);
 assert.equal(advanced.cardsPerAnswer(room.currentRound),2);assert.equal(advanced.required(room.currentRound,'2'),2);
 advanced.playCard(room,'2',0);assert.equal(room.state,GAME_STATES.EM_ANDAMENTO);advanced.playCard(room,'2',0);
 advanced.playCard(room,'3',0);const done=advanced.playCard(room,'3',0);assert.equal(done.allPlayed,true);assert.equal(room.state,GAME_STATES.VOTACAO);
 const answers=advanced.revealAnswers(room);assert.equal(answers.length,2);assert.deepEqual(answers.map(a=>a.cards.length),[2,2]);
 const winner=advanced.pickWinner(room,'1',answers[0].answerId);assert.equal(winner.winnerCards.length,2);assert.equal(players.get(String(winner.winnerId)).score,1);
});

test('Meu Jogo multiplica respostas, não confunde duas cartas de uma mesma resposta',()=>{
 assert.match(advancedBuff,/round\.answerCount\(r,id\)>=2/);
 assert.match(advancedBuff,/rr\.requiredSubmissions\[id\]=2/);
 assert.match(advancedBuff,/const requiredCards=round\.required\(r,id\)/);
 assert.match(advancedBuff,/cardsPerAnswer:round\.cardsPerAnswer\(r\)/);
 assert.doesNotMatch(advancedBuff,/if\(round\.forUser\(r,id\)\.length>=2\).*already_double/);
});

test('UI, Narrador e resultado tratam resposta dupla como um conjunto',()=>{
 assert.match(host,/submission-answer-group/);assert.match(host,/submission-answer-cards/);assert.match(host,/submission\.answerId/);assert.match(playApi,/advanced\.revealAnswers/);assert.match(handApi,/advanced\.revealAnswers/);assert.match(handApi,/cardsPerAnswer/);assert.match(round,/Esta Carta Preta tem 2 lacunas/);assert.match(p19css,/submission-answer-cards\.count-2/);
 assert.match(pickWinner,/winnerCards/);assert.match(progression,/winnerTexts=Array\.isArray\(r\.winnerCards\)/);
 assert.match(narrator,/Array\.isArray\(submission\?\.cards\)/);assert.match(narrator,/E depois:/);assert.match(narrator,/winnerCards/);
 assert.match(result,/result-winner-cards/);assert.match(result,/currentWinnerCards/);assert.match(gameplay,/round_result/);assert.match(gameplay,/currentWinnerCards/);assert.match(index,/js\/gameplayP19\.js/);assert.match(p19css,/result-winner-cards\.count-2/);
});

test('Perfil usa rascunho e só persiste título/moldura no botão Salvar',()=>{
 assert.match(profileAppearance,/equipTitle=function\(key\)\{this\._setAppearanceDraft/);assert.match(profileAppearance,/equipFrame=function\(key\)\{this\._setAppearanceDraft/);
 assert.match(profileAppearance,/saveAppearance=async function/);assert.match(profileAppearance,/await MetaClient\.equip\(titleKey,frameKey\)/);assert.match(profileAppearance,/Salvar título e moldura/);assert.match(profileAppearance,/Alterações não salvas/);
 assert.match(index,/js\/profileAppearanceP19\.js/);assert.ok(index.indexOf('js/profileAppearanceP19.js')>index.indexOf('js/profileModal.js'));
});

test('novas badges/títulos cobrem estatísticas recentes e seguem Comum → Lendário',()=>{
 const keys=['reciclagem-primeiro-lote','mercado-primeira-compra','mercado-dez-compras','lacuna-dupla-dez','reciclagem-duzentas','mercado-cem-compras'];
 for(const key of keys)assert.ok(defs.ACHIEVEMENTS.some(a=>a.key===key),`faltou ${key}`);
 const selected=keys.map(k=>defs.ACHIEVEMENTS.find(a=>a.key===k)),rank={common:1,rare:2,superrare:3,epic:4,legendary:5};
 assert.deepEqual([...new Set(selected.map(a=>rank[a.rarity]))].sort((a,b)=>a-b),[1,2,3,4,5]);
 assert.ok(selected.every(a=>a.title?.key));
 assert.match(backfill,/marketplace_purchase/);assert.match(backfill,/card_recycling/);assert.match(backfill,/double_gap_win/);assert.match(backfill,/generate_series\(1,b\.card_count\)/);assert.match(backfill,/regexp_count/);
 assert.match(metagameApi,/titles\.sort\(byRarity\)/);assert.match(metagameApi,/achievements\.sort\(byRarity\)/);assert.match(statsApi,/sortedTitles/);
});

test('P19 é a camada visual final carregada após P18',()=>{assert.ok(index.indexOf('css/p19.css')>index.indexOf('css/p18.css'));});
