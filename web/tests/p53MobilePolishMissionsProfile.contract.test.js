'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p53.js');
const css=read('public/css/p53.css');
const social=read('public/js/domains/socialUI.js');
const missions=read('public/js/domains/missionsUI.js');
const room=read('public/js/domains/roomUI.js');
const market=read('public/js/domains/marketplaceUI.js');
const nav=read('public/js/domains/navigationUI.js');
const profile=read('public/js/domains/profileUI.js');
const cards=read('public/js/domains/cardsLibrary.js');
const index=read('public/index.html');
const release=read('lib/releaseP53.js');
const version=read('api/version.js');
const notifications=read('api/notifications.js');

test('contador de amigos nasce com último valor conhecido no owner social',()=>{
 assert.ok(social.includes('ensureFriendPill'));
 assert.ok(social.includes('localStorage.getItem(key())'));
 assert.ok(social.includes("pill.textContent='…'"));
});

test('Missões permanecem fechadas no startup e exibem recompensas em linha',()=>{
 assert.ok(missions.includes("sessionStorage.setItem('cartaralho_missions_opened','1')"));
 assert.ok(missions.includes('MetaUI.missionOpen=false'));
 assert.ok(missions.includes('p52-mission-coin-pill'));
 assert.ok(missions.includes('mission-xp-pill'));
 assert.ok(css.includes('flex-wrap:nowrap!important'));
});

test('roomUI preserva retorno do Lobby ao topo',()=>{
 assert.ok(room.includes('function resetLobbyScroll()'));
 assert.ok(room.includes('window.scrollTo(0,0)'));
 assert.ok(room.includes('LobbyScreen.render=function'));
 assert.ok(room.includes('requestAnimationFrame(resetLobbyScroll)'));
});

test('marketplaceUI preserva cores da Reciclagem e ordem Cosméticos antes de Reciclagem',()=>{
 assert.ok(market.includes('p53-recycle-black'));
 assert.ok(market.includes('p53-recycle-white'));
 assert.ok(css.includes('.recycling-card.p53-recycle-black'));
 assert.ok(css.includes('.recycling-card.p53-recycle-white'));
 const c=market.indexOf('[data-market-tab="cosmetics"]');
 const r=market.indexOf('[data-market-tab="recycling"]');
 assert.ok(c>=0&&r>c);
 assert.ok(market.includes('nav.insertBefore(cosmetics,recycling)'));
});

test('navigationUI mantém Central de Notificações acima de Histórico',()=>{
 const n=nav.indexOf('#notifications-menu-btn');
 const h=nav.indexOf('[data-panel="history"]');
 assert.ok(n>=0&&h>n);
});

test('profileUI preserva aparência em um fluxo de render e reutiliza card de Missões',()=>{
 assert.ok(profile.includes('P.render=function'));
 assert.ok(profile.includes('setAppearanceDraft'));
 assert.ok(profile.includes('profile-global-save'));
 assert.ok(profile.includes('CartMissionsDomain?.missionRow?.(m)'));
 assert.ok(css.includes('.profile-modal-frame-grid .avatar-frame'));
});

test('cardsLibrary preserva criação a partir de Minhas Cartas',()=>{
 assert.ok(cards.includes('library-create-entry'));
 assert.ok(cards.includes('Criar nova Carta de Jogador'));
 assert.ok(cards.includes('openCreator'));
 assert.ok(css.includes('.p53-create-card-entry'));
});

test('P53 é histórico não executável e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p53.css?v=1.4.53'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p53.js?v=1.4.53"'));
 assert.ok(!index.includes('<script src="js/p53.js'));
 assert.ok(release.includes("APP_VERSION='v1.4.53'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P53_RELEASE'));
 assert.ok(notifications.includes('P52_RELEASE'));
});
