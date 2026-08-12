/** Small helpers shared by every /api handler. */
function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length > 0) { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}
function ok(res,data={}){res.status(200).json({success:true,...data});}
function fail(res,status,message){res.status(status).json({success:false,error:message});}
function withErrors(handler){return async(req,res)=>{try{
  // Authentication is authoritative for game identity. The old browser-generated
  // playerId is preserved only as visual/session metadata.
  const authHeader=req.headers&&(req.headers.authorization||req.headers.Authorization);
  if(authHeader&&String(authHeader).startsWith('Bearer ')){
    const {getUserFromRequest}=require('./auth');
    const user=await getUserFromRequest(req);
    if(user){
      req.authUser=user;
      const body=getBody(req);
      if(body&&typeof body==='object'){
        req.visualPlayerId=body.playerId||null;
        body.playerId=String(user.id);
        req.body=body;
      }
      if(req.query&&req.query.playerId){req.visualPlayerId=req.query.playerId;req.query.playerId=String(user.id);}
    }
  }
  await handler(req,res);
}catch(err){console.error('[API Error]',err);fail(res,err.statusCode||400,err.message||'Erro inesperado.');}};}
function requireMethod(req,res,method){if(req.method!==method){fail(res,405,`Método não permitido. Use ${method}.`);return false;}return true;}
module.exports={getBody,ok,fail,withErrors,requireMethod};
