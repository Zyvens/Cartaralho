'use strict';

(function soundtrackBootstrap(){
  const STORAGE_KEY='cartaralho:music-muted:v1';
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  const BPM=84;
  const STEP_SECONDS=60/BPM/2;
  const LOOKAHEAD_SECONDS=.35;
  const SCHEDULER_MS=80;
  const MASTER_LEVEL=.055;

  let context=null;
  let master=null;
  let compressor=null;
  let scheduler=null;
  let nextStepTime=0;
  let stepIndex=0;
  let unlocked=false;

  function storedMuted(){
    try{return localStorage.getItem(STORAGE_KEY)==='1';}catch(_){return false;}
  }

  let muted=storedMuted();

  const chords=[
    [57,60,64], // Am
    [53,57,60], // F
    [55,59,62], // G
    [52,55,59], // Em
  ];
  const roots=[45,41,43,40];
  const melody=[69,null,72,71,69,null,67,null,69,null,72,76,74,null,71,null,67,null,71,74,72,null,69,null,64,null,67,71,69,null,67,null];

  function midiToHz(note){return 440*Math.pow(2,(note-69)/12);}

  function ensureAudio(){
    if(context||!AudioCtx)return context;
    context=new AudioCtx();
    master=context.createGain();
    compressor=context.createDynamicsCompressor();
    compressor.threshold.value=-24;
    compressor.knee.value=18;
    compressor.ratio.value=5;
    compressor.attack.value=.01;
    compressor.release.value=.25;
    master.gain.value=muted?0:MASTER_LEVEL;
    master.connect(compressor);
    compressor.connect(context.destination);
    return context;
  }

  function tone(note,when,duration,type,level,detune=0){
    if(!context||!master||muted)return;
    const osc=context.createOscillator();
    const gain=context.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(midiToHz(note),when);
    osc.detune.setValueAtTime(detune,when);
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(level,when+.035);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when+duration+.05);
  }

  function padChord(chord,when){
    chord.forEach((note,i)=>{
      tone(note,when,STEP_SECONDS*7.5,'sine',.11,i===1?-4:i===2?4:0);
      tone(note+12,when,STEP_SECONDS*7.2,'triangle',.025,i===1?3:-3);
    });
  }

  function scheduleStep(index,when){
    const bar=Math.floor(index/8)%4;
    const within=index%8;
    if(within===0)padChord(chords[bar],when);
    if(within===0||within===4)tone(roots[bar],when,STEP_SECONDS*1.7,'triangle',.18);
    const note=melody[index%melody.length];
    if(note!==null)tone(note,when+.012,STEP_SECONDS*.72,'sine',.075);
    if(within===6)tone(chords[bar][1]+12,when,STEP_SECONDS*.42,'triangle',.035);
  }

  function scheduleAhead(){
    if(!context||context.state!=='running'||muted)return;
    if(nextStepTime<context.currentTime-.5)nextStepTime=context.currentTime+.05;
    while(nextStepTime<context.currentTime+LOOKAHEAD_SECONDS){
      scheduleStep(stepIndex,nextStepTime);
      nextStepTime+=STEP_SECONDS;
      stepIndex=(stepIndex+1)%32;
    }
  }

  function ensureScheduler(){
    if(scheduler)return;
    nextStepTime=(context?.currentTime||0)+.06;
    scheduler=setInterval(scheduleAhead,SCHEDULER_MS);
    scheduleAhead();
  }

  async function unlockAndPlay(){
    if(muted||!AudioCtx)return;
    const ctx=ensureAudio();
    if(!ctx)return;
    try{
      if(ctx.state==='suspended')await ctx.resume();
      unlocked=ctx.state==='running';
      if(unlocked){
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(MASTER_LEVEL,ctx.currentTime,.08);
        ensureScheduler();
      }
    }catch(_){unlocked=false;}
  }

  function persist(){
    try{localStorage.setItem(STORAGE_KEY,muted?'1':'0');}catch(_){}
  }

  function iconSvg(isMuted){
    return isMuted
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 4 4m0-4-4 4"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
  }

  function updateButton(button){
    button.innerHTML=iconSvg(muted);
    button.classList.toggle('is-muted',muted);
    button.setAttribute('aria-label',muted?'Ativar trilha sonora':'Mutar trilha sonora');
    button.setAttribute('title',muted?'Ativar trilha sonora':'Mutar trilha sonora');
    button.setAttribute('aria-pressed',muted?'true':'false');
  }

  async function setMuted(value,button){
    muted=!!value;
    persist();
    updateButton(button);
    const ctx=ensureAudio();
    if(!ctx||!master)return;
    if(muted){
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.0001,ctx.currentTime,.035);
      return;
    }
    await unlockAndPlay();
  }

  function installButton(){
    if(document.getElementById('game-audio-toggle'))return document.getElementById('game-audio-toggle');
    const button=document.createElement('button');
    button.id='game-audio-toggle';
    button.className='game-audio-toggle';
    button.type='button';
    updateButton(button);
    button.addEventListener('click',()=>setMuted(!muted,button));
    document.body.appendChild(button);
    return button;
  }

  function installAutoplayUnlock(){
    const attempt=event=>{
      if(event.target?.closest?.('#game-audio-toggle'))return;
      if(muted)return;
      unlockAndPlay();
    };
    document.addEventListener('pointerdown',attempt,{once:true,capture:true});
    document.addEventListener('keydown',attempt,{once:true,capture:true});
  }

  document.addEventListener('visibilitychange',async()=>{
    if(!context)return;
    try{
      if(document.hidden&&context.state==='running')await context.suspend();
      else if(!document.hidden&&!muted&&unlocked){await context.resume();ensureScheduler();}
    }catch(_){}
  });

  function init(){
    const button=installButton();
    if(!AudioCtx){
      muted=true;
      updateButton(button);
      button.disabled=true;
      button.setAttribute('title','Áudio não suportado neste navegador');
      return;
    }
    installAutoplayUnlock();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.CartSoundtrack={
    get muted(){return muted;},
    mute(){const b=installButton();return setMuted(true,b);},
    unmute(){const b=installButton();return setMuted(false,b);},
  };
})();
