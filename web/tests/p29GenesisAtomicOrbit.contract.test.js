'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/genesisFrameP29.js'),owner=read('public/js/domains/genesisFrameUI.js'),shim=read('public/css/p29.css'),css=read('public/css/genesisAtomicCurrent.css'),index=read('public/index.html'),notifications=read('lib/appNotifications.js'),version=read('api/version.js');

test('P29 separa trilha e estrelas em elementos reais pelo owner genesisFrameUI',()=>{
 assert.doesNotThrow(()=>new Function(owner));
 assert.ok(owner.includes("const SELECTOR='.avatar-frame.frame-genese-celestial',STAR='✦',STAR_COUNT=6"));
 assert.ok(owner.includes("track.className='genese-atom-track'"));
 assert.ok(owner.includes("particle.className='genese-atom-particle genese-atom-star'"));
 assert.ok(owner.includes('track.appendChild(particle)'));
 assert.ok(owner.includes('frame.appendChild(track)'));
 assert.ok(css.includes('frame-genese-celestial::after'));
 assert.ok(css.includes('content:none!important'));
});

test('órbita final é elíptica e gira independentemente do arco Celestial',()=>{
 assert.ok(css.includes('width:145%'));
 assert.ok(css.includes('height:112%'));
 assert.ok(css.includes('border-radius:50%'));
 assert.ok(css.includes('animation:p29GenesisOrbitPlane 8.4s linear infinite'));
 assert.ok(css.includes('@keyframes p29GenesisOrbitPlane'));
 assert.ok(css.includes('rotate(-28deg)'));
 assert.ok(css.includes('rotate(332deg)'));
 assert.ok(shim.includes('genesisAtomicCurrent.css'));
});

test('estrelas percorrem a elipse e pulsam no resultado final',()=>{
 assert.ok(css.includes('animation:p30GenesisPlatinumStar 4.6s linear infinite'));
 for(const marker of['0%{left:100%;top:50%','25%{left:50%;top:0%','50%{left:0%;top:50%','75%{left:50%;top:100%','100%{left:100%;top:50%'])assert.ok(css.includes(marker),marker);
});

test('decorador cobre frames existentes e novos sem loop de atributos',()=>{
 assert.ok(owner.includes('decorate(document)'));
 assert.ok(owner.includes('record.addedNodes'));
 assert.ok(owner.includes("observer.observe(document.body,{childList:true,subtree:true})"));
 assert.ok(!owner.includes('attributes:true'));
 assert.ok(owner.includes("querySelector(':scope > .genese-atom-track')"));
});

test('implementação genesisFrameP29 é apenas proveniência não executável',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/genesisFrameP29.js"'));
 assert.ok(!index.includes('<script src="js/genesisFrameP29.js'));
 assert.ok(index.includes('js/domains/genesisFrameUI.js?v=domain-2'));
});

test('release P29 permanece registrada e P75 é corrente',()=>{
 assert.ok(notifications.includes('release:p29'));
 assert.ok(notifications.includes("version:'v1.4.29'"));
 assert.ok(notifications.includes('Gênese com órbita atômica real'));
 assert.ok(version.includes('releaseP75'));
});
