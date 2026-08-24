'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('public/css/cleanCardStacksFix.css');
const lobby=read('public/js/screens/cardCreation.js');
const domain=read('public/js/domains/cardCreationUI.js');
const html=read('public/index.html');

test('criador do lobby mantém tabs e pilhas identificáveis',()=>{
 assert.match(lobby,/card-type-tab-black active/);
 assert.match(lobby,/card-type-tab-white/);
 assert.match(lobby,/cleanStack\('white'/);
 assert.match(lobby,/cleanStack\('black'/);
});

test('owner canônico controla a visibilidade por tipo em qualquer criador',()=>{
 assert.match(domain,/function enforceSingleCleanStack/);
 assert.match(domain,/activeType\(\)/);
 assert.match(domain,/clean-stack-white/);
 assert.match(domain,/clean-stack-black/);
 assert.match(domain,/el\.hidden=type!=='white'/);
 assert.match(domain,/el\.hidden=type!=='black'/);
 assert.match(domain,/gridTemplateColumns='minmax\(0,1fr\)'/);
});

test('CSS mantém fallback P74 e o hotfix JS antigo não executa',()=>{
 assert.match(css,/:has\(\.card-type-tab-black\.active\)[^\n]*\.clean-stack-white/);
 assert.match(css,/:has\(\.card-type-tab-white\.active\)[^\n]*\.clean-stack-black/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.doesNotMatch(html,/<script\s+src="js\/cleanCardStacksFix\.js/);
 assert.match(html,/type="application\/x-cartaralho-legacy" src="js\/cleanCardStacksFix\.js/);
});
