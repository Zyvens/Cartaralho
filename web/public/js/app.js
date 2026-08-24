'use strict';
/*
 * Cartaralho — lexical App shell.
 *
 * Este arquivo existe apenas para preservar o binding global lexical `App`,
 * expor a mesma instância em `window.App` aos installers e manter o gatilho
 * histórico de DOMContentLoaded. Estado, reset, roteamento, fluxo local,
 * lifecycle de socket e bootstrap pertencem aos owners em `core/*`, carregados
 * imediatamente depois deste shell e antes do primeiro uso observável.
 */
const App={state:{}};
window.App=App;

document.addEventListener('DOMContentLoaded',()=>{
  App.init();
});
