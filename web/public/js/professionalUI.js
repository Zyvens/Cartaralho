'use strict';
(()=>{
 const ProfessionalUI={
  status:'SUPERSEDED',
  owner:'domain-owners',
  polishHome(...args){return window.CartHomePresentationDomain?.polishHome?.(...args);},
  renderCards(...args){return window.CartCardsLibrary?.render?.(...args);}
 };
 window.ProfessionalUI=ProfessionalUI;
 window.CartProfessionalLegacy={status:'SUPERSEDED',replacement:['domains/registrationUI.js','domains/appPanelUI.js','domains/socialFoundationUI.js','domains/homePresentationUI.js','domains/cardsLibrary.js','domains/profileUI.js']};
})();
