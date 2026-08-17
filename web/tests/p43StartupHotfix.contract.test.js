'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p42.js'),index=read('public/index.html'),release=read('lib/releaseP43.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P43 remove observer global que podia causar cascata na inicialização',()=>{
 assert.doesNotMatch(js,/new MutationObserver/);
 assert.doesNotMatch(js,/observer\.observe\(document\.documentElement/);
 assert.match(js,/patchHomeLifecycle/);
 assert.match(js,/HomeScreen\.renderAccount/);
});

test('Voltar continua sincronizado sem observar o DOM inteiro',()=>{
 assert.match(js,/syncBack/);
 assert.match(js,/#btn-play,#back-play/);
 assert.match(js,/p42-home-back/);
});

test('hotfix força asset novo para escapar do cache quebrado',()=>{
 assert.match(index,/js\/p42\.js\?v=1\.4\.43/);
 assert.doesNotMatch(index,/js\/p42\.js\?v=1\.4\.42/);
});

test('P43 publica versão e preserva P42 na Central',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.43'/);
 assert.match(version,/releaseP43/);
 assert.match(notifications,/releaseP43/);
 assert.match(notifications,/P42_RELEASE/);
});
