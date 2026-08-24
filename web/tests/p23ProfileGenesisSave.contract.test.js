'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const profile=read('public/js/domains/profileUI.js'),settings=read('api/profile/settings.js'),shim=read('public/css/p23.css'),footerCss=read('public/css/profileSaveFooterCurrent.css'),genesisBase=read('public/css/genesisFrameBaseCurrent.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('profileUI preserva Gênese e cosméticos sem filtrar apenas progressão',()=>{
 assert.doesNotThrow(()=>new Function(profile));
 assert.ok(profile.includes("key:'genese-celestial'"));
 assert.ok(profile.includes("entitlement_type==='frame'&&e?.entitlement_key==='genese-celestial'"));
 assert.ok(profile.includes("if(hasGenesis&&!pm.data.frames.some(f=>f.key==='genese-celestial'))"));
 assert.ok(profile.includes('PROGRESSION_FRAME_NAMES'));
});

test('seleção de título/moldura atualiza draft e DOM sem rerender histórico concorrente',()=>{
 assert.ok(profile.includes('function setAppearanceDraft'));
 assert.ok(profile.includes('syncAppearanceDom(pm)'));
 assert.ok(profile.includes("setAppearanceDraft(this,'title'"));
 assert.ok(profile.includes("setAppearanceDraft(this,'frame'"));
 assert.ok(profile.includes('P.equipTitle=function'));
 assert.ok(profile.includes('P.equipFrame=function'));
});

test('Gênese usa a classe visual atual e sua base vive no owner P26',()=>{
 assert.ok(profile.includes('frame-${frameKey}'));
 assert.ok(profile.includes("window.GenesisFrameP29?.mount?.(frame)"));
 assert.ok(genesisBase.includes('.avatar-frame.frame-genese-celestial'));
 assert.ok(genesisBase.includes('overflow:visible!important'));
 assert.ok(genesisBase.includes('isolation:isolate'));
 assert.ok(genesisBase.includes('filter:none!important'));
 assert.ok(!shim.includes('frame-genese-celestial'));
});

test('Perfil possui somente o Salvar alterações global e barras/seletores antigos ficam ocultos',()=>{
 assert.ok(profile.includes("footer.className='profile-global-footer'"));
 assert.ok(profile.includes('profile-global-save'));
 assert.ok(profile.includes('Salvar alterações'));
 assert.ok(profile.includes("body?.querySelectorAll('.profile-modal-savebar,.profile-appearance-savebar,.profile-appearance-selector-card').forEach(x=>x.remove())"));
 assert.ok(footerCss.includes('.profile-modal-savebar,.profile-appearance-savebar,.profile-appearance-selector-card{display:none!important}'));
 assert.ok(footerCss.includes('.profile-global-footer.is-dirty'));
 assert.ok(footerCss.includes('.profile-modal-preview-pill'));
 assert.ok(shim.includes('profileSaveFooterCurrent.css'));
});

test('Salvar alterações persiste perfil, título e moldura em uma única chamada',()=>{
 assert.ok(profile.includes('AuthClient.saveProfile({displayName:d.displayName,email:d.email,bio:d.bio,avatarData:pm.draftAvatar,titleKey,frameKey})'));
 assert.ok(settings.includes("hasTitle=Object.prototype.hasOwnProperty.call(b,'titleKey')"));
 assert.ok(settings.includes("hasFrame=Object.prototype.hasOwnProperty.call(b,'frameKey')"));
 assert.ok(settings.includes('prestige.canEquipTitle'));
 assert.ok(settings.includes('prestige.canEquipFrame'));
 assert.ok(settings.includes('equipped_title_key=${titleKey},equipped_frame_key=${frameKey}'));
});

test('P23 preserva shim histórico fora do runtime, owner direto e participa da linhagem até v1.5',()=>{
 assert.equal(index.indexOf('css/p23.css'),-1);
 const base=index.indexOf('css/cardCreationSemanticOverridesCurrent.css'),footer=index.indexOf('css/profileSaveFooterCurrent.css'),next=index.indexOf('css/p26.css?v=1.4.26');
 assert.ok(base>=0&&footer>base&&next>footer);
 assert.ok(shim.startsWith('/* COMPAT P23'));
 assert.ok(notifications.includes('release:p23'));
 assert.ok(notifications.includes("version:'v1.4.23'"));
 assert.ok(version.includes('releaseP75'));
 assert.ok(version.includes('releaseV15'));
});
