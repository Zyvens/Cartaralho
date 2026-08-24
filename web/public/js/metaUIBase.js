'use strict';
var MetaUI=window.MetaUI||{
 missionOpen:false,
 rarityClass:r=>'rarity-'+(r||'common'),
 titleName:key=>(window.MetaTitleNames||{})[key]||String(key||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
 titleColor:()=>'',
 decorateTitles(){},
 removeMissionUI(){document.getElementById('mission-fab')?.remove();document.getElementById('mission-card')?.remove();this.missionOpen=false;}
};
window.MetaUI=MetaUI;
