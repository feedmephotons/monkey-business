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

export default function AudioPreviewHeroPage() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between select-none">
      {/* Hidden Audio element */}
      <audio
        ref={audioRef}
        src={`/audio/${TRACKS[currentTrackIndex].file}`}
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
              Mandrill DJ Design Concept 🦧🎨
            </h1>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Monkey Biz Exclusive Preview
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center gap-8">
        {/* Title Block */}
        <div className="text-center space-y-1">
          <span className="text-xs bg-yellow/10 text-yellow border border-yellow/25 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
            Concept Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-yellow pt-1">
            Mandrill DJ Player Concept
          </h2>
          <p className="text-xs text-white/50 max-w-lg mx-auto uppercase tracking-wide">
            Designed to bring maximum high-energy club vibe right to the tables
          </p>
        </div>

        {/* Hero Concept Image */}
        <div className="relative w-full max-w-4xl aspect-[16/9] rounded-sm overflow-hidden border-2 border-yellow/40 shadow-[0_0_50px_rgba(255,204,0,0.15)] bg-neutral-900">
          {/* Animated Neon Green/Yellow Ambient Border Glow */}
          <div className="absolute inset-0 border-[3px] border-transparent rounded-sm animate-pulse pointer-events-none z-10 shadow-[inset_0_0_30px_rgba(57,255,20,0.1)]" />
          <img
            src="/img/mandrill-dj.png"
            alt="Mandrill DJ Concept Art"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        {/* Integrated Clean Playbar at Bottom */}
        <div className="w-full max-w-3xl bg-[#121212] border border-white/5 rounded-sm p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-yellow">Currently Playing</span>
              <h3 className="font-mono text-base font-bold text-white leading-snug">
                {TRACKS[currentTrackIndex].title}
              </h3>
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
        © {new Date().getFullYear()} Monkey Biz Poker Club. Confidential Concept Review.
      </footer>
    </div>
  );
}
