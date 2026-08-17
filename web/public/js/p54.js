'use strict';
(()=>{
 if(window.CartP54)return;
 const VERSION='v1.4.54';

 function mountNativeCardCreator(panel){
  const root=panel?.querySelector?.('.p41-my-cards-panel');
  if(!root)return null;
  let btn=root.querySelector('#p54-create-card-entry');
  if(!btn){
   btn=document.createElement('button');
   btn.type='button';
   btn.id='p54-create-card-entry';
   btn.className='btn btn-primary p54-create-card-entry';
   btn.innerHTML='🧽 Criar nova Carta de Jogador';
  }
  btn.onclick=()=>{
   const open=window.CartP48?.openLibraryCreator;
   if(typeof open!=='function')return Toast.error('Não foi possível abrir a criação de cartas.');
   open.call(CartP48,panel,'whiteCards');
  };
  const tools=root.querySelector('.card-tools');
  if(tools){
   if(btn.parentNode!==root||btn.nextElementSibling!==tools)root.insertBefore(btn,tools);
  }else if(!btn.isConnected)root.appendChild(btn);
  return btn;
 }

 function patchMyCardsRenderer(){
  if(!window.MetaUI||MetaUI.__p54NativeCardCreator)return;
  MetaUI.__p54NativeCardCreator=true;
  const base=MetaUI.renderCards?.bind(MetaUI);
  if(typeof base!=='function')return;
  MetaUI.renderCards=async function(panel,...args){
   const out=await base(panel,...args);
   mountNativeCardCreator(panel);
   return out;
  };
 }

 function settle(){
  patchMyCardsRenderer();
  const panel=document.getElementById('home-panel');
  if(panel?.querySelector('.p41-my-cards-panel'))mountNativeCardCreator(panel);
 }

 settle();
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 window.CartP54={VERSION,mountNativeCardCreator,settle};
})();
