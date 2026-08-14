'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sfx=read('public/js/sfx.js');
const buffsApi=read('api/buffs.js');

test('SFX aceita frequências em Hz sem tratá-las como MIDI',()=>{
  assert.match(sfx,/function frequency\(value\)\{const n=Number\(value\);return n>127\?n:midi\(n\);\}/);
  assert.match(sfx,/censor\(\)\{tone\(1000/);
});

test('preferência antiga de mute migra sem desmutar o usuário',()=>{
  assert.match(sfx,/LEGACY_MUTE_KEY='cartaralho:music-muted:v1'/);
  assert.match(sfx,/stored===null\?!legacyMuted/);
  assert.match(sfx,/localStorage\.getItem\(LEGACY_MUTE_KEY\)/);
});

test('primeiro SFX não é bloqueado pelo cooldown',()=>{
  assert.match(sfx,/last=recent\.get\(key\)/);
  assert.match(sfx,/last!==undefined&&now-last<cooldown/);
});

test('eventos de BUFF carregam activationId e deduplicam áudio local/remoto',()=>{
  assert.match(buffsApi,/buff_resolved'\s*,\s*\{buffKey:'buff_mao_de_vaca',activationId/);
  assert.match(buffsApi,/buff_activated'\s*,\s*\{buffKey,activationId/);
  assert.match(sfx,/seenBuffEvents/);
  assert.match(sfx,/rememberBuffEvent/);
  assert.match(sfx,/SocketClient\?\.on\?\.\('buff_activated',handleBuffEvent\)/);
  assert.match(sfx,/SocketClient\?\.on\?\.\('buff_resolved',handleBuffEvent\)/);
});

test('hotfix não cria novos BUFFs nem altera catálogo econômico',()=>{
  const buffKeys=[...sfx.matchAll(/buff_[a-z0-9_]+:\{name:/g)].map(x=>x[0]);
  assert.equal(buffKeys.length,21);
  assert.doesNotMatch(buffsApi,/price|market_catalog|dirty_coin/i);
});
