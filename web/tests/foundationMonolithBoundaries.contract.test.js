'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const professional=read('public/js/professionalUI.js'),meta=read('public/js/meta.js'),cards=read('public/js/domains/cardsLibrary.js'),stats=read('public/js/domains/statsUI.js'),rank=read('public/js/domains/rankUI.js'),nav=read('public/js/domains/navigationUI.js'),social=read('public/js/domains/socialUI.js'),account=read('public/js/domains/accountUI.js'),identity=read('public/js/domains/identityUI.js'),missions=read('public/js/domains/missionsUI.js');

test('professionalUI ainda contém foundations que impedem desligamento prematuro',()=>{
 for(const symbol of ['const AppPanelModal=','const RegistrationModal=','const SocialUI=','const ProfessionalUI='])assert.match(professional,new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(professional,/HomeScreen\.register=\(\)=>RegistrationModal\.open\(\)/);
 assert.match(account,/ProfessionalUI\?\.polishHome\?\.\(\)/);
 assert.match(social,/SocialUI\.renderFriends/);
 assert.match(social,/SocialUI\.personRow/);
});

test('renderer de Cartas do professionalUI é trajetória supersedida',()=>{
 assert.match(professional,/HomeScreen\.renderCards=panel=>ProfessionalUI\.renderCards\(panel\)/);
 assert.match(cards,/HomeScreen\.renderCards=render/);
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
