(()=>{
const rarityLabels={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário'};
const frameNames={bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
const frameDescriptions={bronze:'Tenha 5 cartas Bronze no seu baralho.',silver:'Tenha 5 cartas Prata no seu baralho.',gold:'Tenha 5 cartas Ouro no seu baralho.',platinum:'Tenha 5 cartas Platina no seu baralho.'};
const baseFrameKeys=['bronze','silver','gold','platinum'];
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function captureProfileDraft(pm){
  if(!pm?.overlay)return;
  const name=pm.overlay.querySelector('#profile-modal-name'),email=pm.overlay.querySelector('#profile-modal-email'),bio=pm.overlay.querySelector('#profile-modal-bio');
  if(!name&&!email&&!bio)return;
  pm.__profileDraft={
    displayName:name?.value??pm.__profileDraft?.displayName??AuthClient.user?.display_name??'',
    email:email?.value??pm.__profileDraft?.email??AuthClient.user?.email??'',
    bio:bio?.value??pm.__profileDraft?.bio??AuthClient.user?.bio??''
  };
}

function normalizeProfileData(pm){
  if(!pm?.data)return;
  pm.data.titles?.forEach(t=>{t.rarityInfo=t.rarityInfo||{};t.rarityInfo.label=rarityLabels[t.rarity]||t.rarityInfo.label||'Comum';});
  if(Array.isArray(pm.data.frames)){
    pm.data.frames=pm.data.frames.filter(f=>baseFrameKeys.includes(f.key));
    pm.data.frames.forEach(f=>{
      f.name=frameNames[f.key]||f.name;
      f.description=frameDescriptions[f.key]||f.description;
    });
    if(pm.data.equipped?.frameKey&&!baseFrameKeys.includes(pm.data.equipped.frameKey))pm.data.equipped.frameKey=null;
  }
}

function bindProfileDraft(pm){
  if(!pm?.overlay||pm.activeTab!=='profile')return;
  const d=pm.__profileDraft||{};
  const name=pm.overlay.querySelector('#profile-modal-name'),email=pm.overlay.querySelector('#profile-modal-email'),bio=pm.overlay.querySelector('#profile-modal-bio');
  if(name&&d.displayName!==undefined)name.value=d.displayName;
  if(email&&d.email!==undefined)email.value=d.email;
  if(bio&&d.bio!==undefined)bio.value=d.bio;
  [name,email,bio].filter(Boolean).forEach(el=>{if(el.__draftBound)return;el.__draftBound=true;el.addEventListener('input',()=>captureProfileDraft(pm));});
}

function ensureProfileFooter(pm){
  const shell=pm?.overlay?.querySelector('.profile-modal-shell');if(!shell)return;
  if(!shell.__draftCaptureBound){shell.__draftCaptureBound=true;shell.addEventListener('click',e=>{if(e.target.closest('[data-profile-tab]'))captureProfileDraft(pm);},true);}
  let footer=shell.querySelector('.profile-global-footer');
  if(!footer){
    footer=document.createElement('footer');footer.className='profile-global-footer';
    footer.innerHTML='<div class="profile-global-footer-copy"><b>Configuração da conta</b><small>Perfil, título e moldura são confirmados juntos.</small></div><button type="button" class="btn btn-primary profile-global-save">Salvar alterações</button>';
    shell.appendChild(footer);
    footer.querySelector('.profile-global-save').onclick=()=>saveProfileAll(pm);
  }
}

async function saveProfileAll(pm){
  captureProfileDraft(pm);const btn=pm?.overlay?.querySelector('.profile-global-save');if(!btn||!AuthClient.user)return;
  btn.disabled=true;btn.classList.add('is-saving');btn.textContent='Salvando...';
  try{
    const d=pm.__profileDraft||{displayName:AuthClient.user.display_name,email:AuthClient.user.email||'',bio:AuthClient.user.bio||''};
    await AuthClient.saveProfile({displayName:d.displayName,email:d.email,bio:d.bio,avatarData:pm.draftAvatar});
    await MetaClient.equip(pm.data?.equipped?.titleKey||null,pm.data?.equipped?.frameKey||null);
    AuthClient.user.equipped_title_key=pm.data?.equipped?.titleKey||null;
    AuthClient.user.equipped_frame_key=pm.data?.equipped?.frameKey||null;
    pm.__profileDraft={displayName:AuthClient.user.display_name,email:AuthClient.user.email||'',bio:AuthClient.user.bio||''};
    HomeScreen.renderAccount();Toast.success('Alterações salvas.');pm.render();
  }catch(e){Toast.error(e.message||'Não foi possível salvar.');}
  finally{const fresh=pm?.overlay?.querySelector('.profile-global-save');if(fresh){fresh.disabled=false;fresh.classList.remove('is-saving');fresh.textContent='Salvar alterações';}}
}

if(window.ProfileModal){
  const baseOpen=ProfileModal.open.bind(ProfileModal);
  ProfileModal.open=async function(tab='profile'){
    this.__profileDraft={displayName:AuthClient.user?.display_name||'',email:AuthClient.user?.email||'',bio:AuthClient.user?.bio||''};
    this.__appearanceDirty=false;
    return baseOpen(tab);
  };

  const baseRender=ProfileModal.render.bind(ProfileModal);
  ProfileModal.render=function(){normalizeProfileData(this);return baseRender();};

  const baseRenderTab=ProfileModal.renderTab.bind(ProfileModal);
  ProfileModal.renderTab=function(){
    normalizeProfileData(this);
    const r=baseRenderTab();
    if(this.activeTab==='frames'){
      const legend=this.overlay?.querySelector('.profile-modal-legend');
      if(legend)legend.outerHTML='<div class="frame-progression-legend"><span>● Bronze</span><span>● Prata</span><span>● Ouro</span><span>● Platina</span></div>';
    }
    bindProfileDraft(this);ensureProfileFooter(this);return r;
  };

  ProfileModal.frameCard=function(f){
    const equipped=this.data.equipped.frameKey===f.key;
    const pct=Math.min(100,(Number(f.progress||0)/Math.max(1,Number(f.target||1)))*100);
    return `<article class="profile-modal-unlock profile-modal-frame-item frame-tier-${safe(f.key)} ${f.unlocked?'unlocked':'locked'} ${equipped?'equipped':''}">
      <div class="profile-modal-frame-sample">${this.avatar(this.draftAvatar,64,f.key)}</div>
      <div class="profile-modal-frame-copy"><div class="profile-modal-unlock-top">${equipped?'<span class="profile-modal-equipped-pill">EQUIPADO</span>':''}</div><h3>${safe(f.name)}</h3><p>${safe(f.description)}</p><div class="profile-modal-progress"><span style="width:${pct}%"></span></div><div class="profile-modal-unlock-foot"><small>${Math.min(Number(f.progress||0),Number(f.target||0))}/${f.target}</small>${f.unlocked?`<button type="button" class="profile-modal-equip-button" data-equip-frame="${safe(f.key)}">${equipped?'Usando':'Equipar'}</button>`:'<span>Bloqueada</span>'}</div></div>
    </article>`;
  };

  ProfileModal.equipTitle=function(key){
    if(!this.data)return;this.data.equipped.titleKey=key||null;this.__appearanceDirty=true;this.activeTab='titles';this.render();
  };
  ProfileModal.equipFrame=function(key){
    if(!this.data)return;this.data.equipped.frameKey=key||null;this.__appearanceDirty=true;this.activeTab='frames';this.render();
  };
  ProfileModal.rarityLegend=()=>'<span class="rarity-common">● Comum</span><span class="rarity-rare">● Incomum</span><span class="rarity-superrare">● Raro</span><span class="rarity-epic">● Épico</span><span class="rarity-legendary">● Lendário</span>';
}

if(window.SocialUI){
  const basePersonRow=SocialUI.personRow.bind(SocialUI);
  SocialUI.personRow=function(x,type){
    if(type!=='outgoing')return basePersonRow(x,type);
    return `<article class="social-person">${this.avatar(x)}<button class="social-person-name" data-public-user="${x.user_id}"><b>${safe(x.display_name)}</b><small>@${safe(x.username)}</small></button><div class="social-person-actions social-pending-actions"><span>Pendente</span><button class="social-cancel-button" data-friend-action="decline:${x.id}">Cancelar</button></div></article>`;
  };
}

window.CartaralhoRarityLabels=rarityLabels;
})();
