'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.5.3 is the canonical patch after v1.5.2, v1.5.1, v1.5.0 and P77',()=>{
 const base=read('lib/releaseV15.js'),v151=read('lib/releaseV151.js'),v152=read('lib/releaseV152.js'),hotfix=read('lib/releaseV153.js'),version=read('api/version.js');
 assert.match(base,/APP_VERSION='v1\.5\.0'/);
 assert.match(v151,/APP_VERSION='v1\.5\.1'/);
 assert.match(v152,/APP_VERSION='v1\.5\.2'/);
 assert.match(hotfix,/APP_VERSION='v1\.5\.3'/);
 assert.match(version,/releaseV153/);
 assert.match(version,/V152_VERSION/);
 assert.match(version,/V151_VERSION/);
 assert.match(version,/V15_VERSION/);
 assert.match(version,/P77_VERSION/);
 assert.match(version,/\[P75_VERSION,P76_VERSION,P77_VERSION,V15_VERSION,V151_VERSION,V152_VERSION,APP_VERSION\]/);
});

test('notification center publishes v1.5.3 and preserves v1.5.2 + v1.5.1 + v1.5.0 in release history',()=>{
 const notifications=read('api/notifications.js'),hotfix=read('lib/releaseV153.js');
 assert.match(notifications,/require\('\.\.\/lib\/releaseV153'\)/);
 assert.match(notifications,/V152_RELEASE/);
 assert.match(notifications,/V151_RELEASE/);
 assert.match(notifications,/V15_RELEASE/);
 assert.match(notifications,/P77_RELEASE/);
 assert.match(notifications,/const releases=\[RELEASE,V152_RELEASE,V151_RELEASE,V15_RELEASE,P77_RELEASE/);
 assert.match(hotfix,/refinamento visual de cartas, conta e missões/i);
 assert.match(hotfix,/carteira e o botão Perfil/i);
 assert.match(hotfix,/🧬 Original/);
 assert.match(hotfix,/recompensas das Missões/i);
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

test('original card identity uses one canonical mark in library and card detail',()=>{
 const bridge=read('public/js/canonicalCardBadge.js'),css=read('public/css/cardLibraryPresentationCurrent.css');
 assert.match(bridge,/function decorateCard\(card,source\)/);
 assert.match(bridge,/canonical-original-mark/);
 assert.match(bridge,/🧬 Original/);
 assert.match(bridge,/card\.appendChild\(mark\)/);
 assert.match(bridge,/function installDetailBridge\(\)/);
 assert.match(bridge,/p56-card-preview-host \.p57-detail-game-card/);
 assert.match(bridge,/decorateCard\(preview,card\)/);
 assert.doesNotMatch(bridge,/CARTA ORIGINAL/);
 assert.match(css,/position:absolute/);
 assert.match(css,/rotate\(-13deg\)/);
 assert.match(css,/\.p56-card-preview-host \.p57-detail-game-card\{position:relative!important;overflow:hidden!important/);
 assert.match(css,/\.p56-card-preview-host \.p57-detail-game-card \.canonical-original-mark\{right:18px!important;bottom:54px!important\}/);
});

test('account actions stay centered, contained, inset and separated from wallet',()=>{
 const ui=read('public/js/domains/accountUI.js'),actions=read('public/css/accountActionsCurrent.css'),account=read('public/css/accountCurrent.css');
 assert.match(ui,/p56-account-action-svg/);
 assert.match(ui,/viewBox="0 0 24 24"/);
 assert.doesNotMatch(ui,/>👤</);
 assert.match(actions,/width:clamp\(92px,10\.5vw,132px\)!important/);
 assert.match(actions,/width:40px!important/);
 assert.match(actions,/height:40px!important/);
 assert.match(actions,/max-width:calc\(2 \* 40px \+ 5px\)!important/);
 assert.match(account,/padding-inline:10px!important/);
 assert.match(account,/padding-inline:8px!important/);
 assert.match(account,/max-width:calc\(100% - 95px\)!important/);
 assert.match(account,/flex:0 0 85px!important/);
 assert.match(account,/margin-left:6px!important/);
 assert.match(account,/overflow:hidden!important/);
});

test('mission BUFF reward shares the reward row to the right of XP with lateral breathing room',()=>{
 const css=read('public/css/missionsTwoColumnCurrent.css'),ui=read('public/js/domains/missionsUI.js');
 assert.match(css,/p52-mission-rewards[\s\S]*display:flex!important/);
 assert.match(css,/p10-mission-buff[\s\S]*padding:4px 10px!important/);
 assert.doesNotMatch(css,/p10-mission-buff[^}]*grid-row:2!important/);
 const coin=ui.indexOf('p52-mission-coin-pill');
 const xp=ui.indexOf('mission-xp-pill',coin);
 const buff=ui.indexOf('${rewardBuff(m)}',xp);
 assert.ok(coin>=0&&xp>coin&&buff>xp,'reward order must remain coin → XP → BUFF');
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
