'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const css=fs.readFileSync(path.join(__dirname,'..','public','css','marketplace.css'),'utf8');

test('Marketplace mobile usa viewport dinâmica e safe areas do iOS',()=>{
  assert.match(css,/100dvh/);
  assert.match(css,/safe-area-inset-top/);
  assert.match(css,/safe-area-inset-bottom/);
  assert.match(css,/safe-area-inset-left/);
  assert.match(css,/safe-area-inset-right/);
});

test('header e abas não encolhem quando a altura é curta',()=>{
  assert.match(css,/\.market-head\{[^}]*flex:0 0 auto/);
  assert.match(css,/\.market-tabs\{[^}]*flex:0 0 auto/);
  assert.match(css,/\.market-body\{[^}]*min-height:0[^}]*flex:1 1 auto/);
});

test('abas permanecem inteiras e podem rolar horizontalmente',()=>{
  assert.match(css,/\.market-tabs\{[^}]*overflow-x:auto[^}]*overflow-y:hidden/);
  assert.match(css,/\.market-tab\{[^}]*white-space:nowrap[^}]*flex:0 0 auto/);
});

test('iPhone em landscape recebe cabeçalho compacto em viewport baixa',()=>{
  assert.match(css,/@media\(max-height:500px\) and \(max-width:900px\)/);
  assert.match(css,/\.market-head-copy p\{display:none\}/);
  assert.match(css,/\.market-shell\{width:100%;height:calc\(100dvh/);
});
