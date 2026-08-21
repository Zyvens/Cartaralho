'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('node:path');
const config=require('../lib/roomConfig');
const contribution=require('../lib/playerContribution');
const{GAME_STATES}=require('../lib/constants');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),roomUI=read('public/js/domains/roomUI.js');
const flags=['useStandardDeck','cardCreationEnabled','playerCardsEnabled','afkEnabled','buffsEnabled','narratorEnabled'];
function room(overrides={}){return{creatorId:'1',state:GAME_STATES.AGUARDANDO_JOGADORES,maxPlayers:6,pointsToWin:10,handSize:5,useStandardDeck:true,cardCreationEnabled:true,playerCardsEnabled:true,afkEnabled:true,buffsEnabled:false,narratorEnabled:false,rewardConfigSnapshot:null,players:new Map([['1',{active:true}],['2',{active:true}],['3',{active:true}]]),...overrides};}

test('as 64 combinações booleanas round-tripam sem acoplamento oculto',()=>{
 for(let mask=0;mask<64;mask++){
  const input={};flags.forEach((k,i)=>input[k]=!!(mask&(1<<i)));
  const initial=config.initial(input),r=room(initial),pub=config.publicConfig(r);
  for(const key of flags)assert.equal(initial[key],input[key],`${mask}:${key}:initial`),assert.equal(pub[key],input[key],`${mask}:${key}:public`);
 }
});

test('limites numéricos são estáveis e independentes das flags',()=>{
 assert.deepEqual(config.initial({maxPlayers:-10,pointsToWin:0,handSize:0}),{maxPlayers:3,pointsToWin:3,handSize:5,useStandardDeck:true,cardCreationEnabled:true,playerCardsEnabled:true,afkEnabled:true,buffsEnabled:false,narratorEnabled:false});
 const hi=config.initial({maxPlayers:99,pointsToWin:99,handSize:99});assert.equal(hi.maxPlayers,10);assert.equal(hi.pointsToWin,20);assert.equal(hi.handSize,15);
});

test('criador pode aplicar qualquer combinação antes do início e ninguém altera após snapshot',()=>{
 for(let mask=0;mask<64;mask++){
  const partial={};flags.forEach((k,i)=>partial[k]=!!(mask&(1<<i)));const r=room();config.apply(r,'1',partial);for(const key of flags)assert.equal(r[key],partial[key],`${mask}:${key}`);
 }
 assert.throws(()=>config.apply(room(),'2',{buffsEnabled:true}),/Apenas o criador/);
 assert.throws(()=>config.apply(room({rewardConfigSnapshot:{pointsToWin:10}}),'1',{buffsEnabled:true}),/não podem ser alteradas/);
 assert.throws(()=>config.apply(room({state:GAME_STATES.EM_ANDAMENTO}),'1',{buffsEnabled:true}),/não podem ser alteradas/);
});

test('capacidade nunca pode cair abaixo dos jogadores ativos',()=>{
 const r=room({maxPlayers:8,players:new Map([['1',{active:true}],['2',{active:true}],['3',{active:true}],['4',{active:true}],['5',{active:false}]])});
 assert.throws(()=>config.apply(r,'1',{maxPlayers:3}),/participantes atuais/);config.apply(r,'1',{maxPlayers:4});assert.equal(r.maxPlayers,4);
});

test('criação de novas cartas e uso de cartas antigas são flags independentes',()=>{
 const noCreation=config.initial({cardCreationEnabled:false,playerCardsEnabled:true});assert.equal(noCreation.cardCreationEnabled,false);assert.equal(noCreation.playerCardsEnabled,true);assert.equal(contribution.requirementEnabled(noCreation),false);
 const noOwnedReuse=config.initial({cardCreationEnabled:true,playerCardsEnabled:false});assert.equal(noOwnedReuse.cardCreationEnabled,true);assert.equal(noOwnedReuse.playerCardsEnabled,false);assert.equal(contribution.requirementEnabled(noOwnedReuse),true);
});

test('owner de sala recebe config completa e sincroniza sem criar writer paralelo',()=>{
 assert.match(roomUI,/App\.state\.config=\{\.\.\.\(App\.state\.config\|\|\{\}\),\.\.\.config\}/);
 assert.match(roomUI,/SocketClient\.on\('room_config_updated',data=>applyConfig\(data\)\)/);
 assert.match(roomUI,/SocketClient\.__domainRoomConfig=true/);
 assert.match(roomUI,/if\(config\.narratorEnabled===false\)window\.CartNarrator\?\.cancel\?\.\(\)/);
});
