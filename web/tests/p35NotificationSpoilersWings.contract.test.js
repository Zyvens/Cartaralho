'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p35.js'),shim=read('public/css/p35.css'),spoilerCss=read('public/css/notificationsSpoilerCurrent.css'),wingsCss=read('public/css/cosmeticWingsCurrent.css'),notificationsUI=read('public/js/domains/notificationsUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP35.js');

test('Central transforma Atualizações e Prêmios em spoilers pelo owner notificationsUI',()=>{
 assert.doesNotThrow(()=>new Function(notificationsUI));
 assert.ok(notificationsUI.includes("document.createElement('details')"));
 assert.ok(notificationsUI.includes("details.className='notifications-spoiler'"));
 assert.ok(notificationsUI.includes("document.createElement('summary')"));
 assert.ok(notificationsUI.includes("summary.className='notifications-spoiler-summary'"));
 assert.ok(notificationsUI.includes("details.dataset.section=index===0?'updates':'rewards'"));
});

test('aparência-base dos spoilers vive em owner visual canônico',()=>{
 assert.ok(spoilerCss.includes('.notifications-spoiler-summary'));
 assert.ok(spoilerCss.includes('.notifications-spoiler-meta small'));
 assert.ok(spoilerCss.includes('.notifications-spoiler-chevron'));
 assert.ok(spoilerCss.includes('.notifications-spoiler[open] .notifications-spoiler-chevron'));
 assert.ok(spoilerCss.includes('.notifications-spoiler-content{padding:12px!important}'));
 assert.ok(shim.includes('notificationsSpoilerCurrent.css'));
});

test('transformações de Asas P35 foram supersedidas pela geometria final P36',()=>{
 assert.ok(!shim.includes('frame-cosmetic-asas'));
 assert.ok(!spoilerCss.includes('frame-cosmetic-asas'));
 assert.ok(wingsCss.includes('bottom:-10px!important'));
 assert.ok(wingsCss.includes('transform:scaleX(-1) rotate(45deg)!important'));
 assert.ok(wingsCss.includes('transform:rotate(45deg)!important'));
 assert.ok(!wingsCss.includes('translateY(-50%)'));
});

test('P35 é histórico não executável, shim visual, e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p35.css?v=1.4.35'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p35.js?v=1.4.35"'));
 assert.ok(!index.includes('<script src="js/p35.js'));
 assert.ok(shim.startsWith('/* COMPAT P35'));
 assert.ok(release.includes("APP_VERSION='v1.4.35'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P35_RELEASE')||notifications.includes('releaseP35'));
});
