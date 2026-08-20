'use strict';
(()=>{
 if(window.CartStatsUI)return;
 CartDomains.claim('statsUI','domains/statsUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const rarityClass=r=>'rarity-'+(r||'common');
  const metaStat=(label,value)=>`<div class="meta-stat"><small>${esc(label)}</small><b>${value}</b></div>`;
  async function render(panel){
   if(!panel)return;
   const d=await AuthClient.stats(),s=d.stats||{},titles=d.titles||d.badges||[];
   panel.innerHTML=`<div class="home-form profile-panel"><button class="panel-close">✕</button><h3>Estatísticas</h3><div class="stats-grid"><div><b>${s.matches||0}</b><span>Partidas</span></div><div><b>${s.matches_won||0}</b><span>Vitórias</span></div><div><b>${s.rounds_won||0}</b><span>Rodadas ganhas</span></div><div><b>${s.total_points||0}</b><span>Pontos</span></div></div><div class="meta-section"><h4>Estatísticas cômicas</h4><div class="meta-stat-grid">${metaStat('Taxa de vitória',(s.win_rate||0)+'%')}${metaStat('Mestre que mais escolheu você',s.master_most_chose?`${esc(s.master_most_chose.display_name)} · ${s.master_most_chose.votes} votos`:'—')}${metaStat('Quem mais perdeu para você',s.player_most_lost_to_you?`${esc(s.player_most_lost_to_you.display_name)} · ${s.player_most_lost_to_you.losses} derrotas`:'—')}${metaStat('Maior sequência de vitórias',s.longest_win_streak||0)}${metaStat('Maior sequência de derrotas',s.longest_loss_streak||0)}${metaStat('Carta que insiste e nunca ganhou',s.card_never_won?`${esc(s.card_never_won.text)} · ${s.card_never_won.times_used} usos`:'—')}${metaStat('Resposta mais vencedora',s.most_winning_answer?`${esc(s.most_winning_answer.text)} · ${s.most_winning_answer.wins} vitórias`:'—')}${metaStat('Mestres diferentes que já escolheram você',s.unique_masters_that_chose_you||0)}</div></div><div class="meta-section"><h4>Badges e títulos</h4><div class="unlock-grid">${titles.map(t=>`<div class="unlock-card ${rarityClass(t.rarity)} ${t.unlocked?'':'locked'}"><span class="unlock-icon">${esc(t.icon)}</span><div><b>${esc(t.name)}</b><small>${esc(t.description)}</small></div><em>${t.progress}/${t.target}</em></div>`).join('')}</div></div></div>`;
   panel.querySelector('.panel-close')?.addEventListener('click',()=>panel.innerHTML='');
   return d;
  }
  HomeScreen.renderStats=render;
  if(typeof MetaUI!=='undefined')MetaUI.renderStats=render;
  window.CartStatsUI={render};
 });
})();
