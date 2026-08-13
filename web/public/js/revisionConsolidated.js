(()=>{
const rarityLabels={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário'};
const frameNames={bronze:'Bronze',silver:'Silver',gold:'Gold',platinum:'Platinum'};

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
  pm.data.frames?.forEach(f=>{if(frameNames[f.key])f.name=frameNames[f.key];});
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

  const baseRenderTab=ProfileModal.renderTab.bind(ProfileModal);
  ProfileModal.renderTab=function(){
    normalizeProfileData(this);
    const r=baseRenderTab();
    if(this.activeTab==='frames'){
      const legend=this.overlay?.querySelector('.profile-modal-legend');
      if(legend)legend.outerHTML='<div class="frame-progression-legend"><b>Progressão das molduras</b><span>● Copper/Bronze</span><span>● Silver</span><span>● Gold</span><span>● Platinum</span></div>';
    }
    bindProfileDraft(this);ensureProfileFooter(this);return r;
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
    return `<article class="social-person">${this.avatar(x)}<button class="social-person-name" data-public-user="${x.user_id}"><b>${String(x.display_name||'')}</b><small>@${String(x.username||'')}</small></button><div class="social-person-actions social-pending-actions"><span>Pendente</span><button class="social-cancel-button" data-friend-action="decline:${x.id}">Cancelar</button></div></article>`;
  };
}

// Mantém a escala de raridade de títulos/badges independente da progressão material/molduras.
window.CartaralhoRarityLabels=rarityLabels;
})();
