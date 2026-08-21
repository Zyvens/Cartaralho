'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p34.js'),css=read('public/css/p34.css'),rank=read('public/js/domains/rankUI.js'),rankApi=read('api/profile/rank.js'),topNav=read('public/css/topNavigationCurrent.css'),wings=read('public/css/cosmeticWingsCurrent.css'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP34.js');

test('navegação P34 foi supersedida pelo owner superior atual',()=>{
 assert.ok(css.startsWith('/* HISTORICAL P34'));
 assert.ok(!css.includes('.create-room-screen>.back-button{'));
 assert.ok(topNav.includes('button.back-button'));
 assert.ok(topNav.includes('position:fixed!important'));
 assert.ok(topNav.includes('left:12px!important'));
 assert.ok(topNav.includes('height:40px!important'));
});

test('Asas P34 foram supersedidas pela geometria final P36',()=>{
 assert.ok(!css.includes('frame-cosmetic-asas'));
 assert.ok(wings.includes('bottom:-10px!important'));
 assert.ok(wings.includes('z-index:40!important'));
 assert.ok(wings.includes('transform:scaleX(-1) rotate(45deg)!important'));
 assert.ok(wings.includes('transform:rotate(45deg)!important'));
 assert.ok(!wings.includes('translateY(-50%)'));
});

test('Rank usa owner canônico e dados públicos de título/moldura',()=>{
 assert.doesNotThrow(()=>new Function(rank));
 assert.ok(rank.includes('row.equipped_frame_key'));
 assert.ok(rank.includes('row.equipped_title_key'));
 assert.ok(rank.includes("classList.add('rank-avatar-frame')"));
 assert.ok(rank.includes("title.className='rank-equipped-title equipped-title public-equipped-title'"));
 assert.ok(rank.includes('MetaUI.renderRank=render'));
 assert.ok(rankApi.includes('u.equipped_title_key,u.equipped_frame_key'));
});

test('P34 é histórico não executável e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p34.css?v=1.4.34'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p34.js?v=1.4.34"'));
 assert.ok(!index.includes('<script src="js/p34.js'));
 assert.ok(release.includes("APP_VERSION='v1.4.34'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P34_RELEASE')||notifications.includes('releaseP34'));
});
