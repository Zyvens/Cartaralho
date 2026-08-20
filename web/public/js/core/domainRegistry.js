'use strict';
(()=>{
 if(window.CartDomains)return;
 const owners=new Map();
 const api={
  claim(domain,owner,install){
   const key=String(domain||'').trim();
   const who=String(owner||'').trim();
   if(!key||!who)throw new Error('Domínio e owner são obrigatórios.');
   const current=owners.get(key);
   if(current)throw new Error(`Domínio ${key} já pertence a ${current.owner}; ${who} não pode sobrescrevê-lo.`);
   const record={domain:key,owner:who,claimedAt:Date.now()};owners.set(key,record);
   if(typeof install==='function')install(record);
   return record;
  },
  owner(domain){return owners.get(String(domain||''))?.owner||null;},
  has(domain){return owners.has(String(domain||''));},
  list(){return [...owners.values()].map(x=>({...x}));},
  assert(domain,owner){const actual=this.owner(domain);if(actual!==owner)throw new Error(`Owner inválido para ${domain}: esperado ${owner}, atual ${actual||'nenhum'}.`);return true;}
 };
 Object.defineProperty(window,'CartDomains',{value:api,writable:false,configurable:false});
})();
