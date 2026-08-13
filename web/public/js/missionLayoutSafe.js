(()=>{
  if(window.MetaUI){
    MetaUI.missionRow=function(m){
      const pct=Math.min(100,(Number(m.progress||0)/Math.max(1,Number(m.target||1)))*100);
      return `<div class="mission-row ${m.completed?'done':''}"><b>${m.completed?'✅':'🎯'} ${String(m.name??'')}</b><small class="mission-copy">${String(m.description??'')}</small><span class="mission-xp-pill">+${Number(m.xp||0)} XP</span><div class="mission-progress"><span style="width:${pct}%"></span></div><small class="mission-count">${Number(m.progress||0)}/${Number(m.target||0)}</small></div>`;
    };
  }

  if(window.ProfileModal){
    ProfileModal.missionCard=function(m){
      const pct=Math.min(100,(Number(m.progress||0)/Math.max(1,Number(m.target||1)))*100);
      const escText=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
      return `<div class="profile-modal-mission ${m.completed?'done':''}"><div><b>${m.completed?'✓':'🎯'} ${escText(m.name)}</b><small>${escText(m.description)}</small></div><strong class="profile-modal-mission-xp">+${Number(m.xp||0)} XP</strong><div class="profile-modal-progress"><span style="width:${pct}%"></span></div><em>${Number(m.progress||0)}/${Number(m.target||0)}</em></div>`;
    };
  }
})();
