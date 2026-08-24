'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p38.js'),admin=read('public/js/domains/adminUI.js'),nav=read('public/js/domains/navigationUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP38.js');

test('regra Admin apenas na Home real vive no owner adminUI',()=>{
 assert.doesNotThrow(()=>new Function(admin));
 assert.ok(admin.includes("const isAdmin=()=>Number(AuthClient?.user?.id)===1"));
 assert.ok(admin.includes("App?.state?.currentScreen==='home'"));
 assert.ok(admin.includes("document.querySelector('.home-screen')"));
 assert.ok(admin.includes("getComputedStyle(document.getElementById('play-form')).display==='none'"));
 assert.ok(admin.includes("if(!isAdmin()||!mainHomeOpen()){remove();return null;}"));
});

test('owner Admin remove FAB e modal fora da Home sem disputar App.showScreen',()=>{
 assert.ok(admin.includes("document.getElementById('creator-admin-fab')?.remove()"));
 assert.ok(admin.includes("document.getElementById('creator-admin-overlay')?.remove()"));
 assert.ok(admin.includes("document.body.classList.remove('creator-admin-active')"));
 assert.ok(!admin.includes('App.showScreen=function'));
 assert.ok(nav.includes('App.showScreen=function'));
});

test('P38 é proveniência não executável e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p38.js?v=1.4.38"'));
 assert.ok(!index.includes('<script src="js/p38.js'));
 assert.ok(index.includes('js/domains/adminUI.js?v=domain-2'));
 assert.ok(release.includes("APP_VERSION='v1.4.38'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P38_RELEASE')||notifications.includes('releaseP38'));
 assert.ok(notifications.includes('P37_RELEASE')||notifications.includes('releaseP37'));
});
