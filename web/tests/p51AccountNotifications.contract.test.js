'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p51.css');
const history=read('public/js/p51.js');
const notices=read('public/js/domains/notificationsUI.js');
const missions=read('public/js/domains/missionsUI.js');
const index=read('public/index.html');
const release=read('lib/releaseP51.js');
const version=read('api/version.js');
const notifications=read('api/notifications.js');

test('P51 preserva identidade e layout compacto da Central',()=>{
 assert.ok(css.includes('home-account-identity'));
 assert.ok(css.includes('notifications-spoiler-heading'));
 assert.ok(css.includes('white-space:nowrap!important'));
 assert.ok(css.includes('notifications-spoiler-meta'));
});

test('notificationsUI preserva a pill de novidade antes do título',()=>{
 assert.ok(notices.includes("pill.className='notifications-section-new'"));
 assert.ok(notices.includes("summary.insertBefore(pill,summary.querySelector('.notifications-spoiler-heading'))"));
 assert.ok(notices.includes('normalize()'));
});

test('missionsUI preserva recompensa em Moedas Sujas e XP',()=>{
 assert.ok(missions.includes('m?.coins'));
 assert.ok(missions.includes('p52-mission-coin-pill'));
 assert.ok(missions.includes('mission-xp-pill'));
});

test('P51 é histórico não executável e permanece no histórico da release',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p51.css?v=1.4.51'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p51.js?v=1.4.51"'));
 assert.ok(!index.includes('<script src="js/p51.js'));
 assert.ok(release.includes("APP_VERSION='v1.4.51'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P51_RELEASE'));
 assert.ok(notifications.includes('P50_RELEASE'));
});
