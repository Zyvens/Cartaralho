'use strict';
(()=>{
 if(window.CartBuffsDomain)return;
 CartDomains.claim('buffsUI','domains/buffsUI.js',()=>{
  const RARITY_ORDER={common:1,rare:2,superrare:3,epic:4,legendary:5,celestial:6};
  const DETAILS={
   buff_que_poder:'Mestre: vincule o efeito a uma resposta, devolva uma carta da sua mão ao pool, tome uma carta daquela resposta como posse temporária e roube para si o ponto quando confirmar essa resposta como vencedora. A carta tomada não vira propriedade permanente nem gera progressão pessoal.',
   buff_saqueador:'No fim da partida, entre no rateio do pote formado por todas as recompensas de colocação. Se houver Saqueadores, os pagamentos normais de colocação são zerados e o pote é dividido entre os participantes do saque; sobrevivência e consolação continuam sendo pagas normalmente.'
  };
  function info(key){return window.CartBuffPresentation?.info?.(key)||{icon:'⚡',rarity:'common',label:'Comum'};}
  function install(){if(!window.BuffUI||BuffUI.__domainOwned)return;BuffUI.__domainOwned=true;const base=BuffUI.card.bind(BuffUI);BuffUI.card=function(item,used){const d=item?.def||{},meta=info(d.key);let html=base(item,used);html=html.replace('<article class="buff-card ',`<article data-buff-key="${String(d.key||'')}" class="buff-card rarity-${meta.rarity} `);html=html.replace('<div class="buff-card-top">',`<div class="buff-presentation-row"><span class="buff-type-pill">BUFF</span><span class="buff-rarity-pill rarity-${meta.rarity}">${meta.label}</span></div><div class="buff-card-top">`);const detail=DETAILS[d.key];if(detail)html=html.replace(`</p>`,`</p><small class="buff-domain-detail">${detail}</small>`);return html;};}
  install();window.CartBuffsDomain={install,details:DETAILS,rarityOrder:RARITY_ORDER};
 });
})();
