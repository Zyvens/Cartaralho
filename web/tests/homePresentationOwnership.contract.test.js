'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const home=read('public/js/domains/homePresentationUI.js'),account=read('public/js/domains/accountUI.js'),profile=read('public/js/domains/profileUI.js'),cards=read('public/js/domains/cardsLibrary.js'),panel=read('public/js/domains/appPanelUI.js'),registration=read('public/js/domains/registrationUI.js'),social=read('public/js/domains/socialFoundationUI.js'),index=read('public/index.html');

test('Home presentation preserva composição profissional sem possuir dados de domínio',()=>{
 assert.doesNotThrow(()=>new Function(home));
 assert.match(home,/CartDomains\.claim\('homePresentationUI'/);
 for(const copy of ['PRONTO PARA COMEÇAR?','JOGAR','Perfil','Sair','Amigos de merda'])assert.ok(home.includes(copy),copy);
 assert.doesNotMatch(home,/HomeScreen\.renderAccount\s*=/);
 assert.match(home,/HomeScreen\.render=async function/);
 assert.match(account,/CartHomePresentationDomain\?\.polishHome/);
});

test('responsabilidades antigas de professionalUI já têm owners finais separados',()=>{
 assert.match(profile,/PROGRESSION_FRAME_NAMES=\{bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'\}/);
 assert.match(profile,/RARITY_LABEL=\{common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário',celestial:'Celestial'\}/);
 assert.match(cards,/HomeScreen\.renderCards=render/);
 assert.match(panel,/window\.AppPanelModal=AppPanelModal/);
 assert.match(registration,/HomeScreen\.register=/);
 assert.match(social,/window\.SocialUI=SocialUI/);
});

test('homePresentation carrega antes dos refinamentos finais de conta e polish',()=>{
 const p=index.indexOf('js/domains/homePresentationUI.js'),accountPos=index.indexOf('js/domains/accountUI.js'),polish=index.indexOf('js/domains/uiPolishUI.js');
 assert.ok(p>0&&accountPos>p&&polish>p);
});
