'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p36.js'),shim=read('public/css/p36.css'),scrollCss=read('public/css/notificationsScrollCurrent.css'),roomCss=read('public/css/roomAccordionCurrent.css'),wingsCss=read('public/css/cosmeticWingsCurrent.css'),backCss=read('public/css/backButtonEnvelopeCurrent.css'),notificationsUI=read('public/js/domains/notificationsUI.js'),room=read('public/js/domains/roomUI.js'),cosmetics=read('public/js/domains/cosmeticsUI.js'),rules=read('public/js/roomRulesUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP36.js');

test('spoilers abertos possuem scroll interno próprio em owner canônico',()=>{
 assert.ok(scrollCss.includes('max-height:min(40vh,360px)!important'));
 assert.ok(scrollCss.includes('overflow-y:auto!important'));
 assert.ok(scrollCss.includes('overscroll-behavior:contain'));
 assert.ok(scrollCss.includes('-webkit-overflow-scrolling:touch'));
 assert.ok(scrollCss.includes('max-height:min(38vh,300px)!important'));
 assert.ok(shim.includes('notificationsScrollCurrent.css'));
 assert.ok(notificationsUI.includes("list.classList.add('notifications-spoiler-content')"));
});

test('Resumo, Estimativa e Como Jogar usam owner roomUI + acordeão visual canônico',()=>{
 assert.doesNotThrow(()=>new Function(room));
 assert.ok(room.includes('room-info-accordion'));
 assert.ok(room.includes('dashboard-collapsible-heading'));
 assert.ok(room.includes('Estimativa para mesa cheia'));
 assert.ok(room.includes('lobby-how-to-play'));
 assert.ok(room.includes("insertAdjacentHTML('afterend',RoomRulesUI.howToPlay"));
 assert.ok(room.includes('const full=d.fullTable||d.preview'));
 assert.ok(roomCss.includes('.room-info-accordion>summary'));
 assert.ok(roomCss.includes('.room-info-accordion[open]>summary'));
 assert.ok(shim.includes('roomAccordionCurrent.css'));
});

test('Como Jogar preserva o guia funcional sem jargão interno',()=>{
 for(const trecho of['Objetivo da partida','Como funciona uma rodada','Sua mão de cartas','Cartas de Jogador','Recompensas','Espólio','BUFFs','Narrador e inatividade'])assert.ok(room.includes(trecho),trecho);
 assert.doesNotMatch(`${room}\n${rules}`,/Reward Engine|snapshot econômico|liquidação|participação efetiva/i);
});

test('Asas usam geometria final P36 e continuam compatíveis com previews cosméticos',()=>{
 assert.doesNotThrow(()=>new Function(cosmetics));
 assert.ok(cosmetics.includes('frame-${m.esc(equip)}'));
 assert.ok(wingsCss.includes('.avatar-frame.frame-cosmetic-asas'));
 assert.ok(wingsCss.includes('bottom:-10px!important'));
 assert.ok(wingsCss.includes('z-index:40!important'));
 assert.ok(wingsCss.includes('transform:scaleX(-1) rotate(45deg)!important'));
 assert.ok(wingsCss.includes('transform:rotate(45deg)!important'));
 assert.ok(shim.includes('cosmeticWingsCurrent.css'));
});

test('alinhamento antigo inline de #back-play foi supersedido pela trajetória P39 e controles superiores',()=>{
 assert.ok(!shim.includes('#back-play'));
 assert.ok(!roomCss.includes('#back-play'));
 assert.ok(!scrollCss.includes('#back-play'));
 assert.ok(!wingsCss.includes('#back-play'));
 assert.ok(backCss.includes('#play-form>#back-play'));
});

test('P36 é histórico não executável, shim visual, e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p36.css?v=1.4.36'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p36.js?v=1.4.36"'));
 assert.ok(!index.includes('<script src="js/p36.js'));
 assert.ok(shim.startsWith('/* COMPAT P36'));
 assert.ok(release.includes("APP_VERSION='v1.4.36'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P36_RELEASE')||notifications.includes('releaseP36'));
});
