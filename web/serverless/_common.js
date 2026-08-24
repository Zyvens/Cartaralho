'use strict';

function routePath(req){
  const raw=req?.query?.__path;
  const value=Array.isArray(raw)?raw[0]:raw;
  if(req?.query)delete req.query.__path;
  return String(value||'').replace(/^\/+|\/+$/g,'');
}

function notFound(res,path){
  res.statusCode=404;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify({success:false,error:`Rota de API não encontrada: /api/${path}`}));
}

function invoke(handler,req,res,params=null){
  if(params){
    req.query=req.query||{};
    Object.assign(req.query,params);
  }
  return handler(req,res);
}

function dispatch(req,res,{fixed={},dynamic=[]}={}){
  const path=routePath(req);
  const exact=fixed[path];
  if(exact)return invoke(exact,req,res);
  for(const item of dynamic){
    const match=item.pattern.exec(path);
    if(!match)continue;
    const params={};
    (item.params||[]).forEach((name,index)=>{params[name]=decodeURIComponent(match[index+1]||'');});
    return invoke(item.handler,req,res,params);
  }
  return notFound(res,path);
}

module.exports={dispatch,routePath,invoke};
