'use strict';
(()=>{
 if(window.CartP54)return;
 const VERSION='v1.4.54';
 function mountNativeCardCreator(panel){
  const root=panel?.querySelector?.('.cards-library')||panel?.querySelector?.('.p41-my-cards-panel');if(!root)return null;
  let btn=root.querySelector('#p54-create-card-entry');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.id='p54-create-card-entry';btn.className='btn btn-primary p54-create-card-entry';btn.innerHTML='🧽 Criar nova Carta de Jogador';}
  btn.onclick=()=>{const open=window.CartP48?.openLibraryCreator;if(typeof open!=='function')return Toast.error('Não foi possível abrir a criação de cartas.');open.call(CartP48,panel,'whiteCards');};
  const anchor=root.querySelector('.cards-library-toolbar')||root.querySelector('.card-tools');
  if(anchor){if(btn.parentNode!==root||btn.nextElementSibling!==anchor)root.insertBefore(btn,anchor);}else if(!btn.isConnected)root.prepend(btn);
  return btn;
 }
 function patchMyCardsRenderer(){
  if(typeof ProfessionalUI!=='undefined'&&!ProfessionalUI.__p54NativeCardCreator){ProfessionalUI.__p54NativeCardCreator=true;const base=ProfessionalUI.renderCards?.bind(ProfessionalUI);if(typeof base==='function')ProfessionalUI.renderCards=async function(panel,...args){const out=await base(panel,...args);mountNativeCardCreator(panel);return out;};}
  if(typeof MetaUI!=='undefined'&&!MetaUI.__p54NativeCardCreator){MetaUI.__p54NativeCardCreator=true;const base=MetaUI.renderCards?.bind(MetaUI);if(typeof base==='function')MetaUI.renderCards=async function(panel,...args){const out=await base(panel,...args);mountNativeCardCreator(panel);return out;};}
 }
 function settle(){patchMyCardsRenderer();const panel=document.getElementById('home-panel');if(panel?.querySelector('.cards-library,.p41-my-cards-panel'))mountNativeCardCreator(panel);}
 settle();document.addEventListener('DOMContentLoaded',settle,{once:true});window.addEventListener('pageshow',settle);
 window.CartP54={VERSION,mountNativeCardCreator,settle};
})();
