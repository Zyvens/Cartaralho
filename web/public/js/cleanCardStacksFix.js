'use strict';

(function cleanCardStacksFix(){
  if(!window.CardCreationScreen||CardCreationScreen.__cleanStacksFixed)return;
  // P19 renderiza a pilha diretamente na fonte da tela. Não envolva renderTabContent novamente.
  if(typeof CardCreationScreen.cleanStack==='function'){
    CardCreationScreen.__cleanStacksFixed=true;
    CardCreationScreen.__cleanStacksSourceAuthoritative=true;
    return;
  }
  CardCreationScreen.__cleanStacksFixed=true;

  const previous={white:null,black:null};
  const esc=value=>{const d=document.createElement('div');d.textContent=String(value??'');return d.innerHTML;};

  function pile(type,count,consumed=false){
    const n=Math.max(0,Number(count)||0);
    const isWhite=type==='white';
    const label=isWhite?'Cartas Limpas Brancas':'Cartas Limpas Pretas';
    const symbol=isWhite?'🤍':'🖤';
    const visible=Math.min(n,12);
    const layers=n===0
      ? '<i class="clean-stack-empty" aria-hidden="true"></i>'
      : Array.from({length:visible},(_,i)=>`<i class="clean-stack-sheet" style="--stack-i:${i};--stack-count:${visible}"></i>`).join('');
    const depth=n>visible?`<span class="clean-stack-depth" aria-hidden="true">+${n-visible}</span>`:'';
    return `<section class="clean-stack-resource clean-stack-live clean-stack-${type}${consumed?' just-consumed':''}" data-clean-type="${type}" data-clean-count="${n}" aria-label="${esc(label)}: ${n}">
      <div class="clean-stack-visual" aria-hidden="true">${layers}${depth}</div>
      <div class="clean-stack-copy"><small>${symbol} ${label}</small><b>${n}</b><span>${n===0?'Sem cartas disponíveis':n===1?'1 carta disponível':`${n} cartas disponíveis`}</span></div>
    </section>`;
  }

  function replaceLegacyCounters(content){
    if(!content)return;
    const smalls=[...content.querySelectorAll('.account-card small')];
    const whiteLabel=smalls.find(el=>el.textContent.includes('Cartas Limpas Brancas'));
    const blackLabel=smalls.find(el=>el.textContent.includes('Cartas Limpas Pretas'));
    const whiteCard=whiteLabel?.closest('.account-card');
    const blackCard=blackLabel?.closest('.account-card');
    const holder=whiteCard?.parentElement;
    if(!holder||blackCard?.parentElement!==holder)return;

    const white=Math.max(0,Number(CardCreationScreen.cleanInventory?.whiteBalance)||0);
    const black=Math.max(0,Number(CardCreationScreen.cleanInventory?.blackBalance)||0);
    const whiteConsumed=previous.white!==null&&white<previous.white;
    const blackConsumed=previous.black!==null&&black<previous.black;

    holder.removeAttribute('style');
    holder.className='clean-stack-grid clean-stack-grid-live';
    holder.innerHTML=pile('white',white,whiteConsumed)+pile('black',black,blackConsumed);

    previous.white=white;
    previous.black=black;
  }

  const base=CardCreationScreen.renderTabContent.bind(CardCreationScreen);
  CardCreationScreen.renderTabContent=function(){
    const result=base();
    replaceLegacyCounters(document.getElementById('tab-content'));
    return result;
  };

  if(App?.state?.currentScreen==='cardCreation')replaceLegacyCounters(document.getElementById('tab-content'));
})();
