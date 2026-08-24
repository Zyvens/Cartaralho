'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/p40.js'),shim=read('public/css/p40.css'),walletCss=read('public/css/walletSurfaceCurrent.css'),appearanceCss=read('public/css/profileAppearanceControlsCurrent.css'),footerCss=read('public/css/profileSaveFooterCurrent.css'),photoCss=read('public/css/profileBasicPhotoCurrent.css'),account=read('public/js/domains/accountUI.js'),profile=read('public/js/domains/profileUI.js'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js'),release=read('lib/releaseP40.js');

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

test('seletores P40 foram supersedidos pelo preview transacional de título e moldura',()=>{
 assert.doesNotThrow(()=>new Function(profile));
 assert.ok(profile.includes('function colorAppearanceSelectors(){/* v1.5: selectors removed; kept as compatibility no-op. */}'));
 assert.ok(profile.includes('data.previewTitle=key'));
 assert.ok(profile.includes('data.previewFrame=key'));
 assert.ok(profile.includes('EXPERIMENTANDO'));
 assert.ok(!profile.includes('data-profile-draft-title'));
 assert.ok(!profile.includes('data-profile-draft-frame'));
 assert.ok(footerCss.includes('.profile-appearance-selector-card{display:none!important}'));
 assert.ok(shim.includes('profileAppearanceControlsCurrent.css'));
 assert.ok(appearanceCss.includes('select[data-profile-draft-title]'));
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

test('P40 é histórico não executável, shim visual, e segue na linhagem da v1.5',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p40.css?v=1.4.40'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/p40.js?v=1.4.40"'));
 assert.ok(!index.includes('<script src="js/p40.js'));
 assert.ok(shim.startsWith('/* COMPAT P40'));
 assert.ok(release.includes("APP_VERSION='v1.4.40'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(version.includes('releaseV15'));
 assert.ok(notifications.includes('releaseP75'));
 assert.ok(notifications.includes('P40_RELEASE')||notifications.includes('releaseP40'));
});
