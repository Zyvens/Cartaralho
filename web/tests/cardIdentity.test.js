'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const identity=require('../lib/cardIdentity');
const rewards=require('../lib/gameLogic');

test('identidade ignora caixa e espaços não significativos',()=>{assert.equal(identity.sameCanonicalCard('whiteCards','Minha Carta','white','  MINHA   CARTA '),true);});
test('NFKC unifica representações equivalentes',()=>{assert.equal(identity.sameCanonicalCard('blackCards','ＡＢＣ','black','ABC'),true);});
test('pontuação e acentos permanecem significativos',()=>{assert.equal(identity.sameCanonicalCard('white','Voce?','white','Você?'),false);assert.equal(identity.sameCanonicalCard('white','Você?','white','Você!'),false);});
test('carta branca e preta nunca colidem',()=>{assert.equal(identity.sameCanonicalCard('white','Mesmo texto','black','Mesmo texto'),false);});
test('controles e caracteres invisíveis não alteram a identidade',()=>{assert.equal(identity.sameCanonicalCard('white','A\u0001 B\u200B','whiteCards','A B'),true);});
test('autoria só é original na partida de origem conhecida',()=>{assert.equal(identity.creationKind({origin_match_id:'ABC123',origin_uncertain:false},'ABC123'),'original');assert.equal(identity.creationKind({origin_match_id:'ABC123',origin_uncertain:false},'XYZ999'),'independent');assert.equal(identity.creationKind({origin_match_id:null,origin_uncertain:true},'ABC123'),'independent');});
test('servidor decide criação pela posse anterior',()=>{assert.equal(identity.submissionIsCreation(42,false),true);assert.equal(identity.submissionIsCreation(42,true),false);assert.equal(identity.submissionIsCreation(null,false),false);});

test('curva econômica mantém referências v1',()=>{
 const cases=[[3,3,[8,4,2],0],[5,6,[42,21,11],0],[10,3,[71,35,19],0],[10,6,[150,75,40],0],[10,10,[260,130,69],37],[15,6,[314,157,84],55],[15,10,[545,273,145],132],[20,6,[531,265,141],127],[20,10,[921,461,246],257]];
 for(const[points,players,placement,survival]of cases){const c=rewards.rewardCurve(points,players);assert.deepEqual(c.placement,placement);assert.equal(c.survival,survival);}
});

test('payout soma colocação, sobrevivência e consolação',()=>{const c=rewards.rewardCurve(20,10);assert.deepEqual(rewards.payoutForPosition(1,10,c,true),{placement:921,survival:257,consolation:0,total:1178});assert.deepEqual(rewards.payoutForPosition(10,10,c,true),{placement:0,survival:257,consolation:1,total:258});assert.deepEqual(rewards.payoutForPosition(10,10,c,false),{placement:0,survival:0,consolation:1,total:1});});
