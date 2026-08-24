'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const legacy=fs.readFileSync(path.join(root,'public/js/notificationsUI.js'),'utf8');
const src=fs.readFileSync(path.join(root,'public/js/domains/notificationsUI.js'),'utf8');
const account=fs.readFileSync(path.join(root,'public/js/domains/accountUI.js'),'utf8');

test('Central de Notificações compila sem observer global de DOM',()=>{
  assert.doesNotThrow(()=>new Function(src));
  assert.doesNotMatch(src,/new\s+MutationObserver/);
  assert.doesNotMatch(src,/observe\(document\.body/);
  assert.match(legacy,/SUPERSEDED/);
});

test('accountUI é o único writer de renderAccount e monta Notificações como serviço',()=>{
  assert.match(account,/HomeScreen\.renderAccount=function/);
  assert.match(account,/NotificationsUI\?\.ensureButton/);
  assert.doesNotMatch(src,/HomeScreen\.renderAccount\s*=/);
  assert.match(src,/installAccountEntry/);
});

test('badge só escreve no DOM quando valor realmente mudou',()=>{
  assert.match(src,/if\(b\.hidden!==hidden\)b\.hidden=hidden/);
  assert.match(src,/if\(b\.textContent!==label\)b\.textContent=label/);
});
