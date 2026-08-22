'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const registration=read('public/js/domains/registrationUI.js'),professional=read('public/js/professionalUI.js'),index=read('public/index.html');

test('registrationUI é o writer final de HomeScreen.register',()=>{
 assert.match(registration,/CartDomains\.claim\('registrationUI'/);
 assert.match(registration,/HomeScreen\.register=\(\)=>RegistrationModal\.open\(\)/);
 assert.ok(index.indexOf('js/professionalUI.js')<index.indexOf('js/domains/registrationUI.js'));
});

test('registro preserva campos, validações e recovery code',()=>{
 for(const id of ['reg-user','reg-nick','reg-pass','reg-pass2','reg-email','reg-submit'])assert.match(registration,new RegExp(id));
 assert.match(registration,/nickname\.length<2/);
 assert.match(registration,/password\.length<6/);
 assert.match(registration,/password!==password2/);
 assert.match(registration,/AuthClient\.register\(username,password,nickname,email\|\|null\)/);
 assert.match(registration,/recoveryCode/);
 assert.match(registration,/HomeScreen\.renderAccount\(\)/);
});

test('professionalUI fica como fallback físico e não é o writer final em runtime',()=>{
 assert.match(professional,/const RegistrationModal=/);
 assert.match(registration,/window\.RegistrationModal=RegistrationModal/);
});
