'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('public/index.html'),base=read('public/css/account.css'),current=read('public/css/accountCurrent.css'),p73=read('public/css/p73.css'),p74=read('public/css/p74.css');

test('owner visual atual contém integralmente os contratos P73/P74',()=>{
 for(const marker of['home-account-balance','p56-account-action-icon','p56-account-action-copy','p74-account-strip','p74-wallet-slot','p56-account-actions','p49-balance-value'])assert.ok(current.includes(marker),marker);
 assert.match(current,/order:30!important/);assert.match(current,/order:40!important/);assert.match(current,/@media\(max-width:620px\)/);
});

test('P73 não contém mais regra funcional e P74 é somente shim de import',()=>{
 assert.match(p73,/HISTORICAL P73/);assert.doesNotMatch(p73,/\{[^}]+\}/);
 assert.match(p74,/COMPAT P74/);assert.match(p74,/^\/\*[\s\S]*\*\/\s*@import url\('\.\/accountCurrent\.css'\);\s*$/);
 assert.doesNotMatch(p74,/p74-wallet-slot\s*\{/);
});

test('shim preserva a posição final da cascata histórica sem antecipar regras no account base',()=>{
 const basePos=index.indexOf('css/account.css'),p73Pos=index.indexOf('css/p73.css?v=1.4.73'),p74Pos=index.indexOf('css/p74.css?v=1.4.74');
 assert.ok(basePos>=0&&p73Pos>basePos&&p74Pos>p73Pos);
 assert.doesNotMatch(base,/p74-wallet-slot/);assert.doesNotMatch(base,/p56-account-action-copy[\s\S]*display:none!important/);
});
