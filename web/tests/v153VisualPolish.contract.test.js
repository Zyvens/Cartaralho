'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('v1.5.3 keeps wallet and Perfil visually separated without undoing mobile containment',()=>{
 const account=read('public/css/accountCurrent.css');
 const actions=read('public/css/accountActionsCurrent.css');
 assert.match(account,/p56-account-actions\{[\s\S]*margin-left:2px!important/);
 assert.match(actions,/@media\(min-width:621px\)[\s\S]*p56-account-actions\{padding-left:12px/);
 assert.match(account,/@media\(max-width:620px\)[\s\S]*p56-account-actions\{[\s\S]*margin-left:6px!important/);
 assert.match(account,/max-width:calc\(100% - 95px\)!important/);
 assert.match(account,/padding-inline:10px!important/);
});

test('v1.5.3 gives the Original marker dedicated clearance in card detail',()=>{
 const css=read('public/css/cardLibraryPresentationCurrent.css');
 assert.match(css,/p56-card-preview-host \.p57-detail-game-card \.canonical-original-mark\{right:18px!important;bottom:54px!important\}/);
 assert.match(css,/@media\(max-width:620px\)[\s\S]*p56-card-preview-host \.p57-detail-game-card \.canonical-original-mark\{right:12px!important;bottom:46px!important\}/);
});

test('v1.5.3 keeps mission coin XP and BUFF rewards on one row with BUFF padding',()=>{
 const css=read('public/css/missionsTwoColumnCurrent.css');
 assert.match(css,/p52-mission-rewards[\s\S]*display:flex!important/);
 assert.match(css,/p10-mission-buff[\s\S]*padding:4px 10px!important/);
 assert.doesNotMatch(css,/p10-mission-buff[^}]*grid-row:2!important/);
 const ui=read('public/js/domains/missionsUI.js');
 const rewards=ui.indexOf('p52-mission-coin-pill');
 const xp=ui.indexOf('mission-xp-pill',rewards);
 const buff=ui.indexOf('${rewardBuff(m)}',xp);
 assert.ok(rewards>=0&&xp>rewards&&buff>xp,'reward order must remain coin → XP → BUFF');
});

test('v1.5.3 is the current API and notification-center release while preserving lineage',()=>{
 const release=read('lib/releaseV153.js');
 const version=read('api/version.js');
 const notifications=read('api/notifications.js');
 assert.match(release,/APP_VERSION='v1\.5\.3'/);
 assert.match(version,/require\('\.\.\/lib\/releaseV153'\)/);
 assert.match(version,/V152_VERSION/);
 assert.match(notifications,/require\('\.\.\/lib\/releaseV153'\)/);
 assert.match(notifications,/V152_RELEASE/);
 assert.match(notifications,/const releases=\[RELEASE,V152_RELEASE,V151_RELEASE,V15_RELEASE/);
});

test('v1.5.3 focused browser acceptance remains part of CI',()=>{
 const workflow=fs.readFileSync(path.join(__dirname,'..','..','.github/workflows/web-tests.yml'),'utf8');
 assert.match(workflow,/Run v1\.5\.3 focused visual acceptance/);
 assert.match(workflow,/node web\/tests\/v153VisualAcceptance\.js/);
});
