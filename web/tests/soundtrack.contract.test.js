'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/soundtrack.js');
const css=read('public/css/soundtrack.css');
const settings=read('public/js/refinementP13.js');
const html=read('public/index.html');

test('trilha usa Web Audio e não depende de mídia externa',()=>{
  assert.match(js,/AudioContext\|\|window\.webkitAudioContext/);
  assert.match(js,/createOscillator/);
  assert.match(js,/createDynamicsCompressor/);
  assert.doesNotMatch(js,/\.mp3|\.ogg|\.wav|fetch\(/i);
});

test('autoplay respeita gesto exigido por navegadores móveis',()=>{
  assert.match(js,/pointerdown/);
  assert.match(js,/keydown/);
  assert.match(js,/\.resume\(\)/);
});

test('mute persiste e permanece disponível para Configurações via API',()=>{
  assert.match(js,/cartaralho:music-muted:v1/);
  assert.match(js,/localStorage\.getItem/);
  assert.match(js,/localStorage\.setItem/);
  assert.match(js,/CartSoundtrack/);
  assert.match(js,/mute\(\)\{return setMuted\(true\);\}/);
  assert.match(js,/unmute\(\)\{return setMuted\(false\);\}/);
  assert.match(js,/setVolume/);
});

test('controle flutuante legado não é recriado nem ocupa o topo',()=>{
  assert.doesNotMatch(js,/game-audio-toggle|installButton|document\.body\.appendChild/);
  assert.doesNotMatch(css,/position:fixed|safe-area-inset-top|safe-area-inset-right|z-index:16000/);
  assert.match(css,/\.game-audio-toggle\{display:none!important\}/);
});

test('volume, música e efeitos ficam centralizados em Configurações',()=>{
  assert.match(settings,/audio-settings-menu-btn/);
  assert.match(settings,/Volume geral/);
  assert.match(settings,/Volume da música/);
  assert.match(settings,/Efeitos sonoros/);
  assert.match(settings,/Volume dos efeitos/);
  assert.match(settings,/data-audio-toggle="music"/);
  assert.match(settings,/data-audio-toggle="sfx"/);
});

test('assets de soundtrack são carregados globalmente',()=>{
  assert.match(html,/css\/soundtrack\.css/);
  assert.match(html,/js\/soundtrack\.js/);
});
