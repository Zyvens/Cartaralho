'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('public/js/app.js'),state=read('public/js/core/appState.js'),router=read('public/js/core/screenRouter.js'),local=read('public/js/core/localTurnFlow.js'),roomSockets=read('public/js/core/roomSocketLifecycle.js'),gameSockets=read('public/js/core/gameplaySocketLifecycle.js'),socketLifecycle=read('public/js/core/socketLifecycle.js'),bootstrap=read('public/js/core/appBootstrap.js'),nav=read('public/js/domains/navigationUI.js'),gameplay=read('public/js/domains/gameplayUI.js'),index=read('public/index.html');

const screens=['home','waitingHost','guest','createRoom','lobby','serverDash','cardCreation','round','host','result','gameOver','admin'];
const roomEvents=['room_created','room_joined','room_closed','player_list_update','cards_submitted','all_cards_ready','game_started','error','player_disconnected','player_left','room_cancelled','player_abandoned','player_reconnected','server_status_update'];
const gameplayEvents=['new_round','card_played','all_cards_played','round_result','game_over','round_skipped'];
const socketEvents=[...roomEvents,...gameplayEvents];

test('app.js é somente shell lexical e não reassume lifecycle',()=>{
 assert.match(app,/^'use strict';/);
 assert.match(app,/const App=\{state:\{\}\};/);
 assert.match(app,/window\.App=App/);
 assert.match(app,/document\.addEventListener\('DOMContentLoaded',[\s\S]*App\.init\(\)/);
 for(const forbidden of [/showScreen\s*\(/,/resetState\s*\(/,/handleLocalNextTurn\s*\(/,/registerSocketEvents\s*\(/,/SocketClient\.on\(/,/SocketClient\.init\(\)/,/case 'home':/])assert.doesNotMatch(app,forbidden);
});

test('owners core compilam e são carregados antes do primeiro uso observável',()=>{
 for(const src of[state,router,local,roomSockets,gameSockets,socketLifecycle,bootstrap])assert.doesNotThrow(()=>new Function(src));
 assert.match(state,/window\.CartAppState=\{initial,reset,install\}/);
 assert.match(router,/window\.CartScreenRouter=\{render,cleanup,show,install\}/);
 assert.match(local,/window\.CartLocalTurnFlow=\{next,install\}/);
 assert.match(roomSockets,/window\.CartRoomSocketLifecycle=\{register\}/);
 assert.match(gameSockets,/window\.CartGameplaySocketLifecycle=\{register\}/);
 assert.match(socketLifecycle,/window\.CartSocketLifecycle=\{register,install\}/);
 assert.match(bootstrap,/window\.CartAppBootstrap=\{detectGuest,chooseFirstScreen,init,install\}/);
 const order=['js/app.js','js/core/appState.js','js/core/screenRouter.js','js/core/localTurnFlow.js','js/core/roomSocketLifecycle.js','js/core/gameplaySocketLifecycle.js','js/core/socketLifecycle.js','js/core/appBootstrap.js','js/domains/navigationUI.js'];
 let last=-1;for(const item of order){const pos=index.indexOf(item);assert.ok(pos>last,`${item} deve vir depois do owner anterior`);last=pos;}
});

test('bootstrap owner preserva SocketClient.init → compositor de listeners → guest detection → primeira tela',()=>{
 const init=bootstrap.indexOf('function init(app)'),socket=bootstrap.indexOf('SocketClient.init()',init),register=bootstrap.indexOf('app.registerSocketEvents()',init),detect=bootstrap.indexOf('detectGuest(app)',register),screen=bootstrap.indexOf('chooseFirstScreen(app)',detect);
 assert.ok(init>=0&&socket>init&&register>socket&&detect>register&&screen>detect);
 assert.match(bootstrap,/hostname\.endsWith\('\.loca\.lt'\)&&hostname\.startsWith\('cartaralho-'\)/);
 assert.match(bootstrap,/app\.state\.guestCode=codePart\.toUpperCase\(\)/);
 assert.match(bootstrap,/app\.showScreen\('guest'\)/);assert.match(bootstrap,/app\.showScreen\('waitingHost'\)/);assert.match(bootstrap,/app\.showScreen\('home'\)/);
 assert.match(app,/document\.addEventListener\('DOMContentLoaded',[\s\S]*App\.init\(\)/);
});

test('owner de estado preserva identidade e limpa exatamente o contexto histórico da partida',()=>{
 for(const key of['nickname','roomCode','isCreator','currentScreen','players','hand','currentBlackCard','isHost','scores','roundNumber','maxPlayers','blackCardsPerPlayer','whiteCardsPerPlayer'])assert.match(state,new RegExp(`${key}:`),key);
 assert.match(state,/nickname:current\?\.nickname\|\|''/);assert.match(state,/roomCode:''/);assert.match(state,/currentScreen:'home'/);assert.match(state,/players:\[\]/);assert.match(state,/hand:\[\]/);assert.match(state,/useStandardDeck:true/);assert.match(state,/Scoreboard\?\.hide\?\.\(\)/);
 assert.doesNotMatch(state,/CardCreationScreen\.blackCards\s*=\s*\[\]|CardCreationScreen\.whiteCards\s*=\s*\[\]/);
});

test('estado inicial preserva modo online e guest defaults',()=>{assert.match(state,/playMode:'online'/);assert.match(state,/isGuest:false/);assert.match(state,/guestCode:''/);});

test('screenRouter mantém telas, cleanup e timings do roteador-base',()=>{
 for(const screen of screens)assert.match(router,new RegExp(`case '${screen}':`),screen);
 assert.match(router,/current==='result'[\s\S]*ResultScreen\?\.cleanup/);assert.match(router,/current==='waitingHost'[\s\S]*WaitingHostScreen\?\.cleanup/);assert.match(router,/app\.classList\.add\('screen-exit'\)/);assert.match(router,/setTimeout\(\(\)=>\{[\s\S]*app\.innerHTML=''[\s\S]*\},300\)/);assert.match(router,/setTimeout\(\(\)=>app\.classList\.remove\('screen-enter'\),400\)/);
});

test('localTurnFlow preserva fila, blind screen e passagem ao Czar sem registrar sockets',()=>{
 assert.match(local,/state\.players\.map\(p=>p\.nickname\)/);assert.match(local,/state\.localTurnQueue=nonHosts/);assert.match(local,/state\.localHostNick=hostNick/);assert.match(local,/SocketClient\.setActiveLocalPlayer\(nextNick\)/);assert.match(local,/Vez de: \$\{nextNick\}/);assert.match(local,/showScreen\('round'/);assert.match(local,/SocketClient\.setActiveLocalPlayer\(state\.localHostNick\)/);assert.match(local,/Vez do Czar: \$\{state\.localHostNick\}/);assert.match(local,/showScreen\('host'/);assert.doesNotMatch(local,/SocketClient\.on\(/);
});

test('compositor registra Room + Gameplay exatamente uma vez e substitui o método legado antes do bootstrap',()=>{
 assert.match(socketLifecycle,/let registered=false/);assert.match(socketLifecycle,/if\(registered\)return false/);assert.match(socketLifecycle,/CartRoomSocketLifecycle\.register\(app\)/);assert.match(socketLifecycle,/CartGameplaySocketLifecycle\.register\(app\)/);assert.match(socketLifecycle,/app\.registerSocketEvents=function\(\)/);
 assert.ok(index.indexOf('js/core/socketLifecycle.js')<index.indexOf('js/core/appBootstrap.js'));
});

test('os 20 eventos core aparecem uma única vez nos owners runtime de socket',()=>{
 const combined=roomSockets+'\n'+gameSockets;
 for(const event of socketEvents){const re=new RegExp(`SocketClient\\.on\\('${event}'`,'g');assert.equal((combined.match(re)||[]).length,1,event);}
 for(const event of roomEvents)assert.match(roomSockets,new RegExp(`SocketClient\\.on\\('${event}'`),event);
 for(const event of gameplayEvents)assert.match(gameSockets,new RegExp(`SocketClient\\.on\\('${event}'`),event);
});

test('Room Socket Lifecycle preserva criação/join/fechamento, prontidão, erros e presença',()=>{
 assert.match(roomSockets,/set_host_mode/);assert.match(roomSockets,/Mesa criada!/);assert.match(roomSockets,/Entrou na sala/);assert.match(roomSockets,/Partida Encerrada/);assert.match(roomSockets,/app\.resetState\(\)/);
 assert.match(roomSockets,/app\.state\.players=data\.players\|\|\[\]/);assert.match(roomSockets,/Scoreboard\.update/);assert.match(roomSockets,/CardCreationScreen\.blackCards=\[\]/);assert.match(roomSockets,/bypassBlindScreen:false/);
 assert.match(roomSockets,/Buscando sala na rede online/);assert.match(roomSockets,/Tentar novamente/);assert.match(roomSockets,/Partida Cancelada/);assert.match(roomSockets,/afk-timer/);assert.match(roomSockets,/data\.mode==='waiting'/);
});

test('Gameplay Socket Lifecycle preserva ordem de mutação antes de navegar',()=>{
 assert.match(gameSockets,/new_round[\s\S]*roundNumber=data\.roundNumber[\s\S]*currentBlackCard=data\.blackCard[\s\S]*state\.hand=data\.hand[\s\S]*state\.isHost=data\.isHost/);
 assert.match(gameSockets,/setTimeout\(\(\)=>app\.handleLocalNextTurn\(\),300\)/);
 assert.match(gameSockets,/all_cards_played[\s\S]*state\.submissions=data\.submissions/);
 assert.match(gameSockets,/round_result[\s\S]*state\.localTurnQueue=null[\s\S]*showScreen\('result'/);
 assert.match(gameSockets,/game_over[\s\S]*Scoreboard\.hide\(\)[\s\S]*showScreen\('gameOver'/);
 assert.match(gameSockets,/round_skipped[\s\S]*Rodada pulada/);
});

test('navigationUI continua sendo o único writer final de App.showScreen entre owners',()=>{
 assert.match(nav,/directShow=App\.showScreen\.bind\(App\)/);assert.match(nav,/App\.showScreen=function\(name,data=\{\}\)/);assert.match(nav,/CartShowcaseDomain\?\.interceptNavigation/);assert.doesNotMatch(gameplay,/App\.showScreen\s*=/);assert.ok(index.indexOf('js/core/screenRouter.js')<index.indexOf('js/domains/navigationUI.js?v=domain-2'));
});
