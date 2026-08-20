'use strict';
(()=>{
 if(window.CartAchievementsDomain)return;
 CartDomains.claim('achievementsUI','domains/achievementsUI.js',()=>{
  const ORDER={common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6},LABEL={common:'Comum',rare:'Incomum',superrare:'Raro',epic:'Épico',legendary:'Lendário',celestial:'Celestial'};
  function install(){if(!window.AchievementUI||AchievementUI.__domainOwned)return;AchievementUI.__domainOwned=true;const render=AchievementUI.renderBadges.bind(AchievementUI),notify=AchievementUI.notify.bind(AchievementUI);AchievementUI.renderBadges=function(body,data){const rows=[...(data?.achievements||[])].map(a=>({...a,rarityInfo:{...(a.rarityInfo||{}),label:LABEL[a.rarity]||a.rarityInfo?.label||'Comum'}})).sort((a,b)=>(ORDER[a.rarity]||99)-(ORDER[b.rarity]||99)||String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));return render(body,{...data,achievements:rows});};AchievementUI.notify=function(data){if(data?.newUnlocks?.length)window.CartSFX?.play?.('achievement');return notify(data);};}
  install();window.CartAchievementsDomain={install,rarityOrder:ORDER};
 });
})();
