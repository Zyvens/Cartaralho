'use strict';

const RARITIES={
 common:{key:'common',label:'Comum',color:'#f4f4f5',order:1},
 rare:{key:'rare',label:'Incomum',color:'#22c55e',order:2},
 superrare:{key:'superrare',label:'Raro',color:'#3b82f6',order:3},
 epic:{key:'epic',label:'Épico',color:'#a855f7',order:4},
 legendary:{key:'legendary',label:'Lendário',color:'#facc15',order:5},
 celestial:{key:'celestial',label:'Celestial',color:'#dffbff',order:6,effect:'iridescent'}
};

const SPECIAL_TITLES={
 'o-criador':{key:'o-criador',name:'O Criador',icon:'✦',rarity:'celestial',description:'Você não zerou o jogo. Você fez essa merda existir.',source:'entitlement'},
 'betinha':{key:'betinha',name:'Betinha',icon:'🧪',rarity:'epic',description:'Estava aqui quando isso ainda quebrava com personalidade.',source:'beta_snapshot'}
};

const COSMETIC_EQUIP_KEYS={
 'cosmetic-fita-isolante':{type:'frame',productKey:'cosmetic_frame_fita_isolante'},
 'cosmetic-ouro-de-pobre':{type:'frame',productKey:'cosmetic_frame_ouro_de_pobre'},
 'cosmetic-neon-duvidoso':{type:'frame',productKey:'cosmetic_frame_neon_duvidoso'},
 'cosmetic-glitch-radioativo':{type:'frame',productKey:'cosmetic_frame_glitch_radioativo'},
 'cosmetic-buraco-negro':{type:'frame',productKey:'cosmetic_frame_buraco_negro'},
 'cosmetic-agiota':{type:'frame',productKey:'cosmetic_frame_agiota'},
 'cosmetic-lavagem-completa':{type:'frame',productKey:'cosmetic_frame_lavagem_completa'},
 'cliente-preferencial':{type:'title',productKey:'cosmetic_title_cliente_preferencial'},
 'lavador-de-moedinhas':{type:'title',productKey:'cosmetic_title_lavador_moedinhas'},
 'patrocinador-do-caos':{type:'title',productKey:'cosmetic_title_patrocinador_caos'},
 'dinheiro-nao-compra-talento':{type:'title',productKey:'cosmetic_title_dinheiro_talento'},
 'herdeiro-do-cartaralho':{type:'title',productKey:'cosmetic_title_herdeiro'},
 'patrimonio-inexplicavel':{type:'title',productKey:'cosmetic_title_patrimonio'}
};

const MIN_COSMETIC_LEVEL=5;
const MIN_COSMETIC_XP=(MIN_COSMETIC_LEVEL-1)*1000;
function levelFromXp(xp){return Math.floor(Math.max(0,Number(xp||0))/1000)+1;}
function rarityInfo(key){return RARITIES[key]||RARITIES.common;}

module.exports={RARITIES,SPECIAL_TITLES,COSMETIC_EQUIP_KEYS,MIN_COSMETIC_LEVEL,MIN_COSMETIC_XP,levelFromXp,rarityInfo};
