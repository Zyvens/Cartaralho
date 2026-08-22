'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/musicRecoveryP28.js'),audio=read('public/js/domains/audioUI.js'),recycling=read('public/js/marketplaceRecycling.js'),shim=read('public/css/p28.css'),skeleton=read('public/css/recyclingSkeletonCurrent.css'),atomic=read('public/css/genesisAtomicCurrent.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('retomada de áudio P28 foi absorvida pelo owner audioUI',()=>{
 assert.doesNotThrow(()=>new Function(audio));
 assert.ok(audio.includes('function wantsMusic()'));
 assert.ok(audio.includes('CartSoundtrack?.resume?.()'));
 for(const evt of['touchstart','touchend','pointerdown','pointerup','click','keydown'])assert.ok(audio.includes(`'${evt}'`),evt);
 assert.ok(audio.includes('pageshow'));
 assert.ok(audio.includes('visibilitychange'));
 assert.ok(audio.includes('cartaralho:audio-settings'));
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/musicRecoveryP28.js"'));
});

test('órbita Gênese P28 de uma partícula foi supersedida por seis estrelas',()=>{
 assert.ok(!shim.includes('p28GenesisAtomOrbit'));
 assert.ok(!skeleton.includes('frame-genese-celestial'));
 assert.ok(atomic.includes('genese-atom-track'));
 assert.ok(atomic.includes('p30GenesisPlatinumStar'));
 assert.ok(atomic.includes('nth-child(6)'));
});

test('Reciclagem mantém geometria estável durante fetch em owner próprio',()=>{
 assert.doesNotThrow(()=>new Function(recycling));
 assert.ok(recycling.includes('skeleton(body)'));
 assert.ok(recycling.includes("body.classList.add('recycling-loading')"));
 assert.ok(recycling.includes('if(this.data)this.paint(body,m);else this.skeleton(body)'));
 assert.ok(recycling.includes('recycling-skeleton-grid'));
 assert.ok(skeleton.includes('.market-body.recycling-loading{min-height:min(540px,62dvh)}'));
 assert.ok(skeleton.includes('.recycling-skeleton-grid>span'));
 assert.ok(shim.includes('recyclingSkeletonCurrent.css'));
});

test('P28 permanece na proveniência e P75 é a release corrente',()=>{
 assert.ok(index.includes('css/p28.css?v=1.4.28'));
 assert.ok(shim.startsWith('/* COMPAT P28'));
 assert.ok(notifications.includes('release:p28'));
 assert.ok(notifications.includes("version:'v1.4.28'"));
 assert.ok(version.includes('releaseP75'));
});
