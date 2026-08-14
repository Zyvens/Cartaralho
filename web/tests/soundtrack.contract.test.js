'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/soundtrack.js');
const css=read('public/css/soundtrack.css');
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

test('mute persiste e expõe controle acessível',()=>{
  assert.match(js,/cartaralho:music-muted:v1/);
  assert.match(js,/localStorage\.getItem/);
  assert.match(js,/localStorage\.setItem/);
  assert.match(js,/aria-label/);
  assert.match(js,/aria-pressed/);
  assert.match(js,/game-audio-toggle/);
});

test('botão é fixo no canto superior direito, libera Voltar e respeita safe-area',()=>{
  assert.match(css,/position:fixed/);
  assert.match(css,/top:calc\([^)]*safe-area-inset-top/);
  assert.match(css,/right:calc\([^)]*safe-area-inset-right/);
  assert.match(css,/left:auto/);
  assert.match(css,/z-index:16000/);
  assert.match(css,/@media\(max-width:600px\)/);
});

test('assets de soundtrack são carregados globalmente',()=>{
  assert.match(html,/css\/soundtrack\.css/);
  assert.match(html,/js\/soundtrack\.js/);
});
