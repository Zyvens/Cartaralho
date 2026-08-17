'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p38.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP38.js');

test('P38 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Admin só é permitido quando user_id 1 está na Home real',()=>{
 assert.match(js,/currentScreen==='home'/);
 assert.match(js,/document\.querySelector\('\.home-screen'\)/);
 assert.match(js,/Number\(AuthClient\?\.user\?\.id\)===1/);
 assert.match(js,/if\(!isAdmin\(\)\|\|!isHome\(\)\)\{removeAdmin\(\);return;\}/);
});

test('navegação remove o pill e o modal administrativo fora da Home',()=>{
 assert.match(js,/creator-admin-fab/);
 assert.match(js,/creator-admin-overlay/);
 assert.match(js,/creator-admin-active/);
 assert.match(js,/App\.showScreen=function/);
 assert.match(js,/scheduleEnforcement\(\)/);
});

test('P38 permanece carregado no histórico de camadas',()=>{
 assert.match(js,/VERSION='v1\.4\.38'/);
 assert.match(js,/sessionStorage\.setItem\(`cartaralho_update_notice_\$\{VERSION\}`,'1'\)/);
 assert.match(index,/js\/p38\.js\?v=1\.4\.38/);
 assert.ok(index.indexOf('js/p38.js?v=1.4.38')>index.indexOf('js/p37.js?v=1.4.37'));
});

test('release P38 permanece preservado na Central mesmo quando o endpoint avança',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.38'/);
 assert.match(release,/release:p38/);
 assert.match(version,/releaseP\d+/);
 assert.match(notifications,/releaseP38/);
 assert.match(notifications,/releaseP37/);
 assert.match(notifications,/P38_RELEASE/);
 assert.match(notifications,/P37_RELEASE/);
});
