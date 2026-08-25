'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.5.1 is the canonical hotfix after v1.5.0 and P77',()=>{
 const base=read('lib/releaseV15.js'),hotfix=read('lib/releaseV151.js'),version=read('api/version.js');
 assert.match(base,/APP_VERSION='v1\.5\.0'/);
 assert.match(hotfix,/APP_VERSION='v1\.5\.1'/);
 assert.match(version,/releaseV151/);
 assert.match(version,/V15_VERSION/);
 assert.match(version,/P77_VERSION/);
 assert.match(version,/\[P75_VERSION,P76_VERSION,P77_VERSION,V15_VERSION,APP_VERSION\]/);
});

test('notification center publishes v1.5.1 and preserves v1.5.0 in release history',()=>{
 const notifications=read('api/notifications.js'),hotfix=read('lib/releaseV151.js');
 assert.match(notifications,/require\('\.\.\/lib\/releaseV151'\)/);
 assert.match(notifications,/V15_RELEASE/);
 assert.match(notifications,/P77_RELEASE/);
 assert.match(notifications,/const releases=\[RELEASE,V15_RELEASE,P77_RELEASE/);
 assert.match(hotfix,/hotfix de interface e configuração de mesa/i);
 assert.match(hotfix,/Link da sala/i);
 assert.match(hotfix,/Perfil e Sair/i);
});

test('appearance is transactional and selected inside titles/frames, not Profile selectors',()=>{
 const profile=read('public/js/domains/profileUI.js');
 assert.doesNotMatch(profile,/data-profile-draft-title/);
 assert.doesNotMatch(profile,/data-profile-draft-frame/);
 assert.match(profile,/EXPERIMENTANDO/);
 assert.match(profile,/_appearanceSaved/);
 assert.match(profile,/data\.previewTitle/);
 assert.match(profile,/data\.previewFrame/);
 assert.match(profile,/btn\.remove\(\)/);
 assert.match(profile,/P\.close=function\(\)\{this\._appearanceSaved=null/);
});

test('original card identity is an internal discreet mark',()=>{
 const bridge=read('public/js/canonicalCardBadge.js'),css=read('public/css/cardLibraryPresentationCurrent.css');
 assert.match(bridge,/canonical-original-mark/);
 assert.match(bridge,/🧬 Original/);
 assert.match(bridge,/card\.appendChild\(mark\)/);
 assert.doesNotMatch(bridge,/CARTA ORIGINAL/);
 assert.match(css,/position:absolute/);
 assert.match(css,/rotate\(-13deg\)/);
});

test('desktop account actions can shrink instead of clipping',()=>{
 const actions=read('public/css/accountActionsCurrent.css'),account=read('public/css/accountCurrent.css');
 assert.match(actions,/flex:0 1 auto/);
 assert.match(actions,/width:clamp\(/);
 assert.match(account,/min-width:0!important/);
 assert.match(account,/flex:0 1 auto!important/);
});

test('mission BUFF reward occupies its own second reward row',()=>{
 const css=read('public/css/missionsTwoColumnCurrent.css');
 assert.match(css,/grid-template-columns:auto auto/);
 assert.match(css,/p10-mission-buff/);
 assert.match(css,/grid-row:2!important/);
});

test('BUFF rarity is separated to the upper-right',()=>{
 const css=read('public/css/buffRarityCurrent.css');
 assert.match(css,/justify-content:space-between/);
 assert.match(css,/margin:1px 0 0 auto/);
});

test('card detail and room setup owners encode the compact v1.5 layout',()=>{
 const detail=read('public/css/cardDetailCurrent.css'),room=read('public/css/roomSetupDashboardCurrent.css');
 assert.match(detail,/justify-content:center/);
 assert.match(detail,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(room,/gap:14px!important/);
 assert.match(room,/create-room-submit/);
 assert.match(room,/margin:18px auto 0!important/);
});

test('shared CI never runs database-writing browser E2E',()=>{
 const web=read('../.github/workflows/web-tests.yml'),visual=read('../.github/workflows/visual-smoke.yml');
 assert.doesNotMatch(web,/realMultiplayerPreview/);
 assert.doesNotMatch(visual,/realMultiplayerPreview/);
 assert.doesNotMatch(web,/api\/auth\/register/);
 assert.doesNotMatch(visual,/api\/auth\/register/);
 assert.match(web,/127\.0\.0\.1:4173/);
 assert.match(visual,/127\.0\.0\.1:4173/);
});

test('reserved QA accounts require an explicitly isolated server environment',()=>{
 const register=read('api/auth/register.js');
 assert.match(register,/\^qa_\(host\|player\|third\)_/);
 assert.match(register,/CARTARALHO_ALLOW_QA_ACCOUNTS/);
 assert.match(register,/ambientes de teste isolados/);
});
