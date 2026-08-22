'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const auth=read('public/js/auth.js'),home=read('public/js/screens/home.js'),socket=read('public/js/socket.js'),p49=read('public/js/p49.js'),p63=read('public/js/p63.js'),p65=read('public/js/p65.js'),p73=read('public/js/p73.js'),p74=read('public/js/p74.js'),index=read('public/index.html'),release=read('lib/releaseP77.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('owners reais da aplicação são bindings lexicais e não propriedades obrigatórias de window',()=>{
 assert.match(auth,/const AuthClient=/);
 assert.match(home,/const HomeScreen=/);
 assert.match(socket,/const SocketClient=/);
});

test('P49 e P65 instalam o primeiro paint sobre o HomeScreen lexical',()=>{
 assert.match(p49,/if\(typeof HomeScreen!==['"]undefined['"]&&!HomeScreen\.__p49AccountHydration\)/);
 assert.doesNotMatch(p49,/if\(window\.HomeScreen/);
 assert.match(p49,/const raw=AuthClient\?\.user\?\.dirty_balance/);
 assert.match(p49,/HomeScreen\.renderAccount=function/);
 assert.match(p65,/if\(typeof HomeScreen===['"]undefined['"]\|\|HomeScreen\.__p65ImmediateWallet\)return/);
 assert.doesNotMatch(p65,/if\(!window\.HomeScreen/);
 assert.match(p65,/HomeScreen\.renderAccount=function/);
});

test('P63 intercepta respostas transacionais usando AuthClient lexical',()=>{
 assert.match(p63,/if\(typeof AuthClient===['"]undefined['"]\|\|AuthClient\.__p63BalanceResponses\)return/);
 assert.doesNotMatch(p63,/if\(!window\.AuthClient/);
 assert.match(p63,/channel\.bind\('balance_updated'/);
 assert.match(p63,/\/api\/profile\/wallet\?_fresh=/);
});

test('P73 e P74 resolvem owners lexicais e não dependem de window para a Home autenticada',()=>{
 for(const js of [p73,p74]){
  assert.match(js,/typeof AuthClient!==['"]undefined['"]\?AuthClient:window\.AuthClient/);
  assert.match(js,/typeof HomeScreen!==['"]undefined['"]\?HomeScreen:window\.HomeScreen/);
  assert.doesNotMatch(js,/window\.AuthClient\?\.user/);
  assert.doesNotMatch(js,/if\(!window\.HomeScreen/);
 }
 assert.match(p74,/typeof SocketClient!==['"]undefined['"]\?SocketClient:window\.SocketClient/);
 assert.doesNotMatch(p74,/if\(realtimeBound\|\|!window\.SocketClient/);
});

test('carteira nasce no render inicial e continua autônoma de ProfessionalUI',()=>{
 assert.doesNotThrow(()=>new Function(p74));
 assert.match(p74,/function ensureBalance\(/);
 assert.match(p74,/function observeAccount\(/);
 assert.match(p74,/new MutationObserver/);
 assert.match(p74,/function patchHome\(/);
 assert.match(p74,/home\.renderAccount=function/);
 assert.match(p74,/ensureBalance\(\);queueMicrotask\(\(\)=>ensureBalance\(\)\);requestAnimationFrame\(\(\)=>ensureBalance\(\)\)/);
});

test('Megafone e balance_updated atualizam imediatamente e depois confirmam pela carteira leve',()=>{
 assert.match(p74,/channel\.bind\('balance_updated',onBalanceRealtime\)/);
 assert.match(p74,/channel\.bind\('admin_megaphone',onAdminMegaphone\)/);
 assert.match(p74,/if\(data\.kind!==['"]reward['"]/);
 assert.match(p74,/ensureBalance\(exact\)/);
 assert.match(p74,/scheduleAuthoritative\('p74-admin-reward',0\)/);
 assert.match(p74,/\/api\/profile\/wallet\?_fresh=/);
});

test('P77 publica cache-bust de todos os owners reabertos e preserva P76 no histórico',()=>{
 assert.match(p74,/VERSION='v1\.4\.77'/);
 assert.match(release,/APP_VERSION='v1\.4\.77'/);
 assert.match(version,/releaseP77/);
 assert.match(notifications,/P76_RELEASE/);
 for(const asset of ['js/p49.js','js/p63.js','js/p65.js','js/p73.js','js/p74.js'])assert.ok(index.includes(`${asset}?v=1.4.77`),asset);
 assert.ok(index.includes('css/p74.css?v=1.4.77'));
});
