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

export default function VectorAudioPreviewPage() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Rotating angle for the turntables
  const [spinAngle, setSpinAngle] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Turntable spin loop
  useEffect(() => {
    let animId: number;
    const updateSpin = () => {
      if (isPlaying) {
        setSpinAngle(prev => (prev + 1.5) % 360);
      }
      animId = requestAnimationFrame(updateSpin);
    };
    animId = requestAnimationFrame(updateSpin);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log(err));
      }
    }
  }, [currentTrackIndex]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between select-none">
      <audio
        ref={audioRef}
        src={`/audio/${TRACKS[currentTrackIndex].file}`}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
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
              Mandrill Vector DJ Decks 🎚️🦧
            </h1>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              100% Vector & Code-Rendered Showcase
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center gap-8">
        
        {/* Title Block */}
        <div className="text-center space-y-1">
          <span className="text-xs bg-yellow/10 text-yellow border border-yellow/25 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
            Interactive Code Build
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-yellow pt-1">
            Mandrill DJ Live Booth
          </h2>
          <p className="text-xs text-white/50 max-w-lg mx-auto uppercase tracking-wide">
            Zero images. Rendered completely with responsive SVG, HTML & CSS.
          </p>
        </div>

        {/* Vector DJ Booth (The Hero Element) */}
        <div className="relative w-full max-w-4xl aspect-[16/9] rounded-sm border-2 border-yellow/40 shadow-[0_0_50px_rgba(255,204,0,0.15)] bg-gradient-to-b from-[#0e0e0e] to-[#040404] p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
          {/* Ambient Grid Lines Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,204,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,204,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

          {/* Equalizer Header within the booth */}
          <div className="flex justify-between items-center z-10">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Live Deck Feed</span>
            </div>
            
            {/* Tiny Equalizer Bars in code */}
            <div className="flex items-end gap-[2px] h-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] bg-[#39FF14] rounded-t-sm transition-all duration-300"
                  style={{
                    height: isPlaying ? "100%" : "20%",
                    transform: isPlaying ? `scaleY(${0.2 + Math.random() * 0.8})` : "scaleY(1)",
                    transformOrigin: "bottom",
                    animation: isPlaying ? "bounce 0.6s ease-in-out infinite alternate" : "none",
                    animationDelay: `${0.05 * (i % 4)}s`,
                    opacity: 0.5 + (i / 12) * 0.5
                  }}
                />
              ))}
            </div>
          </div>

          {/* Interactive DJ Elements Workspace */}
          <div className="flex-1 grid grid-cols-12 gap-4 items-center z-10 py-2">
            
            {/* Left Turntable Deck (cols: 4) */}
            <div className="col-span-4 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-neutral-900 border-4 border-zinc-800 shadow-2xl flex items-center justify-center">
                {/* Vinyl Body */}
                <div 
                  className="absolute inset-1.5 rounded-full bg-black border border-zinc-900 flex items-center justify-center transition-transform duration-75 select-none"
                  style={{ transform: `rotate(${spinAngle}deg)` }}
                >
                  {/* Vinyl grooves lines */}
                  <div className="absolute inset-2 rounded-full border border-neutral-800/60" />
                  <div className="absolute inset-6 rounded-full border border-neutral-800/40" />
                  <div className="absolute inset-10 rounded-full border border-neutral-800/30" />
                  <div className="absolute inset-14 rounded-full border border-neutral-800/20" />
                  <div className="absolute inset-18 rounded-full border border-neutral-800/10" />

                  {/* Center Sticker */}
                  <div className="w-12 h-12 rounded-full bg-yellow border-4 border-black flex items-center justify-center">
                    <span className="text-[6px] font-mono text-black font-extrabold uppercase tracking-tight select-none">MONKEY</span>
                  </div>
                </div>

                {/* Turntable needle arm */}
                <svg 
                  className={`absolute -top-2 right-4 w-12 h-20 origin-[40px_10px] transition-transform duration-700 pointer-events-none z-20 ${
                    isPlaying ? "rotate-[28deg]" : "rotate-0"
                  }`}
                  viewBox="0 0 48 80"
                >
                  <circle cx="40" cy="10" r="8" fill="#52525b" />
                  <path d="M40 10 L12 65 L4 65" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <rect x="2" y="60" width="4" height="10" fill="#3f3f46" transform="rotate(25, 4, 65)" />
                </svg>
              </div>
            </div>

            {/* Centered Vector Mandrill DJ (cols: 4) */}
            <div className="col-span-4 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                
                {/* Glowing Aura */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-500 ${
                  isPlaying ? "bg-[#39FF14] scale-110" : "bg-yellow/10"
                }`} />

                {/* Mandrill SVG Vector Face */}
                <svg 
                  className={`w-32 h-32 sm:w-40 sm:h-40 relative z-10 transition-transform duration-300 ${
                    isPlaying ? "scale-105 animate-[pulse_1.5s_infinite_alternate]" : ""
                  }`}
                  viewBox="0 0 120 120"
                  fill="none"
                >
                  {/* DJ Headphones Arch */}
                  <path 
                    d="M15 65 C15 15, 105 15, 105 65" 
                    stroke={isPlaying ? "#39FF14" : "#FFD13B"} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                  />

                  {/* Headphone Ear Cushions */}
                  <rect x="8" y="55" width="14" height="25" rx="7" fill="#121212" stroke={isPlaying ? "#39FF14" : "#FFD13B"} strokeWidth="3" />
                  <rect x="98" y="55" width="14" height="25" rx="7" fill="#121212" stroke={isPlaying ? "#39FF14" : "#FFD13B"} strokeWidth="3" />

                  {/* Mandrill Head Base */}
                  <path d="M28 65 C28 40, 92 40, 92 65 C92 90, 80 100, 60 100 C40 100, 28 90, 28 65 Z" fill="#262626" />

                  {/* Fierce Blue Monkey Cheeks */}
                  <path d="M30 68 C35 60, 48 60, 48 75 C48 85, 36 90, 30 82 Z" fill="#2563eb" />
                  <path d="M90 68 C85 60, 72 60, 72 75 C72 85, 84 90, 90 82 Z" fill="#2563eb" />

                  {/* Mandrill Red Nose Bridge (Signature Feature) */}
                  <path d="M52 50 L68 50 L68 88 L52 88 Z" fill="#dc2626" />
                  <circle cx="60" cy="86" r="10" fill="#dc2626" />

                  {/* Golden Brows */}
                  <path d="M35 48 C42 42, 53 45, 53 45" stroke="#FFD13B" strokeWidth="4" strokeLinecap="round" />
                  <path d="M85 48 C78 42, 67 45, 67 45" stroke="#FFD13B" strokeWidth="4" strokeLinecap="round" />

                  {/* Fierce Monkey Eyes */}
                  <polygon points="38,54 50,54 46,58 38,58" fill="#ffffff" />
                  <polygon points="82,54 70,54 74,58 82,58" fill="#ffffff" />
                  <circle cx="44" cy="56" r="2.5" fill="#000000" />
                  <circle cx="76" cy="56" r="2.5" fill="#000000" />

                  {/* White Beard/Chin Fluff */}
                  <path d="M40 98 L60 115 L80 98 C80 98, 60 102, 40 98 Z" fill="#e5e5e5" />
                  
                  {/* Teeth/Grimace */}
                  <path d="M48 80 Q60 76 72 80 Q60 84 48 80" stroke="#ffffff" strokeWidth="2.5" fill="#171717" />
                </svg>
              </div>
            </div>

            {/* Right Turntable Deck (cols: 4) */}
            <div className="col-span-4 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-neutral-900 border-4 border-zinc-800 shadow-2xl flex items-center justify-center">
                {/* Vinyl Body */}
                <div 
                  className="absolute inset-1.5 rounded-full bg-black border border-zinc-900 flex items-center justify-center transition-transform duration-75 select-none"
                  style={{ transform: `rotate(${spinAngle}deg)` }}
                >
                  <div className="absolute inset-2 rounded-full border border-neutral-800/60" />
                  <div className="absolute inset-6 rounded-full border border-neutral-800/40" />
                  <div className="absolute inset-10 rounded-full border border-neutral-800/30" />
                  <div className="absolute inset-14 rounded-full border border-neutral-800/20" />
                  <div className="absolute inset-18 rounded-full border border-neutral-800/10" />

                  {/* Center Sticker */}
                  <div className="w-12 h-12 rounded-full bg-yellow border-4 border-black flex items-center justify-center">
                    <span className="text-[6px] font-mono text-black font-extrabold uppercase tracking-tight select-none">BIZ</span>
                  </div>
                </div>

                {/* Turntable needle arm */}
                <svg 
                  className={`absolute -top-2 right-4 w-12 h-20 origin-[40px_10px] transition-transform duration-700 pointer-events-none z-20 ${
                    isPlaying ? "rotate-[28deg]" : "rotate-0"
                  }`}
                  viewBox="0 0 48 80"
                >
                  <circle cx="40" cy="10" r="8" fill="#52525b" />
                  <path d="M40 10 L12 65 L4 65" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <rect x="2" y="60" width="4" height="10" fill="#3f3f46" transform="rotate(25, 4, 65)" />
                </svg>
              </div>
            </div>

          </div>

          {/* Simple Code UI Overlay Controls */}
          <div className="flex justify-between items-center z-10 border-t border-white/5 pt-2 text-[8px] font-mono text-white/30 uppercase">
            <span>Render: PURE REACT + SVG</span>
            <span>Scale: Responsive Vector</span>
            <span>FPS: 60Hz</span>
          </div>
        </div>

        {/* Integrated Clean Playbar at Bottom */}
        <div className="w-full max-w-3xl bg-[#121212] border border-white/5 rounded-sm p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-yellow">Currently Playing</span>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold text-white leading-snug">
                  {TRACKS[currentTrackIndex].title}
                </h3>
                <span className="text-xs font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/20 px-1.5 py-0.5 rounded-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
            
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="px-8 py-3 bg-yellow hover:bg-yellow/90 text-black font-bold font-mono text-xs tracking-wider uppercase rounded-sm transition shrink-0 flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="4" height="16" />
                    <rect x="16" y="4" width="4" height="16" />
                  </svg>
                  Pause Demo
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Play Demo
                </>
              )}
            </button>
          </div>

          {/* Quick Track Switcher Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {TRACKS.map((track, idx) => {
              const isSelected = currentTrackIndex === idx;
              return (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(idx)}
                  className={`p-3.5 rounded-sm border text-left flex flex-col justify-between gap-1.5 transition ${
                    isSelected
                      ? "bg-yellow/10 border-yellow text-yellow shadow-[0_0_15px_rgba(255,204,0,0.1)]"
                      : "bg-[#1C1C1C]/50 border-white/5 text-white/70 hover:bg-[#1C1C1C] hover:border-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Track 0{idx + 1}</span>
                  <span className="font-mono font-bold text-xs line-clamp-1">{track.title}</span>
                  <span className="text-[10px] font-mono text-white/40">{track.duration}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-6 text-center text-[10px] text-white/30 font-mono uppercase tracking-wider">
        © {new Date().getFullYear()} Monkey Biz Poker Club. Vector Art Preview.
      </footer>
    </div>
  );
}
