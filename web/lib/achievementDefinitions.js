'use strict';
const RARITIES={common:{label:'Comum',order:1},rare:{label:'Incomum',order:2},superrare:{label:'Raro',order:3},epic:{label:'Épico',order:4},legendary:{label:'Lendário',order:5}};
const ACHIEVEMENTS=[
 {key:'buff-primeira-dose',name:'Primeira Dose',icon:'⚡',rarity:'common',description:'Efetive seu primeiro Buff em uma partida válida.',target:1,eventKey:'buff_resolved'},
 {key:'buff-canivete-suico',name:'Canivete Suíço do Caos',icon:'🧰',rarity:'rare',description:'Efetive 5 Buffs diferentes em partidas válidas.',target:5,eventKey:'buff_resolved',distinct:'source_key',title:{key:'caos-com-metodo',name:'Caos com Método'}},
 {key:'buff-intervencao',name:'Fiscalização Surpresa',icon:'🏛️',rarity:'epic',description:'Use Intervenção Federal e cancele de verdade outro Buff.',target:1,eventKey:'buff_intervention_success',title:{key:'fiscal-federal',name:'Fiscal Federal'}},
 {key:'buff-caos-total',name:'Nada Faz Sentido',icon:'🫥',rarity:'epic',description:'Efetive CAOS TOTAL em uma partida válida.',target:1,eventKey:'buff_caos_total',title:{key:'agente-do-caos',name:'Agente do Caos'}},
 {key:'buff-saqueador',name:'Crime Compensa às Vezes',icon:'💰',rarity:'epic',description:'Receba uma parcela real de um Saqueador coletivo.',target:1,eventKey:'saqueador_share',title:{key:'saqueador-profissional',name:'Saqueador Profissional'}},
 {key:'espolio-primeiro',name:'Achado Não É Roubado',icon:'📦',rarity:'common',description:'Adote sua primeira carta por Espólio.',target:1,eventKey:'loot_claim'},
 {key:'espolio-dez',name:'Contrabando Seletivo',icon:'🧳',rarity:'rare',description:'Adote 10 cartas por Espólio.',target:10,eventKey:'loot_claim',title:{key:'contrabandista',name:'Contrabandista'}},
 {key:'espolio-fontes',name:'Rede de Contatos Duvidosa',icon:'🕸️',rarity:'superrare',description:'Adote Espólios vindos de 3 jogadores distintos.',target:3,eventKey:'loot_claim',distinct:'related_user_id'},
 {key:'autor-primeira',name:'Assinou o Crime',icon:'🧬',rarity:'common',description:'Origine uma Carta Canônica em uma partida válida.',target:1,eventKey:'original_creation'},
 {key:'autor-direto-fonte',name:'O Original Funciona',icon:'🏆',rarity:'superrare',description:'Vença uma rodada válida usando uma carta criada originalmente por você.',target:1,eventKey:'original_win',title:{key:'direto-da-fonte',name:'Direto da Fonte'}},
 {key:'carta-dez-vitorias',name:'Produto Testado em Campo',icon:'🎯',rarity:'rare',description:'Some 10 vitórias pessoais válidas com suas Cartas de Jogador.',target:10,eventKey:'personal_card_win'},
 {key:'autor-dez-adocoes',name:'Tráfico de Ideias',icon:'🔀',rarity:'superrare',description:'Suas criações somaram 10 adoções deliberadas por Espólio.',target:10,eventKey:'authored_adoption',title:{key:'traficante-de-ideias',name:'Traficante de Ideias'}},
 {key:'autor-alcance-dez',name:'Sua Desgraça se Espalha',icon:'📡',rarity:'rare',description:'Uma criação sua alcançou 10 proprietários distintos.',target:1,eventKey:'legacy_reach_10'},
 {key:'autor-viral',name:'Pegou',icon:'🦠',rarity:'epic',description:'Uma criação sua atingiu Legado Viral.',target:1,eventKey:'legacy_level_viral',title:{key:'viralizador',name:'Viralizador'}},
 {key:'autor-folclore',name:'Patrimônio Imaterial',icon:'🏛️',rarity:'legendary',description:'Uma criação sua atingiu Legado Folclore.',target:1,eventKey:'legacy_level_folclore',title:{key:'folclore-vivo',name:'Folclore Vivo'}}
];
const LEGACY_MILESTONES=[
 {key:'adoption:first',test:s=>Number(s.adoption_count||0)>=1,xp:50},
 {key:'reach:10',test:s=>Number(s.reach_count||0)>=10,xp:100},
 {key:'reach:25',test:s=>Number(s.reach_count||0)>=25,xp:200},
 {key:'reach:100',test:s=>Number(s.reach_count||0)>=100,xp:500},
 {key:'reach:250',test:s=>Number(s.reach_count||0)>=250,xp:750},
 {key:'reach:1000',test:s=>Number(s.reach_count||0)>=1000,xp:1500},
 {key:'legacy_level:viral',test:s=>['viral','classico','folclore'].includes(s.legacy_level),xp:300},
 {key:'legacy_level:classico',test:s=>['classico','folclore'].includes(s.legacy_level),xp:750},
 {key:'legacy_level:folclore',test:s=>s.legacy_level==='folclore',xp:2000}
].map(x=>({...x,coins:Math.round(x.xp*.20)}));
const LEGACY_DAILY=[
 {key:'d-play',name:'Bater ponto',description:'Jogue 1 partida hoje.',target:1,xp:100,metric:{kind:'legacy',key:'matches'}},
 {key:'d-rounds',name:'Arranca risada',description:'Ganhe 3 rodadas hoje.',target:3,xp:150,metric:{kind:'legacy',key:'rounds'}},
 {key:'d-react',name:'Plateia barulhenta',description:'Envie 5 reações hoje.',target:5,xp:75,metric:{kind:'legacy',key:'reactions'}}
];
const LEGACY_WEEKLY=[
 {key:'w-play',name:'Sem vida social',description:'Jogue 5 partidas nesta semana.',target:5,xp:350,metric:{kind:'legacy',key:'matches'}},
 {key:'w-win',name:'Dono do rolê',description:'Vença 2 partidas nesta semana.',target:2,xp:500,metric:{kind:'legacy',key:'wins'}},
 {key:'w-rounds',name:'Metralhadora de piada',description:'Ganhe 10 rodadas nesta semana.',target:10,xp:450,metric:{kind:'legacy',key:'rounds'}},
 {key:'w-borrowed',name:'Piada dos Outros',description:'Ganhe uma rodada usando uma carta criada originalmente por outro jogador.',target:1,xp:400,metric:{kind:'legacy',key:'borrowedWins'}},
 {key:'w-react',name:'Torcida organizada',description:'Envie 20 reações nesta semana.',target:20,xp:250,metric:{kind:'legacy',key:'reactions'}}
];
const P10_DAILY=[
 {key:'d-buff',name:'Má Influência do Dia',description:'Efetive 1 Buff em uma partida válida hoje.',target:1,xp:100,metric:{kind:'event',eventKey:'buff_resolved'}},
 {key:'d-loot',name:'Leva Isso Pra Casa',description:'Adote 1 carta por Espólio hoje.',target:1,xp:100,metric:{kind:'event',eventKey:'loot_claim'}},
 {key:'d-direto-fonte',name:'Direto da Fonte',description:'Apresente uma criação original sua em uma rodada válida hoje.',target:1,xp:150,metric:{kind:'event',eventKey:'original_revealed'}}
];
const P10_WEEKLY=[
 {key:'w-buff-variety',name:'Degustação de Péssimas Decisões',description:'Efetive 3 Buffs diferentes nesta semana.',target:3,xp:300,metric:{kind:'event',eventKey:'buff_resolved',distinct:'source_key'},randomBuff:true},
 {key:'w-loot-matches',name:'Contrabando Interestadual',description:'Adote Espólio em 3 partidas válidas diferentes nesta semana.',target:3,xp:350,metric:{kind:'event',eventKey:'loot_claim',distinct:'match_id'}},
 {key:'w-legado',name:'A Piada Saiu de Casa',description:'Faça suas criações aparecerem em 3 partidas válidas distintas nesta semana.',target:3,xp:400,metric:{kind:'event',eventKey:'authored_presence',distinct:'match_id'}}
];
const BUFF_REWARD_POOL=['buff_dedo_no_olho','buff_foi_sem_querer','buff_amigo_de_merda','buff_vou_fingir'];
const DAILY=[...LEGACY_DAILY,...P10_DAILY],WEEKLY=[...LEGACY_WEEKLY,...P10_WEEKLY];
const byAchievement=key=>ACHIEVEMENTS.find(x=>x.key===key)||null;
module.exports={RARITIES,ACHIEVEMENTS,LEGACY_MILESTONES,DAILY,WEEKLY,BUFF_REWARD_POOL,byAchievement};
