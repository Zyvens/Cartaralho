'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.5 is the canonical release after P77',()=>{
 const release=read('lib/releaseV15.js'),version=read('api/version.js');
 assert.match(release,/APP_VERSION='v1\.5\.0'/);
 assert.match(version,/releaseV15/);
 assert.match(version,/P77_VERSION/);
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
 assert.match(room,/grid-template-areas:'config summary' 'config estimate' 'config howto'/);
 assert.match(room,/gap:14px!important/);
 assert.match(room,/dashboard-config-card\{grid-area:config!important;height:auto!important;align-self:start!important/);
 assert.match(room,/create-room-submit/);
 assert.match(room,/margin:18px auto 0!important/);
 assert.match(room,/create-room-screen>h2\{margin-top:calc\(env\(safe-area-inset-top,0px\) \+ 72px\)/);
 assert.match(room,/create-room-subtitle\{[^}]*margin-bottom:26px!important/);
});

test('create-room owner keeps summary and estimate open while Como Jogar starts collapsed',()=>{
 const room=read('public/js/domains/roomUI.js');
 assert.match(room,/setCreateAccordionDefaults/);
 assert.match(room,/summary\.open=true/);
 assert.match(room,/estimate\.open=true/);
 assert.match(room,/how&&collapseHow\)how\.open=false/);
 assert.match(room,/setCreateAccordionDefaults\(\{collapseHow:false\}\)/);
});

test('room share uses the entire card as copy control and never truncates the mobile URL',()=>{
 const share=read('public/js/domains/roomShareUI.js'),css=read('public/css/roomShareCurrent.css'),summary=read('public/css/roomSummaryCurrent.css');
 assert.match(share,/document\.createElement\('button'\)/);
 assert.match(share,/room-share-copy-hint/);
 assert.match(share,/clique para copiar/);
 assert.match(share,/copyRoomLink\(url\)/);
 assert.doesNotMatch(share,/copy-room-link/);
 assert.doesNotMatch(share,/>Copiar</);
 assert.match(css,/white-space:nowrap!important/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/text-overflow:clip!important/);
 assert.doesNotMatch(css,/text-overflow:ellipsis/);
 assert.match(summary,/@import url\('roomShareCurrent\.css'\)/);
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
