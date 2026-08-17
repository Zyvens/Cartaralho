'use strict';
(()=>{
 if(!window.NotificationsUI||NotificationsUI.__p35Spoilers)return;
 NotificationsUI.__p35Spoilers=true;
 const baseOpen=NotificationsUI.open.bind(NotificationsUI);
 function makeSpoiler(section,index){
  if(!section||section.matches('details.notifications-spoiler'))return;
  const title=section.querySelector(':scope > .notifications-section-title');
  const list=section.querySelector(':scope > .notifications-list');
  if(!title||!list)return;
  const heading=title.querySelector('h3')?.textContent||'';
  const count=title.querySelector('small')?.textContent||'';
  const details=document.createElement('details');
  details.className='notifications-spoiler';
  details.dataset.section=index===0?'updates':'rewards';
  const summary=document.createElement('summary');
  summary.className='notifications-spoiler-summary';
  const headingNode=document.createElement('span');
  headingNode.className='notifications-spoiler-heading';
  headingNode.textContent=heading;
  const meta=document.createElement('span');
  meta.className='notifications-spoiler-meta';
  const countNode=document.createElement('small');
  countNode.textContent=count;
  const chevron=document.createElement('span');
  chevron.className='notifications-spoiler-chevron';
  chevron.setAttribute('aria-hidden','true');
  chevron.textContent='⌄';
  meta.append(countNode,chevron);
  summary.append(headingNode,meta);
  list.classList.add('notifications-spoiler-content');
  details.append(summary,list);
  section.replaceWith(details);
 }
 NotificationsUI.open=async function(...args){
  const out=await baseOpen(...args);
  const body=this.overlay?.querySelector('.notifications-body');
  body?.querySelectorAll(':scope > section').forEach((section,index)=>makeSpoiler(section,index));
  return out;
 };
})();
