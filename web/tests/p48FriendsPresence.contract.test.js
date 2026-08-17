'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const friendsUI=read('public/js/p48Friends.js'),friendsCss=read('public/css/p48Friends.css'),friendsApi=read('api/social/friends.js'),presenceApi=read('api/social/presence.js'),presenceLib=read('lib/presence.js'),ui=read('public/js/uiP25.js'),index=read('public/index.html');

test('Amigos de Merda exibe quantidade online no botão e status individual',()=>{
 assert.doesNotThrow(()=>new Function(friendsUI));
 assert.match(friendsUI,/p48-friends-online-pill/);
 assert.match(friendsUI,/onlineCount/);
 assert.match(friendsUI,/p48-presence-dot/);
 assert.match(friendsUI,/Online':'Offline/);
 assert.match(friendsCss,/\.p48-presence-dot\.online\{background:#22c55e\}/);
 assert.match(friendsCss,/\.p48-presence-dot\.offline\{background:#71717a\}/);
});

test('presença é autenticada, persistida e expira em dois minutos',()=>{
 assert.match(presenceApi,/requireUser/);
 assert.match(presenceApi,/presence\.heartbeat/);
 assert.match(presenceLib,/ONLINE_WINDOW_SECONDS:120/);
 assert.match(presenceLib,/user_presence/);
 assert.match(friendsApi,/LEFT JOIN user_presence/);
 assert.match(friendsApi,/onlineCount:friends\.filter\(x=>x\.online\)\.length/);
});

test('heartbeat é leve e renovado por minuto quando o app está ativo',()=>{
 assert.match(friendsUI,/setInterval\(\(\)=>\{this\.beat\(\);this\.updateHomePill\(true\);\},60000\)/);
 assert.match(friendsUI,/visibilitychange/);
 assert.match(friendsUI,/window\.addEventListener\('focus'/);
});

test('menu mantém Mercado no topo e prioriza Amigos antes de Notificações',()=>{
 const market=ui.indexOf("'#marketplace-menu-btn'"),friends=ui.indexOf("'#friends-menu-btn'"),notifications=ui.indexOf("'#notifications-menu-btn'");
 assert.ok(market>=0&&market<friends&&friends<notifications);
});

test('assets de presença carregam no final do P48',()=>{
 assert.match(index,/css\/p48Friends\.css\?v=1\.4\.48/);
 assert.match(index,/js\/p48Friends\.js\?v=1\.4\.48/);
 assert.ok(index.indexOf('js/p48Friends.js?v=1.4.48')>index.indexOf('js/p48.js?v=1.4.48'));
});
