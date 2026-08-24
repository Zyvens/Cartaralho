'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p33.js'),shim=read('public/css/p33.css'),specialCss=read('public/css/cosmeticSpecialFramesCurrent.css'),rankCss=read('public/css/rankIdentityCurrent.css'),wingsCss=read('public/css/cosmeticWingsCurrent.css'),topNav=read('public/css/topNavigationCurrent.css'),rank=read('public/js/domains/rankUI.js'),cosmetics=read('public/js/domains/cosmeticsUI.js'),rankApi=read('api/profile/rank.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP33.js');

test('navegação de criação P33 foi supersedida pelos owners posteriores',()=>{
 assert.ok(!shim.includes('.create-room-screen'));
 assert.ok(!specialCss.includes('.create-room-screen'));
 assert.ok(!rankCss.includes('.create-room-screen'));
 assert.ok(topNav.includes('button.back-button'));
 assert.ok(topNav.includes('position:fixed!important'));
 assert.ok(topNav.includes('left:12px!important'));
});

test('Asas P33 foram supersedidas pela geometria final P36',()=>{
 assert.ok(!shim.includes('frame-cosmetic-asas'));
 assert.ok(!specialCss.includes('frame-cosmetic-asas'));
 assert.ok(wingsCss.includes('.avatar-frame.frame-cosmetic-asas'));
 assert.ok(wingsCss.includes('bottom:-10px!important'));
 assert.ok(wingsCss.includes('transform:scaleX(-1) rotate(45deg)!important'));
});

test('Fita Isolante Premium mantém identidade zebrada em owner cosmético próprio',()=>{
 assert.ok(specialCss.includes('.avatar-frame.frame-cosmetic-fita-isolante'));
 assert.ok(specialCss.includes('repeating-linear-gradient(135deg,#facc15 0 12px,#111214 12px 24px)!important'));
 assert.ok(shim.includes('cosmeticSpecialFramesCurrent.css'));
 assert.doesNotThrow(()=>new Function(cosmetics));
 assert.ok(cosmetics.includes('frame-${m.esc(equip)}'));
});

test('Cintilante anima o hue da foto e respeita reduced-motion',()=>{
 assert.ok(specialCss.includes('@property --p33-cintilante-hue'));
 assert.ok(specialCss.includes('filter:saturate(1.5) hue-rotate(var(--p33-cintilante-hue))!important'));
 assert.ok(specialCss.includes('animation:p33CintilantePhotoRGB 5.4s linear infinite!important'));
 assert.ok(specialCss.includes('@keyframes p33CintilantePhotoRGB'));
 assert.ok(specialCss.includes('@media(prefers-reduced-motion:reduce)'));
});

test('Rank renderiza moldura e título equipados pelo owner atual e CSS dedicado',()=>{
 assert.doesNotThrow(()=>new Function(rank));
 assert.ok(rank.includes('row.equipped_frame_key'));
 assert.ok(rank.includes('row.equipped_title_key'));
 assert.ok(rank.includes("classList.add('rank-avatar-frame')"));
 assert.ok(rank.includes("title.className='rank-equipped-title equipped-title public-equipped-title'"));
 assert.ok(rankCss.includes('.rank-player>.rank-avatar-frame'));
 assert.ok(rankCss.includes('.rank-equipped-title'));
 assert.ok(shim.includes('rankIdentityCurrent.css'));
 assert.ok(rankApi.includes('u.equipped_title_key,u.equipped_frame_key'));
});

test('P33 é histórico não executável, shim visual, e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p33.css?v=1.4.33'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p33.js?v=1.4.33"'));
 assert.ok(!index.includes('<script src="js/p33.js'));
 assert.ok(shim.startsWith('/* COMPAT P33'));
 assert.ok(release.includes("APP_VERSION='v1.4.33'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P33_RELEASE')||notifications.includes('releaseP33'));
});
