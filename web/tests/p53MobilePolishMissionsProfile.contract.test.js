'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p53.js');
const css=read('public/css/p53.css');
const index=read('public/index.html');
const p24=read('public/js/homeMenuP24.js');
const p25=read('public/js/uiP25.js');
const p27=read('public/js/homeMenuP27.js');
const p50=read('public/js/p50.js');
const p27css=read('public/css/p27.css');
const release=read('lib/releaseP53.js');
const version=read('api/version.js');
const notifications=read('api/notifications.js');

test('P53 compila e permanece carregado depois de P52',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(index.indexOf('css/p53.css?v=1.4.53')>index.indexOf('css/p52.css?v=1.4.52'));
 assert.ok(index.indexOf('js/p53.js?v=1.4.53')>index.indexOf('js/p52.js?v=1.4.52'));
});

test('contador de amigos nasce imediatamente e mantém último valor conhecido',()=>{
 assert.ok(js.includes('ensureFriendPill'));
 assert.ok(js.includes('localStorage.getItem(friendKey())'));
 assert.ok(js.includes("pill.textContent='…'"));
 assert.ok(js.includes('HomeScreen.renderAccount=function'));
});

test('Missões não abrem automaticamente e recompensas ficam horizontais à direita',()=>{
 assert.ok(js.includes("sessionStorage.setItem('cartaralho_missions_opened','1')"));
 assert.ok(js.includes('MetaUI.missionOpen=false'));
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) auto!important'));
 assert.ok(css.includes('flex-wrap:nowrap!important'));
 assert.ok(css.includes('justify-content:flex-end!important'));
});

test('Lobby sempre volta ao topo ao renderizar',()=>{
 assert.ok(js.includes('function resetLobbyScroll'));
 assert.ok(js.includes('window.scrollTo(0,0)'));
 assert.ok(js.includes('LobbyScreen.render=function'));
 assert.ok(js.includes('requestAnimationFrame(resetLobbyScroll)'));
});

test('Reciclagem colore o corpo das cartas pretas e brancas',()=>{
 assert.ok(js.includes('p53-recycle-black'));
 assert.ok(js.includes('p53-recycle-white'));
 assert.ok(css.includes('.recycling-card.p53-recycle-black'));
 assert.ok(css.includes('.recycling-card.p53-recycle-white'));
});

test('Cosméticos fica imediatamente antes de Reciclagem',()=>{
 assert.ok(js.includes('[data-market-tab="cosmetics"]'));
 assert.ok(js.includes('[data-market-tab="recycling"]'));
 assert.ok(js.includes('nav.insertBefore(cosmetics,recycling)'));
});

test('Central de Notificações fica acima de Histórico em todas as camadas',()=>{
 for(const src of[p24,p25,p27,p50]){
  const n=src.indexOf('#notifications-menu-btn'),h=src.indexOf('[data-panel="history"]');
  assert.ok(n>=0&&h>n);
 }
 assert.ok(p27css.indexOf('#notifications-menu-btn{order:5!important}')<p27css.indexOf('[data-panel="history"]{order:6!important}'));
});

test('Perfil troca aparência com um único render e congela animações só nos thumbnails',()=>{
 assert.ok(js.includes('async function equipFrameOnce'));
 assert.ok(js.includes("this.activeTab='frames'"));
 assert.ok(js.includes('this.render()'));
 assert.ok(!js.includes("this.activeTab='frames';this.overlay.querySelectorAll"));
 assert.ok(css.includes('.profile-modal-frame-grid .avatar-frame'));
 assert.ok(css.includes('animation:none!important;transition:none!important'));
});

test('Progressão reutiliza exatamente o card visual da janela de Missões',()=>{
 assert.ok(js.includes('ProfileModal.missionCard=function'));
 assert.ok(js.includes('MetaUI?.missionRow?.(m)'));
});

test('Minhas Cartas mantém a garantia histórica do P53',()=>{
 assert.ok(js.includes('function ensureCardCreator'));
 assert.ok(js.includes('HomeScreen.openPanel=async function'));
 assert.ok(js.includes("if(kind==='cards')"));
 assert.ok(js.includes('Criar nova Carta de Jogador'));
 assert.ok(css.includes('.p53-create-card-entry'));
});

test('P53 permanece preservado na API e Central após releases futuros',()=>{
 assert.ok(release.includes("APP_VERSION='v1.4.53'"));
 assert.match(version,/releaseP(?:53|5[4-9]|[6-9]\d)/);
 assert.ok(notifications.includes('P53_RELEASE')||notifications.includes("require('../lib/releaseP53')"));
 assert.ok(notifications.includes('P52_RELEASE'));
});
