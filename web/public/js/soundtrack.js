'use strict';

(function soundtrackBootstrap(){
  const STORAGE_KEY='cartaralho:music-muted:v1';
  const AudioCtx=window.AudioContext||window.webkitAudioContext;

  // V2: the chaos lives in the groove and arrangement, not in wrong-sounding harmony.
  // Fast arcade-party energy with a stable A-minor palette and a memorable hook.
  const BPM=166;
  const STEP_SECONDS=60/BPM/2; // eighth-note grid
  const LOOKAHEAD_SECONDS=.32;
  const SCHEDULER_MS=55;
  const MASTER_LEVEL=.05;
  const LOOP_STEPS=128; // 16 bars

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

  // Am -> F -> C -> G: familiar, energetic and fully inside A natural minor.
  const chords=[
    [57,60,64], // Am
    [53,57,60], // F
    [48,52,55], // C
    [55,59,62], // G
  ];
  const roots=[45,41,36,43];
  const barProgression=[0,1,2,3, 0,1,2,3, 1,3,0,0, 1,2,3,3];

  // Bass uses only root, fifth and octave. No chromatic jumps.
  const bassOffsets=[0,7,12,7, 0,7,12,7];
  const leadGate=[1,0,1,1,0,1,0,1];

  // One hook, then a B section and a return. Notes stay in A natural minor and favor chord tones.
  const melodyBars=[
    [69,null,72,76,null,72,null,69], // Am
    [69,null,72,77,null,76,null,72], // F
    [67,null,72,76,null,79,null,76], // C
    [67,null,71,74,null,71,null,69], // G
    [69,null,72,76,null,79,null,76], // Am variation
    [69,null,72,77,null,72,null,69], // F
    [67,null,72,76,null,72,null,67], // C
    [67,null,71,74,null,79,null,74], // G lift

    [69,72,77,76,null,72,null,69],   // F - B section
    [71,74,79,74,null,71,null,67],   // G
    [72,76,81,79,null,76,null,72],   // Am high answer
    [69,72,76,81,null,79,null,76],   // Am
    [69,72,77,81,null,77,null,72],   // F
    [67,72,76,79,null,76,null,72],   // C
    [71,74,79,83,null,79,null,74],   // G
    [67,71,74,79,null,74,71,69],     // G turnaround
  ];

  function midiToHz(note){return 440*Math.pow(2,(note-69)/12);}

  function ensureAudio(){
    if(context||!AudioCtx)return context;
    context=new AudioCtx();
    master=context.createGain();
    compressor=context.createDynamicsCompressor();
    compressor.threshold.value=-19;
    compressor.knee.value=14;
    compressor.ratio.value=6;
    compressor.attack.value=.006;
    compressor.release.value=.18;
    master.gain.value=muted?0:MASTER_LEVEL;
    master.connect(compressor);
    compressor.connect(context.destination);
    return context;
  }

  function tone(note,when,duration,type,level,detune=0,attack=.008,cutoff=0){
    if(!context||!master||muted)return;
    const osc=context.createOscillator();
    const gain=context.createGain();
    let sourceNode=osc;
    osc.type=type;
    osc.frequency.setValueAtTime(midiToHz(note),when);
    osc.detune.setValueAtTime(detune,when);

    if(cutoff>0){
      const filter=context.createBiquadFilter();
      filter.type='lowpass';
      filter.frequency.setValueAtTime(cutoff,when);
      filter.Q.setValueAtTime(.7,when);
      osc.connect(filter);
      sourceNode=filter;
    }

    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(level,when+attack);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    sourceNode.connect(gain);
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
    source.stop(when+duration+(open?.03:.01));
  }

  function kick(when,accent=1){
    if(!context||!master||muted)return;
    const osc=context.createOscillator();
    const gain=context.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(138,when);
    osc.frequency.exponentialRampToValueAtTime(48,when+.09);
    gain.gain.setValueAtTime(.32*accent,when);
    gain.gain.exponentialRampToValueAtTime(.0001,when+.13);
    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when+.15);
  }

  function snare(when,accent=1){
    noiseHit(when,.105,.115*accent,1550);
    tone(50,when,.065,'triangle',.032*accent,0,.003,1200);
  }

  function hat(when,open=false,accent=1){
    noiseHit(when,open?.095:.03,(open?.038:.021)*accent,7000,open);
  }

  function chordStab(chord,when,accent=1){
    chord.forEach((note,i)=>{
      const detune=i===0?-2:i===1?0:2;
      tone(note,when,STEP_SECONDS*.42,'sawtooth',.026*accent,detune,.004,2400);
      tone(note+12,when+.004,STEP_SECONDS*.32,'triangle',.013*accent,-detune,.003,3200);
    });
  }

  function bass(note,when,accent=1){
    tone(note,when,STEP_SECONDS*.76,'triangle',.102*accent,0,.004,900);
    tone(note+12,when,STEP_SECONDS*.54,'square',.026*accent,0,.004,1050);
  }

  function leadHit(note,when,index,accent=1){
    if(note===null||note===undefined)return;
    const tinyDetune=index%2===0?-2:2;
    tone(note,when+.008,STEP_SECONDS*.48,'triangle',.055*accent,tinyDetune,.004,3600);
    tone(note+12,when+.012,STEP_SECONDS*.34,'square',.014*accent,-tinyDetune,.003,2600);
  }

  // Controlled fill: fast, silly and energetic, but entirely built from the active chord.
  function chaosFill(chord,when,bar){
    const notes=[chord[0]+12,chord[1]+12,chord[2]+12,chord[1]+12];
    notes.forEach((note,i)=>{
      tone(note,when+i*STEP_SECONDS*.2,STEP_SECONDS*.16,i%2?'triangle':'square',.024,(i%2?-1:1)*2,.002,3000);
    });
    if(bar===15){
      kick(when+STEP_SECONDS*.42,.82);
      snare(when+STEP_SECONDS*.68,.72);
    }
  }

  function scheduleStep(index,when){
    const bar=Math.floor(index/8)%16;
    const within=index%8;
    const progression=barProgression[bar];
    const chord=chords[progression];
    const root=roots[progression];
    const sectionB=bar>=8;

    // Stable dance-punk backbone. Extra syncopated kicks appear in the second half.
    if(within===0||within===4)kick(when,within===0?1.08:.92);
    if(sectionB&&within===3&&(bar%2===0))kick(when,.66);
    if(sectionB&&within===7&&(bar%2===1))kick(when,.58);
    if(within===2||within===6)snare(when,within===6?1.04:.94);

    hat(when,within===7&&(bar%4===3),within%2===0?1.04:.78);
    if(within===1||within===5)hat(when+STEP_SECONDS*.5,false,.42);

    // Bass locks to root/fifth/octave and leaves breathing room around the backbeat.
    if(within===0||within===2||within===4||within===6){
      const offset=bassOffsets[within];
      bass(root+offset,when,within===0?1.08:.84);
    }
    if(sectionB&&within===7&&bar%2===0)bass(root+7,when,.62);

    // Off-beat stabs create motion without fighting the melody.
    if(within===1||within===3||within===5||(sectionB&&within===7)){
      chordStab(chord,when,within===3?1:.82);
    }

    const melody=melodyBars[bar][within];
    if(leadGate[within]&&melody!==null)leadHit(melody,when,index,sectionB?1.04:.94);

    // Fills only close 4-bar phrases instead of interrupting every other bar.
    if(within===7&&(bar===3||bar===7||bar===15))chaosFill(chord,when,bar);
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
