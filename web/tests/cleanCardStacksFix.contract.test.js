'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const legacy=read('public/js/cleanCardStacksFix.js');
const css=read('public/css/cleanCardStacksFix.css');
const screen=read('public/js/screens/cardCreation.js');
const domain=read('public/js/domains/cardCreationUI.js');
const html=read('public/index.html');

test('pilhas são fonte do CardCreationScreen e owner final compila',()=>{
 assert.doesNotThrow(()=>new Function(domain));
 assert.match(screen,/cleanStack\(type,count\)/);
 assert.match(screen,/clean-stack-grid-live/);
 assert.match(screen,/clean-stack-sheet/);
 assert.match(screen,/clean-stack-empty/);
 assert.match(html,/css\/cleanCardStacksFix\.css/);
});

test('hotfix antigo permanece apenas para rastreabilidade',()=>{
 assert.doesNotThrow(()=>new Function(legacy));
 assert.doesNotMatch(html,/<script\s+src="js\/cleanCardStacksFix\.js/);
 assert.match(html,/type="application\/x-cartaralho-legacy" src="js\/cleanCardStacksFix\.js/);
});

test('saldo zero, profundidade e animação continuam preservados',()=>{
 assert.match(css,/border:2px dashed/);
 assert.match(css,/cleanCardSpent/);
 assert.match(screen,/Math\.min\(n,12\)/);
 assert.match(screen,/clean-stack-depth/);
 assert.match(screen,/\+\$\{n-visible\}/);
});

test('owner preserva uma única pilha ativa e largura integral',()=>{
 assert.match(domain,/enforceSingleCleanStack/);
 assert.match(domain,/clean-stack-white/);
 assert.match(domain,/clean-stack-black/);
 assert.match(domain,/gridTemplateColumns='minmax\(0,1fr\)'/);
});
