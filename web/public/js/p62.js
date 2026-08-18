'use strict';
(()=>{
 if(window.CartP62)return;
 const VERSION='v1.4.62';
 const BALANCE_SELECTOR='.account-strip .p49-balance-slot,.account-strip .home-account-balance';

 /* O cliente carregado nunca deve anunciar a própria versão como pendente. */
 try{
  const key=`cartaralho_update_notice_${VERSION}`;
  sessionStorage.setItem(key,'1');
  localStorage.setItem(key,'1');
 }catch(_){ }

 function stripStatsEconomy(panel){
  if(!panel)return panel;
  panel.querySelectorAll('.p61-stats-ledger,.p54-stats-ledger,.stats-economy,.economy-history,.economy-ledger').forEach(node=>node.remove());
  return panel;
 }

 async function renderStats(panel){
  if(!window.MetaUI?.renderStats)throw new Error('Estatísticas indisponíveis.');
  const out=await MetaUI.renderStats(panel);
  stripStatsEconomy(panel);
  queueMicrotask(()=>stripStatsEconomy(panel));
  return out;
 }

 function installStatsRenderer(){
  if(!window.HomeScreen||!window.MetaUI)return;
  HomeScreen.renderStats=renderStats;
  HomeScreen.__p62StatsNoEconomy=true;
 }

 async function openMarketLedger(){
  if(!AuthClient?.user)return Toast.warning('Entre na sua conta para consultar o extrato.');
  if(!window.MarketUI?.open)return Toast.error('Mercado Paralelo indisponível.');
  try{
   window.AppPanelModal?.close?.();
   await MarketUI.open('ledger');
  }catch(e){Toast.error(e?.message||'Não foi possível abrir o extrato.');}
 }

 function balanceSlot(){return document.querySelector(BALANCE_SELECTOR);}
 function decorateBalanceShortcut(){
  const slot=balanceSlot();if(!slot)return null;
  slot.classList.add('p62-market-ledger-shortcut');
  slot.setAttribute('role','button');
  slot.setAttribute('tabindex','0');
  slot.setAttribute('aria-label','Abrir extrato de Moedas Sujas no Mercado Paralelo');
  slot.setAttribute('title','Abrir extrato no Mercado Paralelo');
  return slot;
 }

 function eventBalanceSlot(target){
  const slot=target?.closest?.(BALANCE_SELECTOR);
  return slot&&document.contains(slot)?slot:null;
 }

 /* Captura antes de qualquer handler legado que ainda tente abrir Estatísticas. */
 document.addEventListener('click',e=>{
  if(!eventBalanceSlot(e.target))return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openMarketLedger();
 },true);

 document.addEventListener('keydown',e=>{
  if(!eventBalanceSlot(e.target)||!['Enter',' '].includes(e.key))return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openMarketLedger();
 },true);

 function patchAccountLifecycle(){
  if(!window.HomeScreen||HomeScreen.__p62BalanceShortcut)return;
  HomeScreen.__p62BalanceShortcut=true;
  const base=HomeScreen.renderAccount.bind(HomeScreen);
  HomeScreen.renderAccount=function(...args){
   const out=base(...args);
   queueMicrotask(decorateBalanceShortcut);
   requestAnimationFrame(decorateBalanceShortcut);
   return out;
  };
 }

 function settle(){
  installStatsRenderer();
  patchAccountLifecycle();
  decorateBalanceShortcut();
  const currentStats=document.querySelector('.app-panel-body,.home-panel,#home-panel');
  stripStatsEconomy(currentStats);
 }

 settle();
 document.addEventListener('DOMContentLoaded',settle,{once:true});
 window.addEventListener('pageshow',settle);
 window.CartP62={VERSION,stripStatsEconomy,renderStats,openMarketLedger,decorateBalanceShortcut,installStatsRenderer};
})();
