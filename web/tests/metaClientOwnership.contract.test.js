'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const client=read('public/js/metaClient.js'),meta=read('public/js/meta.js'),index=read('public/index.html');

test('MetaClient permanece binding lexical e também é exposto para integração',()=>{
 assert.match(client,/^'use strict';\nconst MetaClient=/);
 assert.match(client,/window\.MetaClient=MetaClient/);
 assert.doesNotMatch(meta,/const MetaClient=/);
 assert.match(meta,/MetaClient\.metagame\(\)/);
 assert.match(meta,/MetaClient\.spectate\(/);
});

test('MetaClient carrega imediatamente antes de meta.js',()=>{
 const clientPos=index.indexOf('js/metaClient.js'),metaPos=index.indexOf('js/meta.js');
 assert.ok(clientPos>0&&metaPos>clientPos);
 assert.ok(index.slice(clientPos,metaPos).includes('</script>'));
});

test('superfície MetaClient preserva contratos usados pelos módulos atuais',()=>{
 for(const method of ['metagame','missions','equip','hall','replay','groups','group','createGroup','joinGroup','react','spectate','friends'])assert.match(client,new RegExp(`${method}\\(`));
 assert.match(client,/AuthClient\.request/);
});
