'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{
 fixed:{
  'creator-tools':require('../api/admin/creator-tools'),
  'deck':require('../api/admin/deck'),
  'deck/import':require('../api/admin/deck/import'),
  'prestige-entitlement':require('../api/admin/prestige-entitlement')
 },
 dynamic:[
  {pattern:/^deck\/([^/]+)\/(\d+)\/hide$/,params:['type','index'],handler:require('../api/admin/deck/[type]/[index]/hide')},
  {pattern:/^deck\/([^/]+)\/(\d+)$/,params:['type','index'],handler:require('../api/admin/deck/[type]/[index]')}
 ]
});
