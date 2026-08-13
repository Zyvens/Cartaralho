'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const identity=require('../lib/cardIdentity');

test('identidade ignora caixa e espaços não significativos',()=>{
 assert.equal(identity.sameCanonicalCard('whiteCards','Minha Carta','white','  MINHA   CARTA '),true);
});

test('NFKC unifica representações equivalentes',()=>{
 assert.equal(identity.sameCanonicalCard('blackCards','ＡＢＣ','black','ABC'),true);
});

test('pontuação e acentos permanecem significativos',()=>{
 assert.equal(identity.sameCanonicalCard('white','Voce?','white','Você?'),false);
 assert.equal(identity.sameCanonicalCard('white','Você?','white','Você!'),false);
});

test('carta branca e preta nunca colidem',()=>{
 assert.equal(identity.sameCanonicalCard('white','Mesmo texto','black','Mesmo texto'),false);
});

test('autoria só é original na partida de origem conhecida',()=>{
 assert.equal(identity.creationKind({origin_match_id:'ABC123',origin_uncertain:false},'ABC123'),'original');
 assert.equal(identity.creationKind({origin_match_id:'ABC123',origin_uncertain:false},'XYZ999'),'independent');
 assert.equal(identity.creationKind({origin_match_id:null,origin_uncertain:true},'ABC123'),'independent');
});
