'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const profile=read('public/js/metaFixes.js'),identity=read('public/js/domains/identityUI.js'),rank=read('public/js/domains/rankUI.js');

test('public profile tem owner explícito sem listener global legado',()=>{
 assert.doesNotThrow(()=>new Function(profile));
 assert.match(profile,/claim\('publicProfileUI','metaFixes\.js'/);
 assert.match(profile,/status:'CURRENT_BRIDGE'/);
 assert.match(profile,/HomeScreen\.renderPublicProfile=render/);
 assert.doesNotMatch(profile,/document\.addEventListener\('click'/);
});

test('perfil público não duplica título nem moldura com identityUI',()=>{
 assert.match(profile,/public-profile-equipped-title equipped-title public-equipped-title/);
 assert.match(identity,/querySelector\('\.public-profile-equipped-title'\)/);
 assert.match(profile,/IdentityUI\?\.avatarHtml/);
 assert.match(identity,/if\(!p\|\|!panel\?\.isConnected\)return/);
});

test('fechar e voltar respeitam AppPanel e rank owner',()=>{
 assert.match(profile,/AppPanelModal\?\.host===panel/);
 assert.match(profile,/AppPanelModal\.close\(\)/);
 assert.match(profile,/CartRankDomain\?\.render\?\.\(panel,'current','rank'\)/);
 assert.match(rank,/window\.CartRankDomain=\{state,decorate,render,rankTabs,bindRankTabs\}/);
});
