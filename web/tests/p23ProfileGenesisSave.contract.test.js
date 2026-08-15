'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const revision=read('public/js/revisionConsolidated.js'),appearance=read('public/js/profileAppearanceP19.js'),settings=read('api/profile/settings.js'),css=read('public/css/p23.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

for(const[name,src]of[['revisionConsolidated.js',revision],['profileAppearanceP19.js',appearance],['settings.js',settings]])test(`${name} compila no P23`,()=>assert.doesNotThrow(()=>new Function(src)));

test('normalização do Perfil preserva Gênese e demais cosméticos em vez de filtrar só progressão',()=>{
 assert.doesNotMatch(revision,/pm\.data\.frames=pm\.data\.frames\.filter/);
 assert.doesNotMatch(revision,/equipped\.frameKey=null/);
 assert.match(revision,/if\(!baseFrameKeys\.includes\(f\.key\)\)return/);
 assert.match(revision,/cosméticos e entitlements/);
});

test('selecionar título ou moldura atualiza a prévia sem rerenderizar o modal inteiro',()=>{
 assert.match(appearance,/_syncAppearanceDom/);
 assert.match(appearance,/_setAvatarFrameClass/);
 assert.match(appearance,/this\._syncAppearanceDom\(\)/);
 assert.match(appearance,/data-profile-draft-frame[^\n]*addEventListener\('change',e=>this\._setAppearanceDraft\('frame'/);
 assert.match(appearance,/data-profile-draft-title[^\n]*addEventListener\('change',e=>this\._setAppearanceDraft\('title'/);
 assert.doesNotMatch(appearance,/data-profile-draft-frame[^\n]*_refreshCurrentTab/);
});

test('Gênese usa a mesma classe visual imediatamente na prévia',()=>{
 assert.match(appearance,/node\.classList\.add\(`frame-\$\{key\}`\)/);
 assert.match(css,/avatar-frame\.frame-genese-celestial/);
 assert.match(css,/filter:none!important/);
});

test('Perfil possui apenas o Salvar alterações global',()=>{
 assert.match(appearance,/P\._appearanceSavebar=function\(\)\{return'';\}/);
 assert.match(revision,/querySelectorAll\('\.profile-modal-savebar,\.profile-appearance-savebar'\)/);
 assert.match(revision,/profile-global-save/);
 assert.match(revision,/Salvar alterações/);
 assert.match(css,/\.profile-modal-savebar,[\s\S]*\.profile-appearance-savebar\{display:none!important\}/);
});

test('Salvar alterações persiste dados, título e moldura em uma única chamada de Perfil',()=>{
 assert.match(revision,/AuthClient\.saveProfile\(\{displayName:d\.displayName,email:d\.email,bio:d\.bio,avatarData:pm\.draftAvatar,titleKey,frameKey\}\)/);
 assert.doesNotMatch(revision,/await MetaClient\.equip/);
 assert.match(settings,/hasTitle/);assert.match(settings,/hasFrame/);
 assert.match(settings,/prestige\.canEquipTitle/);assert.match(settings,/prestige\.canEquipFrame/);
 assert.match(settings,/equipped_title_key=\$\{titleKey\},equipped_frame_key=\$\{frameKey\}/);
});

test('P23 é a camada final e versão publicada é v1.4.23',()=>{
 assert.ok(index.indexOf('css/p23.css')>index.indexOf('css/p22.css'));
 assert.match(notifications,/APP_VERSION='v1\.4\.23'/);
 assert.match(notifications,/release:p23/);
});
