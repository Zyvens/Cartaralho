'use strict';
const{withErrors,ok,requireMethod}=require('../lib/http');
const{APP_VERSION}=require('../lib/releaseP77');
const{APP_VERSION:P76_VERSION}=require('../lib/releaseP76');
const{APP_VERSION:P75_VERSION}=require('../lib/releaseP75');
const RELEASE_LINEAGE=[P75_VERSION,P76_VERSION,APP_VERSION];
module.exports=withErrors(async(req,res)=>{if(!requireMethod(req,res,'GET'))return;ok(res,{currentVersion:APP_VERSION,releaseLineage:RELEASE_LINEAGE});});
