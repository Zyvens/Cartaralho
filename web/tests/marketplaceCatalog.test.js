'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const sql=fs.readFileSync(path.join(__dirname,'../db/metagame_v1_4_package5.sql'),'utf8');
test('P05 contém catálogo autoritativo completo e sem produtos de P06+',()=>{
 const products=[['white_10',1800],['white_25',4000],['white_50',7000],['black_10',1800],['black_25',4000],['black_50',7000],['mixed_10',3200],['mixed_25',7000],['mixed_50',12000],['pack_random_10',5000],['pack_best_world_3',15000]];
 for(const[key,price]of products){assert.match(sql,new RegExp(`'${key}'[^\\n]*,${price},`));}
 assert.equal((sql.match(/'market-v1'/g)||[]).length>=11,true);
 assert.match(sql,/marketplace_purchase/);assert.doesNotMatch(sql,/buff_|cosmetic|spoils/i);
});
