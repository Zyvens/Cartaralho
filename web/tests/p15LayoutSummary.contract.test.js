'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const create=read('public/js/screens/createRoom.js'),lobby=read('public/js/screens/lobby.js'),reward=read('public/js/rewardPreviewUI.js'),rules=read('public/js/roomRulesUI.js'),roomDomain=read('public/js/domains/roomUI.js'),p15=read('public/css/p15.css'),summaryCss=read('public/css/roomSummaryCurrent.css'),editorCss=read('public/css/roomRulesEditorCurrent.css'),economyCss=read('public/css/economyPlacementCurrent.css'),p21=read('public/css/roomSetupDashboardCurrent.css'),p22=read('public/css/rewardEstimateCurrent.css'),index=read('public/index.html'),legacy=read('public/js/refinementP13.js');
for(const[file,src]of[['createRoom.js',create],['lobby.js',lobby],['rewardPreviewUI.js',reward],['roomRulesUI.js',rules],['roomUI.js',roomDomain]])test(`${file} compila`,()=>assert.doesNotThrow(()=>new Function(src)));

test('composição atual da criação pertence a P21/roomUI e não ao shim P15',()=>{for(const marker of['dashboard-config-card','how-to-play-card','dashboard-summary-slot','dashboard-estimate-card'])assert.match(create,new RegExp(marker));assert.match(p21,/grid-template-areas:'config summary' 'config estimate' 'howto howto'/);assert.match(roomDomain,/normalizeCreate/);assert.doesNotMatch(p15,/create-room-dashboard\{/);});

test('estimativa une moeda e Espólio dentro de cada colocação',()=>{for(const marker of['economy-placement-card','economy-placement-rewards','economy-reward-coins','economy-reward-loot'])assert.match(reward,new RegExp(marker));for(const label of["'1º lugar'","'2º lugar'","'3º lugar'","'Demais'"])assert.ok(reward.includes(label),label);assert.match(reward,/survival\?'Sobrevivência':'Prêmio'/);assert.doesNotMatch(reward,/economy-payout-grid|economy-loot-grid/);assert.match(economyCss,/economy-placement-grid/);assert.match(economyCss,/economy-reward-loot/);});

test('renderer P15 permanece autoritativo contra override legado P13',()=>{assert.match(reward,/Object\.defineProperty\(RewardPreviewUI,'card'/);assert.match(reward,/P15RewardCard/);assert.match(legacy,/RewardPreviewUI\.card=function/);assert.match(reward,/set\(\)\{\}/);});

test('Lobby mostra resumo e editor completo somente ao editar',()=>{assert.match(lobby,/RoomRulesUI\.summary\(cfg/);assert.match(lobby,/data-room-summary-edit/);assert.match(lobby,/openRulesEditor/);assert.match(lobby,/RoomRulesUI\.openEditor/);assert.match(lobby,/scope:'lobby-edit'/);assert.doesNotMatch(lobby,/save-room-rules-btn/);assert.match(summaryCss,/room-summary-card/);assert.match(summaryCss,/room-summary-primary/);assert.match(summaryCss,/room-summary-flags/);});

test('editor modal reaproveita regras existentes e salva pela API já existente',()=>{assert.match(rules,/room-rules-editor-overlay/);assert.match(rules,/role="dialog"/);assert.match(rules,/this\.render\(config/);assert.match(rules,/data-room-editor-save/);assert.match(lobby,/SocketClient\.updateRoomConfig/);assert.match(lobby,/CartRoomConfigSync/);assert.match(editorCss,/room-rules-editor-shell/);assert.match(editorCss,/room-rules-editor-actions/);});

test('Resumo contém regras essenciais sem exibir formulário',()=>{for(const label of['Jogadores','Vitória','Mão','Deck-base','Novas cartas','Cartas próprias','BUFFs','Narrador','AFK'])assert.ok(rules.includes(label),label);});

test('casca/contexto econômico posterior pertence a P22',()=>{assert.match(p22,/economy-classification/);assert.match(p22,/economy-match-facts/);assert.match(p22,/economy-preview-head/);});

test('P15 é shim de três owners e preserva posição histórica',()=>{for(const name of['roomSummaryCurrent.css','roomRulesEditorCurrent.css','economyPlacementCurrent.css'])assert.match(p15,new RegExp(name.replace('.','\\.')));assert.ok(index.indexOf('css/p15.css')>index.indexOf('css/p14.css'));});
