'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/p40.css'),js=read('public/js/p40.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP40.js');

test('P40 JS compila',()=>assert.doesNotThrow(()=>new Function(js)));

test('Home mostra identidade completa com moldura e título usando AuthClient real',()=>{
 assert.match(js,/equipped_frame_key/);
 assert.match(js,/equipped_title_key/);
 assert.match(js,/IdentityUI\?\.wrapExisting/);
 assert.match(js,/account-equipped-title/);
 assert.match(js,/typeof AuthClient/);
 assert.ok(!js.includes('window.AuthClient?.user'));
});

test('saldo, Perfil e Sair usam a mesma altura compacta sem achatar o número',()=>{
 assert.match(css,/\.home-account-bar \.home-account-balance/);
 assert.match(css,/\.home-account-bar #profile-shortcut/);
 assert.match(css,/\.home-account-bar #logout-btn/);
 assert.match(css,/height:48px!important/);
 assert.match(css,/font:900 1\.2rem\/1/);
 assert.match(js,/home-account-balance/);
});

test('seletores de título e moldura recebem cor da raridade',()=>{
 ['common','rare','superrare','epic','legendary','celestial'].forEach(r=>assert.match(css,new RegExp(`data-rarity='${r}'`)));
 assert.match(js,/colorAppearanceSelectors/);
 assert.match(js,/option\.dataset\.rarity=rarity/);
 assert.match(js,/select\.dataset\.rarity/);
 assert.match(js,/COLORS\[rarity\]/);
});

test('Foto e aparência básica nunca mostra a moldura equipada',()=>{
 assert.match(js,/avatar\(this\.draftAvatar,116,null\)/);
 assert.match(js,/keepBasicPhotoPlain/);
 assert.match(js,/frameClasses\(node\).*classList\.remove/);
 assert.match(css,/profile-modal-avatar-editor-card #profile-modal-avatar-preview/);
 assert.match(css,/::before,[\s\S]*::after\{display:none!important\}/);
});

test('P40 permanece publicado e preservado após releases futuros',()=>{
 assert.match(release,/APP_VERSION='v1\.4\.40'/);
 assert.match(release,/release:p40/);
 assert.match(version,/APP_VERSION/);
 assert.match(notifications,/P40_RELEASE|releaseP40/);
 assert.match(notifications,/data\.currentVersion=APP_VERSION/);
});

test('P40 permanece carregado com cache-busting próprio',()=>{
 assert.match(index,/css\/p40\.css\?v=1\.4\.40/);
 assert.match(index,/js\/p40\.js\?v=1\.4\.40/);
 assert.ok(index.indexOf('css/p40.css?v=1.4.40')>index.indexOf('css/p39.css?v=1.4.39'));
 assert.ok(index.indexOf('js/p40.js?v=1.4.40')>index.indexOf('js/p39.js?v=1.4.39'));
});
