'use strict';
const{withErrors,ok,requireMethod}=require('../lib/http');
const{APP_VERSION}=require('../lib/releaseP69');
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'GET'))return;ok(res,{currentVersion:APP_VERSION});});
