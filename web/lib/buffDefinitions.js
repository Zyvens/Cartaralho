'use strict';
const PHASES={PREPARATION:'preparation',HAND:'hand_pre_submission',SUBMISSIONS:'submissions',REVEAL:'reveal',MASTER_CHOICE:'master_choice',RESULT:'result',TRANSITION:'transition',FINAL_REWARD:'final_reward'};
const D=(key,name,icon,phases,target,input,description,role='any',extra={})=>({key,name,icon,phases,target,input,description,role,...extra});
const defs={
 buff_dedo_no_olho:D('buff_dedo_no_olho','Dedo no Olho','👁️',[PHASES.HAND,PHASES.SUBMISSIONS],'opponent',[],'Veja privadamente uma carta aleatória da mão de um adversário.'),
 buff_foi_sem_querer:D('buff_foi_sem_querer','Foi sem querer querendo','↩️',[PHASES.SUBMISSIONS],'self_submission',[],'Recolha sua resposta antes da revelação e envie outra carta.'),
 buff_amigo_de_merda:D('buff_amigo_de_merda','Amigo de Merda','🌀',[PHASES.HAND,PHASES.SUBMISSIONS],'opponent_unsubmitted',[],'Antes da submissão do alvo, devolva toda a mão dele ao bolo e force uma nova mão do mesmo tamanho.'),
 buff_vou_fingir:D('buff_vou_fingir','Vou fingir que ninguém viu','🕵️',[PHASES.SUBMISSIONS,PHASES.MASTER_CHOICE],'self',[],'Mestre: revele somente para você a autoria das respostas desta rodada.','master'),
 buff_meu_jogo:D('buff_meu_jogo','Meu jogo, minhas regras','🃏',[PHASES.HAND,PHASES.SUBMISSIONS],'self',[],'Envie duas respostas independentes nesta rodada.'),
 buff_xo_ve_aqui:D('buff_xo_ve_aqui','Xô vê aqui','🔄',[PHASES.HAND],'opponent',['cardIndex'],'Troque uma carta da sua mão por uma carta aleatória da mão de um adversário.'),
 buff_mao_de_vaca:D('buff_mao_de_vaca','Mão de Vaca','🐄',[PHASES.HAND],'self',[],'Compre duas cartas extras e escolha duas para devolver.'),
 buff_testemunha_protegida:D('buff_testemunha_protegida','Testemunha Protegida','🛡️',[PHASES.SUBMISSIONS],'self_submission',[],'Proteja suas submissões contra apagar, trocar ou manipular nesta rodada.'),
 buff_surrupiada:D('buff_surrupiada','Surrupiada','🥷',[PHASES.SUBMISSIONS],'submission',['submissionId'],'Retire uma resposta recém-submetida de outro jogador e force substituição.','any',{globalLock:'surrupiada'}),
 buff_toque_de_midas:D('buff_toque_de_midas','Toque de Midas','✨',[PHASES.HAND],'self',[],'Devolva sua mão ao pool e compre outra do mesmo tamanho.'),
 buff_censura_previa:D('buff_censura_previa','Censura Prévia','🚫',[PHASES.HAND],'self',[],'Mestre: descarte a Carta Preta atual e sorteie outra.','master',{globalLock:'black_swap'}),
 buff_quem_nunca:D('buff_quem_nunca','Quem nunca?','🙋',[PHASES.HAND],'self',[],'Troque a Carta Preta antes das submissões.','any',{globalLock:'black_swap'}),
 buff_silencio_geral:D('buff_silencio_geral','Silêncio Geral','🤐',[PHASES.HAND,PHASES.SUBMISSIONS,PHASES.MASTER_CHOICE],'self',[],'Mestre: desabilite reações pelo restante da partida.','master'),
 buff_quero_tudo:D('buff_quero_tudo','Quero tudo que é seu','🤝',[PHASES.HAND,PHASES.SUBMISSIONS],'two_players',['targetUserId','secondTargetUserId'],'Troque as mãos atuais de dois jogadores.'),
 buff_intervencao_federal:D('buff_intervencao_federal','Intervenção Federal','🏛️',[PHASES.HAND,PHASES.SUBMISSIONS,PHASES.MASTER_CHOICE],'latest_buff',[],'Cancele o buff que acabou de ser efetivado dentro da janela do engine.'),
 buff_apagao:D('buff_apagao','Apagão','🌑',[PHASES.HAND,PHASES.SUBMISSIONS,PHASES.MASTER_CHOICE],'self',[],'Impeça novas ativações de Buff na rodada seguinte.'),
 buff_poder_subiu:D('buff_poder_subiu','O poder subiu à cabeça','👑',[PHASES.HAND,PHASES.SUBMISSIONS,PHASES.MASTER_CHOICE],'self',[],'Mestre: permaneça na próxima rodada e inverta a rotação.','master'),
 buff_caos_total:D('buff_caos_total','CAOS TOTAL','🫥',[PHASES.HAND,PHASES.SUBMISSIONS],'all_opponents',[],'Oculte no servidor o conteúdo das mãos de seus adversários nesta rodada.'),
 buff_se_fode_ai:D('buff_se_fode_ai','Se fode aí','💥',[PHASES.HAND,PHASES.SUBMISSIONS],'all_opponents',[],'Substitua cartas especiais dos adversários por cartas normais do pool.'),
 buff_que_poder:D('buff_que_poder','Que Poder, Filho da Puta','🤬',[PHASES.MASTER_CHOICE],'submission',['submissionId','returnCardIndex'],'Mestre: tome o ponto e a resposta escolhida apenas para sua mão temporária.','master'),
 buff_saqueador:D('buff_saqueador','Saqueador','💰',[PHASES.FINAL_REWARD],'self',[],'Entre no rateio coletivo do pote saqueável da premiação de colocação.')
};
function get(key){return defs[String(key||'')]||null;}function list(){return Object.values(defs).map(x=>({...x}));}function isAdvanced(key){return !['buff_dedo_no_olho','buff_foi_sem_querer','buff_amigo_de_merda','buff_xo_ve_aqui','buff_mao_de_vaca','buff_testemunha_protegida','buff_toque_de_midas'].includes(String(key||''));}
module.exports={PHASES,get,list,defs,isAdvanced};
