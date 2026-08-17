'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p52.js');
const p24=read('public/js/homeMenuP24.js');
const p25=read('public/js/uiP25.js');
const p27=read('public/js/homeMenuP27.js');
const p50=read('public/js/p50.js');
const presence=read('lib/presence.js');
const index=read('public/index.html');

test('P52 continua compilando e preserva as recompensas',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(js.includes('p52-mission-coin-pill'));
 assert.ok(js.includes('mission-xp-pill'));
});

test('um único observer continua dono da ordem atual',()=>{
 assert.ok(!p24.includes('new MutationObserver'));
 assert.ok(!p25.includes('new MutationObserver'));
 assert.ok(!p50.includes('new MutationObserver'));
 assert.ok(p27.includes('mainObserver?.disconnect()'));
 for(const src of[p24,p25,p27,p50]){
  const n=src.indexOf('#notifications-menu-btn');
  const h=src.indexOf('[data-panel="history"]');
  assert.ok(n>=0&&h>n);
 }
});

test('fundo dinâmico continua sendo destruído ao sair da Home',()=>{
 assert.ok(js.includes('stopDynamicBackground'));
 assert.ok(js.includes('clearInterval(this.bgInterval)'));
 assert.ok(js.includes('__p52BgGeneration'));
});

test('retorno à Home continua reutilizando sessão',()=>{
 assert.ok(js.includes('if(this.user&&this.token)return this.user'));
 assert.ok(js.includes('CartP49?.ensureBalanceSlot'));
 assert.ok(js.includes('CartP37?.ensureAdminButton'));
});

test('presença continua tolerando corrida de DDL',()=>{
 assert.ok(presence.includes('23505'));
 assert.ok(presence.includes('42P07'));
 assert.ok(presence.includes('ready=null'));
});

test('assets P52 continuam presentes após P53',()=>{
 assert.ok(index.includes('css/p52.css?v=1.4.52'));
 assert.ok(index.includes('js/p52.js?v=1.4.52'));
 assert.ok(index.includes('css/p53.css?v=1.4.53'));
 assert.ok(index.includes('js/p53.js?v=1.4.53'));
});
