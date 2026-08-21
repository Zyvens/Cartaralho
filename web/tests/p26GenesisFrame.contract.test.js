'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shim=read('public/css/p26.css'),base=read('public/css/genesisFrameBaseCurrent.css'),atomic=read('public/css/genesisAtomicCurrent.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('P26 preserva base/arco Celestial em owner canônico',()=>{
 assert.ok(shim.includes('genesisFrameBaseCurrent.css'));
 assert.ok(base.includes('.avatar-frame.frame-genese-celestial{'));
 assert.ok(base.includes('position:relative'));
 assert.ok(base.includes('padding:4px!important'));
 assert.ok(base.includes('filter:none!important'));
 assert.ok(base.includes('frame-genese-celestial>img'));
 assert.ok(base.includes('z-index:2'));
});

test('anel Celestial continua girando sem animar a foto',()=>{
 assert.ok(base.includes('frame-genese-celestial::before'));
 assert.ok(base.includes('conic-gradient'));
 assert.ok(base.includes('animation:p26GenesisRing 7.2s linear infinite'));
 assert.ok(base.includes('@keyframes p26GenesisRing{to{transform:rotate(360deg)}}'));
 assert.ok(!base.match(/frame-genese-celestial>img[^\{]*\{[^}]*animation:/));
});

test('órbita e breath P26 foram supersedidos pelo resultado P29-P31',()=>{
 assert.ok(!base.includes('p26GenesisOrbit'));
 assert.ok(!base.includes('p26GenesisBreath'));
 assert.ok(!base.includes('frame-genese-celestial::after'));
 assert.ok(atomic.includes('p31GenesisBreath'));
 assert.ok(atomic.includes('genese-atom-track'));
});

test('P26 mantém posição histórica da cascata e release permanece registrada',()=>{
 const old=index.indexOf('css/p18.css'),next=index.indexOf('css/p26.css?v=1.4.26');
 assert.ok(old>=0&&next>old);
 assert.ok(shim.startsWith('/* COMPAT P26'));
 assert.ok(notifications.includes('release:p26'));
 assert.ok(notifications.includes('P26 — Gênese refinada'));
 assert.ok(version.includes('releaseP75'));
});
