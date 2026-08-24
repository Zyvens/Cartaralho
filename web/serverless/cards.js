'use strict';
const{dispatch}=require('./_common');
module.exports=(req,res)=>dispatch(req,res,{fixed:{
 'clean':require('../api/cards/clean'),
 'create':require('../api/cards/create'),
 'match-created':require('../api/cards/match-created'),
 'submit':require('../api/cards/submit')
}});
