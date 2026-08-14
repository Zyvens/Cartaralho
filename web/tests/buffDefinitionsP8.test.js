'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const{PHASES,list,get}=require('../lib/buffDefinitions');
const keys=['buff_dedo_no_olho','buff_foi_sem_querer','buff_amigo_de_merda','buff_xo_ve_aqui','buff_mao_de_vaca','buff_testemunha_protegida','buff_toque_de_midas'];

test('engine conhece exatamente os sete buffs simples do P08',()=>{
 const rows=list();assert.equal(rows.length,7);assert.deepEqual(rows.map(x=>x.key).sort(),[...keys].sort());for(const key of keys)assert.ok(get(key));
});

test('buffs de mão não são permitidos na escolha do Mestre',()=>{
 for(const key of ['buff_xo_ve_aqui','buff_mao_de_vaca','buff_toque_de_midas']){const d=get(key);assert.deepEqual(d.phases,[PHASES.HAND]);assert.equal(d.phases.includes(PHASES.MASTER_CHOICE),false);}
});

test('efeitos pós-submissão simples ficam restritos à fase de submissões',()=>{
 assert.deepEqual(get('buff_foi_sem_querer').phases,[PHASES.SUBMISSIONS]);assert.deepEqual(get('buff_testemunha_protegida').phases,[PHASES.SUBMISSIONS]);
});

test('Amigo de Merda exige alvo ainda não submetido e Xô vê aqui exige carta',()=>{
 assert.equal(get('buff_amigo_de_merda').target,'opponent_unsubmitted');assert.deepEqual(get('buff_xo_ve_aqui').input,['cardIndex']);
});
