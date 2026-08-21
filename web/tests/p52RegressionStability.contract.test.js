'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shim=read('public/css/p52.css');
const homeCss=read('public/css/homeHeaderLayoutCurrent.css');
const missionCss=read('public/css/missionsCoinVisualCurrent.css');
const history=read('public/js/p52.js');
const missions=read('public/js/domains/missionsUI.js');
const nav=read('public/js/domains/navigationUI.js');
const account=read('public/js/domains/accountUI.js');
const admin=read('public/js/domains/adminUI.js');
const presence=read('lib/presence.js');
const cards=read('public/js/domains/cardsLibrary.js');
const index=read('public/index.html');
const version=read('api/version.js');

test('P52 mantém apenas owners visuais ainda efetivos',()=>{
 assert.ok(homeCss.includes('.home-subtitle'));
 assert.ok(homeCss.includes('.home-logo'));
 assert.ok(missionCss.includes('.p52-mission-coin-pill'));
 assert.ok(shim.includes('homeHeaderLayoutCurrent.css'));
 assert.ok(shim.includes('missionsCoinVisualCurrent.css'));
});

test('ordem visual histórica de P52 foi supersedida pelo único owner navigationUI',()=>{
 assert.ok(!shim.includes('marketplace-menu-btn'));
 assert.ok(!homeCss.includes('notifications-menu-btn'));
 const n=nav.indexOf('#notifications-menu-btn');
 const h=nav.indexOf('[data-panel="history"]');
 assert.ok(n>=0&&h>n);
 assert.ok(nav.includes('mainObserver=null'));
 assert.ok(nav.includes('mainObserver=new MutationObserver'));
 assert.ok(nav.includes('mainObserver?.disconnect()'));
});

test('layout antigo de Missões e entrada p48 de criação não são recanonizados',()=>{
 assert.ok(missions.includes('p52-mission-coin-pill'));
 assert.ok(missions.includes('mission-xp-pill'));
 assert.ok(!shim.includes('mission-row'));
 assert.ok(!shim.includes('p48-create-card-entry'));
 assert.ok(cards.includes('p54-create-card-entry p56-create-card-entry p57-create-card-entry'));
});

test('navigationUI preserva lifecycle seguro do fundo dinâmico',()=>{
 assert.ok(nav.includes('HomeScreen.stopDynamicBackground=function'));
 assert.ok(nav.includes('clearInterval(this.bgInterval)'));
 assert.ok(nav.includes('__domainBgGeneration'));
 assert.ok(nav.includes("window.addEventListener('pagehide'"));
});

test('atalhos da Home agora são responsabilidade de accountUI e adminUI',()=>{
 assert.ok(account.includes('HomeScreen.renderAccount=function'));
 assert.ok(account.includes('CartMarketplaceDomain?.mountBalance'));
 assert.ok(admin.includes('CartAdminDomain'));
});

test('presença continua tolerando corrida de DDL',()=>{
 assert.ok(presence.includes('23505'));
 assert.ok(presence.includes('42P07'));
 assert.ok(presence.includes('ready=null'));
});

test('P52 é histórico não executável, shim visual, e P75 permanece corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p52.css?v=1.4.52'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p52.js?v=1.4.52"'));
 assert.ok(!index.includes('<script src="js/p52.js'));
 assert.ok(shim.startsWith('/* COMPAT P52'));
 assert.ok(version.includes('releaseP75'));
});
