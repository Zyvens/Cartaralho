'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const auth=read('public/js/auth.js'),home=read('public/js/screens/home.js'),socket=read('public/js/socket.js'),p74=read('public/js/p74.js'),index=read('public/index.html'),release=read('lib/releaseP77.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owners reais da aplicação são bindings lexicais e não propriedades obrigatórias de window',()=>{
 assert.match(auth,/const AuthClient=/);
 assert.match(home,/const HomeScreen=/);
 assert.match(socket,/const SocketClient=/);
});

test('owner da carteira resolve AuthClient HomeScreen e SocketClient pelo binding lexical',()=>{
 assert.doesNotThrow(()=>new Function(p74));
 assert.match(p74,/typeof AuthClient!==['"]undefined['"]\?AuthClient:window\.AuthClient/);
 assert.match(p74,/typeof HomeScreen!==['"]undefined['"]\?HomeScreen:window\.HomeScreen/);
 assert.match(p74,/typeof SocketClient!==['"]undefined['"]\?SocketClient:window\.SocketClient/);
 assert.doesNotMatch(p74,/window\.AuthClient\?\.user/);
 assert.doesNotMatch(p74,/if\(!window\.HomeScreen/);
 assert.doesNotMatch(p74,/if\(realtimeBound\|\|!window\.SocketClient/);
});

test('carteira continua autônoma de ProfessionalUI para existir e recuperar rerenders',()=>{
 assert.match(p74,/function ensureBalance\(/);
 assert.match(p74,/function observeAccount\(/);
 assert.match(p74,/new MutationObserver/);
 assert.match(p74,/function patchHome\(/);
 assert.match(p74,/home\.renderAccount=function/);
});

test('P77 é publicado com cache bust e preserva P76 no histórico',()=>{
 assert.match(p74,/VERSION='v1\.4\.77'/);
 assert.match(release,/APP_VERSION='v1\.4\.77'/);
 assert.match(version,/releaseP77/);
 assert.match(notifications,/P76_RELEASE/);
 assert.ok(index.includes('css/p74.css?v=1.4.77'));
 assert.ok(index.includes('js/p74.js?v=1.4.77'));
});
