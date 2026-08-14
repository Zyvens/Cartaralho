'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const create=read('public/js/screens/createRoom.js'),lobby=read('public/js/screens/lobby.js'),reward=read('public/js/rewardPreviewUI.js'),rules=read('public/js/roomRulesUI.js'),p15=read('public/css/p15.css'),index=read('public/index.html'),legacy=read('public/js/refinementP13.js');

for(const[file,src]of[['createRoom.js',create],['lobby.js',lobby],['rewardPreviewUI.js',reward],['roomRulesUI.js',rules]])test(`${file} compila no P15`,()=>assert.doesNotThrow(()=>new Function(src)));

test('criação de sala expõe quatro cards visuais independentes',()=>{for(const marker of['dashboard-config-card','how-to-play-card','dashboard-summary-slot','dashboard-estimate-card'])assert.match(create,new RegExp(marker));assert.match(create,/create-room-dashboard/);assert.doesNotMatch(create,/create-room-sidebar/);assert.match(p15,/dashboard-config-card,\.dashboard-summary-slot,\.dashboard-estimate-card\{background:none!important;border:0!important;box-shadow:none!important/);});

test('Como Jogar ocupa a coluna mais larga no desktop',()=>{assert.match(p15,/grid-template-columns:minmax\(360px,\.84fr\) minmax\(500px,1\.16fr\)/);assert.match(p15,/how-to-play-card/);assert.match(p15,/rules-list\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);});

test('estimativa une moeda e Espólio dentro de cada colocação',()=>{for(const marker of['economy-placement-card','economy-placement-rewards','economy-reward-coins','economy-reward-loot'])assert.match(reward,new RegExp(marker));for(const label of["'1º lugar'","'2º lugar'","'3º lugar'","'Demais'"])assert.ok(reward.includes(label),label);assert.match(reward,/survival\?'Sobrevivência':'Prêmio'/);assert.doesNotMatch(reward,/economy-payout-grid|economy-loot-grid/);assert.doesNotMatch(reward,/~\d|~\$\{/);});

test('renderer P15 permanece autoritativo mesmo diante do override legado P13',()=>{assert.match(reward,/Object\.defineProperty\(RewardPreviewUI,'card'/);assert.match(reward,/P15RewardCard/);assert.match(legacy,/RewardPreviewUI\.card=function/);assert.match(reward,/set\(\)\{\}/);});

test('Lobby mostra resumo e só abre editor completo ao clicar em Editar',()=>{assert.match(lobby,/RoomRulesUI\.summary\(cfg/);assert.match(lobby,/data-room-summary-edit/);assert.match(lobby,/openRulesEditor/);assert.match(lobby,/RoomRulesUI\.openEditor/);assert.match(lobby,/scope:'lobby-edit'/);assert.doesNotMatch(lobby,/save-room-rules-btn/);assert.doesNotMatch(lobby,/RoomRulesUI\.render\(cfg/);});

test('editor modal reaproveita regras existentes e salva pela API já existente',()=>{assert.match(rules,/room-rules-editor-overlay/);assert.match(rules,/role="dialog"/);assert.match(rules,/this\.render\(config/);assert.match(rules,/data-room-editor-save/);assert.match(lobby,/SocketClient\.updateRoomConfig/);assert.match(lobby,/CartRoomConfigSync/);});

test('Resumo da partida contém regras essenciais sem exibir formulário',()=>{for(const label of['Jogadores','Vitória','Mão','Deck-base','Novas cartas','Cartas próprias','BUFFs','Narrador','AFK'])assert.ok(rules.includes(label),label);assert.match(rules,/room-summary-primary/);assert.match(rules,/room-summary-flags/);});

test('P15 mantém ordem mobile Configuração, Como Jogar, Resumo, Estimativas',()=>{assert.match(p15,/dashboard-config-card\{order:1\}/);assert.match(p15,/how-to-play-card\{order:2\}/);assert.match(p15,/dashboard-summary-slot\{order:3\}/);assert.match(p15,/dashboard-estimate-card\{order:4\}/);});

test('CSS P15 é carregado depois do P14',()=>{const p14=index.indexOf('css/p14.css'),p15At=index.indexOf('css/p15.css');assert.ok(p14>0&&p15At>p14);});
