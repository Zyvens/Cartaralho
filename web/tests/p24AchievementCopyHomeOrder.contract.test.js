'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const defs=require('../lib/achievementDefinitions'),service=require('../lib/achievementService');
const menu=read('public/js/homeMenuP24.js'),index=read('public/index.html'),notifications=read('lib/appNotifications.js');

test('títulos derivados de achievements usam exatamente a descrição do requisito real',()=>{
 const expected=new Map(defs.ACHIEVEMENTS.filter(a=>a.title).map(a=>[a.title.key,a.description]));
 const titles=service.titleDefinitions();
 assert.equal(titles.length,expected.size);
 for(const title of titles)assert.equal(title.description,expected.get(title.key),`descrição divergente em ${title.key}`);
});

test('nenhuma fonte do jogo mantém o texto genérico título por achievement',()=>{
 const stack=[root],hits=[];
 while(stack.length){const dir=stack.pop();for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())stack.push(p);else if(/\.(js|html|css|md|json)$/i.test(entry.name)){const src=fs.readFileSync(p,'utf8');if(/t[ií]tulo por achievement/i.test(src))hits.push(path.relative(root,p));}}}
 assert.deepEqual(hits,[]);
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

test('P24 carrega por último e é publicado como v1.4.24',()=>{
 assert.ok(index.indexOf('js/homeMenuP24.js')>index.indexOf('js/playerShowcaseP20.js'));
 assert.match(notifications,/APP_VERSION='v1\.4\.24'/);
 assert.match(notifications,/release:p24/);
});
