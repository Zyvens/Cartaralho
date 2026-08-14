'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sql=fs.readFileSync(path.join(__dirname,'../db/metagame_v1_4_package8.sql'),'utf8');
const expected={buff_dedo_no_olho:250,buff_foi_sem_querer:300,buff_amigo_de_merda:350,buff_xo_ve_aqui:450,buff_mao_de_vaca:500,buff_testemunha_protegida:500,buff_toque_de_midas:600};

test('P08 publica exatamente os sete buffs simples com preços v1',()=>{
 for(const[key,price]of Object.entries(expected)){assert.match(sql,new RegExp(`'${key}'[\\s\\S]*?'buff','buff_item',${price},`));}
 assert.equal((sql.match(/'buff','buff_item'/g)||[]).length,7);
});

test('P08 não vende buffs avançados do P09',()=>{
 for(const name of ['Surrupiada','Meu jogo, minhas regras','Vou fingir que ninguém viu','Censura Prévia','Quem nunca?','Silêncio Geral','Quero tudo que é seu','Intervenção Federal','Apagão','O poder subiu à cabeça','CAOS TOTAL','Se fode aí','Que Poder, Filho da Puta','Saqueador'])assert.equal(sql.includes(`'${name}'`),false,`${name} pertence ao P09`);
});

test('schema impõe inventário não negativo e uma ativação por jogador por rodada',()=>{
 assert.match(sql,/quantity INT NOT NULL DEFAULT 0 CHECK\(quantity>=0\)/);
 assert.match(sql,/UNIQUE\(room_code,round_number,user_id\)/);
 assert.match(sql,/UNIQUE\(user_id,activation_id\)/);
});
