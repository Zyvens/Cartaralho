(()=>{
function polishMissionPanel(){
  const card=document.querySelector('.mission-card');
  if(!card)return;

  card.querySelectorAll('h2,h3,h4').forEach((heading)=>{
    const text=heading.textContent.trim();
    if(text==='Hoje'||text==='Esta semana') heading.classList.add('mission-section-heading');
  });

  card.querySelectorAll('.mission-row').forEach((row)=>{
    if(row.dataset.missionPolished==='1') return;

    const candidates=[...row.querySelectorAll('small,p,span')].filter((el)=>!el.classList.contains('mission-xp-pill'));
    const description=candidates.find((el)=>/\+\d+\s*XP\s*$/i.test(el.textContent.trim()));
    if(!description){
      row.dataset.missionPolished='1';
      return;
    }

    const match=description.textContent.trim().match(/^(.*?)(?:\s*·\s*)?(\+\d+\s*XP)\s*$/i);
    if(!match){
      row.dataset.missionPolished='1';
      return;
    }

    const label=match[1].trim();
    const pill=document.createElement('span');
    pill.className='mission-xp-pill';
    pill.textContent=match[2].replace(/\s+/g,' ');
    description.replaceChildren(document.createTextNode(label+' '),pill);
    row.dataset.missionPolished='1';
  });
}

let scheduled=false;
const schedulePolish=()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    polishMissionPanel();
  });
};

const observer=new MutationObserver((mutations)=>{
  if(mutations.some((m)=>[...m.addedNodes].some((n)=>n.nodeType===1&&((n.matches&&n.matches('.mission-card,.mission-row'))||(n.querySelector&&n.querySelector('.mission-card,.mission-row')))))) schedulePolish();
});
observer.observe(document.documentElement,{childList:true,subtree:true});
schedulePolish();
})();
