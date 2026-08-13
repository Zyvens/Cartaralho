(()=>{
function polishMissionPanel(){
  const card=document.querySelector('.mission-card');
  if(!card)return;

  const headings=[...card.querySelectorAll('h2,h3,h4')];
  headings.forEach((heading)=>{
    const text=heading.textContent.trim();
    if(text==='Hoje'||text==='Esta semana') heading.classList.add('mission-section-heading');
  });

  card.querySelectorAll('.mission-row').forEach((row)=>{
    const candidates=[...row.querySelectorAll('small,p,span')];
    const description=candidates.find((el)=>!el.querySelector('.mission-xp-pill')&&/\+\d+\s*XP\s*$/i.test(el.textContent.trim()));
    if(!description)return;
    const match=description.textContent.trim().match(/^(.*?)(?:\s*·\s*)?(\+\d+\s*XP)\s*$/i);
    if(!match)return;
    description.replaceChildren(document.createTextNode(match[1].trim()));
    const pill=document.createElement('span');
    pill.className='mission-xp-pill';
    pill.textContent=match[2].replace(/\s+/g,' ');
    description.appendChild(pill);
  });
}

const observer=new MutationObserver(()=>polishMissionPanel());
observer.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(polishMissionPanel,0);
})();
