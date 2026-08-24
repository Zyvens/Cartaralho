'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{fixed:{
 'login':require('../api/auth/login'),
 'me':require('../api/auth/me'),
 'recover':require('../api/auth/recover'),
 'register':require('../api/auth/register')
}});
