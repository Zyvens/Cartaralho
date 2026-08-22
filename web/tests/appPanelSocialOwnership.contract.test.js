'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const panel=read('public/js/domains/appPanelUI.js'),socialBase=read('public/js/domains/socialFoundationUI.js'),social=read('public/js/domains/socialUI.js'),professional=read('public/js/professionalUI.js'),index=read('public/index.html');

test('AppPanelModal canônico preserva shell e rotas dos cinco painéis',()=>{
 assert.doesNotThrow(()=>new Function(panel));
 assert.match(panel,/CartDomains\.claim\('appPanelUI'/);
 for(const k of ['cards','stats','rank','history','friends'])assert.match(panel,new RegExp(`${k}:\\{`));
 assert.match(panel,/window\.AppPanelModal=AppPanelModal/);
 assert.match(panel,/HomeScreen\.openPanel=async kind=>PANEL_META\[kind\]\?AppPanelModal\.open\(kind\):baseOpen\(kind\)/);
 assert.match(panel,/Escape/);assert.match(panel,/app-panel-open/);assert.match(panel,/normalize\(\)/);
});

test('Social foundation não fecha sobre AppPanelModal lexical antigo',()=>{
 assert.doesNotThrow(()=>new Function(socialBase));
 assert.match(socialBase,/CartDomains\.claim\('socialFoundationUI'/);
 assert.match(socialBase,/window\.SocialUI=SocialUI/);
 assert.match(socialBase,/window\.AppPanelModal\?\.host\|\|root/);
 assert.match(socialBase,/MetaUI\.renderFriendGroup\(host/);
 assert.doesNotMatch(socialBase,/[^.]AppPanelModal\.host/);
});

test('decorator de presença continua depois da foundation nova',()=>{
 const basePos=index.indexOf('js/domains/socialFoundationUI.js'),decoratorPos=index.indexOf('js/domains/socialUI.js');
 assert.ok(basePos>0&&decoratorPos>basePos);
 assert.match(social,/installSocialRenderer/);
 assert.match(social,/SocialUI\.__domainPresence/);
});

test('professionalUI não contém mais AppPanel nem Social runtime',()=>{
 assert.match(professional,/status:'SUPERSEDED'/);
 assert.doesNotMatch(professional,/const AppPanelModal=/);
 assert.doesNotMatch(professional,/const SocialUI=/);
 assert.doesNotMatch(professional,/HomeScreen\.openPanel=/);
 assert.ok(index.indexOf('js/professionalUI.js')<index.indexOf('js/domains/appPanelUI.js'));
});
