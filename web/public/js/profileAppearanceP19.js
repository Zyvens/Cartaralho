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
    this.render();
    const shell=this.overlay?.querySelector('.profile-modal-shell');
    shell?.querySelectorAll('[data-profile-tab]').forEach(x=>x.classList.toggle('active',x.dataset.profileTab===tab));
    this.renderTab();
  };

  P._setAppearanceDraft=function(kind,key){
    this._ensureAppearanceDraft();
    if(!this.data?.equipped)return;
    if(kind==='title')this.data.equipped.titleKey=key||null;else this.data.equipped.frameKey=key||null;
    this._appearanceDirty=this.data.equipped.titleKey!==this._appearanceSaved.titleKey||this.data.equipped.frameKey!==this._appearanceSaved.frameKey;
    this._refreshCurrentTab(kind==='title'?'titles':'frames');
  };

  P.equipTitle=function(key){this._setAppearanceDraft('title',key||null);};
  P.equipFrame=function(key){this._setAppearanceDraft('frame',key||null);};

  P.saveAppearance=async function(){
    this._ensureAppearanceDraft();
    const button=this.overlay?.querySelector('[data-save-appearance]');
    if(button){button.disabled=true;button.textContent='Salvando...';}
    try{
      const titleKey=this.data.equipped?.titleKey||null,frameKey=this.data.equipped?.frameKey||null;
      await MetaClient.equip(titleKey,frameKey);
      this._appearanceSaved={titleKey,frameKey};this._appearanceDirty=false;
      if(AuthClient.user){AuthClient.user.equipped_title_key=titleKey;AuthClient.user.equipped_frame_key=frameKey;}
      if(window.App?.state){App.state.matchTitleKey=titleKey;App.state.matchFrameKey=frameKey;}
      Toast.success('Título e moldura salvos.');
      HomeScreen.renderAccount?.();
      this._refreshCurrentTab(this.activeTab||'profile');
    }catch(e){Toast.error(e.message||'Não foi possível salvar a aparência.');}
  };

  P._appearanceSavebar=function(){
    const dirty=this._appearanceDirty;
    return `<div class="profile-appearance-savebar ${dirty?'is-dirty':'is-saved'}"><div><b>${dirty?'Alterações não salvas':'Aparência salva'}</b><small>${dirty?'Título e moldura só serão mantidos depois de salvar.':'Esta combinação será usada nas próximas partidas.'}</small></div><button type="button" class="btn btn-primary" data-save-appearance ${dirty?'':'disabled'}>${dirty?'Salvar título e moldura':'✓ Salvo'}</button></div>`;
  };

  P._profileAppearanceCard=function(){
    const d=this.data||{},titles=(d.titles||[]).filter(x=>x.unlocked),frames=(d.frames||[]).filter(x=>x.unlocked),t=d.equipped?.titleKey||'',f=d.equipped?.frameKey||'';
    return `<section class="profile-modal-card profile-appearance-selector-card"><div class="profile-modal-section-heading"><div><span>APARÊNCIA DA PARTIDA</span><h3>Título e moldura</h3></div></div><p class="profile-appearance-help">Escolha como seu perfil aparece no Lobby e durante a partida. Você pode testar a combinação antes de salvar.</p><div class="profile-appearance-selectors"><label><span>Título</span><select class="input" data-profile-draft-title><option value="">Sem título</option>${titles.map(x=>`<option value="${attr(x.key)}" ${t===x.key?'selected':''}>${esc(x.icon||'🏷️')} ${esc(x.name)} · ${esc(x.rarityInfo?.label||x.rarity)}</option>`).join('')}</select></label><label><span>Moldura</span><select class="input" data-profile-draft-frame><option value="">Sem moldura</option>${frames.map(x=>`<option value="${attr(x.key)}" ${f===x.key?'selected':''}>${esc(x.icon||'◉')} ${esc(x.name)} · ${esc(x.rarityInfo?.label||x.rarity)}</option>`).join('')}</select></label></div>${this._appearanceSavebar()}</section>`;
  };

  P.renderTab=function(){
    const out=baseRenderTab();
    const body=this.overlay?.querySelector('#profile-modal-body');if(!body)return out;
    if(this.activeTab==='profile'){
      const layout=body.querySelector('.profile-tab-layout-profile');
      if(layout&&!layout.querySelector('.profile-appearance-selector-card'))layout.insertAdjacentHTML('beforeend',this._profileAppearanceCard());
    }
    if((this.activeTab==='titles'||this.activeTab==='frames')&&!body.querySelector('.profile-appearance-savebar'))body.insertAdjacentHTML('beforeend',this._appearanceSavebar());
    body.querySelector('[data-profile-draft-title]')?.addEventListener('change',e=>{this.data.equipped.titleKey=e.target.value||null;this._appearanceDirty=this.data.equipped.titleKey!==this._appearanceSaved.titleKey||this.data.equipped.frameKey!==this._appearanceSaved.frameKey;this._refreshCurrentTab('profile');});
    body.querySelector('[data-profile-draft-frame]')?.addEventListener('change',e=>{this.data.equipped.frameKey=e.target.value||null;this._appearanceDirty=this.data.equipped.titleKey!==this._appearanceSaved.titleKey||this.data.equipped.frameKey!==this._appearanceSaved.frameKey;this._refreshCurrentTab('profile');});
    body.querySelector('[data-save-appearance]')?.addEventListener('click',()=>this.saveAppearance());
    return out;
  };
})();
