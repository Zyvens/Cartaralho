'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('public/js/app.js'),state=read('public/js/core/appState.js'),nav=read('public/js/domains/navigationUI.js'),gameplay=read('public/js/domains/gameplayUI.js'),index=read('public/index.html');

const screens=['home','waitingHost','guest','createRoom','lobby','serverDash','cardCreation','round','host','result','gameOver','admin'];
const socketEvents=['room_created','room_joined','room_closed','player_list_update','cards_submitted','all_cards_ready','game_started','new_round','card_played','all_cards_played','round_result','game_over','error','player_disconnected','player_left','round_skipped','room_cancelled','player_abandoned','player_reconnected','server_status_update'];

test('appState owner compila e é instalado antes do bootstrap',()=>{
 assert.doesNotThrow(()=>new Function(state));
 assert.match(state,/const initial=\(\)=>\(\{/);
 assert.match(state,/const reset=current=>\(\{/);
 assert.match(state,/window\.CartAppState=\{initial,reset,install\}/);
 assert.match(state,/app\.resetState=function\(\)/);
 const appPos=index.indexOf('js/app.js'),statePos=index.indexOf('js/core/appState.js'),navPos=index.indexOf('js/domains/navigationUI.js');
 assert.ok(appPos>=0&&statePos>appPos&&navPos>statePos,'app.js → appState → navigationUI');
});

test('bootstrap inicializa socket, registra eventos uma vez e só então escolhe a primeira tela',()=>{
 const init=app.indexOf('init()'),socket=app.indexOf('SocketClient.init()',init),register=app.indexOf('this.registerSocketEvents()',init),screen=app.indexOf("this.showScreen('home')",init);
 assert.ok(init>=0&&socket>init&&register>socket&&screen>register);
 assert.match(app,/document\.addEventListener\('DOMContentLoaded',[\s\S]*App\.init\(\)/);
});

test('owner de estado preserva identidade e limpa exatamente o contexto histórico da partida',()=>{
 for(const key of['nickname','roomCode','isCreator','currentScreen','players','hand','currentBlackCard','isHost','scores','roundNumber','maxPlayers','blackCardsPerPlayer','whiteCardsPerPlayer'])assert.match(state,new RegExp(`${key}:`),key);
 assert.match(state,/nickname:current\?\.nickname\|\|''/);
 assert.match(state,/roomCode:''/);assert.match(state,/currentScreen:'home'/);assert.match(state,/players:\[\]/);assert.match(state,/hand:\[\]/);
 assert.match(state,/useStandardDeck:true/);
 assert.match(state,/Scoreboard\?\.hide\?\.\(\)/);
 assert.doesNotMatch(state,/CardCreationScreen\.blackCards\s*=\s*\[\]|CardCreationScreen\.whiteCards\s*=\s*\[\]/);
});

test('estado inicial preserva modo online e detecção guest antes de qualquer mutação',()=>{
 assert.match(state,/playMode:'online'/);assert.match(state,/isGuest:false/);assert.match(state,/guestCode:''/);
 assert.match(app,/this\.state\.isGuest = true/);assert.match(app,/this\.state\.guestCode = codePart\.toUpperCase\(\)/);
});

test('roteador-base mantém todas as telas e cleanup antes da transição',()=>{
 for(const screen of screens)assert.ok(app.includes(`case '${screen}':`)||screen==='home'&&app.includes("case 'home':"),screen);
 assert.match(app,/currentScreen === 'result'[\s\S]*ResultScreen\.cleanup\(\)/);
 assert.match(app,/currentScreen === 'waitingHost'[\s\S]*WaitingHostScreen\.cleanup\(\)/);
 assert.match(app,/app\.classList\.add\('screen-exit'\)/);assert.match(app,/setTimeout\(\(\) => \{[\s\S]*app\.innerHTML = ''/);
});

test('socket lifecycle registra o conjunto canônico de eventos críticos',()=>{
 for(const event of socketEvents)assert.match(app,new RegExp(`SocketClient\\.on\\('${event}'`),event);
 assert.equal((app.match(/registerSocketEvents\(\)/g)||[]).length,2,'uma declaração + uma chamada no init');
});

test('transições de rodada preservam estado antes de renderizar telas',()=>{
 assert.match(app,/SocketClient\.on\('new_round',[\s\S]*this\.state\.roundNumber[\s\S]*this\.state\.currentBlackCard[\s\S]*this\.state\.hand[\s\S]*this\.state\.isHost/);
 assert.match(app,/SocketClient\.on\('all_cards_played',[\s\S]*this\.state\.submissions/);
 assert.match(app,/SocketClient\.on\('round_result',[\s\S]*this\.state\.localTurnQueue = null[\s\S]*this\.showScreen\('result'/);
 assert.match(app,/SocketClient\.on\('game_over',[\s\S]*Scoreboard\.hide\(\)[\s\S]*this\.showScreen\('gameOver'/);
});

test('navigationUI continua sendo o único writer final de App.showScreen entre owners',()=>{
 assert.match(nav,/directShow=App\.showScreen\.bind\(App\)/);
 assert.match(nav,/App\.showScreen=function\(name,data=\{\}\)/);
 assert.match(nav,/CartShowcaseDomain\?\.interceptNavigation/);
 assert.doesNotMatch(gameplay,/App\.showScreen\s*=/);
 assert.ok(index.indexOf('js/app.js')<index.indexOf('js/domains/navigationUI.js?v=domain-2'));
});
