'use strict';
const{sql}=require('./db');

const APP_VERSION='v1.4.25';
const RELEASES=[
 {id:'release:p25',type:'update',icon:'🃏',title:'P25 — Rascunhos de cartas e commit no início',description:'Cartas preparadas no Lobby agora permanecem como rascunhos. Inventário, Cartas Limpas, autoria e genealogia só são efetivados quando a partida começa; cancelar a sala não consome nada.',version:'v1.4.25',publishedAt:'2026-08-15T09:30:00.000Z'},
 {id:'release:p24',type:'update',icon:'🧭',title:'P24 — Achievements e atalhos da Home',description:'Títulos ligados a achievements agora mostram diretamente o requisito real de desbloqueio, e os atalhos da Home passam a seguir uma ordem fixa e consistente.',version:'v1.4.24',publishedAt:'2026-08-15T09:05:00.000Z'},
 {id:'release:p23',type:'update',icon:'🪞',title:'P23 — Perfil e Gênese',description:'Corrige a moldura Gênese no seletor e na prévia, elimina o salto ao topo ao trocar cosméticos e consolida todo o salvamento do Perfil no botão Salvar alterações.',version:'v1.4.23',publishedAt:'2026-08-15T08:55:00.000Z'},
 {id:'release:p22',type:'update',icon:'🧩',title:'P22 — Estimativas, Gênese e refinamentos mobile',description:'Unifica o visual de Resumo e Estimativa, preserva a classificação da partida, corrige a hidratação da moldura Gênese e simplifica pilhas/ícones de cartas no mobile.',version:'v1.4.22',publishedAt:'2026-08-15T07:50:00.000Z'},
 {id:'release:p21',type:'update',icon:'🩹',title:'P21 — Hotfix de configuração e Cartas Limpas',description:'Corrige início da música no primeiro gesto permitido, números das regras, organização dos quatro cards de configuração, contraste das abas de cartas e consumo visual das pilhas de Cartas Limpas.',version:'v1.4.21',publishedAt:'2026-08-15T07:20:00.000Z'},
 {id:'release:p20',type:'update',icon:'🎭',title:'P20 — Cosméticos públicos e apresentação pré-jogo',description:'Título e moldura passam a acompanhar a identidade do jogador no Perfil, Home, Lobby e partida. Gênese fica disponível ao Criador e o início da partida ganha uma apresentação curta dos jogadores e suas cartas de ostentação.',version:'v1.4.20',publishedAt:'2026-08-15T07:00:00.000Z'},
 {id:'release:p19',type:'update',icon:'🛠️',title:'P19 — Correções de sala, cartas e progressão',description:'Corrige estimativas com cache, confirma Mão de Vaca sem bloquear Pronto, restaura pilhas de Cartas Limpas, suporta Cartas Pretas de duas lacunas, Perfil com salvar aparência e novas badges/títulos.',version:'v1.4.19',publishedAt:'2026-08-14T23:45:00.000Z'},
 {id:'release:p18',type:'update',icon:'🆕',title:'P18 — Contribuição e Central de Notificações',description:'Pronto passa a considerar contribuição para Espólio, seleção de cartas é bloqueada após Pronto, melhorias de sala e nova Central de Notificações.',version:'v1.4.18',publishedAt:'2026-08-14T21:00:00.000Z'},
 {id:'release:p17',type:'update',icon:'✨',title:'P17 — Molduras e raridades',description:'Molduras reorganizadas por raridade, novos preços e efeitos animados para progressão e Celestial.',version:'v1.4.17',publishedAt:'2026-08-14T19:30:00.000Z'},
 {id:'release:p16',type:'update',icon:'♻️',title:'P16 — Pronto e Reciclagem',description:'Prontidão separada da edição de cartas e Reciclagem de Cartas de Jogador no Mercado Paralelo.',version:'v1.4.16',publishedAt:'2026-08-14T18:00:00.000Z'}
];
const DIRTY_LABELS={starter_grant:'Prêmio de boas-vindas',match_placement:'Prêmio de colocação',match_survival:'Bônus de sobrevivência',match_consolation:'Prêmio de consolação',match_saqueador:'Saqueador',mission_reward:'Recompensa de missão',legacy_royalty:'Royalties de Legado',card_recycling:'Reciclagem',adjustment:'Crédito recebido'};
function rewardIcon(type){if(type==='starter_grant')return'🎁';if(type==='mission_reward')return'🎯';if(type==='legacy_royalty')return'👑';if(type==='card_recycling')return'♻️';return'🪙';}
async function rewardNotifications(userId){
 const id=Number(userId);
 const[dirty,clean,entitlements]=await Promise.all([
  sql`SELECT id,amount,transaction_type,reference_type,reference_id,metadata,created_at FROM dirty_coin_ledger WHERE user_id=${id} AND amount>0 AND transaction_type IN('starter_grant','match_placement','match_survival','match_consolation','match_saqueador','mission_reward','legacy_royalty','card_recycling','adjustment') ORDER BY created_at DESC,id DESC LIMIT 30`,
  sql`SELECT id,card_type,amount,transaction_type,created_at FROM clean_card_ledger WHERE user_id=${id} AND amount>0 AND transaction_type='starter_grant' ORDER BY created_at DESC,id DESC LIMIT 10`,
  sql`SELECT entitlement_key,entitlement_type,source_type,metadata,granted_at FROM special_entitlements WHERE user_id=${id} ORDER BY granted_at DESC LIMIT 20`
 ]);
 const rows=dirty.map(r=>({id:`dirty:${r.id}`,type:'reward',icon:rewardIcon(r.transaction_type),title:DIRTY_LABELS[r.transaction_type]||'Prêmio recebido',description:`+${Number(r.amount).toLocaleString('pt-BR')} Moedas Sujas`,amount:Number(r.amount),currency:'dirty',receivedAt:r.created_at}));
 const cleanStarter=clean.map(r=>({id:`clean:${r.id}`,type:'reward',icon:r.card_type==='black'?'🖤':'🤍',title:'Kit de boas-vindas',description:`+${Number(r.amount).toLocaleString('pt-BR')} Cartas Limpas ${r.card_type==='black'?'Pretas':'Brancas'}`,amount:Number(r.amount),currency:r.card_type==='black'?'clean_black':'clean_white',receivedAt:r.created_at}));
 const special=entitlements.map(r=>({id:`entitlement:${r.entitlement_type}:${r.entitlement_key}`,type:'reward',icon:r.entitlement_type==='frame'?'✦':'🏷️',title:r.entitlement_type==='frame'?'Moldura especial recebida':'Título especial recebido',description:String(r.metadata?.displayName||r.entitlement_key||'Recompensa especial'),receivedAt:r.granted_at}));
 return[...rows,...cleanStarter,...special].sort((a,b)=>new Date(b.receivedAt)-new Date(a.receivedAt));
}
async function center(userId){return{currentVersion:APP_VERSION,updates:RELEASES,rewards:await rewardNotifications(userId),generatedAt:new Date().toISOString()};}
module.exports={APP_VERSION,RELEASES,rewardNotifications,center};
