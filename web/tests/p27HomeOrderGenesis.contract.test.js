'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const history=read('public/js/homeMenuP27.js'),css=read('public/css/p27.css'),nav=read('public/js/domains/navigationUI.js'),atomic=read('public/css/genesisAtomicCurrent.css'),index=read('public/index.html'),version=read('api/version.js'),notifications=read('api/notifications.js');

test('ordem da Home pertence exclusivamente ao navigationUI',()=>{
 assert.doesNotThrow(()=>new Function(nav));
 const n=nav.indexOf("'#notifications-menu-btn'");
 const h=nav.indexOf("'[data-panel=\"history\"]'");
 assert.ok(n>=0&&h>n);
 assert.ok(nav.includes('function orderMenu'));
 assert.ok(nav.includes('mainObserver'));
 assert.ok(!css.includes('order:'));
});

test('órbita P27 foi supersedida pelo resultado final Gênese P29-P31',()=>{
 assert.ok(css.startsWith('/* HISTORICAL P27'));
 assert.ok(!css.includes('p27GenesisOrbitalGlint'));
 assert.ok(atomic.includes('genese-atom-track'));
 assert.ok(atomic.includes('p30GenesisPlatinumStar'));
});

test('P27 permanece apenas como proveniência não executável',()=>{
 assert.doesNotThrow(()=>new Function(history));
 assert.ok(index.includes('css/p27.css?v=1.4.53'));
 assert.ok(index.includes('type="application/x-cartaralho-legacy" src="js/homeMenuP27.js"'));
 assert.ok(!index.includes('<script src="js/homeMenuP27.js'));
 assert.ok(version.includes('releaseP75'));
 assert.ok(notifications.includes('releaseP75'));
});
