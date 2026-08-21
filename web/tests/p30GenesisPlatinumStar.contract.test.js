'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const owner=read('public/js/domains/genesisFrameUI.js'),css=read('public/css/genesisAtomicCurrent.css'),base=read('public/css/genesisFrameBaseCurrent.css'),p17=read('public/css/p17.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('Gênese usa a mesma estrela visual da progressão Platina',()=>{
 assert.match(p17,/frame-platinum::after[\s\S]*content:'✦'/);
 assert.match(p17,/frame-platinum\{--p17-spark:#dffcff;--p17-glow:rgba\(139,234,255,\.98\)\}/);
 assert.ok(owner.includes("STAR='✦'"));
 assert.ok(owner.includes('particle.textContent=STAR'));
 assert.ok(css.includes('color:#dffcff'));
 assert.ok(css.includes('text-shadow:0 0 5px #fff,0 0 10px rgba(139,234,255,.98),0 0 18px rgba(139,234,255,.98)'));
});

test('partícula é estrela tipográfica e não bolinha radial',()=>{
 const block=css.match(/\.avatar-frame\.frame-genese-celestial>\.genese-atom-track>\.genese-atom-particle\{([\s\S]*?)\n\}/)?.[1]||'';
 assert.match(block,/background:none/);
 assert.match(block,/border-radius:0/);
 assert.match(block,/font-size:\.84em/);
 assert.doesNotMatch(block,/radial-gradient/);
});

test('estrela percorre e pulsa na elipse enquanto o plano orbital gira',()=>{
 assert.ok(css.includes('animation:p29GenesisOrbitPlane 8.4s linear infinite'));
 assert.ok(css.includes('animation:p30GenesisPlatinumStar 4.6s linear infinite'));
 for(const marker of['0%{left:100%;top:50%;opacity:.48','25%{left:50%;top:0%;opacity:1','50%{left:0%;top:50%;opacity:.48','75%{left:50%;top:100%;opacity:1'])assert.ok(css.includes(marker),marker);
});

test('foto e arco Celestial permanecem independentes da estrela orbital',()=>{
 assert.ok(base.includes('frame-genese-celestial>img'));
 assert.ok(base.includes('filter:none!important'));
 assert.ok(base.includes('animation:p26GenesisRing 7.2s linear infinite'));
 assert.ok(css.includes('genese-atom-track'));
});

test('P30 permanece registrado; runtime usa owner canônico e P75 é corrente',()=>{
 assert.ok(index.includes('css/p29.css?v=1.4.31'));
 assert.ok(index.includes('js/domains/genesisFrameUI.js?v=domain-2'));
 assert.ok(notifications.includes('release:p30'));
 assert.ok(notifications.includes("version:'v1.4.30'"));
 assert.ok(notifications.includes('Estrela orbital da Gênese'));
 assert.ok(version.includes('releaseP75'));
});
