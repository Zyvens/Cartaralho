'use strict';

(function profileAppearanceP19(){
  const TITLE_META={
    'catador-de-ideias':['Catador de Ideias','common'],
    'cliente-suspeito':['Cliente Suspeito','common'],
    'frequentador-do-beco':['Frequentador do Beco','rare'],
    'malabarista-de-lacunas':['Malabarista de Lacunas','superrare'],
    'usina-de-ideias':['Usina de Ideias','epic'],
    'magnata-do-mercado-paralelo':['Magnata do Mercado Paralelo','legendary'],
    'o-criador':['O Criador','celestial']
  };
  window.MetaTitleNames={...(window.MetaTitleNames||{}),...Object.fromEntries(Object.entries(TITLE_META).map(([k,v])=>[k,v[0]]))};
  if(window.MetaUI&&!MetaUI.__p19TitleColors){
    MetaUI.__p19TitleColors=true;
    const old=MetaUI.titleColor.bind(MetaUI),colors={common:'#f4f4f5',rare:'#22c55e',superrare:'#3b82f6',epic:'#a855f7',legendary:'#facc15',celestial:'#67e8f9'};
    MetaUI.titleColor=k=>TITLE_META[k]?colors[TITLE_META[k][1]]:old(k);
  }

  const P=window.ProfileModal;
  if(!P||P.__p19Appearance)return;
  P.__p19Appearance=true;

  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const attr=v=>esc(v).replace(/"/g,'&quot;');
  const baseClose=P.close.bind(P);
  const baseRender=P.render.bind(P);
  const baseRenderTab=P.renderTab.bind(P);

  P._appearanceSaved=null;
  P._appearanceDirty=false;

  P._ensureAppearanceDraft=function(){
    if(!this.data)return;
    if(this._appearanceSaved)return;
    this._appearanceSaved={titleKey:this.data.equipped?.titleKey||null,frameKey:this.data.equipped?.frameKey||null};
    this.data.equipped={...this._appearanceSaved};
    this._appearanceDirty=false;
  };

  P.close=function(){
    this._appearanceSaved=null;
    this._appearanceDirty=false;
    return baseClose();
  };

  P.render=function(){this._ensureAppearanceDraft();return baseRender();};

  P._refreshCurrentTab=function(tab){
    this.activeTab=tab;
    const body=this.overlay?.querySelector('#profile-modal-body'),scroll=body?.scrollTop||0;
    this.renderTab();
    if(body)body.scrollTop=scroll;
  };

  P._setAvatarFrameClass=function(node,key){
    if(!node)return;
    [...node.classList].filter(c=>c.startsWith('frame-')).forEach(c=>node.classList.remove(c));
    if(key)node.classList.add(`frame-${key}`);
  };

  P._syncAppearanceDom=function(){
    const d=this.data||{},titleKey=d.equipped?.titleKey||null,frameKey=d.equipped?.frameKey||null;
    const title=(d.titles||[]).find(x=>x.key===titleKey)||null,frame=(d.frames||[]).find(x=>x.key===frameKey)||null;
    const root=this.overlay;if(!root)return;

    const titleSelect=root.querySelector('[data-profile-draft-title]'),frameSelect=root.querySelector('[data-profile-draft-frame]');
    if(titleSelect)titleSelect.value=titleKey||'';
    if(frameSelect)frameSelect.value=frameKey||'';

    [
      root.querySelector('.profile-modal-identity .avatar-frame'),
      root.querySelector('#profile-modal-avatar-preview .avatar-frame'),
      root.querySelector('.profile-appearance-live-preview .avatar-frame'),
      root.querySelector('.profile-modal-frame-hero .avatar-frame')
    ].filter(Boolean).forEach(node=>this._setAvatarFrameClass(node,frameKey));

    const live=root.querySelector('.profile-appearance-live-preview>div');
    if(live){
      let titleNode=live.querySelector('.equipped-title,.profile-appearance-no-title');
      if(!titleNode){titleNode=document.createElement('span');live.appendChild(titleNode);}
      if(title){titleNode.className='equipped-title';titleNode.dataset.titleKey=title.key;titleNode.textContent=`${title.icon||'🏷️'} ${title.name}`;}
      else{titleNode.className='profile-appearance-no-title';titleNode.removeAttribute('data-title-key');titleNode.textContent='Sem título';}
      let frameNode=live.querySelector('em');if(!frameNode){frameNode=document.createElement('em');live.appendChild(frameNode);}
      frameNode.textContent=frame?`◉ ${frame.name}`:'◌ Sem moldura';
    }

    const handle=root.querySelector('.profile-modal-handle');
    if(handle){
      let current=handle.querySelector('.profile-modal-title');
      if(title){if(!current){current=document.createElement('span');current.className='profile-modal-title';handle.append(' ',current);}current.className=`profile-modal-title rarity-${title.rarity||'common'}`;current.textContent=`${title.icon||'🏷️'} ${title.name}`;}
      else current?.remove();
    }

    const frameHero=root.querySelector('.profile-modal-frame-hero');
    if(frameHero){const h=frameHero.querySelector('h3');if(h)h.textContent=frame?.name||'Sem moldura';}
    root.querySelectorAll('[data-equip-frame]').forEach(btn=>{
      const active=btn.dataset.equipFrame===frameKey,card=btn.closest('.profile-modal-frame-item'),top=card?.querySelector('.profile-modal-unlock-top');
      card?.classList.toggle('equipped',active);btn.textContent=active?'Usando':'Equipar';
      const pill=top?.querySelector('.profile-modal-equipped-pill');
      if(active&&!pill){const el=document.createElement('span');el.className='profile-modal-equipped-pill';el.textContent='EQUIPADO';top?.appendChild(el);}else if(!active)pill?.remove();
    });
    const titleFeature=root.querySelector('.profile-modal-feature-card');
    if(this.activeTab==='titles'&&titleFeature){const h=titleFeature.querySelector('h3');if(h)h.textContent=title?.name||'Nenhum título equipado';}
    root.querySelectorAll('[data-equip-title]').forEach(btn=>{
      const active=btn.dataset.equipTitle===titleKey,card=btn.closest('.profile-modal-unlock'),top=card?.querySelector('.profile-modal-unlock-top');
      card?.classList.toggle('equipped',active);btn.textContent=active?'Usando':'Equipar';
      const pill=top?.querySelector('.profile-modal-equipped-pill');
      if(active&&!pill){const el=document.createElement('span');el.className='profile-modal-equipped-pill';el.textContent='EQUIPADO';top?.appendChild(el);}else if(!active)pill?.remove();
    });

    const footer=root.querySelector('.profile-global-footer');
    if(footer){footer.classList.toggle('is-dirty',this._appearanceDirty);const copy=footer.querySelector('small');if(copy)copy.textContent=this._appearanceDirty?'Há alterações de aparência aguardando o Salvar alterações.':'Perfil, título e moldura são confirmados juntos.';}
  };

  P._setAppearanceDraft=function(kind,key){
    this._ensureAppearanceDraft();
    if(!this.data?.equipped)return;
    if(kind==='title')this.data.equipped.titleKey=key||null;else this.data.equipped.frameKey=key||null;
    this._appearanceDirty=this.data.equipped.titleKey!==this._appearanceSaved.titleKey||this.data.equipped.frameKey!==this._appearanceSaved.frameKey;
    this.__appearanceDirty=this._appearanceDirty;
    this._syncAppearanceDom();
  };

  P.equipTitle=function(key){this._setAppearanceDraft('title',key||null);};
  P.equipFrame=function(key){this._setAppearanceDraft('frame',key||null);};

  // Compatibilidade: qualquer chamada antiga de salvar aparência usa o único botão global.
  P.saveAppearance=async function(){this.overlay?.querySelector('.profile-global-save')?.click();};
  P._appearanceSavebar=function(){return'';};

  P._profileAppearanceCard=function(){
    const d=this.data||{},titles=(d.titles||[]).filter(x=>x.unlocked),frames=(d.frames||[]).filter(x=>x.unlocked),t=d.equipped?.titleKey||'',f=d.equipped?.frameKey||'';
    return `<section class="profile-modal-card profile-appearance-selector-card"><div class="profile-modal-section-heading"><div><span>APARÊNCIA DA PARTIDA</span><h3>Título e moldura</h3></div></div><p class="profile-appearance-help">Escolha como seu perfil aparece no Lobby e durante a partida. Você pode testar a combinação antes de salvar.</p><div class="profile-appearance-selectors"><label><span>Título</span><select class="input" data-profile-draft-title><option value="">Sem título</option>${titles.map(x=>`<option value="${attr(x.key)}" ${t===x.key?'selected':''}>${esc(x.icon||'🏷️')} ${esc(x.name)} · ${esc(x.rarityInfo?.label||x.rarity)}</option>`).join('')}</select></label><label><span>Moldura</span><select class="input" data-profile-draft-frame><option value="">Sem moldura</option>${frames.map(x=>`<option value="${attr(x.key)}" ${f===x.key?'selected':''}>${esc(x.icon||'◉')} ${esc(x.name)} · ${esc(x.rarityInfo?.label||x.rarity)}</option>`).join('')}</select></label></div></section>`;
  };

  P.renderTab=function(){
    const out=baseRenderTab();
    const body=this.overlay?.querySelector('#profile-modal-body');if(!body)return out;
    if(this.activeTab==='profile'){
      const layout=body.querySelector('.profile-tab-layout-profile');
      if(layout&&!layout.querySelector('.profile-appearance-selector-card'))layout.insertAdjacentHTML('beforeend',this._profileAppearanceCard());
    }
    body.querySelector('[data-profile-draft-title]')?.addEventListener('change',e=>this._setAppearanceDraft('title',e.target.value||null));
    body.querySelector('[data-profile-draft-frame]')?.addEventListener('change',e=>this._setAppearanceDraft('frame',e.target.value||null));
    this._syncAppearanceDom();
    return out;
  };
})();
