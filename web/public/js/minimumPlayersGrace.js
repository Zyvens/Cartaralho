const MinimumPlayersGrace={
  timer:null,endsAt:0,active:false,
  init(){
    SocketClient.on('insufficient_players_started',d=>this.start(d));
    SocketClient.on('insufficient_players_cancelled',d=>this.cancel(d));
    SocketClient.on('minimum_players_sync',d=>{if(d?.minimumGrace)this.start(d.minimumGrace);else if(this.active)this.hide();});
    ['game_over','room_closed','room_cancelled'].forEach(e=>SocketClient.on(e,()=>this.hide()));
  },
  ensureOverlay(){
    let el=document.getElementById('minimum-players-grace');
    if(el)return el;
    el=document.createElement('div');el.id='minimum-players-grace';
    el.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(8,8,14,.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;';
    el.innerHTML='<div style="width:min(460px,100%);padding:28px 24px;border-radius:20px;background:#171722;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 80px rgba(0,0,0,.45)"><div style="font-size:2rem;margin-bottom:8px">⏳</div><h2 style="margin:0 0 8px">Aguardando jogadores</h2><p id="minimum-grace-message" style="margin:0 0 18px;color:var(--text-muted,#aaa)">A mesa ficou com jogadores insuficientes.</p><div id="minimum-grace-clock" style="font-size:3.4rem;font-weight:900;letter-spacing:.06em;line-height:1;margin:12px 0">01:00</div><p id="minimum-grace-count" style="margin:14px 0 0;color:var(--text-secondary,#ccc)"></p><p style="margin:10px 0 0;font-size:.82rem;color:var(--text-muted,#999)">A partida está pausada. Se um participante reingressar pelo código e o mínimo for restaurado, o jogo continua automaticamente.</p></div>';
    document.body.appendChild(el);return el;
  },
  start(data={}){
    const parsed=Date.parse(data.endsAt||'');this.endsAt=Number.isFinite(parsed)?parsed:Date.now()+Math.max(0,Number(data.remainingSeconds||60))*1000;this.active=true;
    const el=this.ensureOverlay();el.style.display='flex';
    const msg=document.getElementById('minimum-grace-message');if(msg)msg.textContent=data.message||'A mesa ficou com jogadores insuficientes. A partida será encerrada se o mínimo não for restaurado.';
    const count=document.getElementById('minimum-grace-count');if(count)count.textContent=`Jogadores ativos: ${data.activePlayers??'—'} / mínimo ${data.minPlayers??3}`;
    this.tick();if(this.timer)clearInterval(this.timer);this.timer=setInterval(()=>this.tick(),250);
  },
  tick(){
    if(!this.active)return;const remaining=Math.max(0,Math.ceil((this.endsAt-Date.now())/1000)),m=Math.floor(remaining/60),s=remaining%60,clock=document.getElementById('minimum-grace-clock');if(clock)clock.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(remaining<=0){if(clock)clock.textContent='00:00';const msg=document.getElementById('minimum-grace-message');if(msg)msg.textContent='Tempo esgotado. Encerrando a partida...';if(this.timer){clearInterval(this.timer);this.timer=null;}}
  },
  cancel(data={}){const was=this.active;this.hide();if(was)Toast.success(data.message||'Jogadores suficientes novamente. A partida continua!');},
  hide(){this.active=false;this.endsAt=0;if(this.timer){clearInterval(this.timer);this.timer=null;}const el=document.getElementById('minimum-players-grace');if(el)el.style.display='none';}
};
MinimumPlayersGrace.init();
