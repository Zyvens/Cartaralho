'use strict';
const PHASES={PREPARATION:'preparation',HAND:'hand_pre_submission',SUBMISSIONS:'submissions',MASTER_CHOICE:'master_choice',RESULT:'result',TRANSITION:'transition',FINAL_REWARD:'final_reward'};
const defs={
 buff_dedo_no_olho:{key:'buff_dedo_no_olho',name:'Dedo no Olho',icon:'👁️',phases:[PHASES.HAND,PHASES.SUBMISSIONS],target:'opponent',input:[],description:'Veja privadamente uma carta aleatória da mão de um adversário.'},
 buff_foi_sem_querer:{key:'buff_foi_sem_querer',name:'Foi sem querer querendo',icon:'↩️',phases:[PHASES.SUBMISSIONS],target:'self_submission',input:[],description:'Recolha sua resposta antes da revelação e envie outra carta.'},
 buff_amigo_de_merda:{key:'buff_amigo_de_merda',name:'Amigo de Merda',icon:'🌀',phases:[PHASES.HAND,PHASES.SUBMISSIONS],target:'opponent_unsubmitted',input:[],description:'Embaralhe a ordem da mão de um adversário antes da submissão dele.'},
 buff_xo_ve_aqui:{key:'buff_xo_ve_aqui',name:'Xô vê aqui',icon:'🔄',phases:[PHASES.HAND],target:'opponent',input:['cardIndex'],description:'Troque uma carta da sua mão por uma carta aleatória da mão de um adversário.'},
 buff_mao_de_vaca:{key:'buff_mao_de_vaca',name:'Mão de Vaca',icon:'🐄',phases:[PHASES.HAND],target:'self',input:[],description:'Compre duas cartas extras e escolha duas para devolver.'},
 buff_testemunha_protegida:{key:'buff_testemunha_protegida',name:'Testemunha Protegida',icon:'🛡️',phases:[PHASES.SUBMISSIONS],target:'self_submission',input:[],description:'Proteja sua submissão de efeitos de apagar, trocar ou manipular nesta rodada.'},
 buff_toque_de_midas:{key:'buff_toque_de_midas',name:'Toque de Midas',icon:'✨',phases:[PHASES.HAND],target:'self',input:[],description:'Devolva sua mão ao pool da partida e compre outra do mesmo tamanho.'}
};
function get(key){return defs[String(key||'')]||null;}
function list(){return Object.values(defs).map(x=>({...x}));}
module.exports={PHASES,get,list,defs};
