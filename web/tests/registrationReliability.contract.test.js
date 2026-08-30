'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const registerApi=read('api/auth/register.js'),loginApi=read('api/auth/login.js'),provisioning=read('lib/accountProvisioning.js'),registrationUi=read('public/js/domains/registrationUI.js');

test('registro usa owner canônico resiliente para provisionamento inicial',()=>{
 assert.match(registerApi,/require\('\.\.\/\.\.\/lib\/accountProvisioning'\)/);
 assert.match(loginApi,/require\('\.\.\/\.\.\/lib\/accountProvisioning'\)/);
 assert.match(registerApi,/ensureAccountProvisioned\(user\.id\)/);
 assert.match(loginApi,/ensureAccountProvisioned\(user\.id\)/);
 assert.match(provisioning,/async function ensureStarterDeck/);
 assert.match(provisioning,/ensureStarterCoins\(userId\)/);
 assert.match(provisioning,/cleanCards\.ensureStarterCleanCards\(userId\)/);
 assert.match(provisioning,/retry&&failed\.length/);
 assert.match(provisioning,/complete:failed\.length===0/);
});

test('retry da criação recupera conta parcialmente criada somente com a mesma senha',()=>{
 assert.match(registerApi,/userByUsername\(normalized\)/);
 assert.match(registerApi,/verifyPassword\(password,existingUser\.password_hash\)/);
 assert.match(registerApi,/accountRecovered:true/);
 assert.match(registerApi,/setupIncomplete:!setup\.complete/);
 assert.match(registerApi,/existingEmail&&\(!existingUser\|\|String\(existingEmail\.id\)!==String\(existingUser\.id\)\)/);
});

test('UI canônica normaliza usuário antes do POST e explica falhas recuperáveis',()=>{
 assert.match(registrationUi,/const canonicalUsername=/);
 assert.match(registrationUi,/normalize\('NFD'\)/);
 assert.match(registrationUi,/replace\(\/\\s\+\/g,'-'\)/);
 assert.match(registrationUi,/validUsername\(username\)/);
 assert.match(registrationUi,/autocapitalize="none"/);
 assert.match(registrationUi,/accountRecovered/);
 assert.match(registrationUi,/setupIncomplete/);
 assert.match(registrationUi,/AuthClient\.register\(username,password,nickname,email\|\|null\)/);
});
