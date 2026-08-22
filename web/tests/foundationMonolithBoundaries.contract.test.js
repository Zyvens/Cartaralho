'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const professional=read('public/js/professionalUI.js'),meta=read('public/js/meta.js'),registration=read('public/js/domains/registrationUI.js'),panel=read('public/js/domains/appPanelUI.js'),socialBase=read('public/js/domains/socialFoundationUI.js'),homePresentation=read('public/js/domains/homePresentationUI.js'),cards=read('public/js/domains/cardsLibrary.js'),stats=read('public/js/domains/statsUI.js'),rank=read('public/js/domains/rankUI.js'),nav=read('public/js/domains/navigationUI.js'),social=read('public/js/domains/socialUI.js'),account=read('public/js/domains/accountUI.js'),identity=read('public/js/domains/identityUI.js'),missions=read('public/js/domains/missionsUI.js'),profile=read('public/js/domains/profileUI.js');

test('professionalUI foi retirado do runtime ownership',()=>{
 assert.match(professional,/status:'SUPERSEDED'/);
 for(const forbidden of [/const AppPanelModal=/,/const RegistrationModal=/,/const SocialUI=/,/HomeScreen\.register=/,/HomeScreen\.openPanel=/,/HomeScreen\.renderAccount=function/,/ProfileModal\.render=function/])assert.doesNotMatch(professional,forbidden);
 assert.match(registration,/HomeScreen\.register=/);
 assert.match(panel,/HomeScreen\.openPanel=/);
 assert.match(socialBase,/window\.SocialUI=SocialUI/);
 assert.match(homePresentation,/HomeScreen\.renderAccount=function/);
 assert.match(cards,/HomeScreen\.renderCards=render/);
 assert.match(profile,/RARITY_LABEL/);
 assert.match(account,/CartHomePresentationDomain\?\.polishHome/);
 assert.doesNotMatch(account,/ProfessionalUI\?\.polishHome/);
 assert.match(social,/SocialUI\.renderFriends/);
});

test('professionalUI mantém apenas delegates compatíveis sem reassumir ownership',()=>{
 assert.match(professional,/polishHome\(\.\.\.args\).*CartHomePresentationDomain/s);
 assert.match(professional,/renderCards\(\.\.\.args\).*CartCardsLibrary/s);
});

test('meta mantém APIs únicas que precisam ser extraídas antes da remoção',()=>{
 assert.match(meta,/const MetaClient=/);
 for(const token of ['openSpectator(code)','renderSpectator(s)','exitSpectator()','updateReactionDock(name)','showReaction(d)','addRoomShare()'])assert.ok(meta.includes(token),token);
 assert.match(meta,/SocketClient\.subscribeRoom=async code/);
});

test('writers genéricos do meta são substituídos por owners finais',()=>{
 assert.match(meta,/HomeScreen\.renderRank=/);assert.match(rank,/HomeScreen\.renderRank=render/);
 assert.match(meta,/HomeScreen\.renderStats=/);assert.match(stats,/HomeScreen\.renderStats=render/);
 assert.match(meta,/HomeScreen\.renderCards=/);assert.match(cards,/HomeScreen\.renderCards=render/);
 assert.match(meta,/App\.showScreen=/);assert.match(nav,/App\.showScreen=function/);
});

test('identity/missions decoram MetaUI sem exigir que ele reassuma renderers finais',()=>{
 assert.match(identity,/MetaUI\.titleName/);
 assert.match(missions,/MetaUI\.missionRow=missionRow/);
});
