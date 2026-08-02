"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TRACKS = [
  {
    id: "poker-2",
    title: "Monkey Biz Poker - Cut 2 (Current)",
    file: "monkey-biz-poker-2.mp3",
    duration: "4:21"
  },
  {
    id: "poker-1",
    title: "Monkey Biz Poker - Cut 1",
    file: "monkey-biz-poker.mp3",
    duration: "4:14"
  },
  {
    id: "beat",
    title: "Monkey Biz Beat (Instrumental)",
    file: "monkey-biz-beat.mp3",
    duration: "2:29"
  },
  {
    id: "jungle",
    title: "Welcome to the Jungle (Rock Theme)",
    file: "welcome-to-the-jungle.mp3",
    duration: "2:24"
  }
];

export default function AudioDJPreviewPage() {
  // Deck A State
  const [trackAIndex, setTrackAIndex] = useState(0);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [currentTimeA, setCurrentTimeA] = useState(0);
  const [durationA, setDurationA] = useState(0);
  const [volumeA, setVolumeA] = useState(0.8);
  const [pitchA, setPitchA] = useState(1.0); // Playback rate
  // Deck A 3-Band EQ Sliders (range: -12dB to +12dB)
  const [bassA, setBassA] = useState(0);
  const [midA, setMidA] = useState(0);
  const [trebleA, setTrebleA] = useState(0);

  // Deck B State
  const [trackBIndex, setTrackBIndex] = useState(2); // Default to instrumental beat
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [currentTimeB, setCurrentTimeB] = useState(0);
  const [durationB, setDurationB] = useState(0);
  const [volumeB, setVolumeB] = useState(0.8);
  const [pitchB, setPitchB] = useState(1.0); // Playback rate
  // Deck B 3-Band EQ Sliders (range: -12dB to +12dB)
  const [bassB, setBassB] = useState(0);
  const [midB, setMidB] = useState(0);
  const [trebleB, setTrebleB] = useState(0);

  // Global Mixer State
  const [crossfader, setCrossfader] = useState(0.5); // 0 = Deck A fully, 1 = Deck B fully, 0.5 = Equal mix

  // Scratch State
  const [isScratchingA, setIsScratchingA] = useState(false);
  const [isScratchingB, setIsScratchingB] = useState(false);
  const lastXRefA = useRef(0);
  const lastXRefB = useRef(0);

  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);

  // Web Audio Visualizer API Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRefA = useRef<AnalyserNode | null>(null);
  const analyserRefB = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Biquad EQ Filters Refs
  const filterBassA = useRef<BiquadFilterNode | null>(null);
  const filterMidA = useRef<BiquadFilterNode | null>(null);
  const filterTrebleA = useRef<BiquadFilterNode | null>(null);

  const filterBassB = useRef<BiquadFilterNode | null>(null);
  const filterMidB = useRef<BiquadFilterNode | null>(null);
  const filterTrebleB = useRef<BiquadFilterNode | null>(null);

  // Track user-dragged EQ slider levels to shift EQ colors in the draw loop
  const eqLevelsRef = useRef({ bassA: 0, midA: 0, trebleA: 0, bassB: 0, midB: 0, trebleB: 0 });

  useEffect(() => {
    eqLevelsRef.current = { bassA, midA, trebleA, bassB, midB, trebleB };
  }, [bassA, midA, trebleA, bassB, midB, trebleB]);

  // Initialize Web Audio API on first user interaction
  const initAudioContext = () => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Deck A Nodes with 3-Band EQ
      if (audioRefA.current) {
        const sourceA = ctx.createMediaElementSource(audioRefA.current);
        
        // Low/Bass Peaking Filter
        const bFilterA = ctx.createBiquadFilter();
        bFilterA.type = "peaking";
        bFilterA.frequency.value = 100; // Bass
        bFilterA.Q.value = 1.0;
        bFilterA.gain.value = bassA;
        filterBassA.current = bFilterA;

        // Mid Peaking Filter
        const mFilterA = ctx.createBiquadFilter();
        mFilterA.type = "peaking";
        mFilterA.frequency.value = 1000; // Mids
        mFilterA.Q.value = 1.0;
        mFilterA.gain.value = midA;
        filterMidA.current = mFilterA;

        // Treble Peaking Filter
        const tFilterA = ctx.createBiquadFilter();
        tFilterA.type = "peaking";
        tFilterA.frequency.value = 8000; // Treble
        tFilterA.Q.value = 1.0;
        tFilterA.gain.value = trebleA;
        filterTrebleA.current = tFilterA;

        const analyserA = ctx.createAnalyser();
        analyserA.fftSize = 128;

        // Connect the chain: Source -> Bass -> Mid -> Treble -> Analyser -> Output
        sourceA.connect(bFilterA);
        bFilterA.connect(mFilterA);
        mFilterA.connect(tFilterA);
        tFilterA.connect(analyserA);
        analyserA.connect(ctx.destination);
        analyserRefA.current = analyserA;
      }

      // Deck B Nodes with 3-Band EQ
      if (audioRefB.current) {
        const sourceB = ctx.createMediaElementSource(audioRefB.current);

        const bFilterB = ctx.createBiquadFilter();
        bFilterB.type = "peaking";
        bFilterB.frequency.value = 100;
        bFilterB.Q.value = 1.0;
        bFilterB.gain.value = bassB;
        filterBassB.current = bFilterB;

        const mFilterB = ctx.createBiquadFilter();
        mFilterB.type = "peaking";
        mFilterB.frequency.value = 1000;
        mFilterB.Q.value = 1.0;
        mFilterB.gain.value = midB;
        filterMidB.current = mFilterB;

        const tFilterB = ctx.createBiquadFilter();
        tFilterB.type = "peaking";
        tFilterB.frequency.value = 8000;
        tFilterB.Q.value = 1.0;
        tFilterB.gain.value = trebleB;
        filterTrebleB.current = tFilterB;

        const analyserB = ctx.createAnalyser();
        analyserB.fftSize = 128;

        sourceB.connect(bFilterB);
        bFilterB.connect(mFilterB);
        mFilterB.connect(tFilterB);
        tFilterB.connect(analyserB);
        analyserB.connect(ctx.destination);
        analyserRefB.current = analyserB;
      }

      startVisualizerLoop();
    } catch (err) {
      console.error("Web Audio API failed to load:", err);
    }
  };

  const startVisualizerLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArrayA = new Uint8Array(64);
    const dataArrayB = new Uint8Array(64);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Fetch dynamic analyser levels
      if (analyserRefA.current) analyserRefA.current.getByteFrequencyData(dataArrayA);
      if (analyserRefB.current) analyserRefB.current.getByteFrequencyData(dataArrayB);

      const barWidth = (width / 24) - 2;

      // Determine active EQ slider heights to modify visualizer colors dynamically!
      // Sliders go from -12 to +12. Let's normalize to see if they're boosted or cut.
      const activeBass = (eqLevelsRef.current.bassA + eqLevelsRef.current.bassB) / 2;
      const activeMid = (eqLevelsRef.current.midA + eqLevelsRef.current.midB) / 2;
      const activeTreble = (eqLevelsRef.current.trebleA + eqLevelsRef.current.trebleB) / 2;

      // Average boost factor (from 0 to 1, where > 0.5 is pushed up)
      const overallBoost = Math.max(0, Math.min(1, (activeBass + activeMid + activeTreble + 36) / 72));

      for (let i = 0; i < 24; i++) {
        const valA = dataArrayA[i % 16] || 0;
        const valB = dataArrayB[i % 16] || 0;
        
        const volFactorA = (1 - crossfader) * volumeA;
        const volFactorB = crossfader * volumeB;
        
        const blendedVal = (valA * volFactorA) + (valB * volFactorB);
        const barHeight = (blendedVal / 255) * height * 0.95;

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Dynamic Color Shifting!
        // Default is neon lime green.
        // As they slide the EQ buttons higher (overallBoost increases), we shift colors!
        // We can transition through hue-rotation (hsl): 
        // Lime Green is around HSL(120, 100%, 50%)
        // As boost increases, we rotate towards Yellow/Orange (HSL 60-30) or even Hot Pink/Red (HSL 0-330)!
        const hue = 120 - (overallBoost * 180); // range from 120 (lime green) down to -60 (neon hot magenta/pink!)
        const glowColor = `hsl(${hue}, 100%, 50%)`;

        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = glowColor;

        const grad = ctx.createLinearGradient(x, y, x, height);
        grad.addColorStop(0, `hsl(${hue}, 100%, 50%)`); // Dynamic neon peak
        grad.addColorStop(0.6, `hsl(${hue + 30}, 100%, 40%)`); // Shift
        grad.addColorStop(1, "#0A1405"); // Base dark
        
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.restore();
      }
    };

    draw();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Update EQ filters in real-time when sliders change
  useEffect(() => {
    if (filterBassA.current) filterBassA.current.gain.value = bassA;
  }, [bassA]);
  useEffect(() => {
    if (filterMidA.current) filterMidA.current.gain.value = midA;
  }, [midA]);
  useEffect(() => {
    if (filterTrebleA.current) filterTrebleA.current.gain.value = trebleA;
  }, [trebleA]);

  useEffect(() => {
    if (filterBassB.current) filterBassB.current.gain.value = bassB;
  }, [bassB]);
  useEffect(() => {
    if (filterMidB.current) filterMidB.current.gain.value = midB;
  }, [midB]);
  useEffect(() => {
    if (filterTrebleB.current) filterTrebleB.current.gain.value = trebleB;
  }, [trebleB]);

  // Volumes updates
  useEffect(() => {
    if (audioRefA.current) {
      const crossFactorA = Math.cos((crossfader * Math.PI) / 2);
      audioRefA.current.volume = volumeA * crossFactorA;
    }
  }, [volumeA, crossfader]);

  useEffect(() => {
    if (audioRefB.current) {
      const crossFactorB = Math.sin((crossfader * Math.PI) / 2);
      audioRefB.current.volume = volumeB * crossFactorB;
    }
  }, [volumeB, crossfader]);

  // Pitch updates
  useEffect(() => {
    if (audioRefA.current) audioRefA.current.playbackRate = pitchA;
  }, [pitchA]);
  useEffect(() => {
    if (audioRefB.current) audioRefB.current.playbackRate = pitchB;
  }, [pitchB]);

  // Load A / B
  useEffect(() => {
    if (audioRefA.current) {
      audioRefA.current.load();
      if (isPlayingA) audioRefA.current.play().catch((err) => console.log(err));
    }
  }, [trackAIndex]);

  useEffect(() => {
    if (audioRefB.current) {
      audioRefB.current.load();
      if (isPlayingB) audioRefB.current.play().catch((err) => console.log(err));
    }
  }, [trackBIndex]);

  const togglePlayA = () => {
    initAudioContext();
    if (!audioRefA.current) return;
    if (isPlayingA) {
      audioRefA.current.pause();
      setIsPlayingA(false);
    } else {
      audioRefA.current.play().then(() => setIsPlayingA(true)).catch((err) => console.log(err));
    }
  };

  const togglePlayB = () => {
    initAudioContext();
    if (!audioRefB.current) return;
    if (isPlayingB) {
      audioRefB.current.pause();
      setIsPlayingB(false);
    } else {
      audioRefB.current.play().then(() => setIsPlayingB(true)).catch((err) => console.log(err));
    }
  };

  // Scratching Decks
  const handleScratchStartA = (e: React.MouseEvent | React.TouchEvent) => {
    initAudioContext();
    setIsScratchingA(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    lastXRefA.current = clientX;
    if (audioRefA.current && isPlayingA) audioRefA.current.playbackRate = 0.5;
  };

  const handleScratchMoveA = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratchingA || !audioRefA.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - lastXRefA.current;
    lastXRefA.current = clientX;
    audioRefA.current.currentTime = Math.max(0, Math.min(audioRefA.current.duration, audioRefA.current.currentTime + diff * 0.08));
    audioRefA.current.playbackRate = Math.min(3, Math.max(0.2, Math.abs(diff) * 0.5));
  };

  const handleScratchEndA = () => {
    setIsScratchingA(false);
    if (audioRefA.current) audioRefA.current.playbackRate = pitchA;
  };

  const handleScratchStartB = (e: React.MouseEvent | React.TouchEvent) => {
    initAudioContext();
    setIsScratchingB(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    lastXRefB.current = clientX;
    if (audioRefB.current && isPlayingB) audioRefB.current.playbackRate = 0.5;
  };

  const handleScratchMoveB = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratchingB || !audioRefB.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - lastXRefB.current;
    lastXRefB.current = clientX;
    audioRefB.current.currentTime = Math.max(0, Math.min(audioRefB.current.duration, audioRefB.current.currentTime + diff * 0.08));
    audioRefB.current.playbackRate = Math.min(3, Math.max(0.2, Math.abs(diff) * 0.5));
  };

  const handleScratchEndB = () => {
    setIsScratchingB(false);
    if (audioRefB.current) audioRefB.current.playbackRate = pitchB;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between select-none">
      <audio
        ref={audioRefA}
        src={`/audio/${TRACKS[trackAIndex].file}`}
        onTimeUpdate={() => audioRefA.current && setCurrentTimeA(audioRefA.current.currentTime)}
        onLoadedMetadata={() => audioRefA.current && setDurationA(audioRefA.current.duration)}
        onEnded={() => setIsPlayingA(false)}
        preload="auto"
      />
      <audio
        ref={audioRefB}
        src={`/audio/${TRACKS[trackBIndex].file}`}
        onTimeUpdate={() => audioRefB.current && setCurrentTimeB(audioRefB.current.currentTime)}
        onLoadedMetadata={() => audioRefB.current && setDurationB(audioRefB.current.duration)}
        onEnded={() => setIsPlayingB(false)}
        preload="auto"
      />

      {/* Header */}
      <header className="border-b border-yellow/10 bg-[#080808]/80 backdrop-blur sticky top-0 z-50 px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-yellow font-bold uppercase tracking-wider hover:opacity-80 transition">
            <span>← Exit Preview</span>
          </Link>
          <div className="text-right">
            <h1 className="text-lg font-mono text-yellow font-bold tracking-widest uppercase">
              Chameleon DJ Decks 🎚️🦧🌈
            </h1>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Monkey Biz Interactive Live EQ Studio
            </p>
          </div>
        </div>
      </header>

      {/* Main Console */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col gap-6 justify-center">
        {/* Dynamic Equalizer Matrix Display */}
        <div className="bg-[#121212] border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-left">
            <h2 className="text-xs font-mono uppercase tracking-widest text-yellow font-bold flex items-center gap-1.5">
              <span className="animate-pulse">🟢</span> Dynamic Multi-Color Analyzer Matrix
            </h2>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase">
              Equalizer shifts color from **Lime Green** to **Hot Pink** as you push the EQ sliders up!
            </p>
          </div>
          {/* Glowing Equalizer Screen */}
          <div className="w-full sm:w-96 h-14 bg-black rounded-sm border border-white/10 overflow-hidden shadow-2xl relative">
            <canvas ref={canvasRef} width="384" height="56" className="w-full h-full" onClick={initAudioContext} />
          </div>
        </div>

        {/* DJ Station Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Deck A (Left - 4 cols) */}
          <div className="lg:col-span-4 bg-[#121212] border border-white/5 rounded-sm p-6 flex flex-col gap-5 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-xs font-mono font-bold text-yellow">DECK A (LEFT)</span>
              <span className="text-xs font-mono text-white/40">{formatTime(currentTimeA)} / {formatTime(durationA)}</span>
            </div>

            {/* Deck A track picker */}
            <select
              value={trackAIndex}
              onChange={(e) => setTrackAIndex(parseInt(e.target.value))}
              className="w-full bg-[#1C1C1C] text-xs text-white border border-white/10 rounded-sm p-2 font-mono focus:outline-none"
            >
              {TRACKS.map((t, idx) => (
                <option key={t.id} value={idx}>{t.title}</option>
              ))}
            </select>

            {/* Interactive Turn Table */}
            <div className="flex justify-center items-center py-2">
              <div
                onMouseDown={handleScratchStartA}
                onMouseMove={handleScratchMoveA}
                onMouseUp={handleScratchEndA}
                onMouseLeave={handleScratchEndA}
                onTouchStart={handleScratchStartA}
                onTouchMove={handleScratchMoveA}
                onTouchEnd={handleScratchEndA}
                className={`w-40 h-40 rounded-full bg-gradient-to-r from-neutral-900 via-zinc-800 to-neutral-900 border-[8px] border-zinc-700 shadow-xl relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${
                  isPlayingA && !isScratchingA ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
              >
                <div className="absolute inset-1 rounded-full border border-zinc-900/40" />
                <div className="absolute inset-4 rounded-full border border-zinc-900/30" />
                <div className="absolute inset-8 rounded-full border border-zinc-900/20" />
                <div className="absolute inset-12 rounded-full border border-zinc-900/10" />
                <div className="w-12 h-12 rounded-full bg-yellow flex items-center justify-center border-4 border-black">
                  <div className="w-3 h-3 rounded-full bg-black flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
                <div className="absolute -top-1 right-6 w-1 h-12 bg-zinc-400 origin-top rotate-12 pointer-events-none rounded-sm" />
              </div>
            </div>

            {/* Deck A 3-Band Equalizer Sliders */}
            <div className="bg-[#1C1C1C]/60 p-3.5 rounded-sm space-y-3 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider block border-b border-white/5 pb-1">
                🎚️ Deck A 3-Band Parametric EQ
              </span>
              <div className="grid grid-cols-3 gap-3">
                {/* Bass */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Bass</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={bassA}
                    onChange={(e) => { initAudioContext(); setBassA(parseFloat(e.target.value)); }}
                    className="h-20 bg-black rounded-lg appearance-none cursor-pointer accent-yellow [writing-mode:bt-lr] [direction:ltr] select-none"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                  <span className={`text-[10px] font-mono ${bassA > 0 ? "text-[#39FF14]" : bassA < 0 ? "text-red" : "text-white/60"}`}>
                    {bassA > 0 ? `+${bassA}` : bassA}dB
                  </span>
                </div>
                {/* Mid */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Mid</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={midA}
                    onChange={(e) => { initAudioContext(); setMidA(parseFloat(e.target.value)); }}
                    className="h-20 bg-black rounded-lg appearance-none cursor-pointer accent-yellow [writing-mode:bt-lr] [direction:ltr]"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                  <span className={`text-[10px] font-mono ${midA > 0 ? "text-[#39FF14]" : midA < 0 ? "text-red" : "text-white/60"}`}>
                    {midA > 0 ? `+${midA}` : midA}dB
                  </span>
                </div>
                {/* Treble */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Treble</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={trebleA}
                    onChange={(e) => { initAudioContext(); setTrebleA(parseFloat(e.target.value)); }}
                    className="h-20 bg-black rounded-lg appearance-none cursor-pointer accent-yellow [writing-mode:bt-lr] [direction:ltr]"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                  <span className={`text-[10px] font-mono ${trebleA > 0 ? "text-[#39FF14]" : trebleA < 0 ? "text-red" : "text-white/60"}`}>
                    {trebleA > 0 ? `+${trebleA}` : trebleA}dB
                  </span>
                </div>
              </div>
            </div>

            {/* Deck Controls */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={togglePlayA}
                className={`py-2 rounded-sm font-mono text-xs font-bold uppercase transition ${
                  isPlayingA ? "bg-red text-black" : "bg-yellow text-black"
                }`}
              >
                {isPlayingA ? "❚❚ Pause" : "▶ Play A"}
              </button>
              
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-mono text-white/40 uppercase">Pitch ({pitchA.toFixed(2)}x)</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={pitchA}
                  onChange={(e) => setPitchA(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow"
                />
              </div>
            </div>
          </div>

          {/* Central DJ Mandrill Mixer Console (4 cols) */}
          <div className="lg:col-span-4 bg-[#1C1C1C] border border-white/5 rounded-sm p-4 flex flex-col justify-between gap-5 shadow-xl relative min-h-[400px]">
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-yellow bg-yellow/10 border border-yellow/20 px-2 py-0.5 rounded-sm inline-block">
                Master DJ Console
              </span>
            </div>

            {/* Mandrill DJ Avatar Image */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="relative w-full max-w-[280px] aspect-[16/9] rounded-sm overflow-hidden border border-yellow/30 shadow-[0_0_20px_rgba(255,204,0,0.15)] bg-black/40">
                {/* Glow overlay that pulses when playing */}
                <div className={`absolute inset-0 border-[2px] rounded-sm pointer-events-none transition-all duration-300 z-10 ${
                  isPlayingA || isPlayingB ? "border-[#39FF14] shadow-[inset_0_0_15px_rgba(57,255,20,0.3)]" : "border-yellow/20"
                }`} />
                <img
                  src="/img/mandrill-dj.png"
                  alt="Mandrill DJ Spinning Vinyls"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
              <p className="text-[10px] font-mono text-center text-yellow/80 uppercase font-bold tracking-wider">
                Mandrill DJ on the Decks 🦧🎧
              </p>
            </div>

            {/* Crossfader Controls */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase">
                <span>A</span>
                <span>Crossfader</span>
                <span>B</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={crossfader}
                onChange={(e) => setCrossfader(parseFloat(e.target.value))}
                className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-yellow border border-white/5"
              />
              <div className="text-center text-[9px] font-mono text-white/30">
                {(100 - Math.round(crossfader * 100))}% Left / {Math.round(crossfader * 100)}% Right
              </div>
            </div>
          </div>

          {/* Deck B (Right - 4 cols) */}
          <div className="lg:col-span-4 bg-[#121212] border border-white/5 rounded-sm p-6 flex flex-col gap-5 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-xs font-mono font-bold text-yellow">DECK B (RIGHT)</span>
              <span className="text-xs font-mono text-white/40">{formatTime(currentTimeB)} / {formatTime(durationB)}</span>
            </div>

            {/* Deck B track picker */}
            <select
              value={trackBIndex}
              onChange={(e) => setTrackBIndex(parseInt(e.target.value))}
              className="w-full bg-[#1C1C1C] text-xs text-white border border-white/10 rounded-sm p-2 font-mono focus:outline-none"
            >
              {TRACKS.map((t, idx) => (
                <option key={t.id} value={idx}>{t.title}</option>
              ))}
            </select>

            {/* Interactive Turn Table */}
            <div className="flex justify-center items-center py-2">
              <div
                onMouseDown={handleScratchStartB}
                onMouseMove={handleScratchMoveB}
                onMouseUp={handleScratchEndB}
                onMouseLeave={handleScratchEndB}
                onTouchStart={handleScratchStartB}
                onTouchMove={handleScratchMoveB}
                onTouchEnd={handleScratchEndB}
                className={`w-40 h-40 rounded-full bg-gradient-to-r from-neutral-900 via-zinc-800 to-neutral-900 border-[8px] border-zinc-700 shadow-xl relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${
                  isPlayingB && !isScratchingB ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
              >
                <div className="absolute inset-1 rounded-full border border-zinc-900/40" />
                <div className="absolute inset-4 rounded-full border border-zinc-900/30" />
                <div className="absolute inset-8 rounded-full border border-zinc-900/20" />
                <div className="absolute inset-12 rounded-full border border-zinc-900/10" />
                <div className="w-12 h-12 rounded-full bg-yellow flex items-center justify-center border-4 border-black">
                  <div className="w-3 h-3 rounded-full bg-black flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
                <div className="absolute -top-1 right-6 w-1 h-12 bg-zinc-400 origin-top rotate-12 pointer-events-none rounded-sm" />
              </div>
            </div>

            {/* Deck B 3-Band Equalizer Sliders */}
            <div className="bg-[#1C1C1C]/60 p-3.5 rounded-sm space-y-3 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider block border-b border-white/5 pb-1">
                🎚️ Deck B 3-Band Parametric EQ
              </span>
              <div className="grid grid-cols-3 gap-3">
                {/* Bass */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Bass</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={bassB}
                    onChange={(e) => { initAudioContext(); setBassB(parseFloat(e.target.value)); }}
                    className="h-20 bg-black rounded-lg appearance-none cursor-pointer accent-yellow [writing-mode:bt-lr] [direction:ltr]"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                  <span className={`text-[10px] font-mono ${bassB > 0 ? "text-[#39FF14]" : bassB < 0 ? "text-red" : "text-white/60"}`}>
                    {bassB > 0 ? `+${bassB}` : bassB}dB
                  </span>
                </div>
                {/* Mid */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Mid</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={midB}
                    onChange={(e) => { initAudioContext(); setMidB(parseFloat(e.target.value)); }}
                    className="h-20 bg-black rounded-lg appearance-none cursor-pointer accent-yellow [writing-mode:bt-lr] [direction:ltr]"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                  <span className={`text-[10px] font-mono ${midB > 0 ? "text-[#39FF14]" : midB < 0 ? "text-red" : "text-white/60"}`}>
                    {midB > 0 ? `+${midB}` : midB}dB
                  </span>
                </div>
                {/* Treble */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase">Treble</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={trebleB}
                    onChange={(e) => { initAudioContext(); setTrebleB(parseFloat(e.target.value)); }}
                    className="h-20 bg-black rounded-lg appearance-none cursor-pointer accent-yellow [writing-mode:bt-lr] [direction:ltr]"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                  <span className={`text-[10px] font-mono ${trebleB > 0 ? "text-[#39FF14]" : trebleB < 0 ? "text-red" : "text-white/60"}`}>
                    {trebleB > 0 ? `+${trebleB}` : trebleB}dB
                  </span>
                </div>
              </div>
            </div>

            {/* Deck Controls */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={togglePlayB}
                className={`py-2 rounded-sm font-mono text-xs font-bold uppercase transition ${
                  isPlayingB ? "bg-red text-black" : "bg-yellow text-black"
                }`}
              >
                {isPlayingB ? "❚❚ Pause" : "▶ Play B"}
              </button>
              
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-mono text-white/40 uppercase">Pitch ({pitchB.toFixed(2)}x)</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={pitchB}
                  onChange={(e) => setPitchB(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hints */}
        <div className="bg-[#1C1C1C] border border-white/5 rounded-sm p-4 text-center">
          <p className="text-xs text-white/50 font-mono uppercase tracking-wider leading-relaxed">
            🎨 <strong className="text-yellow">Chameleon Visualizer Logic:</strong> Drag any of the **BASS, MID, or TREBLE sliders** up or down. As you boost the sliders and make the mix louder and more aggressive, the Equalizer visualizer smoothly shifts color from **Lime Green** to a glowing **Neon Yellow** and all the way to a fiery, vibrant **Hot Pink/Magenta**!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-6 text-center text-[10px] text-white/30 font-mono uppercase tracking-wider">
        © {new Date().getFullYear()} Monkey Biz Poker Club. Chameleon Live Equalizer Demo.
      </footer>
    </div>
  );
}
