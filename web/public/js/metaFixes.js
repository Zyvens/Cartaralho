'use strict';
(()=>{
 if(window.CartPublicProfileDomain)return;
 const claim=window.CartDomains?.claim;
 const install=()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  function titleName(key){return window.IdentityUI?.titleName?.(key)||(window.MetaTitleNames||{})[key]||String(key||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
  function avatar(p,size=82){if(window.IdentityUI?.avatarHtml)return IdentityUI.avatarHtml(p,size,'public-profile-avatar');return HomeScreen.avatar(p?.avatar_data,size);}
  function close(panel){if(window.AppPanelModal?.host===panel){AppPanelModal.close();return;}if(panel)panel.innerHTML='';}
  async function render(panel,userId){
   if(!panel)return null;
   const d=await AuthClient.publicProfile(userId),p=d.profile||{},s=d.stats||{},titleKey=p.equipped_title_key||null,title=titleKey?titleName(titleKey):null;
   panel.innerHTML=`<div class="home-form profile-panel public-profile-panel"><button class="panel-close" type="button" aria-label="Fechar">✕</button><button id="back-rank" class="btn btn-secondary btn-sm">← Rank</button><div class="public-profile-head">${avatar(p,82)}<div><h3>${esc(p.display_name||'Jogador')}</h3><span>@${esc(p.username||'')}</span>${title?`<div class="public-profile-equipped-title equipped-title public-equipped-title" data-title-key="${esc(titleKey)}">${esc(title)}</div>`:''}<small>Nível ${Math.floor(Number(p.xp||0)/1000)+1} · ${Number(p.xp||0)} XP</small></div></div><p>${esc(p.bio||'Sem bio ainda.')}</p><div class="stats-grid"><div><b>${s.matches||0}</b><span>Partidas</span></div><div><b>${s.matches_won||0}</b><span>Vitórias</span></div><div><b>${s.rounds_won||0}</b><span>Rodadas</span></div><div><b>${s.total_points||0}</b><span>Pontos</span></div></div>${(d.medals||[]).length?`<div class="meta-section"><h4>Hall da Fama</h4>${d.medals.map(m=>`<div class="hall-medal"><span style="font-size:1.5rem">${m.position===1?'🥇':m.position===2?'🥈':'🥉'}</span><div><b>${esc(m.season_name)}</b><small style="display:block">#${m.position} · ${m.points} pts · ${m.wins} vitórias</small></div></div>`).join('')}</div>`:''}<div class="meta-section"><h4>Títulos conquistados</h4><div class="unlock-grid">${(d.titles||d.badges||[]).map(t=>`<div class="unlock-card ${MetaUI?.rarityClass?.(t.rarity)||`rarity-${t.rarity||'common'}`}"><span class="unlock-icon">${esc(t.icon)}</span><div><b>${esc(t.name)}</b><small>${esc(t.description)}</small></div><em>${esc(t.rarityInfo?.label||'')}</em></div>`).join('')||'<p>Nenhum título desbloqueado ainda.</p>'}</div></div></div>`;
   panel.querySelector('.panel-close')?.addEventListener('click',()=>close(panel));
   panel.querySelector('#back-rank')?.addEventListener('click',()=>window.CartRankDomain?.render?.(panel,'current','rank'));
   MetaUI?.decorateTitles?.();
   return d;
  }
  HomeScreen.renderPublicProfile=render;
  window.CartPublicProfileDomain={status:'CURRENT_BRIDGE',owner:'publicProfileUI',render,close,titleName,avatar};
 };
 if(claim)claim('publicProfileUI','metaFixes.js',install);else install();
})();
