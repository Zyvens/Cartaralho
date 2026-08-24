'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function walk(dir,prefix=''){
 const abs=path.join(root,dir),out=[];
 for(const entry of fs.readdirSync(abs,{withFileTypes:true})){
  const rel=prefix?`${prefix}/${entry.name}`:entry.name;
  if(entry.isDirectory())out.push(...walk(path.join(dir,entry.name),rel));
  else if(entry.isFile()&&entry.name.endsWith('.js'))out.push(rel.replace(/\.js$/,''));
 }
 return out.sort();
}

const gatewayFiles=['auth','cards','game','profile','rooms','social','admin','root'];
const gatewaySources=gatewayFiles.map(name=>read(`serverless/${name}.js`));
const vercel=JSON.parse(read('vercel.json'));

test('todos os handlers físicos de api pertencem explicitamente a um dos oito gateways',()=>{
 const physical=walk('api');
 const referenced=[];
 for(const source of gatewaySources){
  for(const match of source.matchAll(/require\('\.\.\/api\/([^']+)'\)/g))referenced.push(match[1]);
 }
 referenced.sort();
 assert.deepEqual(referenced,physical);
 assert.equal(new Set(referenced).size,referenced.length,'nenhum handler pode aparecer em dois gateways');
});

test('configuração Vercel cria somente oito Functions Node, abaixo do limite Hobby',()=>{
 const nodeBuilds=vercel.builds.filter(x=>x.use==='@vercel/node');
 assert.equal(nodeBuilds.length,8);
 assert.ok(nodeBuilds.length<=12);
 assert.deepEqual(nodeBuilds.map(x=>x.src).sort(),gatewayFiles.map(x=>`serverless/${x}.js`).sort());
 assert.equal(vercel.builds.filter(x=>x.use==='@vercel/static').length,1);
});

test('rotas públicas preservam os sete domínios prefixados e o catch-all raiz',()=>{
 const srcs=vercel.routes.map(x=>x.src);
 for(const domain of['auth','cards','game','profile','rooms','social','admin'])assert.ok(srcs.includes(`/api/${domain}/(?<path>.*)`),domain);
 assert.ok(srcs.includes('/api/(?<path>.*)'));
 assert.deepEqual(vercel.routes.slice(-2),[
  {src:'/',dest:'/public/index.html'},
  {src:'/(?<path>.*)',dest:'/public/$path'}
 ]);
});

test('dispatcher injeta parâmetros de rota dinâmica sem apagar query original',()=>{
 const{dispatch}=require('../serverless/_common');
 let seen=null;
 const req={query:{__path:'deck/black/12/hide',foo:'bar'}};
 const res={};
 dispatch(req,res,{dynamic:[{pattern:/^deck\/([^/]+)\/(\d+)\/hide$/,params:['type','index'],handler:r=>{seen={...r.query};}}]});
 assert.deepEqual(seen,{foo:'bar',type:'black',index:'12'});
});

test('gateway Admin preserva as duas rotas dinâmicas file-based',()=>{
 const source=read('serverless/admin.js');
 assert.match(source,/deck\\\/\(\[\^\/\]\+\)\\\/\(\\d\+\)\\\/hide/);
 assert.match(source,/params:\['type','index'\]/);
 assert.match(source,/\.\.\/api\/admin\/deck\/\[type\]\/\[index\]\/hide/);
 assert.match(source,/\.\.\/api\/admin\/deck\/\[type\]\/\[index\]/);
});

test('gateway desconhecido devolve 404 JSON sem executar módulo arbitrário',()=>{
 const{dispatch}=require('../serverless/_common');
 let body='',status=0,type='';
 const req={query:{__path:'nao-existe'}};
 const res={set statusCode(v){status=v;},get statusCode(){return status;},setHeader(k,v){if(k==='Content-Type')type=v;},end(v){body=v;}};
 dispatch(req,res,{fixed:{}});
 assert.equal(status,404);
 assert.match(type,/application\/json/);
 assert.equal(JSON.parse(body).success,false);
});
