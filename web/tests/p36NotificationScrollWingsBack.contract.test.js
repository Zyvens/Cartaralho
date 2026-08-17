'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p36.css'),js=read('public/js/p36.js'),rules=read('public/js/roomRulesUI.js'),create=read('public/js/screens/createRoom.js'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('P36 JS crítico compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('spoilers abertos possuem scroll interno próprio',()=>{
 assert.match(css,/\.notifications-spoiler-content\{[\s\S]*max-height:min\(40vh,360px\)!important[\s\S]*overflow-y:auto!important[\s\S]*overscroll-behavior:contain/);
 assert.match(css,/-webkit-overflow-scrolling:touch/);
});

test('Voltar da etapa de apelido fica alinhado à esquerda',()=>{
 assert.match(css,/#play-form>#back-play\{[\s\S]*display:flex!important[\s\S]*width:max-content!important[\s\S]*margin:0 auto 12px 0!important[\s\S]*justify-content:flex-start!important/);
});

test('Asas ficam na base e acima de foto e moldura',()=>{
 assert.match(css,/frame-cosmetic-asas::before,[\s\S]*frame-cosmetic-asas::after\{[\s\S]*top:auto!important[\s\S]*bottom:-10px!important[\s\S]*z-index:40!important/);
 assert.match(css,/frame-cosmetic-asas::before\{[\s\S]*left:-10px!important[\s\S]*scaleX\(-1\) rotate\(45deg\)!important/);
 assert.match(css,/frame-cosmetic-asas::after\{[\s\S]*right:-10px!important[\s\S]*rotate\(45deg\)!important/);
});

test('Resumo, Estimativa e Como Jogar usam o mesmo acordeão',()=>{
 assert.match(js,/RoomRulesUI\.summary=function/);
 assert.match(js,/room-info-accordion/);
 assert.match(js,/RoomRulesUI\.howToPlay=function/);
 assert.match(js,/Estimativa para mesa cheia/);
 assert.match(js,/dashboard-collapsible-heading/);
 assert.match(css,/\.room-info-accordion>summary\{/);
 assert.match(css,/\.room-info-accordion\[open\]>summary/);
});

test('Como Jogar também aparece no Lobby e a estimativa usa mesa cheia',()=>{
 assert.match(js,/lobby-how-to-play/);
 assert.match(js,/insertAdjacentHTML\('afterend',RoomRulesUI\.howToPlay/);
 assert.match(js,/const full=d\.fullTable\|\|d\.preview/);
 assert.match(js,/RewardPreviewUI\.card\(full,'Estimativa para mesa cheia'/);
});

test('Como Jogar é o mesmo guia na criação e no Lobby',()=>{
 assert.match(js,/oldHow\.insertAdjacentHTML\('beforebegin',RoomRulesUI\.howToPlay/);
 for(const trecho of['Objetivo da partida','Como funciona uma rodada','Sua mão de cartas','Cartas de Jogador','Recompensas','Espólio','BUFFs','Narrador e inatividade']){
  assert.ok(js.includes(trecho),`P36:${trecho}`);
  assert.ok(create.includes(trecho),`createRoom:${trecho}`);
 }
 assert.doesNotMatch(`${js}\n${create}`,/Reward Engine|server-side|snapshot econômico|liquidação|participação efetiva/i);
});

test('Configurações explicam o efeito prático de cada opção',()=>{
 for(const trecho of['quantas pessoas podem entrar','partida termina quando alguém alcança','quantas Cartas Brancas cada jogador terá','cartas salvas pelo criador','Cada nova carta consome 1 Carta Limpa','cartas personalizadas que já fazem parte da sua coleção','vantagens consumíveis compradas no Mercado Paralelo','ler em voz alta','voltar usando o código da mesa'])assert.ok(rules.includes(trecho),trecho);
 assert.doesNotMatch(rules,/Reward Engine|server-side|snapshot econômico|liquidação|participação efetiva/i);
});

test('P36 é a camada final publicada',()=>{
 assert.match(index,/css\/p36\.css\?v=1\.4\.36/);
 assert.match(index,/js\/p36\.js\?v=1\.4\.36/);
 assert.ok(index.indexOf('css/p36.css?v=1.4.36')>index.indexOf('css/p35.css?v=1.4.35'));
 assert.ok(index.indexOf('js/p36.js?v=1.4.36')>index.indexOf('js/p35.js?v=1.4.35'));
});

test('Central publica P36',()=>{
 assert.match(notifications,/APP_VERSION='v1\.4\.36'/);
 assert.match(notifications,/release:p36/);
 assert.match(notifications,/Scroll nos spoilers, Asas em primeiro plano e Voltar alinhado/);
});
