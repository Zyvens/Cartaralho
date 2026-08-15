'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const defs=require('../lib/achievementDefinitions');
const service=read('lib/achievementService.js'),refinement=read('public/js/refinementP13.js'),menu=read('public/js/homeMenuP24.js'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('títulos derivados de achievements usam a descrição canônica do requisito real',()=>{
 assert.ok(defs.ACHIEVEMENTS.filter(a=>a.title).length>0);
 assert.match(service,/function titleDefinitions\(\)\{return defs\.ACHIEVEMENTS\.filter\(x=>x\.title\)\.map\(x=>\(\{key:x\.title\.key,name:x\.title\.name,icon:x\.icon,rarity:x\.rarity,description:x\.description,achievementKey:x\.key,target:x\.target\}\)\);\}/);
});

test('copy genérica antiga não é mais produzida e o scrubber legado continua convertendo caches antigos',()=>{
 const generic=['Título','por','achievement'].join(' ');
 assert.ok(!service.includes(generic));
 assert.match(refinement,/TITLE_DESCRIPTIONS/);
 assert.match(refinement,/node\.nodeValue=title/);
 assert.match(refinement,/p\.textContent=copy/);
});

test('ordem autoritativa da Home segue exatamente a sequência solicitada',()=>{
 assert.doesNotThrow(()=>new Function(menu));
 const expected=['#marketplace-menu-btn','#notifications-menu-btn','#friends-menu-btn','[data-panel="cards"]','[data-panel="rank"]','[data-panel="history"]','[data-panel="stats"]','#audio-settings-menu-btn','[data-panel="credits"]'];
 let previous=-1;
 for(const selector of expected){const at=menu.indexOf(`'${selector}'`);assert.ok(at>previous,`${selector} fora de ordem`);previous=at;}
 assert.match(menu,/'#friends-menu-btn':'Amigos de Merda'/);
 assert.match(menu,/'\[data-panel="stats"\]':'Estatística'/);
});

test('ordenação reage somente dentro da grade de atalhos e não observa o body inteiro',()=>{
 assert.match(menu,/obs\.observe\(actions,\{childList:true\}\)/);
 assert.doesNotMatch(menu,/observe\(document\.body/);
 assert.match(menu,/if\(!already\)nodes\.forEach\(node=>actions\.appendChild\(node\)\)/);
});

test('P24 permanece carregado e registrado mesmo com versões posteriores',()=>{
 assert.ok(index.indexOf('js/homeMenuP24.js')>index.indexOf('js/playerShowcaseP20.js'));
 assert.match(notifications,/release:p24/);
 assert.match(notifications,/version:'v1\.4\.24'/);
});
