'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'public/js/notificationsUI.js'),'utf8');

test('Central de Notificações compila sem observer global de DOM',()=>{
  assert.doesNotThrow(()=>new Function(src));
  assert.doesNotMatch(src,/new\s+MutationObserver/);
  assert.doesNotMatch(src,/observe\(document\.body/);
});

test('botão de notificações acompanha renderAccount sem tempestade de microtasks',()=>{
  assert.match(src,/const baseRenderAccount=HomeScreen\.renderAccount\.bind\(HomeScreen\)/);
  assert.match(src,/HomeScreen\.renderAccount=function/);
  assert.match(src,/queueMicrotask\(\(\)=>N\.ensureButton\(\)\)/);
});

test('badge só escreve no DOM quando valor realmente mudou',()=>{
  assert.match(src,/if\(b\.hidden!==hidden\)b\.hidden=hidden/);
  assert.match(src,/if\(b\.textContent!==label\)b\.textContent=label/);
});
