'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/cleanCardStacksFix.css');
const lobby=read('public/js/screens/cardCreation.js');
const library=read('public/js/p58.js');

test('criador do lobby mantém tabs de tipo e pilhas identificáveis',()=>{
  assert.match(lobby,/card-type-tab-black active/);
  assert.match(lobby,/card-type-tab-white/);
  assert.match(lobby,/cleanStack\('white'/);
  assert.match(lobby,/cleanStack\('black'/);
});

test('criador de Minhas Cartas mantém o mesmo estado ativo por tipo',()=>{
  assert.match(library,/card-type-tab-black \$\{isBlack\?'active':''\}/);
  assert.match(library,/card-type-tab-white \$\{!isBlack\?'active':''\}/);
  assert.match(library,/p58-clean-stack-grid/);
});

test('somente a pilha correspondente à aba ativa permanece visível',()=>{
  assert.match(css,/:has\(\.card-type-tab-black\.active\)[^\n]*\.clean-stack-white/);
  assert.match(css,/:has\(\.card-type-tab-white\.active\)[^\n]*\.clean-stack-black/);
  assert.match(css,/p58-clean-fallback\.white\{display:none!important\}/);
  assert.match(css,/p58-clean-fallback\.black\{display:none!important\}/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
});
