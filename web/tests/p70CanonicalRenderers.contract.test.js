'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('public/js/p70.js'),index=read('public/index.html');

test('P70 compila e carrega depois do P69',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(index.indexOf('js/p70.js?v=1.4.70')>index.indexOf('js/p69.js?v=1.4.69'));
});

test('Estatísticas usa o renderer canônico sem patches de DOM',()=>{
 assert.match(js,/HomeScreen\.renderStats=renderStats/);
 assert.match(js,/return MetaUI\.renderStats\(panel\)/);
 assert.doesNotMatch(js,/MutationObserver/);
 assert.doesNotMatch(js,/window\.HomeScreen/);
});

test('Minhas Cartas usa renderer canônico em todos os caminhos',()=>{
 assert.match(js,/ProfessionalUI\.renderCards=renderCards/);
 assert.match(js,/HomeScreen\.renderCards=renderCards/);
 assert.match(js,/CartP56\.Library\.render=renderCards/);
});

test('cartas de jogador não exibem pill redundante nem rodapé técnico',()=>{
 assert.match(js,/Criado por \$\{esc\(creatorLabel\(c\)\)\}/);
 assert.doesNotMatch(js,/DE JOGADOR/);
 assert.doesNotMatch(js,/contorno/);
 assert.doesNotMatch(js,/partida\$\{/);
});
