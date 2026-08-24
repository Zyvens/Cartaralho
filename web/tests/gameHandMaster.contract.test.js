'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const handApi=fs.readFileSync(path.join(__dirname,'../api/game/hand.js'),'utf8');
const gameLogic=fs.readFileSync(path.join(__dirname,'../lib/gameLogic.js'),'utf8');
const advanced=fs.readFileSync(path.join(__dirname,'../lib/advancedRoundEngine.js'),'utf8');

test('API de mão compila e mantém resposta privada por usuário autenticado',()=>{
 assert.doesNotThrow(()=>new Function(handApi));
 assert.match(handApi,/const user=await requireUser\(req,res\)/);
 assert.match(handApi,/player=room\.players\.get\(key\)/);
 assert.doesNotMatch(handApi,/hand:Array\.from\(room\.players/);
});

test('Mestre mantém mão própria para rotação mas nunca exige submissão',()=>{
 assert.match(gameLogic,/function dealHands\(room\)\{for\(const\[,p\]of room\.players\)/);
 assert.match(advanced,/if\(r\.hostId===id\)throw new Error\('O Mestre da rodada não pode jogar cartas\.'/);
 assert.match(handApi,/if\(isHost\)\{requiredSubmissions=0;answerCount=0;\}/);
 assert.match(handApi,/canSubmitMore:!isHost&&submittedCount<requiredSubmissions/);
});

test('contrato do Mestre é equivalente entre engine legado e avançado',()=>{
 assert.match(handApi,/requiredSubmissions=isHost\?0:advanced\.required\(room\.currentRound,key\)/);
 assert.match(handApi,/answerCount=isHost\?0:advanced\.answerCount\(room\.currentRound,key\)/);
 assert.match(handApi,/else\{submittedCount=.*if\(isHost\)\{requiredSubmissions=0;answerCount=0;\}/s);
});
