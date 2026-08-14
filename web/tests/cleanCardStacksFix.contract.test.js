'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/cleanCardStacksFix.js');
const css=read('public/css/cleanCardStacksFix.css');
const html=read('public/index.html');

test('fix das pilhas compila e carrega por último',()=>{
  assert.doesNotThrow(()=>new Function(js));
  assert.match(html,/css\/cleanCardStacksFix\.css/);
  assert.match(html,/js\/refinementP13\.js[^]*js\/cleanCardStacksFix\.js/);
});

test('substitui explicitamente os contadores legados pelas pilhas',()=>{
  assert.match(js,/Cartas Limpas Brancas/);
  assert.match(js,/Cartas Limpas Pretas/);
  assert.match(js,/closest\('\.account-card'\)/);
  assert.match(js,/clean-stack-grid-live/);
  assert.match(js,/clean-stack-sheet/);
  assert.match(js,/clean-stack-empty/);
});

test('saldo zero usa slot pontilhado e consumo possui animação',()=>{
  assert.match(css,/border:2px dashed/);
  assert.match(css,/cleanCardSpent/);
  assert.match(js,/previous\.white/);
  assert.match(js,/previous\.black/);
  assert.match(js,/white<previous\.white/);
  assert.match(js,/black<previous\.black/);
});

test('pilha mostra profundidade sem renderizar centenas de nós',()=>{
  assert.match(js,/Math\.min\(n,12\)/);
  assert.match(js,/clean-stack-depth/);
  assert.match(js,/\+\$\{n-visible\}/);
});
