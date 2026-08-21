'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p74.js'),css=read('public/css/p74.css'),index=read('public/index.html'),release=read('lib/releaseP74.js'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('P74 compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('mostrador fica como filho direto da tag principal da conta e antes das ações',()=>{
 assert.match(js,/querySelector\(':scope > \.account-strip'\)/);
 assert.match(js,/root\.insertBefore\(slot,actions\|\|null\)/);
 assert.match(js,/p74-wallet-slot/);
 assert.match(css,/#home-account>\.account-strip\.p74-account-strip>\.p74-wallet-slot/);
 assert.match(css,/flex-wrap:nowrap!important/);
 assert.match(css,/position:static!important/);
});

test('saldo nasce do usuário autenticado e a reconciliação usa a carteira leve',()=>{
 assert.match(js,/AuthClient\?\.user/);
 assert.match(js,/dirty_balance/);
 assert.match(js,/CartP64\?\.refreshBalance/);
 assert.match(js,/CartP63\?\.fetchAuthoritativeBalance/);
 assert.match(js,/CartP61\?\.syncDirtyBalance/);
 assert.match(js,/\/api\/profile\/wallet\?_fresh=/);
 assert.doesNotMatch(js,/AuthClient\.request\('\/api\/marketplace'\)/);
 assert.match(js,/cartaralho:balance-updated/);
});

test('render da Home só posiciona o saldo e não dispara nova consulta concorrente',()=>{
 const patch=js.match(/function patchHome\(\)[\s\S]*?function patchProfessionalUI/);assert.ok(patch);
 assert.match(patch[0],/ensureBalance\(\)/);
 assert.doesNotMatch(patch[0],/scheduleAuthoritative|syncAuthoritative/);
});

test('recompensa administrativa atualiza e confirma o saldo real',()=>{
 assert.match(js,/channel\.bind\('admin_megaphone'/);
 assert.match(js,/data\.kind!==['"]reward['"]/);
 assert.match(js,/p74-admin-reward/);
 assert.match(js,/p74-admin-reward-confirm/);
 assert.match(js,/targetUserIds/);
});

test('P74 continua histórico e é carregado após P73 com cache novo',()=>{
 assert.ok(index.indexOf('css/p74.css?v=1.4.74')>index.indexOf('css/p73.css?v=1.4.73'));
 assert.ok(index.indexOf('js/p74.js?v=1.4.75')>index.indexOf('js/p73.js?v=1.4.73'));
 assert.match(release,/APP_VERSION='v1\.4\.74'/);
 assert.match(version,/releaseP75/);
 assert.match(notifications,/releaseP74/);
 assert.match(notifications,/P73_RELEASE/);
});
