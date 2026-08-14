'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/audioIntegrationP13.js');
const html=read('public/index.html');

test('integração final de áudio compila e carrega após refinamento',()=>{
  assert.doesNotThrow(()=>new Function(js));
  assert.match(html,/js\/refinementP13\.js[^]*js\/audioIntegrationP13\.js/);
});

test('primeira migração de preferências respeita mute legado',()=>{
  assert.match(js,/cartaralho:audio-settings:v1/);
  assert.match(js,/cartaralho:music-muted:v1/);
  assert.match(js,/localStorage\.getItem\(LEGACY_MUTE_KEY\)!=='1'/);
});

test('modais gerais recebem sons de abrir e fechar sem alterar o componente base',()=>{
  assert.match(js,/Modal\.show/);
  assert.match(js,/Modal\.hide/);
  assert.match(js,/modal_open/);
  assert.match(js,/modal_close/);
  assert.match(js,/profile-modal-overlay/);
  assert.match(js,/market-overlay/);
  assert.match(js,/buff-drawer-shell/);
});
