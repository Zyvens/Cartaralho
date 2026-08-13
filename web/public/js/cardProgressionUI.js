(()=>{
 const escape=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const fmt=n=>Number(n||0).toLocaleString('pt-BR');
 const labelLevel=k=>({nascente:'Nascente',espalhando:'Espalhando',viral:'Viral',classico:'Clássico',folclore:'Folclore'}[k]||k||'Nascente');
 const previousCards=HomeScreen.renderCards;
 HomeScreen.renderCards=async panel=>{
  await previousCards(panel);
  let cards,data;try{[cards,data]=await Promise.all([AuthClient.cards(),AuthClient.request('/api/profile/progression')]);}catch(_){return;}
  if(!data?.progressionEnabled)return;
  const byLegacyId=new Map(cards.map(c=>[String(c.id),c])),byCanonical=new Map((data.cards||[]).map(p=>[String(p.canonicalCardId),p]));
  panel.querySelectorAll('.profile-card[data-card-id]').forEach(el=>{
   const card=byLegacyId.get(String(el.dataset.cardId)),p=card?.canonicalCardId?byCanonical.get(String(card.canonicalCardId)):null;if(!card||!p)return;
   [...el.classList].filter(x=>x.startsWith('tier-')||x.startsWith('border-')).forEach(x=>el.classList.remove(x));
   el.classList.add(`tier-${p.material.tier}`,`border-${p.border.tier}`);
   const metric=card.type==='whiteCards'?`${fmt(p.whitePersonalWins)} vitórias pessoais`:`${fmt(p.blackPersonalUses)} usos válidos pessoais`;
   const small=el.querySelector('small');if(small)small.textContent=`${p.material.label} · borda ${p.border.label} · ${metric} · ${fmt(p.externalPresenceMatches)} presenças externas`;
   el.onclick=e=>{if(e.target.closest('.favorite-card'))return;const g=p.global||{},original=p.isOriginal?'<br><br><strong>🧬 CARTA ORIGINAL</strong><br>Você é um dos criadores originais desta identidade canônica.':'';Modal.show({title:escape(card.text),message:`<strong>Corpo/material: ${escape(p.material.label)}</strong><br>${card.type==='whiteCards'?'Vitórias suas com esta carta':'Rodadas válidas em que a sua posse entrou como pergunta'}: ${fmt(p.material.score)}.<br>Próximo: ${escape(p.material.nextLabel||'máximo')}${p.material.nextLabel?` · faltam ${fmt(p.material.remaining)}`:''}.<br><br><strong>Borda: ${escape(p.border.label)}</strong><br>Partidas distintas em que a mesma Carta Canônica apareceu através de outro jogador: ${fmt(p.externalPresenceMatches)}.<br>Próximo: ${escape(p.border.nextLabel||'máximo')}${p.border.nextLabel?` · faltam ${fmt(p.border.remaining)}`:''}.<br><br><strong>Legado global: ${escape(g.legacyLabel||labelLevel(g.legacyLevel))}</strong><br>Alcance: ${fmt(g.reach)} · presença: ${fmt(g.presence)} partidas · vitórias globais: ${fmt(g.wins)} · coincidências criativas: ${fmt(g.creativeCoincidences)}.${original}`,confirmText:'Fechar'});};
  });
 };
 const previousStats=HomeScreen.renderStats;
 HomeScreen.renderStats=async panel=>{
  await previousStats(panel);
  let data;try{data=await AuthClient.request('/api/profile/legacy');}catch(_){return;}if(!data?.progressionEnabled)return;
  const l=data.legacy||{},root=panel.querySelector('.profile-panel');if(!root||root.querySelector('#my-card-legacy'))return;
  const section=document.createElement('section');section.id='my-card-legacy';section.className='meta-section';section.innerHTML=`<h4>🧬 Meu Legado</h4><div class="meta-stat-grid"><div class="meta-stat"><b>${fmt(l.originalCards)}</b><small>Cartas originais</small></div><div class="meta-stat"><b>${fmt(l.playersReached)}</b><small>Jogadores alcançados</small></div><div class="meta-stat"><b>${fmt(l.creativeCoincidences)}</b><small>Coincidências criativas</small></div><div class="meta-stat"><b>${fmt(l.globalWins)}</b><small>Vitórias globais</small></div></div><div class="origin-box" style="margin-top:10px"><b>Criações mais relevantes</b>${(l.cards||[]).slice(0,5).map(c=>`<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span>${escape(c.display_text)}</span><small>${escape(labelLevel(c.legacy_level))} · ${fmt(c.reach_count)} donos · ${fmt(c.presence_count)} partidas</small></div>`).join('')||'<small style="display:block;margin-top:6px;color:var(--text-muted)">Você ainda não possui criações originais com Legado registrado.</small>'}</div>`;root.appendChild(section);
 };
 SocketClient.on('round_result',data=>{if(!data?.originalCelebration)return;setTimeout(()=>{Toast.success(`🧬 DIRETO DA FONTE · ${data.originalCelebration.message}: ${data.originalCelebration.detail}`);},300);});
})();
