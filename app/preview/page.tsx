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

  // Deck B State
  const [trackBIndex, setTrackBIndex] = useState(2); // Default to instrumental beat
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [currentTimeB, setCurrentTimeB] = useState(0);
  const [durationB, setDurationB] = useState(0);
  const [volumeB, setVolumeB] = useState(0.8);
  const [pitchB, setPitchB] = useState(1.0); // Playback rate

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

  // Initialize Web Audio API on first user interaction
  const initAudioContext = () => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Deck A Nodes
      if (audioRefA.current) {
        const sourceA = ctx.createMediaElementSource(audioRefA.current);
        const analyserA = ctx.createAnalyser();
        analyserA.fftSize = 128; // Lower FFT size for thick EQ bars
        sourceA.connect(analyserA);
        analyserA.connect(ctx.destination);
        analyserRefA.current = analyserA;
      }

      // Deck B Nodes
      if (audioRefB.current) {
        const sourceB = ctx.createMediaElementSource(audioRefB.current);
        const analyserB = ctx.createAnalyser();
        analyserB.fftSize = 128;
        sourceB.connect(analyserB);
        analyserB.connect(ctx.destination);
        analyserRefB.current = analyserB;
      }

      startVisualizerLoop();
    } catch (err) {
      console.error("Web Audio API not supported / failed:", err);
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

      // Get analyser data
      if (analyserRefA.current) analyserRefA.current.getByteFrequencyData(dataArrayA);
      if (analyserRefB.current) analyserRefB.current.getByteFrequencyData(dataArrayB);

      // We combine them based on mixing volumes & crossfader, drawing glowing LIME GREEN bars
      const barWidth = (width / 24) - 2;
      
      // We render 24 EQ bars that light up in bright neon lime green
      for (let i = 0; i < 24; i++) {
        // Average or blend Deck A and B frequency points based on crossfader
        const valA = dataArrayA[i % 16] || 0;
        const valB = dataArrayB[i % 16] || 0;
        
        // Blend factor
        const volFactorA = (1 - crossfader) * volumeA;
        const volFactorB = crossfader * volumeB;
        
        const blendedVal = (valA * volFactorA) + (valB * volFactorB);
        const barHeight = (blendedVal / 255) * height * 0.95;

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Draw glowing bright neon lime green bars
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#39FF14"; // Lime green glow

        // Gradient from bright lime green to neon yellow-green
        const grad = ctx.createLinearGradient(x, y, x, height);
        grad.addColorStop(0, "#39FF14"); // Bright lime
        grad.addColorStop(0.5, "#00FF66"); // Neon green
        grad.addColorStop(1, "#1D3A0A"); // Dark green base
        
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

  // Update Volumes based on sliders + crossfader
  useEffect(() => {
    if (audioRefA.current) {
      // Crossfader: left side (0) means full Deck A. Right side (1) means no Deck A.
      const crossFactorA = Math.cos((crossfader * Math.PI) / 2);
      audioRefA.current.volume = volumeA * crossFactorA;
    }
  }, [volumeA, crossfader]);

  useEffect(() => {
    if (audioRefB.current) {
      // Crossfader: right side (1) means full Deck B. Left side (0) means no Deck B.
      const crossFactorB = Math.sin((crossfader * Math.PI) / 2);
      audioRefB.current.volume = volumeB * crossFactorB;
    }
  }, [volumeB, crossfader]);

  // Handle Playback rate (pitch controls)
  useEffect(() => {
    if (audioRefA.current) {
      audioRefA.current.playbackRate = pitchA;
    }
  }, [pitchA]);

  useEffect(() => {
    if (audioRefB.current) {
      audioRefB.current.playbackRate = pitchB;
    }
  }, [pitchB]);

  // Load new track A
  useEffect(() => {
    if (audioRefA.current) {
      audioRefA.current.load();
      if (isPlayingA) {
        audioRefA.current.play().catch((err) => console.log(err));
      }
    }
  }, [trackAIndex]);

  // Load new track B
  useEffect(() => {
    if (audioRefB.current) {
      audioRefB.current.load();
      if (isPlayingB) {
        audioRefB.current.play().catch((err) => console.log(err));
      }
    }
  }, [trackBIndex]);

  const togglePlayA = () => {
    initAudioContext();
    if (!audioRefA.current) return;
    if (isPlayingA) {
      audioRefA.current.pause();
      setIsPlayingA(false);
    } else {
      audioRefA.current.play()
        .then(() => setIsPlayingA(true))
        .catch((err) => console.log(err));
    }
  };

  const togglePlayB = () => {
    initAudioContext();
    if (!audioRefB.current) return;
    if (isPlayingB) {
      audioRefB.current.pause();
      setIsPlayingB(false);
    } else {
      audioRefB.current.play()
        .then(() => setIsPlayingB(true))
        .catch((err) => console.log(err));
    }
  };

  // Scratch Effect Simulation
  const handleScratchStartA = (e: React.MouseEvent | React.TouchEvent) => {
    initAudioContext();
    setIsScratchingA(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    lastXRefA.current = clientX;
    if (audioRefA.current && isPlayingA) {
      audioRefA.current.playbackRate = 0.5; // slow down during manual grab
    }
  };

  const handleScratchMoveA = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratchingA || !audioRefA.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - lastXRefA.current;
    lastXRefA.current = clientX;

    // Scrub the current playback point of Deck A based on mouse movement
    audioRefA.current.currentTime = Math.max(0, Math.min(audioRefA.current.duration, audioRefA.current.currentTime + diff * 0.08));
    
    // Mimic the pitch manipulation of scrubbing
    audioRefA.current.playbackRate = Math.min(3, Math.max(0.2, Math.abs(diff) * 0.5));
  };

  const handleScratchEndA = () => {
    setIsScratchingA(false);
    if (audioRefA.current) {
      audioRefA.current.playbackRate = pitchA; // restore pitch
    }
  };

  const handleScratchStartB = (e: React.MouseEvent | React.TouchEvent) => {
    initAudioContext();
    setIsScratchingB(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    lastXRefB.current = clientX;
    if (audioRefB.current && isPlayingB) {
      audioRefB.current.playbackRate = 0.5;
    }
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
    if (audioRefB.current) {
      audioRefB.current.playbackRate = pitchB;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between select-none">
      {/* Hidden Audio Elements */}
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
              Mandrill DJ Decks 🎚️🦧
            </h1>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Monkey Biz Interactive Mixer Studio
            </p>
          </div>
        </div>
      </header>

      {/* Main Studio Console */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col gap-6 justify-center">
        {/* EQ Display Header */}
        <div className="bg-[#121212] border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-left">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#39FF14] font-bold">
              🟢 Realtime Freq Equalizer (Analyser)
            </h2>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase">
              Web Audio nodes feeding lime green matrix
            </p>
          </div>
          {/* Neon Equalizer Canvas */}
          <div className="w-full sm:w-80 h-12 bg-black rounded-sm border border-emerald-500/10 overflow-hidden">
            <canvas ref={canvasRef} width="320" height="48" className="w-full h-full" onClick={initAudioContext} />
          </div>
        </div>

        {/* DJ Station Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Deck A (Left - 5 cols) */}
          <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-sm p-6 flex flex-col gap-6 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-yellow">DECK A (LEFT)</span>
              <span className="text-xs font-mono text-white/40">{formatTime(currentTimeA)} / {formatTime(durationA)}</span>
            </div>

            {/* Deck A track picker */}
            <select
              value={trackAIndex}
              onChange={(e) => setTrackAIndex(parseInt(e.target.value))}
              className="w-full bg-[#1C1C1C] text-sm text-white border border-white/10 rounded-sm p-2.5 font-mono focus:outline-none focus:border-yellow"
            >
              {TRACKS.map((t, idx) => (
                <option key={t.id} value={idx}>{t.title}</option>
              ))}
            </select>

            {/* Deck A Interactive Turn Table */}
            <div className="flex justify-center items-center py-4">
              <div
                onMouseDown={handleScratchStartA}
                onMouseMove={handleScratchMoveA}
                onMouseUp={handleScratchEndA}
                onMouseLeave={handleScratchEndA}
                onTouchStart={handleScratchStartA}
                onTouchMove={handleScratchMoveA}
                onTouchEnd={handleScratchEndA}
                className={`w-48 h-48 rounded-full bg-gradient-to-r from-neutral-900 via-zinc-800 to-neutral-900 border-[10px] border-zinc-700 shadow-2xl relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${
                  isPlayingA && !isScratchingA ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
                style={{
                  transform: isScratchingA ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.1s ease"
                }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-2 rounded-full border border-zinc-900/40" />
                <div className="absolute inset-6 rounded-full border border-zinc-900/30" />
                <div className="absolute inset-10 rounded-full border border-zinc-900/20" />
                <div className="absolute inset-14 rounded-full border border-zinc-900/10" />

                {/* Center Label */}
                <div className="w-16 h-16 rounded-full bg-yellow flex items-center justify-center border-4 border-black shadow-inner">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Needle Arm Indicator */}
                <div className="absolute -top-1 right-8 w-1 h-14 bg-zinc-400 origin-top rotate-12 pointer-events-none rounded-sm shadow-md" />
              </div>
            </div>

            {/* Deck Controls */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={togglePlayA}
                className={`py-3 rounded-sm font-mono text-xs font-bold uppercase transition ${
                  isPlayingA ? "bg-red text-black hover:bg-red/80" : "bg-yellow text-black hover:bg-yellow/80"
                }`}
              >
                {isPlayingA ? "❚❚ Pause Deck" : "▶ Play Deck"}
              </button>
              
              <div className="flex flex-col gap-1 justify-center">
                <span className="text-[9px] font-mono text-white/40 uppercase">Pitch Speed ({pitchA.toFixed(2)}x)</span>
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

          {/* Central DJ Mandrill Mixer (Center - 2 cols) */}
          <div className="lg:col-span-2 bg-[#1C1C1C] border border-white/5 rounded-sm p-4 flex flex-col justify-between gap-6 shadow-xl relative min-h-[350px]">
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/20 px-2 py-0.5 rounded-sm inline-block">
                Master DJ
              </span>
            </div>

            {/* Mandrill DJ Avatar Icon */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                {/* Headphone glows based on play state */}
                <div className={`absolute -inset-1 rounded-full blur-md opacity-75 ${
                  isPlayingA || isPlayingB ? "bg-[#39FF14] animate-pulse" : "bg-zinc-700"
                }`} />
                <div className="relative w-16 h-16 rounded-full bg-neutral-900 border-2 border-yellow flex items-center justify-center text-2xl">
                  🦧
                </div>
              </div>
              <p className="text-[10px] font-mono text-center text-yellow/80 uppercase font-bold tracking-wider">
                Scratch & Mix
              </p>
            </div>

            {/* Crossfader */}
            <div className="space-y-3">
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
                className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#39FF14] border border-white/5"
              />
              <div className="text-center text-[9px] font-mono text-white/30">
                {(100 - Math.round(crossfader * 100))}% Left / {Math.round(crossfader * 100)}% Right
              </div>
            </div>
          </div>

          {/* Deck B (Right - 5 cols) */}
          <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-sm p-6 flex flex-col gap-6 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-yellow">DECK B (RIGHT)</span>
              <span className="text-xs font-mono text-white/40">{formatTime(currentTimeB)} / {formatTime(durationB)}</span>
            </div>

            {/* Deck B track picker */}
            <select
              value={trackBIndex}
              onChange={(e) => setTrackBIndex(parseInt(e.target.value))}
              className="w-full bg-[#1C1C1C] text-sm text-white border border-white/10 rounded-sm p-2.5 font-mono focus:outline-none focus:border-yellow"
            >
              {TRACKS.map((t, idx) => (
                <option key={t.id} value={idx}>{t.title}</option>
              ))}
            </select>

            {/* Deck B Interactive Turn Table */}
            <div className="flex justify-center items-center py-4">
              <div
                onMouseDown={handleScratchStartB}
                onMouseMove={handleScratchMoveB}
                onMouseUp={handleScratchEndB}
                onMouseLeave={handleScratchEndB}
                onTouchStart={handleScratchStartB}
                onTouchMove={handleScratchMoveB}
                onTouchEnd={handleScratchEndB}
                className={`w-48 h-48 rounded-full bg-gradient-to-r from-neutral-900 via-zinc-800 to-neutral-900 border-[10px] border-zinc-700 shadow-2xl relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${
                  isPlayingB && !isScratchingB ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
                style={{
                  transform: isScratchingB ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.1s ease"
                }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-2 rounded-full border border-zinc-900/40" />
                <div className="absolute inset-6 rounded-full border border-zinc-900/30" />
                <div className="absolute inset-10 rounded-full border border-zinc-900/20" />
                <div className="absolute inset-14 rounded-full border border-zinc-900/10" />

                {/* Center Label */}
                <div className="w-16 h-16 rounded-full bg-yellow flex items-center justify-center border-4 border-black shadow-inner">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Needle Arm Indicator */}
                <div className="absolute -top-1 right-8 w-1 h-14 bg-zinc-400 origin-top rotate-12 pointer-events-none rounded-sm shadow-md" />
              </div>
            </div>

            {/* Deck Controls */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={togglePlayB}
                className={`py-3 rounded-sm font-mono text-xs font-bold uppercase transition ${
                  isPlayingB ? "bg-red text-black hover:bg-red/80" : "bg-yellow text-black hover:bg-yellow/80"
                }`}
              >
                {isPlayingB ? "❚❚ Pause Deck" : "▶ Play Deck"}
              </button>
              
              <div className="flex flex-col gap-1 justify-center">
                <span className="text-[9px] font-mono text-white/40 uppercase">Pitch Speed ({pitchB.toFixed(2)}x)</span>
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

        {/* DJ Mixer Hints */}
        <div className="bg-[#1C1C1C] border border-white/5 rounded-sm p-4 text-center">
          <p className="text-xs text-white/50 font-mono uppercase tracking-wider leading-relaxed">
            🎧 <strong className="text-yellow">DJ Instructions:</strong> Click and hold/drag on either **Vinyl Record** to scratch, spin-back, or manually seek! Use the center **Crossfader** to blend Deck A and B together. Click any playbar or select tracks to mix different beats!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-6 text-center text-[10px] text-white/30 font-mono uppercase tracking-wider">
        © {new Date().getFullYear()} Monkey Biz Poker Club. DJ Mixer Preview Console.
      </footer>
    </div>
  );
}
