'use strict';
(()=>{
 const P=window.ProfileModal;if(!P||!P._profileAppearanceCard||P.__p20AppearancePreview)return;P.__p20AppearancePreview=true;
 const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
 const attr=v=>esc(v).replace(/"/g,'&quot;');
 const GENESIS={key:'genese-celestial',name:'Gênese',icon:'✦',rarity:'celestial',description:'A moldura que existia antes do catálogo. Exclusiva de quem fez o Cartaralho existir.',target:1,progress:1,unlocked:true,isEntitlement:true,rarityInfo:{key:'celestial',label:'Celestial',color:'#dffbff',order:6,effect:'iridescent'}};
 P._reconcileSpecialAppearance=function(){
  const d=this.data;if(!d)return;
  d.frames=Array.isArray(d.frames)?d.frames:[];d.equipped=d.equipped||{titleKey:null,frameKey:null};
  const entitlements=Array.isArray(d.prestige?.entitlements)?d.prestige.entitlements:[];
  const hasGenesis=entitlements.some(e=>e?.entitlement_type==='frame'&&e?.entitlement_key==='genese-celestial')||d.equipped.frameKey==='genese-celestial'||window.AuthClient?.user?.equipped_frame_key==='genese-celestial';
  if(hasGenesis&&!d.frames.some(f=>f?.key==='genese-celestial'))d.frames.push({...GENESIS});
  if(!d.equipped.frameKey&&window.AuthClient?.user?.equipped_frame_key==='genese-celestial')d.equipped.frameKey='genese-celestial';
 };
 const baseRender=P.render.bind(P);
 P.render=function(){this._reconcileSpecialAppearance();return baseRender();};
 P._profileAppearanceCard=function(){
  this._reconcileSpecialAppearance();
  const d=this.data||{},titles=(d.titles||[]).filter(x=>x.unlocked),frames=(d.frames||[]).filter(x=>x.unlocked),t=d.equipped?.titleKey||'',f=d.equipped?.frameKey||'',title=titles.find(x=>x.key===t),frame=frames.find(x=>x.key===f),u=window.AuthClient?.user||{};
  return `<section class="profile-modal-card profile-appearance-selector-card"><div class="profile-modal-section-heading"><div><span>APARÊNCIA DA PARTIDA</span><h3>Título e moldura</h3></div></div><p class="profile-appearance-help">Escolha como seu perfil aparece no Lobby e durante a partida. A prévia abaixo muda antes de salvar.</p><div class="profile-appearance-live-preview">${this.avatar(this.draftAvatar,76,f||null)}<div><small>PRÉVIA PÚBLICA</small><b>${esc(u.display_name||'Jogador')}</b>${title?`<span class="equipped-title" data-title-key="${attr(title.key)}">${esc(title.icon||'🏷️')} ${esc(title.name)}</span>`:'<span class="profile-appearance-no-title">Sem título</span>'}${frame?`<em>◉ ${esc(frame.name)}</em>`:'<em>◌ Sem moldura</em>'}</div></div><div class="profile-appearance-selectors"><label><span>Título</span><select class="input" data-profile-draft-title><option value="">Sem título</option>${titles.map(x=>`<option value="${attr(x.key)}" ${t===x.key?'selected':''}>${esc(x.icon||'🏷️')} ${esc(x.name)} · ${esc(x.rarityInfo?.label||x.rarity)}</option>`).join('')}</select></label><label><span>Moldura</span><select class="input" data-profile-draft-frame><option value="">Sem moldura</option>${frames.map(x=>`<option value="${attr(x.key)}" ${f===x.key?'selected':''}>${esc(x.icon||'◉')} ${esc(x.name)} · ${esc(x.rarityInfo?.label||x.rarity)}</option>`).join('')}</select></label></div>${this._appearanceSavebar()}</section>`;
 };
})();
