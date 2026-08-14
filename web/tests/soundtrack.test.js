'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const soundtrack=fs.readFileSync(path.join(__dirname,'..','public','js','soundtrack.js'),'utf8');

test('trilha do Cartaralho usa andamento alto e loop expandido',()=>{
  const bpm=Number(soundtrack.match(/const BPM=(\d+);/)?.[1]);
  const steps=Number(soundtrack.match(/const LOOP_STEPS=(\d+);/)?.[1]);
  assert.ok(bpm>=160,`BPM esperado >= 160, recebido ${bpm}`);
  assert.ok(steps>=64,`loop esperado >= 64 passos, recebido ${steps}`);
});

test('arranjo possui bateria, baixo, staccato e viradas caóticas',()=>{
  for(const token of ['function kick(','function snare(','function hat(','function bass(','function chordStab(','function chaosFill('])assert.match(soundtrack,new RegExp(token.replace(/[()]/g,'\\$&')));
  assert.match(soundtrack,/bassOffsets/);
  assert.match(soundtrack,/leadGate/);
  assert.doesNotMatch(soundtrack,/function padChord\(/);
});

test('controles de áudio e preferência de mute permanecem compatíveis',()=>{
  assert.match(soundtrack,/cartaralho:music-muted:v1/);
  assert.match(soundtrack,/game-audio-toggle/);
  assert.match(soundtrack,/visibilitychange/);
  assert.match(soundtrack,/CartSoundtrack/);
  assert.match(soundtrack,/pointerdown/);
  assert.match(soundtrack,/keydown/);
});
