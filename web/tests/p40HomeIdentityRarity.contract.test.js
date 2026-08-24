'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p40.js'),shim=read('public/css/p40.css'),walletCss=read('public/css/walletSurfaceCurrent.css'),appearanceCss=read('public/css/profileAppearanceControlsCurrent.css'),photoCss=read('public/css/profileBasicPhotoCurrent.css'),account=read('public/js/domains/accountUI.js'),profile=read('public/js/domains/profileUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP40.js');

test('identidade P40 foi absorvida pelo owner atual de conta',()=>{
 assert.doesNotThrow(()=>new Function(account));
 assert.ok(account.includes('equipped_frame_key'));
 assert.ok(account.includes('equipped_title_key'));
 assert.ok(account.includes('IdentityUI.wrapExisting'));
 assert.ok(account.includes('account-equipped-title equipped-title public-equipped-title'));
 assert.ok(account.includes('function decorateIdentity()'));
});

test('superfície visual da carteira vive em owner canônico próprio',()=>{
 assert.ok(walletCss.includes('.home-account-bar .home-account-balance'));
 assert.ok(walletCss.includes('height:48px!important'));
 assert.ok(walletCss.includes('font:900 1.2rem/1 var(--font-display)!important'));
 assert.ok(shim.includes('walletSurfaceCurrent.css'));
});

test('seletores de aparência usam CSS estrutural e cor dinâmica por raridade no profileUI',()=>{
 assert.doesNotThrow(()=>new Function(profile));
 assert.ok(appearanceCss.includes('select[data-profile-draft-title]'));
 assert.ok(appearanceCss.includes('select[data-profile-draft-frame]'));
 assert.ok(appearanceCss.includes('font-weight:850!important'));
 assert.ok(profile.includes('function colorAppearanceSelectors'));
 assert.ok(profile.includes('o.dataset.rarity=rarity'));
 assert.ok(profile.includes("select.style.setProperty('color'"));
 assert.ok(profile.includes('COLORS[rarity]'));
 assert.ok(!appearanceCss.includes("data-rarity='common']{color:"));
 assert.ok(shim.includes('profileAppearanceControlsCurrent.css'));
});

test('foto básica do editor permanece sem moldura equipada',()=>{
 assert.ok(profile.includes('avatar(this.draftAvatar,116,null)'));
 assert.ok(profile.includes('keepBasicPhotoPlain'));
 assert.ok(profile.includes('frameClasses(node).forEach(c=>node.classList.remove(c))'));
 assert.ok(photoCss.includes('profile-modal-avatar-editor-card #profile-modal-avatar-preview .profile-modal-avatar'));
 assert.ok(photoCss.includes('::after{display:none!important}'));
 assert.ok(shim.includes('profileBasicPhotoCurrent.css'));
});

test('métricas antigas de Perfil/Sair e cores CSS P40 foram supersedidas',()=>{
 assert.ok(!walletCss.includes('#profile-shortcut'));
 assert.ok(!walletCss.includes('#logout-btn'));
 assert.ok(!appearanceCss.includes("data-rarity='rare']{color:"));
 assert.ok(!appearanceCss.includes("data-rarity='legendary']{color:"));
});

test('P40 é histórico não executável, shim visual, e P75 é a release corrente',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p40.css?v=1.4.40'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p40.js?v=1.4.40"'));
 assert.ok(!index.includes('<script src="js/p40.js'));
 assert.ok(shim.startsWith('/* COMPAT P40'));
 assert.ok(release.includes("APP_VERSION='v1.4.40'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P40_RELEASE')||notifications.includes('releaseP40'));
});
