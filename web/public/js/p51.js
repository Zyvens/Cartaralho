'use strict';
(()=>{
 if(window.CartP51)return;
 const VERSION='v1.4.51';
 function normalizeNotifications(){
  document.querySelectorAll('.notifications-spoiler-summary').forEach(summary=>{
   const heading=summary.querySelector('.notifications-spoiler-heading');
   const pill=summary.querySelector('.notifications-section-new');
   const meta=summary.querySelector('.notifications-spoiler-meta');
   if(heading&&pill&&meta&&pill.nextElementSibling!==meta)summary.insertBefore(pill,meta);
  });
 }
 if(window.NotificationsUI&&!NotificationsUI.__p51Order){
  NotificationsUI.__p51Order=true;
  const baseOpen=NotificationsUI.open.bind(NotificationsUI);
  NotificationsUI.open=async function(...args){const out=await baseOpen(...args);normalizeNotifications();return out;};
 }
 window.addEventListener('pageshow',normalizeNotifications);
 window.CartP51={VERSION,normalizeNotifications};
})();
