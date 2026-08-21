'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const heroCss=read('public/css/homeHeroFlowCurrent.css');
const friendsCss=read('public/css/friendsIndicatorCurrent.css');
const createCss=read('public/css/cardsCreateEntryBaseCurrent.css');
const shim=read('public/css/p50.css');
const history=read('public/js/p50.js');
const nav=read('public/js/domains/navigationUI.js');
const social=read('public/js/domains/socialUI.js');
const cards=read('public/js/domains/cardsLibrary.js');
const index=read('public/index.html');
const release=read('lib/releaseP50.js');
const version=read('api/version.js');
const notifications=read('api/notifications.js');

test('Home hero, Amigos e criação vivem em owners visuais separados',()=>{
 assert.ok(heroCss.includes('.home-subtitle'));
 assert.ok(heroCss.includes('.home-logo'));
 assert.ok(friendsCss.includes('p48-friends-online-pill'));
 assert.ok(createCss.includes('.p48-create-card-entry'));
 assert.ok(shim.includes('homeHeroFlowCurrent.css'));
 assert.ok(shim.includes('friendsIndicatorCurrent.css'));
 assert.ok(shim.includes('cardsCreateEntryBaseCurrent.css'));
});

test('navigationUI preserva a ordem Notificações antes de Histórico',()=>{
 const n=nav.indexOf('#notifications-menu-btn');
 const h=nav.indexOf('[data-panel="history"]');
 assert.ok(n>=0&&h>n);
 assert.ok(nav.includes('function orderMenu()'));
});

test('cardsLibrary preserva a entrada de criação',()=>{
 assert.ok(cards.includes('library-create-entry'));
 assert.ok(cards.includes('Criar nova Carta de Jogador'));
 assert.ok(cards.includes('openCreator'));
});

test('socialUI preserva presença fora do ciclo de render',()=>{
 assert.ok(social.includes('async function heartbeat()'));
 assert.ok(social.includes('document.hidden'));
 assert.ok(social.includes('timer=setInterval'));
});

test('P50 é histórico não executável, shim visual, e P75 é corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p50.css?v=1.4.50'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p50.js?v=1.4.53"'));
 assert.ok(!index.includes('<script src="js/p50.js'));
 assert.ok(shim.startsWith('/* COMPAT P50'));
 assert.ok(release.includes("APP_VERSION='v1.4.50'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P50_RELEASE'));
 assert.ok(notifications.includes('P49_RELEASE'));
});
