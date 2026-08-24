'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const accountCss=read('public/css/accountIdentityAlignmentCurrent.css');
const noticesCss=read('public/css/notificationsSummaryCurrent.css');
const shim=read('public/css/p51.css');
const history=read('public/js/p51.js');
const notices=read('public/js/domains/notificationsUI.js');
const missions=read('public/js/domains/missionsUI.js');
const index=read('public/index.html');
const release=read('lib/releaseP51.js');
const version=read('api/version.js');
const notifications=read('api/notifications.js');

test('alinhamento da identidade e resumo da Central vivem em owners visuais canônicos',()=>{
 assert.ok(accountCss.includes('home-account-identity'));
 assert.ok(accountCss.includes('text-align:left!important'));
 assert.ok(noticesCss.includes('notifications-spoiler-heading'));
 assert.ok(noticesCss.includes('white-space:nowrap!important'));
 assert.ok(noticesCss.includes('notifications-spoiler-meta'));
 assert.ok(shim.includes('accountIdentityAlignmentCurrent.css'));
 assert.ok(shim.includes('notificationsSummaryCurrent.css'));
});

test('pill P51 de Missões foi supersedida pelo contrato P52',()=>{
 assert.ok(missions.includes('p52-mission-coin-pill'));
 assert.ok(missions.includes('mission-xp-pill'));
 assert.ok(!missions.includes('p51-mission-coin-pill'));
 assert.ok(!shim.includes('p51-mission-coin-pill'));
});

test('notificationsUI preserva a pill de novidade antes do título',()=>{
 assert.ok(notices.includes("pill.className='notifications-section-new'"));
 assert.ok(notices.includes("summary.insertBefore(pill,summary.querySelector('.notifications-spoiler-heading'))"));
 assert.ok(notices.includes('normalize()'));
});

test('P51 é histórico não executável, shim visual, e P75 permanece corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p51.css?v=1.4.51'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p51.js?v=1.4.51"'));
 assert.ok(!index.includes('<script src="js/p51.js'));
 assert.ok(shim.startsWith('/* COMPAT P51'));
 assert.ok(release.includes("APP_VERSION='v1.4.51'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P51_RELEASE'));
 assert.ok(notifications.includes('P50_RELEASE'));
});
