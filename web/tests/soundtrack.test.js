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

test('preferências e API de áudio permanecem compatíveis sem botão flutuante',()=>{
  assert.match(soundtrack,/cartaralho:music-muted:v1/);
  assert.match(soundtrack,/visibilitychange/);
  assert.match(soundtrack,/CartSoundtrack/);
  assert.match(soundtrack,/mute\(\)\{return setMuted\(true\);\}/);
  assert.match(soundtrack,/unmute\(\)\{return setMuted\(false\);\}/);
  assert.match(soundtrack,/pointerdown/);
  assert.match(soundtrack,/keydown/);
  assert.doesNotMatch(soundtrack,/game-audio-toggle|installButton|document\.body\.appendChild/);
});
