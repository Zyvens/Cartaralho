'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const config=require('../lib/roomConfig');
const compat=require('../lib/roomConfigP7');

function room(overrides={}){return{creatorId:'1',state:'aguardando_jogadores',maxPlayers:6,pointsToWin:10,handSize:5,useStandardDeck:true,cardCreationEnabled:true,playerCardsEnabled:true,afkEnabled:true,buffsEnabled:false,rewardConfigSnapshot:null,players:new Map([['1',{active:true}],['2',{active:true}],['3',{active:true}]]),...overrides};}

test('P7 é alias do owner canônico de configuração de sala',()=>{
 assert.equal(compat.initial,config.initial);
 assert.equal(compat.apply,config.apply);
 assert.equal(compat.publicConfig,config.publicConfig);
});

test('normalização permite AFK desligado e mantém buffs apenas como flag',()=>{
 const c=config.initial({maxPlayers:10,pointsToWin:20,handSize:15,afkEnabled:false,cardCreationEnabled:false,playerCardsEnabled:false,buffsEnabled:true});
 assert.equal(c.maxPlayers,10);assert.equal(c.pointsToWin,20);assert.equal(c.handSize,15);assert.equal(c.afkEnabled,false);assert.equal(c.cardCreationEnabled,false);assert.equal(c.playerCardsEnabled,false);assert.equal(c.buffsEnabled,true);
});

test('criador consegue alterar todas as regras antes do início',()=>{
 const r=room();config.apply(r,'1',{maxPlayers:8,pointsToWin:15,handSize:12,afkEnabled:false,cardCreationEnabled:false,playerCardsEnabled:false,useStandardDeck:false,buffsEnabled:true});
 assert.equal(r.maxPlayers,8);assert.equal(r.pointsToWin,15);assert.equal(r.handSize,12);assert.equal(r.afkEnabled,false);assert.equal(r.cardCreationEnabled,false);assert.equal(r.playerCardsEnabled,false);assert.equal(r.useStandardDeck,false);assert.equal(r.buffsEnabled,true);
});

test('não permite reduzir capacidade abaixo dos participantes atuais',()=>{const r=room({maxPlayers:8,players:new Map([['1',{active:true}],['2',{active:true}],['3',{active:true}],['4',{active:true}]])});assert.throws(()=>config.apply(r,'1',{maxPlayers:3}),/participantes atuais/);assert.equal(r.maxPlayers,8);});
test('snapshot econômico trava alterações posteriores',()=>{const r=room({rewardConfigSnapshot:{pointsToWin:10,participantsAtStart:3}});assert.throws(()=>config.apply(r,'1',{pointsToWin:20}),/não podem ser alteradas/);assert.equal(r.pointsToWin,10);});
test('não criador não altera regras',()=>{const r=room();assert.throws(()=>config.apply(r,'2',{pointsToWin:20}),/Apenas o criador/);assert.equal(r.pointsToWin,10);});
