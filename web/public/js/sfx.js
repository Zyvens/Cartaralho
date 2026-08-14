'use strict';

(function cartaralhoSfxBootstrap(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  const STORAGE_KEY='cartaralho:audio-settings:v1';
  const LEGACY_MUTE_KEY='cartaralho:music-muted:v1';
  const DEFAULTS={volume:.8,music:true,sfx:true,musicVolume:.82,sfxVolume:.78};
  let context=null;
  let output=null;
  let noiseBuffer=null;
  let lastHoverAt=0;
  const recent=new Map();
  const seenBuffEvents=new Set();

  function clamp(v,min=0,max=1){return Math.max(min,Math.min(max,Number(v)||0));}
  function read(){
    try{
      const stored=localStorage.getItem(STORAGE_KEY);
      const raw=JSON.parse(stored||'null')||{};
      const legacyMuted=localStorage.getItem(LEGACY_MUTE_KEY)==='1';
      const music=stored===null?!legacyMuted:(raw.music??DEFAULTS.music);
      return {...DEFAULTS,...raw,music:!!music,volume:clamp(raw.volume??DEFAULTS.volume),musicVolume:clamp(raw.musicVolume??DEFAULTS.musicVolume),sfxVolume:clamp(raw.sfxVolume??DEFAULTS.sfxVolume)};
    }catch(_){
      let music=DEFAULTS.music;
      try{music=localStorage.getItem(LEGACY_MUTE_KEY)!=='1';}catch(__){}
      return {...DEFAULTS,music};
    }
  }
  let settings=read();
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));}catch(_){} }
  function getSettings(){return {...settings};}
  function setSettings(next={}){
    settings={...settings,...next};
    settings.volume=clamp(settings.volume);
    settings.musicVolume=clamp(settings.musicVolume);
    settings.sfxVolume=clamp(settings.sfxVolume);
    settings.music=!!settings.music;
    settings.sfx=!!settings.sfx;
    persist();
    applyMusic();
    if(output&&context)output.gain.setTargetAtTime(settings.volume*settings.sfxVolume,context.currentTime,.025);
    window.dispatchEvent(new CustomEvent('cartaralho:audio-settings',{detail:getSettings()}));
    return getSettings();
  }

  function ensure(){
    if(context||!AudioCtx)return context;
    context=new AudioCtx();
    output=context.createGain();
    output.gain.value=settings.volume*settings.sfxVolume;
    output.connect(context.destination);
    return context;
  }
  async function unlock(){
    const ctx=ensure();
    if(ctx?.state==='suspended'){try{await ctx.resume();}catch(_){} }
    return ctx;
  }
  function canPlay(key,cooldown=45){
    if(!settings.sfx)return false;
    const now=performance.now(),last=recent.get(key);
    if(last!==undefined&&now-last<cooldown)return false;
    recent.set(key,now);
    if(recent.size>80){for(const[k,t]of recent)if(now-t>5000)recent.delete(k);}
    return true;
  }
  function midi(note){return 440*Math.pow(2,(note-69)/12);}
  function frequency(value){const n=Number(value);return n>127?n:midi(n);}
  function tone(note,delay=0,duration=.08,type='sine',level=.08,slideTo=null){
    const ctx=ensure();if(!ctx||!output)return;
    const t=ctx.currentTime+Math.max(0,delay),osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency(note),t);
    if(slideTo!==null)osc.frequency.exponentialRampToValueAtTime(Math.max(20,frequency(slideTo)),t+duration);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,level),t+.006);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain);gain.connect(output);osc.start(t);osc.stop(t+duration+.02);
  }
  function noise(delay=0,duration=.09,level=.05,highpass=900){
    const ctx=ensure();if(!ctx||!output)return;
    if(!noiseBuffer){const len=Math.floor(ctx.sampleRate*.35);noiseBuffer=ctx.createBuffer(1,len,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<len;i++)data[i]=Math.random()*2-1;}
    const t=ctx.currentTime+Math.max(0,delay),src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=noiseBuffer;filter.type='highpass';filter.frequency.value=highpass;gain.gain.setValueAtTime(level,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(filter);filter.connect(gain);gain.connect(output);src.start(t);src.stop(t+duration+.015);
  }
  function seq(notes,{gap=.055,duration=.07,type='square',level=.06,down=false}={}){notes.forEach((n,i)=>tone(n,i*gap,duration,type,level,down&&i===notes.length-1?Math.max(30,n-12):null));}

  const uiPatterns={
    click:()=>{tone(76,0,.035,'triangle',.035);tone(83,.018,.028,'sine',.018);},
    hover:()=>tone(88,0,.022,'sine',.011),
    confirm:()=>seq([72,76,79],{gap:.045,duration:.065,type:'triangle',level:.045}),
    purchase:()=>{seq([84,88,91],{gap:.04,duration:.075,type:'sine',level:.055});noise(.01,.035,.014,4800);},
    error:()=>{tone(51,0,.095,'square',.045,47);tone(45,.075,.11,'triangle',.04);},
    modal_open:()=>seq([60,67],{gap:.035,duration:.075,type:'sine',level:.027}),
    modal_close:()=>seq([67,60],{gap:.035,duration:.065,type:'sine',level:.023}),
    achievement:()=>{seq([72,76,79,84],{gap:.065,duration:.11,type:'triangle',level:.06});tone(91,.25,.18,'sine',.035);},
    reward:()=>{seq([67,72,76,79],{gap:.052,duration:.09,type:'triangle',level:.055});noise(.13,.045,.018,5600);}
  };

  const BUFF_META={
    buff_dedo_no_olho:{name:'Dedo no Olho',icon:'👁️',rarity:'common',label:'Comum',sfx:'eye'},
    buff_foi_sem_querer:{name:'Foi sem querer querendo',icon:'↩️',rarity:'common',label:'Comum',sfx:'rewind'},
    buff_amigo_de_merda:{name:'Amigo de Merda',icon:'🌀',rarity:'common',label:'Comum',sfx:'shuffle'},
    buff_vou_fingir:{name:'Vou fingir que ninguém viu',icon:'🕵️',rarity:'rare',label:'Incomum',sfx:'sneak'},
    buff_xo_ve_aqui:{name:'Xô vê aqui',icon:'🔄',rarity:'rare',label:'Incomum',sfx:'swap'},
    buff_meu_jogo:{name:'Meu jogo, minhas regras',icon:'🃏',rarity:'rare',label:'Incomum',sfx:'double'},
    buff_mao_de_vaca:{name:'Mão de Vaca',icon:'🐄',rarity:'rare',label:'Incomum',sfx:'cow'},
    buff_testemunha_protegida:{name:'Testemunha Protegida',icon:'🛡️',rarity:'rare',label:'Incomum',sfx:'shield'},
    buff_toque_de_midas:{name:'Toque de Midas',icon:'✨',rarity:'superrare',label:'Raro',sfx:'gold'},
    buff_surrupiada:{name:'Surrupiada',icon:'🥷',rarity:'superrare',label:'Raro',sfx:'steal'},
    buff_censura_previa:{name:'Censura Prévia',icon:'🚫',rarity:'superrare',label:'Raro',sfx:'censor'},
    buff_quem_nunca:{name:'Quem nunca?',icon:'🙋',rarity:'superrare',label:'Raro',sfx:'question'},
    buff_silencio_geral:{name:'Silêncio Geral',icon:'🤐',rarity:'superrare',label:'Raro',sfx:'silence'},
    buff_quero_tudo:{name:'Quero tudo que é seu',icon:'🤝',rarity:'epic',label:'Épico',sfx:'handswap'},
    buff_intervencao_federal:{name:'Intervenção Federal',icon:'🏛️',rarity:'epic',label:'Épico',sfx:'siren'},
    buff_apagao:{name:'Apagão',icon:'🌑',rarity:'epic',label:'Épico',sfx:'powerdown'},
    buff_poder_subiu:{name:'O poder subiu à cabeça',icon:'👑',rarity:'epic',label:'Épico',sfx:'crown'},
    buff_caos_total:{name:'CAOS TOTAL',icon:'🫥',rarity:'legendary',label:'Lendário',sfx:'chaos'},
    buff_se_fode_ai:{name:'Se fode aí',icon:'💥',rarity:'legendary',label:'Lendário',sfx:'impact'},
    buff_que_poder:{name:'Que Poder, Filho da Puta',icon:'🤬',rarity:'legendary',label:'Lendário',sfx:'power'},
    buff_saqueador:{name:'Saqueador',icon:'💰',rarity:'legendary',label:'Lendário',sfx:'coins'}
  };

  const buffPatterns={
    eye(){tone(95,0,.028,'sine',.04);noise(.018,.035,.036,4200);tone(79,.035,.055,'triangle',.03);},
    rewind(){seq([79,76,72,67],{gap:.035,duration:.055,type:'sawtooth',level:.035});},
    shuffle(){noise(0,.11,.045,2100);seq([74,69,76,71],{gap:.022,duration:.035,type:'square',level:.025});},
    sneak(){noise(0,.10,.022,3600);tone(64,.015,.09,'sine',.025,57);},
    swap(){tone(67,0,.11,'triangle',.04,79);tone(79,.025,.11,'triangle',.04,67);},
    double(){tone(72,0,.07,'square',.04);tone(72,.055,.07,'square',.04);tone(79,.11,.08,'triangle',.032);},
    cow(){tone(45,0,.18,'sawtooth',.035,40);tone(52,.12,.16,'triangle',.03,43);},
    shield(){noise(0,.035,.025,5200);tone(84,.005,.17,'sine',.055);tone(91,.045,.14,'sine',.025);},
    gold(){seq([76,81,88,93],{gap:.047,duration:.12,type:'sine',level:.05});},
    steal(){tone(55,0,.055,'triangle',.03);noise(.025,.07,.032,2500);tone(79,.065,.045,'square',.027);},
    censor(){tone(1000,0,.11,'square',.045);tone(1000,.135,.075,'square',.035);},
    question(){seq([67,71,74,79],{gap:.055,duration:.085,type:'triangle',level:.042});},
    silence(){noise(0,.13,.038,5000);tone(72,0,.13,'sine',.025,48);},
    handswap(){tone(60,0,.14,'triangle',.04,76);tone(76,.01,.14,'triangle',.04,60);noise(.06,.05,.025,3400);},
    siren(){tone(69,0,.13,'square',.035,81);tone(81,.12,.13,'square',.035,69);tone(69,.24,.11,'square',.03,81);},
    powerdown(){tone(72,0,.24,'sawtooth',.045,36);noise(.14,.10,.028,1200);},
    crown(){seq([60,67,72,76,79],{gap:.06,duration:.13,type:'triangle',level:.045});tone(84,.28,.22,'sine',.04);},
    chaos(){seq([84,55,79,62,91,48,76],{gap:.026,duration:.05,type:'square',level:.032});noise(.035,.16,.037,1800);},
    impact(){tone(88,0,.025,'square',.035);tone(40,.018,.16,'sine',.07,31);noise(.015,.11,.055,700);},
    power(){tone(43,0,.19,'sawtooth',.052,55);tone(67,.07,.17,'square',.04,79);noise(.04,.12,.04,1100);},
    coins(){seq([88,93,96,91,100],{gap:.035,duration:.075,type:'sine',level:.05});noise(.03,.04,.018,6500);noise(.13,.04,.018,6500);}
  };

  function play(name,options={}){
    const cooldown=options.cooldown??(name==='hover'?80:45);
    if(!canPlay(`ui:${name}`,cooldown))return;
    unlock().then(()=>uiPatterns[name]?.());
  }
  function rememberBuffEvent(eventId){
    if(!eventId)return true;
    const key=String(eventId);
    if(seenBuffEvents.has(key))return false;
    seenBuffEvents.add(key);
    if(seenBuffEvents.size>200){const first=seenBuffEvents.values().next().value;seenBuffEvents.delete(first);}
    return true;
  }
  function playBuff(key,eventId=''){
    const meta=BUFF_META[key];if(!meta||!rememberBuffEvent(eventId))return;
    if(!canPlay(`buff:${eventId||key}`,eventId?0:170))return;
    unlock().then(()=>buffPatterns[meta.sfx]?.());
  }
  function hover(){const now=performance.now();if(now-lastHoverAt<95)return;lastHoverAt=now;play('hover',{cooldown:90});}
  function applyMusic(){
    const music=window.CartSoundtrack;if(!music)return;
    const level=settings.volume*settings.musicVolume;
    if(typeof music.setVolume==='function')music.setVolume(level);
    if(settings.music){if(music.muted)music.unmute?.();}else if(!music.muted)music.mute?.();
  }
  function syncLegacyMute(){
    const music=window.CartSoundtrack;if(!music)return;
    settings.music=!music.muted;persist();
    window.dispatchEvent(new CustomEvent('cartaralho:audio-settings',{detail:getSettings()}));
  }
  function handleBuffEvent(d){
    const key=d?.buffKey||d?.buff_key||d?.buff?.key;
    const eventId=d?.activationId||d?.activation_id||d?._eventId||'';
    if(key)playBuff(key,eventId);
  }

  document.addEventListener('pointerdown',e=>{
    const target=e.target?.closest?.('button,.btn,[role="button"]');
    if(!target||target.disabled||target.closest('#audio-settings-modal'))return;
    play('click');
  },true);
  document.addEventListener('pointerover',e=>{
    const target=e.target?.closest?.('button,.btn,[role="button"]');
    if(!target||target.disabled||target===e.relatedTarget||target.contains(e.relatedTarget))return;
    hover();
  },true);
  document.addEventListener('pointerdown',()=>unlock(),{once:true,capture:true});
  document.addEventListener('keydown',()=>unlock(),{once:true,capture:true});
  document.addEventListener('click',e=>{if(e.target?.closest?.('#game-audio-toggle'))setTimeout(syncLegacyMute,30);},true);
  window.SocketClient?.on?.('buff_activated',handleBuffEvent);
  window.SocketClient?.on?.('buff_resolved',handleBuffEvent);
  window.addEventListener('load',()=>setTimeout(applyMusic,0));

  window.CartBuffPresentation={meta:BUFF_META,rarity(key){return BUFF_META[key]?.rarity||'common';},info(key){return BUFF_META[key]||null;}};
  window.CartSFX={play,playBuff,hover,unlock,getSettings,setSettings,applyMusic,BUFF_META};
})();