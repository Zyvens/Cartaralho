'use strict';
(()=>{
 if(window.CartSocialGroupsDomain)return;
 CartDomains.claim('socialGroupsUI','domains/socialGroupsUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const fmtDate=v=>v?new Date(v).toLocaleString('pt-BR'):'—';
  async function renderFriendGroup(panel,id){const d=await MetaClient.group(id),g=d.group;panel.innerHTML=`<div class="home-form profile-panel"><button class="panel-close">✕</button><button id="groups-back" class="btn btn-secondary btn-sm">← Turmas</button><h3>${esc(g.name)}</h3><p>Código privado: <span class="friend-code">${esc(g.invite_code)}</span></p><h4>Ranking da turma</h4><div class="rank-list">${(d.members||[]).map((m,i)=>`<button class="rank-player" data-user-id="${m.user_id}">${HomeScreen.avatar(m.avatar_data,34)}<span><b>#${i+1} ${esc(m.display_name)}</b><small>${m.points} pts · ${m.wins} vitórias · ${m.matches} partidas</small></span></button>`).join('')}</div><h4>Cartas mais famosas</h4><div class="hall-list">${(d.famousCards||[]).map((c,i)=>`<div class="hall-row"><span>#${i+1}</span><strong>${esc(c.text)}</strong><span>${c.uses} usos</span></div>`).join('')||'<p>Sem dados.</p>'}</div><h4>Histórico da turma</h4>${(d.history||[]).map(h=>`<div class="friend-card"><b>${esc(h.room_code)}</b><small style="display:block">${esc(h.winner_nickname||'—')} venceu · ${fmtDate(h.finished_at)}</small></div>`).join('')||'<p>Sem partidas.</p>'}</div>`;panel.querySelector('#groups-back').onclick=()=>window.SocialUI?.render?.(panel,'groups');panel.querySelectorAll('.rank-player').forEach(b=>b.onclick=()=>HomeScreen.renderPublicProfile(panel,b.dataset.userId));panel.querySelector('.panel-close')?.addEventListener('click',()=>window.AppPanelModal?.close?.());return d;}
  if(window.MetaUI)MetaUI.renderFriendGroup=renderFriendGroup;window.CartSocialGroupsDomain={renderFriendGroup};
 });
})();
