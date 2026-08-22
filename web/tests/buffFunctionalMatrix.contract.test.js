'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const defs=require('../lib/buffDefinitions');
const api=read('api/buffs.js'),simple=read('lib/buffEngine.js'),advanced=read('lib/advancedBuffEngine.js'),amigo=read('lib/amigoDeMerda.js'),rewards=read('lib/advancedRewards.js');
const P=defs.PHASES;
const expected={
 buff_dedo_no_olho:{role:'any',target:'opponent',phases:[P.HAND,P.SUBMISSIONS],family:'simple'},
 buff_foi_sem_querer:{role:'any',target:'self_submission',phases:[P.SUBMISSIONS],family:'simple'},
 buff_amigo_de_merda:{role:'any',target:'opponent_unsubmitted',phases:[P.HAND,P.SUBMISSIONS],family:'special'},
 buff_vou_fingir:{role:'master',target:'self',phases:[P.SUBMISSIONS,P.MASTER_CHOICE],family:'advanced'},
 buff_meu_jogo:{role:'any',target:'self',phases:[P.HAND,P.SUBMISSIONS],family:'advanced'},
 buff_xo_ve_aqui:{role:'any',target:'opponent',phases:[P.HAND],family:'simple'},
 buff_mao_de_vaca:{role:'any',target:'self',phases:[P.HAND],family:'simple'},
 buff_testemunha_protegida:{role:'any',target:'self_submission',phases:[P.SUBMISSIONS],family:'simple'},
 buff_surrupiada:{role:'any',target:'submission',phases:[P.SUBMISSIONS],family:'advanced'},
 buff_toque_de_midas:{role:'any',target:'self',phases:[P.HAND],family:'simple'},
 buff_censura_previa:{role:'master',target:'self',phases:[P.HAND],family:'advanced'},
 buff_quem_nunca:{role:'any',target:'self',phases:[P.HAND],family:'advanced'},
 buff_silencio_geral:{role:'master',target:'self',phases:[P.HAND,P.SUBMISSIONS,P.MASTER_CHOICE],family:'advanced'},
 buff_quero_tudo:{role:'any',target:'two_players',phases:[P.HAND,P.SUBMISSIONS],family:'advanced'},
 buff_intervencao_federal:{role:'any',target:'latest_buff',phases:[P.HAND,P.SUBMISSIONS,P.MASTER_CHOICE],family:'advanced'},
 buff_apagao:{role:'any',target:'self',phases:[P.HAND,P.SUBMISSIONS,P.MASTER_CHOICE],family:'advanced'},
 buff_poder_subiu:{role:'master',target:'self',phases:[P.HAND,P.SUBMISSIONS,P.MASTER_CHOICE],family:'advanced'},
 buff_caos_total:{role:'any',target:'all_opponents',phases:[P.HAND,P.SUBMISSIONS],family:'advanced'},
 buff_se_fode_ai:{role:'any',target:'all_opponents',phases:[P.HAND,P.SUBMISSIONS],family:'advanced'},
 buff_que_poder:{role:'master',target:'submission',phases:[P.MASTER_CHOICE],family:'advanced'},
 buff_saqueador:{role:'any',target:'self',phases:[P.FINAL_REWARD],family:'advanced'}
};

test('matriz canônica contém exatamente os 21 BUFFs com papel, alvo e fases preservados',()=>{
 const listed=defs.list();assert.equal(listed.length,21);assert.deepEqual(listed.map(x=>x.key).sort(),Object.keys(expected).sort());
 for(const[key,e]of Object.entries(expected)){const d=defs.get(key);assert.ok(d,key);assert.equal(d.role,e.role,key);assert.equal(d.target,e.target,key);assert.deepEqual(d.phases,e.phases,key);}
});

test('classificação simple/advanced coincide com as definições e Amigo possui owner especial',()=>{
 for(const[key,e]of Object.entries(expected)){
  if(e.family==='advanced')assert.equal(defs.isAdvanced(key),true,key);
  else assert.equal(defs.isAdvanced(key),false,key);
 }
 assert.match(api,/amigo=require\('\.\.\/lib\/amigoDeMerda'\)/);
 assert.match(api,/buffKey==='buff_amigo_de_merda'\?await amigo\.activate\(room,user\.id,activationId,input\):await engine\.activate/);
 assert.doesNotMatch(api,/amigoDeMerdaP32/);
});

test('os seis BUFFs simples restantes possuem implementação nos engines simples e avançado',()=>{
 const keys=Object.entries(expected).filter(([,x])=>x.family==='simple').map(([k])=>k);
 assert.equal(keys.length,6);
 for(const key of keys){const marker=new RegExp(`def\\.key==='${key}'`);assert.match(simple,marker,key);assert.match(advanced,marker,key);}
});

test('os 14 BUFFs avançados permanecem cobertos pelo advanced engine',()=>{
 const keys=Object.entries(expected).filter(([,x])=>x.family==='advanced').map(([k])=>k);assert.equal(keys.length,14);
 for(const key of keys)assert.ok(advanced.includes(key),key);
 assert.match(advanced,/roleValid\(room,userId,def\)/);
 assert.match(advanced,/if\(!def\.phases\.includes\(phase\)\)/);
 assert.match(advanced,/buff_activations WHERE room_code=/);
});

test('Amigo de Merda oficial faz redraw completo, transacional e idempotente',()=>{
 assert.match(amigo,/room\.whiteDeck\.push\(\.\.\.target\.hand\.splice\(0\)\)/);
 assert.match(amigo,/shuffle\(room\.whiteDeck\)/);
 assert.match(amigo,/for\(let i=0;i<n;i\+\+\)target\.hand\.push\(room\.whiteDeck\.pop\(\)\)/);
 assert.match(amigo,/temporaryPossessions\[tid\]=\[\]/);
 assert.match(amigo,/INSERT INTO buff_activations/);assert.match(amigo,/UPDATE buff_inventory SET quantity=quantity-1/);assert.match(amigo,/isolationMode:'Serializable'/);assert.match(amigo,/prior\(actorDbId,activation\)/);
});

test('Saqueador só redistribui placement pot; sobrevivência e consolação ficam fora do rateio',()=>{
 assert.match(rewards,/pot\+=reward\.placement/);
 assert.match(rewards,/placement=raiders\.length\?0:Number\(r\.placement_reward\|\|0\)/);
 assert.match(rewards,/survival=Number\(r\.survival_reward\|\|0\)/);
 assert.match(rewards,/consolation=Number\(r\.consolation_reward\|\|0\)/);
 assert.match(rewards,/match_saqueador/);assert.match(rewards,/WINDOW_SECONDS=15/);
});
