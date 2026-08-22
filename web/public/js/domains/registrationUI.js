'use strict';
(()=>{
 if(window.CartRegistrationDomain)return;
 CartDomains.claim('registrationUI','domains/registrationUI.js',()=>{
  const esc=v=>{const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;};
  const RegistrationModal={
   open(){
    window.AppPanelModal?.close?.();
    const overlay=document.createElement('div');overlay.className='app-panel-overlay';
    overlay.innerHTML=`<section class="register-modal-shell" role="dialog" aria-modal="true"><button class="app-panel-close register-close" type="button">✕</button><div class="register-brand"><span>🎭</span><div><small>NOVA CONTA</small><h2>Entre para o Cartaralho</h2><p>O usuário identifica sua conta. O nickname é seu nome padrão e ainda pode mudar em cada partida.</p></div></div><div class="register-grid"><label><span>Usuário</span><input id="reg-user" class="input" maxlength="24" autocomplete="username" placeholder="ex.: joaovictor"></label><label><span>Nickname padrão</span><input id="reg-nick" class="input" maxlength="24" placeholder="Como quer aparecer?"></label><label><span>Senha</span><input id="reg-pass" class="input" type="password" minlength="6" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label><label><span>Confirmar senha</span><input id="reg-pass2" class="input" type="password" minlength="6" autocomplete="new-password" placeholder="Repita a senha"></label><label class="register-email"><span>E-mail <em>opcional</em></span><input id="reg-email" class="input" type="email" autocomplete="email" placeholder="Para facilitar sua recuperação"></label></div><div class="register-actions"><button id="reg-cancel" class="btn btn-secondary">Cancelar</button><button id="reg-submit" class="btn btn-primary">Criar minha conta</button></div></section>`;
    document.body.appendChild(overlay);document.body.classList.add('app-panel-open');
    const close=()=>{overlay.remove();document.body.classList.remove('app-panel-open');};
    overlay.querySelector('.register-close').onclick=close;overlay.querySelector('#reg-cancel').onclick=close;overlay.addEventListener('mousedown',e=>{if(e.target===overlay)close();});
    overlay.querySelector('#reg-submit').onclick=async()=>{
     const username=overlay.querySelector('#reg-user').value.trim(),nickname=overlay.querySelector('#reg-nick').value.trim(),password=overlay.querySelector('#reg-pass').value,password2=overlay.querySelector('#reg-pass2').value,email=overlay.querySelector('#reg-email').value.trim();
     if(!username)return Toast.warning('Escolha um usuário para sua conta.');
     if(nickname.length<2)return Toast.warning('Escolha um nickname padrão.');
     if(password.length<6)return Toast.warning('A senha precisa ter pelo menos 6 caracteres.');
     if(password!==password2)return Toast.warning('As senhas não conferem.');
     const btn=overlay.querySelector('#reg-submit');btn.disabled=true;btn.textContent='Criando...';
     try{const d=await AuthClient.register(username,password,nickname,email||null);close();Modal.show({title:'Conta criada',message:`Guarde seu código de recuperação:<br><br><strong style="font-size:1.2rem;letter-spacing:.08em">${esc(d.recoveryCode)}</strong><br><br>Ele permite redefinir sua senha caso você perca o acesso.`,confirmText:'Guardei'});HomeScreen.renderAccount();}
     catch(e){Toast.error(e.message);btn.disabled=false;btn.textContent='Criar minha conta';}
    };
   }
  };
  window.RegistrationModal=RegistrationModal;
  HomeScreen.register=()=>RegistrationModal.open();
  window.CartRegistrationDomain={RegistrationModal};
 });
})();
