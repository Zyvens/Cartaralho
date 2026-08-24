'use strict';
(()=>{
 if(window.CartProfileDomain)return;
 CartDomains.claim('profileUI','domains/profileUI.js',()=>{
  const COLORS={common:'#f4f4f5',rare:'#22c55e',superrare:'#3b82f6',epic:'#a855f7',legendary:'#facc15',celestial:'#bff7ff'};
  const RARITY_ORDER={common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6};
  const RARITY_LABEL={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário',celestial:'Celestial'};
  const PROGRESSION_FRAME_NAMES={bronze:'Bronze',silver:'Prata',gold:'Ouro',platinum:'Platina'};
  const PROGRESSION_FRAME_DESCRIPTIONS={bronze:'Tenha 5 cartas Bronze no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.',silver:'Tenha 5 cartas Prata no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.',gold:'Tenha 5 cartas Ouro no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.',platinum:'Tenha 5 cartas Platina no seu baralho. Depois de desbloqueada, esta moldura pode ser equipada livremente no Perfil.'};
  const GENESIS={key:'genese-celestial',name:'Gênese',icon:'✦',rarity:'celestial',description:'A moldura que existia antes do catálogo. Exclusiva de quem fez o Cartaralho existir.',target:1,progress:1,unlocked:true,isEntitlement:true,rarityInfo:{key:'celestial',label:'Celestial',color:'#dffbff',order:6,effect:'iridescent'}};
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const frameClasses=node=>[...(node?.classList||[])].filter(c=>c.startsWith('frame-'));
  const titleName=t=>t?`${t.icon||'🏷️'} ${t.name}`:'Nenhum título';
  function normalizeProfileData(pm=window.ProfileModal){
   if(!pm?.data)return;
   pm.data.titles=Array.isArray(pm.data.titles)?pm.data.titles:[];
   pm.data.frames=Array.isArray(pm.data.frames)?pm.data.frames:[];
   pm.data.equipped=pm.data.equipped||{titleKey:null,frameKey:null};
   pm.data.titles.forEach(t=>{t.rarityInfo={...(t.rarityInfo||{}),label:RARITY_LABEL[t.rarity]||t.rarityInfo?.label||'Comum'};});
   pm.data.frames.forEach(f=>{const key=String(f?.key||'');f.rarityInfo={...(f.rarityInfo||{}),label:RARITY_LABEL[f.rarity]||f.rarityInfo?.label||'Comum'};if(PROGRESSION_FRAME_NAMES[key]){f.name=PROGRESSION_FRAME_NAMES[key];f.description=PROGRESSION_FRAME_DESCRIPTIONS[key];f.progressionFrame=true;}});
   const entitlements=Array.isArray(pm.data.prestige?.entitlements)?pm.data.prestige.entitlements:[],equipped=pm.data.equipped.frameKey||AuthClient?.user?.equipped_frame_key||null,hasGenesis=entitlements.some(e=>e?.entitlement_type==='frame'&&e?.entitlement_key==='genese-celestial')||equipped==='genese-celestial';
   if(hasGenesis&&!pm.data.frames.some(f=>f.key==='genese-celestial'))pm.data.frames.push({...GENESIS});
   if(!pm.data.equipped.frameKey&&equipped==='genese-celestial')pm.data.equipped.frameKey='genese-celestial';
   pm.data.titles.sort((a,b)=>(RARITY_ORDER[a.rarity]||99)-(RARITY_ORDER[b.rarity]||99)||String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));
   pm.data.frames.sort((a,b)=>(RARITY_ORDER[a.rarity]||99)-(RARITY_ORDER[b.rarity]||99)||String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));
  }
  function keepBasicPhotoPlain(root=document){const node=root.querySelector?.('.profile-modal-avatar-editor-card #profile-modal-avatar-preview .profile-modal-avatar')||document.querySelector('.profile-modal-avatar-editor-card #profile-modal-avatar-preview .profile-modal-avatar');if(!node)return;frameClasses(node).forEach(c=>node.classList.remove(c));}
  function colorAppearanceSelectors(){/* v1.5: selectors removed; kept as compatibility no-op. */}
  function stabilizeGenesis(root=document){root.querySelectorAll?.('.profile-modal-frame-grid').forEach(grid=>{grid.classList.add('p57-live-frame-grid','p58-live-frame-grid');grid.classList.remove('profile-modal-frame-grid');});root.querySelectorAll?.('.p58-live-frame-grid .avatar-frame.frame-genese-celestial,.p57-live-frame-grid .avatar-frame.frame-genese-celestial').forEach(frame=>{window.GenesisFrameP29?.mount?.(frame);frame.classList.add('p58-genesis-preview');});}
  function captureProfileDraft(pm){if(!pm?.overlay)return;const name=pm.overlay.querySelector('#profile-modal-name'),email=pm.overlay.querySelector('#profile-modal-email'),bio=pm.overlay.querySelector('#profile-modal-bio');if(!name&&!email&&!bio)return;pm.__profileDraft={displayName:name?.value??pm.__profileDraft?.displayName??AuthClient.user?.display_name??'',email:email?.value??pm.__profileDraft?.email??AuthClient.user?.email??'',bio:bio?.value??pm.__profileDraft?.bio??''};}
  function bindProfileDraft(pm){if(!pm?.overlay||pm.activeTab!=='profile')return;const d=pm.__profileDraft||{},name=pm.overlay.querySelector('#profile-modal-name'),email=pm.overlay.querySelector('#profile-modal-email'),bio=pm.overlay.querySelector('#profile-modal-bio');if(name&&d.displayName!==undefined)name.value=d.displayName;if(email&&d.email!==undefined)email.value=d.email;if(bio&&d.bio!==undefined)bio.value=d.bio;[name,email,bio].filter(Boolean).forEach(el=>{if(el.__domainDraftBound)return;el.__domainDraftBound=true;el.addEventListener('input',()=>captureProfileDraft(pm));});}
  function ensureAppearanceDraft(pm){if(!pm?.data)return;if(pm._appearanceSaved)return;pm._appearanceSaved={titleKey:pm.data.equipped?.titleKey||null,frameKey:pm.data.equipped?.frameKey||null};pm.data.equipped={...pm._appearanceSaved};pm._appearanceDirty=false;pm.__appearanceDirty=false;}
  function setAppearanceDraft(pm,kind,key){
   ensureAppearanceDraft(pm);if(!pm?.data?.equipped)return;
   const normalized=key||null,list=kind==='title'?pm.data.titles:pm.data.frames;
   if(normalized&&!list.some(x=>String(x.key)===String(normalized)&&x.unlocked))return;
   if(kind==='title')pm.data.equipped.titleKey=normalized;else pm.data.equipped.frameKey=normalized;
   pm._appearanceDirty=pm.data.equipped.titleKey!==pm._appearanceSaved.titleKey||pm.data.equipped.frameKey!==pm._appearanceSaved.frameKey;
   pm.__appearanceDirty=pm._appearanceDirty;
   syncAppearanceDom(pm);
  }
  function addStatusPill(top,label,preview=false){
   if(!top)return;
   const pill=document.createElement('span');
   pill.className=preview?'profile-modal-preview-pill':'profile-modal-equipped-pill';
   pill.textContent=label;
   top.appendChild(pill);
  }
  function syncCardStatuses(pm,root){
   const saved=pm._appearanceSaved||{titleKey:null,frameKey:null},draft=pm.data?.equipped||{titleKey:null,frameKey:null};
   root.querySelectorAll('[data-preview-title]').forEach(card=>{
    const key=card.dataset.previewTitle,isSaved=key===String(saved.titleKey||''),isPreview=key===String(draft.titleKey||'')&&!isSaved,top=card.querySelector('.profile-modal-unlock-top');
    card.classList.toggle('equipped',isSaved);card.classList.toggle('previewing',isPreview);
    top?.querySelectorAll('.profile-modal-equipped-pill,.profile-modal-preview-pill').forEach(x=>x.remove());
    if(isSaved)addStatusPill(top,'EQUIPADO');if(isPreview)addStatusPill(top,'EXPERIMENTANDO',true);
   });
   root.querySelectorAll('[data-preview-frame]').forEach(card=>{
    const key=card.dataset.previewFrame,isSaved=key===String(saved.frameKey||''),isPreview=key===String(draft.frameKey||'')&&!isSaved,top=card.querySelector('.profile-modal-unlock-top');
    card.classList.toggle('equipped',isSaved);card.classList.toggle('previewing',isPreview);
    top?.querySelectorAll('.profile-modal-equipped-pill,.profile-modal-preview-pill').forEach(x=>x.remove());
    if(isSaved)addStatusPill(top,'EQUIPADO');if(isPreview)addStatusPill(top,'EXPERIMENTANDO',true);
   });
  }
  function bindAppearanceCards(pm,body){
   if(!body)return;
   body.querySelectorAll('[data-equip-title]').forEach(btn=>{
    const key=btn.dataset.equipTitle,card=btn.closest('.profile-modal-unlock');if(!card)return;
    card.dataset.previewTitle=key;card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Experimentar título ${card.querySelector('h3')?.textContent||''}`);
    btn.remove();
    const choose=e=>{if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;if(e.type==='keydown')e.preventDefault();setAppearanceDraft(pm,'title',key);};
    card.addEventListener('click',choose);card.addEventListener('keydown',choose);
   });
   body.querySelectorAll('[data-equip-frame]').forEach(btn=>{
    const key=btn.dataset.equipFrame,card=btn.closest('.profile-modal-frame-item');if(!card)return;
    card.dataset.previewFrame=key;card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Experimentar moldura ${card.querySelector('h3')?.textContent||''}`);
    btn.remove();
    const choose=e=>{if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;if(e.type==='keydown')e.preventDefault();setAppearanceDraft(pm,'frame',key);};
    card.addEventListener('click',choose);card.addEventListener('keydown',choose);
   });
  }
  function syncAppearanceDom(pm){
   if(!pm?.overlay||!pm.data)return;
   normalizeProfileData(pm);ensureAppearanceDraft(pm);
   const d=pm.data,root=pm.overlay,titleKey=d.equipped?.titleKey||null,frameKey=d.equipped?.frameKey||null,title=d.titles.find(x=>x.key===titleKey)||null,frame=d.frames.find(x=>x.key===frameKey)||null,saved=pm._appearanceSaved||{};
   [root.querySelector('.profile-modal-identity .avatar-frame')].filter(Boolean).forEach(node=>{frameClasses(node).forEach(c=>node.classList.remove(c));if(frameKey)node.classList.add(`frame-${frameKey}`);});
   keepBasicPhotoPlain(root);
   const handle=root.querySelector('.profile-modal-handle');
   if(handle){let current=handle.querySelector('.profile-modal-title');if(title){if(!current){current=document.createElement('span');current.className='profile-modal-title';handle.append(' ',current);}current.className=`profile-modal-title rarity-${title.rarity||'common'}`;current.textContent=titleName(title);}else current?.remove();}
   if(pm.activeTab==='titles'){
    const feature=root.querySelector('.profile-modal-feature-card'),eyebrow=feature?.querySelector('.profile-modal-eyebrow'),heading=feature?.querySelector('h3'),dirty=titleKey!==(saved.titleKey||null);
    if(eyebrow)eyebrow.textContent=dirty?'TÍTULO EM PRÉVIA':'TÍTULO EQUIPADO';
    if(heading)heading.textContent=title?.name||'Nenhum título equipado';
    const clear=root.querySelector('#profile-modal-clear-title');if(clear)clear.disabled=!titleKey;
   }
   if(pm.activeTab==='frames'){
    const hero=root.querySelector('.profile-modal-frame-hero'),eyebrow=hero?.querySelector('.profile-modal-eyebrow'),heading=hero?.querySelector('h3'),preview=hero?.querySelector('.profile-modal-frame-preview'),dirty=frameKey!==(saved.frameKey||null);
    if(eyebrow)eyebrow.textContent=dirty?'MOLDURA EM PRÉVIA':'MOLDURA EQUIPADA';
    if(heading)heading.textContent=frame?.name||'Sem moldura';
    if(preview)preview.innerHTML=pm.avatar(pm.draftAvatar,132,frameKey);
    const clear=root.querySelector('#profile-modal-clear-frame');if(clear)clear.disabled=!frameKey;
   }
   syncCardStatuses(pm,root);
   const footer=root.querySelector('.profile-global-footer');
   if(footer){footer.classList.toggle('is-dirty',!!pm._appearanceDirty);const copy=footer.querySelector('small');if(copy)copy.textContent=pm._appearanceDirty?'Você está experimentando uma aparência. Salve para equipar; fechar no X descarta a prévia.':'Alterações de perfil, título e moldura só entram em vigor ao salvar.';}
   stabilizeGenesis(root);MetaUI?.decorateTitles?.();
  }
  function profileAppearanceCard(){return'';}
  function ensureFooter(pm){
   const shell=pm?.overlay?.querySelector('.profile-modal-shell');if(!shell)return;
   if(!shell.__domainDraftCapture){shell.__domainDraftCapture=true;shell.addEventListener('click',e=>{if(e.target.closest('[data-profile-tab]'))captureProfileDraft(pm);},true);}
   let footer=shell.querySelector('.profile-global-footer');
   if(!footer){footer=document.createElement('footer');footer.className='profile-global-footer';footer.innerHTML='<div class="profile-global-footer-copy"><b>Configuração da conta</b><small>Alterações de perfil, título e moldura só entram em vigor ao salvar.</small></div><button type="button" class="btn btn-primary profile-global-save">Salvar alterações</button>';shell.appendChild(footer);footer.querySelector('.profile-global-save').onclick=()=>saveAll(pm);}
   syncAppearanceDom(pm);
  }
  async function saveAll(pm){
   captureProfileDraft(pm);const btn=pm?.overlay?.querySelector('.profile-global-save');if(!btn||!AuthClient.user)return;
   btn.disabled=true;btn.classList.add('is-saving');btn.textContent='Salvando...';
   try{
    const d=pm.__profileDraft||{displayName:AuthClient.user.display_name,email:AuthClient.user.email||'',bio:AuthClient.user.bio||''},titleKey=pm.data?.equipped?.titleKey||null,frameKey=pm.data?.equipped?.frameKey||null;
    await AuthClient.saveProfile({displayName:d.displayName,email:d.email,bio:d.bio,avatarData:pm.draftAvatar,titleKey,frameKey});
    pm.data.equipped={titleKey:AuthClient.user?.equipped_title_key||null,frameKey:AuthClient.user?.equipped_frame_key||null};pm._appearanceSaved={...pm.data.equipped};pm._appearanceDirty=false;pm.__appearanceDirty=false;
    if(window.App?.state){App.state.matchTitleKey=pm.data.equipped.titleKey;App.state.matchFrameKey=pm.data.equipped.frameKey;}
    pm.__profileDraft={displayName:AuthClient.user.display_name,email:AuthClient.user.email||'',bio:AuthClient.user.bio||''};
    HomeScreen.renderAccount();Toast.success('Alterações salvas.');pm.render();
   }catch(e){Toast.error(e.message||'Não foi possível salvar.');}
   finally{const fresh=pm?.overlay?.querySelector('.profile-global-save');if(fresh){fresh.disabled=false;fresh.classList.remove('is-saving');fresh.textContent='Salvar alterações';}}
  }
  function install(){
   if(typeof ProfileModal==='undefined'||ProfileModal.__domainOwned)return;
   const P=ProfileModal;P.__domainOwned=true;
   const baseOpen=P.open.bind(P),baseClose=P.close.bind(P),baseRender=P.render.bind(P),baseRenderProfile=P.renderProfile.bind(P),baseRenderFrames=P.renderFrames.bind(P),baseRenderTab=P.renderTab.bind(P),fallbackMission=P.missionCard?.bind(P);
   P.open=async function(tab='profile'){this.__profileDraft={displayName:AuthClient.user?.display_name||'',email:AuthClient.user?.email||'',bio:AuthClient.user?.bio||''};this._appearanceSaved=null;this._appearanceDirty=false;this.__appearanceDirty=false;const out=await baseOpen(tab);normalizeProfileData(this);ensureAppearanceDraft(this);return out;};
   P.close=function(){this._appearanceSaved=null;this._appearanceDirty=false;this.__appearanceDirty=false;this.__profileDraft=null;return baseClose();};
   P.render=function(...args){normalizeProfileData(this);ensureAppearanceDraft(this);const out=baseRender(...args);ensureFooter(this);return out;};
   P.renderProfile=function(body){const out=baseRenderProfile(body),repaint=()=>{const p=body.querySelector('#profile-modal-avatar-preview');if(p)p.innerHTML=this.avatar(this.draftAvatar,116,null);keepBasicPhotoPlain(body);};repaint();const file=body.querySelector('#profile-modal-avatar-file');if(file)file.onchange=async e=>{try{const chosen=e.target.files?.[0];if(!chosen)return;this.draftAvatar=await AuthClient.imageToAvatar(chosen);repaint();}catch(err){Toast.error(err.message);}};const remove=body.querySelector('#profile-modal-avatar-remove');if(remove)remove.onclick=()=>{this.draftAvatar=null;repaint();};body.querySelector('.profile-modal-savebar')?.remove();return out;};
   P.renderFrames=function(body,...args){normalizeProfileData(this);const out=baseRenderFrames(body,...args);stabilizeGenesis(body);requestAnimationFrame(()=>stabilizeGenesis(body));return out;};
   P.renderTab=function(...args){captureProfileDraft(this);normalizeProfileData(this);const out=baseRenderTab(...args),body=this.overlay?.querySelector('#profile-modal-body');body?.querySelectorAll('.profile-modal-savebar,.profile-appearance-savebar,.profile-appearance-selector-card').forEach(x=>x.remove());bindProfileDraft(this);bindAppearanceCards(this,body);keepBasicPhotoPlain();stabilizeGenesis();ensureFooter(this);syncAppearanceDom(this);return out;};
   P.equipTitle=function(key){setAppearanceDraft(this,'title',key||null);};
   P.equipFrame=function(key){setAppearanceDraft(this,'frame',key||null);};
   P.saveAppearance=async function(){this.overlay?.querySelector('.profile-global-save')?.click();};
   P._appearanceSavebar=()=>'';
   P._profileAppearanceCard=()=>'';
   P._syncAppearanceDom=function(){syncAppearanceDom(this);};
   P.rarityLegend=()=>'<span class="rarity-common">● Comum</span><span class="rarity-rare">● Incomum</span><span class="rarity-superrare">● Raro</span><span class="rarity-epic">● Épico</span><span class="rarity-legendary">● Lendário</span><span class="rarity-celestial">✦ Celestial</span>';
   if(fallbackMission)P.missionCard=function(m){return window.CartMissionsDomain?.missionRow?.(m)||window.MetaUI?.missionRow?.(m)||fallbackMission(m);};
  }
  install();
  window.addEventListener('pageshow',()=>{install();normalizeProfileData();stabilizeGenesis();});
  window.CartProfileDomain={install,keepBasicPhotoPlain,colorAppearanceSelectors,stabilizeGenesis,normalizeProfileData,profileAppearanceCard,saveAll,setAppearanceDraft,syncAppearanceDom,PROGRESSION_FRAME_NAMES};
 });
})();
