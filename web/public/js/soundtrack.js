'use strict';

(function soundtrackBootstrap(){
  const STORAGE_KEY='cartaralho:music-muted:v1';
  const AudioCtx=window.AudioContext||window.webkitAudioContext;

  // Cartaralho should feel like a party that is one card away from going off the rails.
  // The score is intentionally fast, syncopated and slightly abrasive, but still loopable.
  const BPM=172;
  const STEP_SECONDS=60/BPM/2; // eighth-note grid
  const LOOKAHEAD_SECONDS=.32;
  const SCHEDULER_MS=55;
  const MASTER_LEVEL=.048;
  const LOOP_STEPS=64;

  let context=null;
  let master=null;
  let compressor=null;
  let noiseBuffer=null;
  let scheduler=null;
  let nextStepTime=0;
  let stepIndex=0;
  let unlocked=false;

  function storedMuted(){
    try{return localStorage.getItem(STORAGE_KEY)==='1';}catch(_){return false;}
  }

  let muted=storedMuted();

  // D minor with a final A-major push: bright enough for a party, tense enough for chaos.
  const chords=[
    [62,65,69], // Dm
    [58,62,65], // Bb
    [60,64,67], // C
    [57,61,64], // A
  ];
  const roots=[38,34,36,33];
  const bassOffsets=[0,0,12,0,7,0,10,7];
  const lead=[
    74,77,81,79,77,74,72,76,
    74,70,74,77,81,77,74,72,
    72,76,79,84,79,76,74,79,
    73,76,81,85,84,81,76,73,
    86,81,79,77,74,77,81,84,
    82,77,74,70,74,77,79,81,
    84,79,76,72,76,79,84,88,
    85,81,76,73,76,81,85,88,
  ];
  const leadGate=[1,1,0,1,1,0,1,1, 1,0,1,1,0,1,1,0];

  function midiToHz(note){return 440*Math.pow(2,(note-69)/12);}

  function ensureAudio(){
    if(context||!AudioCtx)return context;
    context=new AudioCtx();
    master=context.createGain();
    compressor=context.createDynamicsCompressor();
    compressor.threshold.value=-18;
    compressor.knee.value=12;
    compressor.ratio.value=7;
    compressor.attack.value=.004;
    compressor.release.value=.16;
    master.gain.value=muted?0:MASTER_LEVEL;
    master.connect(compressor);
    compressor.connect(context.destination);
    return context;
  }

  function tone(note,when,duration,type,level,detune=0,attack=.008){
    if(!context||!master||muted)return;
    const osc=context.createOscillator();
    const gain=context.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(midiToHz(note),when);
    osc.detune.setValueAtTime(detune,when);
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(level,when+attack);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when+duration+.03);
  }

  function getNoiseBuffer(){
    if(noiseBuffer||!context)return noiseBuffer;
    const length=Math.max(1,Math.floor(context.sampleRate*.22));
    noiseBuffer=context.createBuffer(1,length,context.sampleRate);
    const data=noiseBuffer.getChannelData(0);
    for(let i=0;i<length;i+=1)data[i]=Math.random()*2-1;
    return noiseBuffer;
  }

  function noiseHit(when,duration,level,frequency,open=false){
    if(!context||!master||muted)return;
    const source=context.createBufferSource();
    const filter=context.createBiquadFilter();
    const gain=context.createGain();
    source.buffer=getNoiseBuffer();
    filter.type='highpass';
    filter.frequency.setValueAtTime(frequency,when);
    gain.gain.setValueAtTime(level,when);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(when);
    source.stop(when+duration+(open ? .03 : .01));
  }

  function kick(when,accent=1){
    if(!context||!master||muted)return;
    const osc=context.createOscillator();
    const gain=context.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(150,when);
    osc.frequency.exponentialRampToValueAtTime(46,when+.095);
    gain.gain.setValueAtTime(.34*accent,when);
    gain.gain.exponentialRampToValueAtTime(.0001,when+.14);
    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when+.16);
  }

  function snare(when,accent=1){
    noiseHit(when,.12,.13*accent,1350);
    tone(43,when,.08,'triangle',.055*accent,-8,.003);
  }

  function hat(when,open=false,accent=1){
    noiseHit(when,open?.11:.035,(open?.045:.027)*accent,6500,open);
  }

  function chordStab(chord,when,accent=1){
    chord.forEach((note,i)=>{
      const detune=i===0?-5:i===1?3:7;
      tone(note,when,STEP_SECONDS*.52,'sawtooth',.035*accent,detune,.004);
      tone(note+12,when+.006,STEP_SECONDS*.34,'square',.012*accent,-detune,.003);
    });
  }

  function bass(note,when,accent=1){
    tone(note,when,STEP_SECONDS*.72,'square',.105*accent,-4,.004);
    tone(note-12,when,STEP_SECONDS*.68,'triangle',.075*accent,2,.004);
  }

  function leadHit(note,when,index){
    const detune=(index%4===0?-8:index%4===1?5:index%4===2?-2:9);
    tone(note,when+.008,STEP_SECONDS*.43,'square',.047,detune,.004);
    if(index%8===7)tone(note+12,when+STEP_SECONDS*.48,STEP_SECONDS*.24,'sawtooth',.025,-detune,.003);
  }

  function chaosFill(chord,when,bar){
    const notes=[chord[0]+12,chord[1]+12,chord[2]+12,chord[1]+24];
    notes.forEach((note,i)=>{
      tone(note,when+i*STEP_SECONDS*.22,STEP_SECONDS*.18,i%2?'square':'sawtooth',.028,(bar%2?1:-1)*i*7,.002);
    });
    kick(when+STEP_SECONDS*.46,.72);
    snare(when+STEP_SECONDS*.72,.68);
  }

  function scheduleStep(index,when){
    const bar=Math.floor(index/8)%8;
    const progression=bar%4;
    const within=index%8;
    const chord=chords[progression];
    const root=roots[progression];

    // Drums: relentless backbeat with extra kicks and end-of-bar open hats.
    if(within===0||within===4)kick(when,within===0?1.08:.92);
    if(within===3&&(bar%2===0))kick(when,.72);
    if(within===5&&(bar%2===1))kick(when,.66);
    if(within===2||within===6)snare(when,within===6?1.08:.94);
    hat(when,within===7,within%2===0?1.08:.78);
    if(within===1||within===5)hat(when+STEP_SECONDS*.5,false,.5);

    // Bass and sharp chord hits keep the harmony moving without turning into a pad.
    if(within!==6||bar%2===0)bass(root+bassOffsets[within],when,within===0?1.12:.86);
    if(within===0||within===3||within===4||(within===7&&bar%2===0))chordStab(chord,when,within===0?1.08:.82);

    // Nervous lead line: deliberately leaves holes so the groove can punch through.
    if(leadGate[index%leadGate.length])leadHit(lead[index%lead.length],when,index);

    // Every second bar throws a tiny musical tantrum; the final bar gets the biggest fill.
    if(within===7&&(bar%2===1))chaosFill(chord,when,bar);
    if(bar===7&&within===6){
      leadHit(93,when,index);
      kick(when+STEP_SECONDS*.5,.82);
    }
  }

  function scheduleAhead(){
    if(!context||context.state!=='running'||muted)return;
    if(nextStepTime<context.currentTime-.5)nextStepTime=context.currentTime+.05;
    while(nextStepTime<context.currentTime+LOOKAHEAD_SECONDS){
      scheduleStep(stepIndex,nextStepTime);
      nextStepTime+=STEP_SECONDS;
      stepIndex=(stepIndex+1)%LOOP_STEPS;
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
        master.gain.setTargetAtTime(MASTER_LEVEL,ctx.currentTime,.06);
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
