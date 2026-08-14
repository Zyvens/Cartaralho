(()=>{
'use strict';
const TITLES={
 'cliente-preferencial':{name:'Cliente Preferencial',rarity:'rare'},
 'lavador-de-moedinhas':{name:'Lavador de Moedinhas',rarity:'superrare'},
 'patrocinador-do-caos':{name:'Patrocinador do Caos',rarity:'epic'},
 'dinheiro-nao-compra-talento':{name:'Dinheiro Não Compra Talento',rarity:'epic'},
 'herdeiro-do-cartaralho':{name:'Herdeiro do Cartaralho',rarity:'legendary'},
 'patrimonio-inexplicavel':{name:'Patrimônio Inexplicável',rarity:'celestial'},
 'o-criador':{name:'O Criador',rarity:'celestial'},
 'betinha':{name:'Betinha',rarity:'epic'}
};
const COLORS={common:'#f4f4f5',rare:'#22c55e',superrare:'#3b82f6',epic:'#a855f7',legendary:'#facc15',celestial:'#dffbff'};
Object.assign(window.MetaTitleNames||(window.MetaTitleNames={}),Object.fromEntries(Object.entries(TITLES).map(([k,v])=>[k,v.name])));
Object.assign(window.MetaTitleRarities||(window.MetaTitleRarities={}),Object.fromEntries(Object.entries(TITLES).map(([k,v])=>[k,v.rarity])));

if(window.MetaUI){
 const oldName=MetaUI.titleName?.bind(MetaUI),oldColor=MetaUI.titleColor?.bind(MetaUI),oldDecorate=MetaUI.decorateTitles?.bind(MetaUI);
 MetaUI.titleName=k=>TITLES[k]?.name||(oldName?oldName(k):k||'');
 MetaUI.titleColor=k=>COLORS[TITLES[k]?.rarity]||(oldColor?oldColor(k):COLORS.common);
 MetaUI.decorateTitles=()=>{
  if(oldDecorate)oldDecorate();
  document.querySelectorAll('[data-title-key]').forEach(el=>{
   const rarity=TITLES[el.dataset.titleKey]?.rarity;
   if(!rarity)return;
   el.classList.add(`title-rarity-${rarity}`);
   el.dataset.titleRarity=rarity;
   if(rarity!=='celestial')el.style.color=COLORS[rarity]||'';
  });
 };
 MetaUI.decorateTitles();
}

if(window.ProfileModal){
 const oldLegend=ProfileModal.rarityLegend.bind(ProfileModal);
 ProfileModal.rarityLegend=function(){const base=oldLegend();return base.includes('Celestial')?base:`${base}<span class="rarity-celestial">✦ Celestial</span>`;};
}
window.PrestigeUI={titles:TITLES,colors:COLORS};
})();
