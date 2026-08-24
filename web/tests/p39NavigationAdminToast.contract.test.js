'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p39.js'),shim=read('public/css/p39.css'),backCss=read('public/css/backButtonEnvelopeCurrent.css'),toastCss=read('public/css/toastViewportCurrent.css'),topNav=read('public/css/topNavigationCurrent.css'),accountActions=read('public/css/accountActionsCurrent.css'),admin=read('public/js/domains/adminUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP39.js');

test('Admin home-only pertence ao owner canônico adminUI',()=>{
 assert.doesNotThrow(()=>new Function(admin));
 assert.ok(admin.includes("App?.state?.currentScreen==='home'"));
 assert.ok(admin.includes("document.querySelector('.home-screen')"));
 assert.ok(admin.includes("getComputedStyle(document.getElementById('play-form')).display==='none'"));
 assert.ok(admin.includes("if(!isAdmin()||!mainHomeOpen()){remove();return null;}"));
 assert.ok(admin.includes("b.id='creator-admin-fab'"));
});

test('envelope genérico de Voltar vive em owner próprio e refinamentos superiores continuam posteriores',()=>{
 assert.ok(backCss.includes('button.back-button'));
 assert.ok(backCss.includes('button.ghost-back'));
 assert.ok(backCss.includes("button[id^='back-']"));
 assert.ok(backCss.includes('#play-form>#back-play'));
 assert.ok(backCss.includes('border-radius:999px!important'));
 assert.ok(shim.includes('backButtonEnvelopeCurrent.css'));
 assert.ok(topNav.includes('button.back-button'));
 assert.ok(topNav.includes('height:40px!important'));
 assert.ok(index.indexOf('css/p39.css?v=1.4.39')<index.indexOf('css/p45.css?v=1.4.45'));
});

test('toasts longos quebram linha sem exceder a viewport',()=>{
 assert.ok(toastCss.includes('width:min(420px,calc(100vw - 24px))!important'));
 assert.ok(toastCss.includes('white-space:normal!important'));
 assert.ok(toastCss.includes('overflow-wrap:anywhere'));
 assert.ok(toastCss.includes('width:calc(100vw - 20px)!important'));
 assert.ok(shim.includes('toastViewportCurrent.css'));
});

test('sizing histórico de Perfil/Sair não permanece sob ownership P39',()=>{
 assert.ok(!backCss.includes('#profile-shortcut'));
 assert.ok(!backCss.includes('#logout-btn'));
 assert.ok(!toastCss.includes('#profile-shortcut'));
 assert.ok(!toastCss.includes('#logout-btn'));
 assert.ok(accountActions.includes('.p56-account-action'));
 assert.ok(accountActions.includes('.p56-profile-action'));
 assert.ok(accountActions.includes('.p56-logout-action'));
});

test('P39 é histórico não executável, shim visual, e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p39.css?v=1.4.39'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p39.js?v=1.4.39"'));
 assert.ok(!index.includes('<script src="js/p39.js'));
 assert.ok(shim.startsWith('/* COMPAT P39'));
 assert.ok(release.includes("APP_VERSION='v1.4.39'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P39_RELEASE')||notifications.includes('releaseP39'));
});
