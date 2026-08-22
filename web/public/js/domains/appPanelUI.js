'use strict';
(()=>{
 if(window.CartAppPanelDomain)return;
 CartDomains.claim('appPanelUI','domains/appPanelUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const attr=v=>esc(v).replace(/"/g,'&quot;');
  const PANEL_META={cards:{icon:'⭐',title:'Minhas Cartas',subtitle:'Sua coleção, favoritas, Cartas Nativas e cartas criadas pela comunidade.'},stats:{icon:'📊',title:'Estatísticas',subtitle:'Seu histórico de decisões questionáveis, em números.'},rank:{icon:'🏆',title:'Rank',subtitle:'Temporada, Hall da Vergonha e Hall da Fama.'},history:{icon:'📜',title:'Histórico',subtitle:'Revise partidas e abra o replay rodada a rodada.'},friends:{icon:'🤝',title:'Amigos de merda',subtitle:'Amizades, pedidos e turmas privadas.'}};
  const AppPanelModal={
   overlay:null,host:null,current:null,keyHandler:null,
   async open(kind){
    const meta=PANEL_META[kind];if(!meta)return false;
    this.close();this.current=kind;
    const overlay=document.createElement('div');overlay.className='app-panel-overlay';
    overlay.innerHTML=`<section class="app-panel-shell" role="dialog" aria-modal="true" aria-label="${attr(meta.title)}"><header class="app-panel-header"><div class="app-panel-heading"><span class="app-panel-icon">${meta.icon}</span><div><span class="app-panel-eyebrow">CARTARALHO</span><h2>${esc(meta.title)}</h2><p>${esc(meta.subtitle)}</p></div></div><button class="app-panel-close" type="button" aria-label="Fechar">✕</button></header><main class="app-panel-body"><div class="app-panel-loading"><span></span><b>Carregando...</b></div></main></section>`;
    document.body.appendChild(overlay);document.body.classList.add('app-panel-open');this.overlay=overlay;this.host=overlay.querySelector('.app-panel-body');
    overlay.querySelector('.app-panel-close').onclick=()=>this.close();overlay.addEventListener('mousedown',e=>{if(e.target===overlay)this.close();});
    this.keyHandler=e=>{if(e.key==='Escape')this.close();};document.addEventListener('keydown',this.keyHandler);
    try{
     if(kind==='cards')await HomeScreen.renderCards(this.host);
     else if(kind==='stats')await HomeScreen.renderStats(this.host);
     else if(kind==='rank')await MetaUI.renderRank(this.host,'current','rank');
     else if(kind==='history')await HomeScreen.renderHistory(this.host);
     else if(kind==='friends')await window.SocialUI.render(this.host,'friends');
     this.normalize();return true;
    }catch(e){this.host.innerHTML=`<div class="app-panel-empty"><b>Não deu certo.</b><p>${esc(e.message||'Erro ao abrir esta área.')}</p></div>`;return false;}
   },
   normalize(){if(!this.host)return;this.host.querySelectorAll('.panel-close').forEach(x=>x.remove());this.host.querySelectorAll(':scope > .home-form.profile-panel').forEach(x=>x.classList.add('app-panel-legacy-content'));},
   close(){if(this.overlay)this.overlay.remove();this.overlay=null;this.host=null;this.current=null;if(this.keyHandler)document.removeEventListener('keydown',this.keyHandler);this.keyHandler=null;document.body.classList.remove('app-panel-open');}
  };
  window.AppPanelModal=AppPanelModal;
  const baseOpen=HomeScreen.openPanel.bind(HomeScreen);
  HomeScreen.openPanel=async kind=>kind==='profile'?ProfileModal.open('profile'):PANEL_META[kind]?AppPanelModal.open(kind):baseOpen(kind);
  window.CartAppPanelDomain={AppPanelModal,PANEL_META};
 });
})();
