'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const owner=read('public/js/domains/genesisFrameUI.js'),css=read('public/css/genesisAtomicCurrent.css'),shim=read('public/css/p29.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('Gênese renderiza exatamente seis estrelas orbitais pelo owner atual',()=>{
 assert.ok(owner.includes('STAR_COUNT=6'));
 assert.ok(owner.includes('for(let index=0;index<STAR_COUNT;index+=1)'));
 assert.ok(owner.includes("particle.className='genese-atom-particle genese-atom-star'"));
 assert.ok(owner.includes('track.appendChild(particle)'));
 assert.ok(owner.includes('window.GenesisFrameP29=api'));
});

test('seis estrelas ficam equidistantes por fases de um sexto do ciclo',()=>{
 for(const marker of['nth-child(1){animation-delay:0s}','nth-child(2){animation-delay:-.766667s}','nth-child(3){animation-delay:-1.533333s}','nth-child(4){animation-delay:-2.3s}','nth-child(5){animation-delay:-3.066667s}','nth-child(6){animation-delay:-3.833333s}'])assert.ok(css.includes(marker),marker);
 assert.ok(css.includes('animation:p30GenesisPlatinumStar 4.6s linear infinite'));
});

test('elipse gira como guia invisível',()=>{
 const block=css.match(/\.avatar-frame\.frame-genese-celestial>\.genese-atom-track\{([\s\S]*?)\n\}/)?.[1]||'';
 assert.match(block,/width:145%/);
 assert.match(block,/height:112%/);
 assert.match(block,/border:0!important/);
 assert.match(block,/background:transparent!important/);
 assert.match(block,/box-shadow:none!important/);
 assert.match(block,/filter:none!important/);
 assert.match(block,/animation:p29GenesisOrbitPlane 8\.4s linear infinite/);
});

test('Gênese não desenha segunda borda sobre o arco Celestial',()=>{
 const block=css.match(/\.avatar-frame\.frame-genese-celestial\{([\s\S]*?)\n\}/)?.[1]||'';
 assert.match(block,/border:0!important/);
 assert.match(block,/outline:0!important/);
 assert.match(block,/background:transparent!important/);
 assert.doesNotMatch(block,/0 0 0 1px/);
 assert.ok(css.includes('@keyframes p31GenesisBreath'));
});

test('reduced-motion congela plano e seis estrelas em posições estáveis',()=>{
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert.ok(css.includes('nth-child(1){left:100%;top:50%}'));
 assert.ok(css.includes('nth-child(6){left:75%;top:93.3%}'));
});

test('P29/P30/P31 usam um owner CSS e JS canônicos; P75 é corrente',()=>{
 assert.ok(shim.includes('genesisAtomicCurrent.css'));
 assert.ok(index.includes('css/p29.css?v=1.4.31'));
 assert.ok(index.includes('js/domains/genesisFrameUI.js?v=domain-2'));
 assert.ok(notifications.includes('release:p31'));
 assert.ok(notifications.includes("version:'v1.4.31'"));
 assert.ok(notifications.includes('Seis estrelas orbitais da Gênese'));
 assert.ok(version.includes('releaseP75'));
});
