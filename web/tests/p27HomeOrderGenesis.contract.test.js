'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/homeMenuP27.js');
const css=read('public/css/p27.css');
const index=read('public/index.html');

test('P27 compila e continua carregado',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(index.includes('css/p27.css?v=1.4.53'));
 assert.ok(index.includes('js/homeMenuP27.js?v=1.4.53'));
});

test('Notificações ficam imediatamente antes de Histórico',()=>{
 const notification=css.indexOf('#notifications-menu-btn{order:5!important}');
 const history=css.indexOf('[data-panel="history"]{order:6!important}');
 assert.ok(notification>=0&&history>notification);
 const njs=js.indexOf("'#notifications-menu-btn'");
 const hjs=js.indexOf("'[data-panel=\"history\"]'");
 assert.ok(njs>=0&&hjs>njs);
});

test('P27 segue como único reconciliador estável',()=>{
 assert.ok(js.includes('new MutationObserver'));
 assert.ok(js.includes("document.getElementById('home-main')"));
 assert.ok(js.includes('mainObserver?.disconnect()'));
 assert.ok(!js.includes('observe(document.body'));
});

test('Gênese preserva a órbita histórica',()=>{
 assert.ok(css.includes('.avatar-frame.frame-genese-celestial::after'));
 assert.ok(css.includes('animation:p27GenesisOrbitalGlint 5.2s linear infinite!important'));
 assert.ok(css.includes('25%{background-position:50% 0%;background-size:17px 17px'));
 assert.ok(css.includes('75%{background-position:50% 100%;background-size:17px 17px'));
});
