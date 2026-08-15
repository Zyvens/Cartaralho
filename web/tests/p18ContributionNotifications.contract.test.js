'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const contribution=require('../lib/playerContribution');
const cardIdentity=require('../lib/cardIdentity');
const defs=require('../lib/prestigeDefinitions');
const{GAME_STATES}=require('../lib/constants');
const readiness=require('../lib/roomReadiness');

const lobby=read('public/js/screens/lobby.js'),cards=read('public/js/screens/cardCreation.js'),rules=read('public/js/roomRulesUI.js'),readyApi=read('api/rooms/ready.js'),loot=read('lib/matchLoot.js'),shop=read('public/js/marketplaceShop.js'),notifyLib=read('lib/appNotifications.js'),notifyUI=read('public/js/notificationsUI.js'),notifyApi=read('api/notifications.js'),audio=read('public/js/audioIntegrationP13.js'),css=read('public/css/p18.css'),index=read('public/index.html'),migration=read('db/p18_creator_entitlements.sql'),prestige=read('lib/prestigeService.js'),createApi=read('api/cards/create.js'),cleanCards=read('lib/cleanCards.js'),cardComponent=read('public/js/components/card.js');

for(const[name,src]of[['lobby',lobby],['cardCreation',cards],['roomRules',rules],['marketplaceShop',shop],['notificationsUI',notifyUI],['audioIntegration',audio],['cardComponent',cardComponent]])test(`${name} compila`,()=>assert.doesNotThrow(()=>new Function(src)));

test('contribuição mínima é uma carta e zero exige confirmação somente quando criação está ativa',()=>{
 const room={state:GAME_STATES.CADASTRO_CARTAS,cardCreationEnabled:true,playerCardsEnabled:true,players:new Map([['1',{active:true,blackCards:[],whiteCards:[],cardsReady:false}],['2',{active:true,blackCards:['A ______?'],whiteCards:[],cardsReady:false}],['3',{active:true,blackCards:[],whiteCards:['Resposta'],cardsReady:false}]])};
 assert.equal(contribution.count(room.players.get('1')),0);assert.equal(contribution.status(room,room.players.get('1')).requiresConfirmation,true);
 assert.equal(contribution.count(room.players.get('2')),1);assert.equal(contribution.currentEligibility(room,room.players.get('2')),true);
 readiness.setReady(room,'2',true);assert.equal(room.players.get('2').lootEligible,true);
 const noCreation={...room,cardCreationEnabled:false,players:new Map([['1',{active:true,blackCards:[],whiteCards:[],cardsReady:false}]])};
 assert.equal(contribution.status(noCreation,noCreation.players.get('1')).requiresConfirmation,false);assert.equal(contribution.status(noCreation,noCreation.players.get('1')).lootEligible,true);
});

test('Pronto sem contribuição pede confirmação em resposta normal e broadcast segue compacto contra 413',()=>{
 assert.match(readyApi,/confirmationRequired:true/);assert.match(readyApi,/NO_CONTRIBUTION_LOOT_WARNING/);assert.match(readyApi,/acceptNoContribution/);assert.match(readyApi,/playerStatuses/);assert.doesNotMatch(readyApi,/ok\(res,\{[^}]*players,/s);assert.match(readyApi,/avatarData em base64/);
 assert.match(lobby,/Mão de Vaca/);assert.match(lobby,/não poderá coletar Espólio/);assert.match(lobby,/Ficar Pronto sem Espólio/);
});

test('ao ficar Pronto a edição de Cartas de Jogador congela até desmarcar',()=>{
 assert.match(lobby,/cardButton\.disabled=myReady/);assert.match(lobby,/Cartas travadas/);assert.match(cards,/readyLocked/);assert.match(createApi,/player\.cardsReady===true/);
});

test('quem não contribui recebe quota zero de Espólio no fechamento',()=>{
 assert.match(loot,/enforceContributionEligibility/);assert.match(loot,/eligible_count=0,quota=0,status='empty'/);assert.match(loot,/contribution\.finalEligibility/);
});

test('raridade do BUFF segue estética textual dos cosméticos, sem pill de raridade na loja',()=>{
 assert.match(shop,/cosmetic-rarity rarity-/);assert.doesNotMatch(shop,/buff-rarity-pill/);assert.match(css,/market-buff-header \.cosmetic-rarity/);
});

test('configuração exibe valores numéricos e não mostra Editável',()=>{
 assert.match(rules,/<output class="config-value"/);assert.match(rules,/aria-live="polite"/);assert.doesNotMatch(rules,/>Editável</);assert.match(css,/\.room-rules-card \.config-value/);
});

test('seleção de cartas usa game-card real para biblioteca e seleção',()=>{
 assert.match(cards,/CardComponent\.createBlackCard/);assert.match(cards,/CardComponent\.createWhiteCard/);assert.match(cards,/player-card-library-card/);assert.doesNotMatch(cards,/profile-card tier-/);assert.match(css,/player-card-library-grid/);
});

test('Carta Preta nova exige de 1 a 2 lacunas e normaliza qualquer run de underscore',()=>{
 assert.throws(()=>cardIdentity.normalizeBlackCardDisplay('Qual é a resposta?'),/lacuna/i);
 assert.equal(cardIdentity.normalizeBlackCardDisplay('Qual é _?'),'Qual é ______?');
 assert.equal(cardIdentity.normalizeBlackCardDisplay('A __________ B'),'A ______ B');
 assert.equal(cardIdentity.normalizeBlackCardDisplay('___ ou ____________________'),'______ ou ______');
 assert.throws(()=>cardIdentity.normalizeBlackCardDisplay('_ + _ + _'),/no máximo 2 lacunas/i);
 assert.equal(cardIdentity.whiteCardsRequiredForBlack('A ______ ou ______'),2);
 assert.match(cleanCards,/normalizeBlackCardDisplay\(text,\{requireGap:true\}\)/);
 assert.match(createApi,/\/lacuna\/i/);
 assert.match(cardComponent,/replace\(\/_\+\/g/);
});

test('Central de Notificações publica versão atual, updates e recompensas',()=>{
 const version=notifyLib.match(/const APP_VERSION='v(\d+)\.(\d+)\.(\d+)'/);assert.ok(version,'APP_VERSION deve permanecer semver');const[,major,minor,patch]=version.map(Number);assert.ok(major>1||(major===1&&(minor>4||(minor===4&&patch>=18))),'a Central não pode regredir abaixo do P18');assert.ok((notifyLib.match(/type:'update'/g)||[]).length>=4);assert.match(notifyLib,/Prêmio de boas-vindas/);assert.match(notifyLib,/Kit de boas-vindas/);assert.match(notifyApi,/notifications\.center/);assert.match(notifyUI,/Central de Notificações/);assert.match(notifyUI,/VERSÃO ATUAL/);assert.match(notifyUI,/Prêmios recebidos/);assert.match(index,/js\/notificationsUI\.js/);assert.match(css,/notifications-overlay/);
});

test('música é migrada para ligada e retoma no primeiro gesto permitido',()=>{
 assert.match(audio,/music-autostart-p18:v1/);assert.match(audio,/setSettings\(\{music:true\}\)/);assert.match(audio,/pointerdown/);assert.match(audio,/CartSoundtrack\?\.unmute/);
});

test('VitorIvens recebe título e moldura Celestial exclusivos fora do catálogo',()=>{
 assert.equal(defs.SPECIAL_TITLES['o-criador'].name,'O Criador');assert.equal(defs.SPECIAL_TITLES['o-criador'].rarity,'celestial');assert.equal(defs.SPECIAL_FRAMES['genese-celestial'].rarity,'celestial');
 assert.match(prestige,/SPECIAL_FRAMES/);assert.match(migration,/lower\(username\)=lower\('VitorIvens'\)/);assert.match(migration,/'o-criador'/);assert.match(migration,/'genese-celestial'/);assert.match(migration,/equipped_title_key='o-criador'/);assert.match(css,/frame-genese-celestial/);
});

test('P18 e P19 são carregados depois dos pacotes anteriores',()=>{assert.ok(index.indexOf('css/p18.css')>index.indexOf('css/p17.css'));assert.ok(index.indexOf('css/p19.css')>index.indexOf('css/p18.css'));assert.ok(index.indexOf('js/notificationsUI.js')>index.indexOf('js/refinementP13.js'));});
