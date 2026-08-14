'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('public/js/refinementP13.js');
const sfx=read('public/js/sfx.js');
const css=read('public/css/refinementP13.css');
const soundtrack=read('public/js/soundtrack.js');
const html=read('public/index.html');

function compiles(source,name){assert.doesNotThrow(()=>new Function(source),`${name} deve compilar`);}

test('scripts do pacote compilam e são carregados por último',()=>{
  compiles(ui,'refinementP13.js');
  compiles(sfx,'sfx.js');
  compiles(soundtrack,'soundtrack.js');
  assert.match(html,/css\/refinementP13\.css/);
  assert.match(html,/js\/soundtrack\.js[^]*js\/sfx\.js/);
  assert.match(html,/js\/finalRewardUI\.js[^]*js\/refinementP13\.js/);
});

test('navegação e textos técnicos são tratados no front',()=>{
  assert.match(css,/\.back-button\{/);
  assert.match(css,/safe-area-inset-top/);
  assert.match(ui,/Ledger auditável · saldo ligado à conta/);
  assert.match(ui,/TECHNICAL_COPY/);
  assert.match(ui,/dirty-card-zero-line/);
  assert.match(ui,/Enviar zero cartas continua válido\./);
});

test('achievements, badges e títulos usam hierarquia de raridade coerente',()=>{
  assert.match(ui,/common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6/);
  assert.match(ui,/rare:'Incomum',superrare:'Raro'/);
  assert.match(ui,/compareRarity/);
  assert.match(ui,/caos-com-metodo/);
  assert.match(ui,/Efetive 5 Buffs diferentes/);
  assert.match(css,/profile-modal-unlock-grid>\.rarity-common/);
  assert.match(css,/profile-modal-unlock-grid>\.rarity-celestial/);
});

test('molduras de progressão continuam separadas e mais chamativas',()=>{
  for(const key of ['bronze','silver','gold','platinum'])assert.match(css,new RegExp(`avatar-frame\\.frame-${key}`));
  assert.match(css,/conic-gradient/);
  assert.match(css,/p13FramePulse/);
  assert.doesNotMatch(css,/frame-cosmetic-[^{]*\{[^}]*p13FramePulse/);
});

test('missões exibem XP e moedas como badges distintas',()=>{
  assert.match(css,/p10-mission-rewards/);
  assert.match(css,/nth-child\(2\)/);
  assert.match(css,/245,158,11/);
});

test('Opção B usa pilhas visuais, consumo e slot pontilhado em zero',()=>{
  assert.match(ui,/function cleanStack/);
  assert.match(ui,/clean-stack-sheet/);
  assert.match(ui,/clean-stack-empty/);
  assert.match(ui,/just-consumed/);
  assert.match(css,/border:2px dashed/);
  assert.match(css,/p13ConsumeCard/);
  assert.match(ui,/whiteBalance/);
  assert.match(ui,/blackBalance/);
});

test('loja mostra composição visual dos lotes',()=>{
  assert.match(ui,/market-clean-breakdown/);
  assert.match(ui,/product\.config\?\.white/);
  assert.match(ui,/product\.config\?\.black/);
  assert.match(css,/market-clean-card-icon/);
});

test('todos os 21 BUFFs possuem raridade, ícone e SFX próprios',()=>{
  const keys=[
    'buff_dedo_no_olho','buff_foi_sem_querer','buff_amigo_de_merda','buff_vou_fingir','buff_xo_ve_aqui','buff_meu_jogo','buff_mao_de_vaca','buff_testemunha_protegida','buff_toque_de_midas','buff_surrupiada','buff_censura_previa','buff_quem_nunca','buff_silencio_geral','buff_quero_tudo','buff_intervencao_federal','buff_apagao','buff_poder_subiu','buff_caos_total','buff_se_fode_ai','buff_que_poder','buff_saqueador'
  ];
  for(const key of keys)assert.match(sfx,new RegExp(`${key}:\\{name:`),key);
  const icons=[...sfx.matchAll(/buff_[a-z0-9_]+:\{name:'[^']+',icon:'([^']+)'/g)].map(x=>x[1]);
  assert.equal(icons.length,21);
  assert.equal(new Set(icons).size,21,'ícones de BUFF não podem repetir');
  const sounds=[...sfx.matchAll(/buff_[a-z0-9_]+:\{name:'[^']+',icon:'[^']+',rarity:'[^']+',label:'[^']+',sfx:'([^']+)'/g)].map(x=>x[1]);
  assert.equal(sounds.length,21);
  assert.equal(new Set(sounds).size,21,'SFX de BUFF não podem repetir');
  assert.match(css,/buff-type-pill/);
  assert.match(css,/buff-rarity-pill/);
});

test('configurações separam música, SFX e volumes com persistência',()=>{
  assert.match(sfx,/cartaralho:audio-settings:v1/);
  assert.match(ui,/Volume geral/);
  assert.match(ui,/Volume da música/);
  assert.match(ui,/Volume dos efeitos/);
  assert.match(ui,/data-audio-toggle="music"/);
  assert.match(ui,/data-audio-toggle="sfx"/);
  assert.match(soundtrack,/cartaralho:music-volume:v1/);
  assert.match(soundtrack,/setVolume/);
  assert.match(sfx,/localStorage\.setItem/);
});

test('SFX gerais cobrem interface, compra, erro, achievement e recompensa',()=>{
  for(const name of ['click','hover','confirm','purchase','error','modal_open','modal_close','achievement','reward'])assert.match(sfx,new RegExp(`${name}:\\(\\)=>`),name);
  assert.match(sfx,/pointerover/);
  assert.match(sfx,/cooldown/);
  assert.match(ui,/final_reward_settled/);
  assert.match(ui,/activateBuff/);
});

test('reward preview remove informação técnica, til e organiza espólio',()=>{
  assert.doesNotMatch(ui,/effort-pill[^]*E \$\{/);
  assert.doesNotMatch(ui,/>~\$\{/);
  assert.match(ui,/economy-loot-place/);
  assert.match(ui,/1º lugar/);
  assert.match(ui,/2º lugar/);
  assert.match(ui,/3º lugar/);
  assert.match(ui,/reward-preview-panel/);
  assert.match(css,/grid-template-areas:'config rules' 'config reward'/);
  assert.match(css,/grid-template-areas:'config' 'reward' 'rules'/);
});

test('configurações de sala e criação de carta recebem layout responsivo',()=>{
  assert.match(css,/checkbox-group>small/);
  assert.match(css,/creation-input-row/);
  assert.match(css,/#add-card-btn/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/flex-direction:column!important/);
});
