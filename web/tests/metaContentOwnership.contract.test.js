'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/domains/historyUI.js'),groups=read('public/js/domains/socialGroupsUI.js'),social=read('public/js/domains/socialFoundationUI.js'),index=read('public/index.html');

test('Histórico e Replay têm owner canônico completo',()=>{
 assert.match(history,/CartDomains\.claim\('historyUI'/);
 assert.match(history,/AuthClient\.history\(\)/);
 assert.match(history,/MetaClient\.replay\(code\)/);
 assert.match(history,/HomeScreen\.renderHistory=render/);
 assert.match(history,/MetaUI\.renderHistory=render/);
 assert.match(history,/MetaUI\.renderReplay=renderReplay/);
 for(const copy of ['Histórico','Replay','Vencedor:'])assert.ok(history.includes(copy),copy);
});

test('detalhe de Turma tem owner separado e volta à foundation social',()=>{
 assert.match(groups,/CartDomains\.claim\('socialGroupsUI'/);
 assert.match(groups,/MetaClient\.group\(id\)/);
 assert.match(groups,/MetaUI\.renderFriendGroup=renderFriendGroup/);
 assert.match(groups,/SocialUI\?\.render\?\.\(panel,'groups'\)/);
 assert.match(groups,/HomeScreen\.renderPublicProfile/);
 assert.match(social,/MetaUI\.renderFriendGroup\(host/);
});

test('owners de conteúdo carregam depois da base Meta e antes do uso interativo',()=>{
 const metaBase=index.indexOf('js/metaUIBase.js'),historyPos=index.indexOf('js/domains/historyUI.js'),groupsPos=index.indexOf('js/domains/socialGroupsUI.js');
 assert.ok(metaBase>0&&historyPos>metaBase&&groupsPos>metaBase);
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/meta.js"'));
});
