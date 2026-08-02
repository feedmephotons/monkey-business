"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TRACKS = [
  {
    id: "poker-2",
    title: "Monkey Biz Poker - Cut 2 (Current)",
    file: "monkey-biz-poker-2.mp3",
    description: "The latest high-energy theme cut featuring custom poker lyrics, heavy beats, and pure hype.",
    duration: "4:21"
  },
  {
    id: "poker-1",
    title: "Monkey Biz Poker - Cut 1",
    file: "monkey-biz-poker.mp3",
    description: "The original full-length cut with custom lyrics. A absolute masterpiece.",
    duration: "4:14"
  },
  {
    id: "beat",
    title: "Monkey Biz Beat (Instrumental)",
    file: "monkey-biz-beat.mp3",
    description: "Pre-existing underlying beat, 808s and rhythms with no vocal overlay.",
    duration: "2:29"
  },
  {
    id: "jungle",
    title: "Welcome to the Jungle (Rock Theme)",
    file: "welcome-to-the-jungle.mp3",
    description: "High-octane rock cover/remix theme for that classic poker club energy.",
    duration: "2:24"
  }
];

export default function AudioPreviewPage() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // If track changes while playing, play the new one immediately
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Play failed: ", err));
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Play failed: ", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    // Auto-play selected track
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleTrackEnded = () => {
    if (currentTrackIndex < TRACKS.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
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
      {/* Header */}
      <header className="border-b border-yellow/10 bg-[#080808]/80 backdrop-blur sticky top-0 z-50 px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-yellow font-bold uppercase tracking-wider hover:opacity-80 transition">
            <span>← Back to Site</span>
          </Link>
          <div className="text-right">
            <h1 className="text-lg font-mono text-yellow font-bold tracking-widest uppercase">
              Monkey Biz Music Box 🎵
            </h1>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Internal Audio Selector / Preview
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8 justify-center">
        <div className="text-center space-y-2 mb-4">
          <span className="text-xs bg-yellow/10 text-yellow border border-yellow/25 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
            Preview Environment
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase">
            Choose Your Anthem
          </h2>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            Listen, evaluate, and compare all 4 tracks currently uploaded for Monkey Biz Poker. Simply click any track to load it into the player.
          </p>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={`/audio/${currentTrack.file}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnded}
          preload="auto"
        />

        {/* Player Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Track List (Left side - 7 cols) */}
          <div className="md:col-span-7 bg-[#121212] border border-white/5 rounded-sm p-4 sm:p-6 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase text-white/40 tracking-wider mb-2">
              Available Tracks ({TRACKS.length})
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {TRACKS.map((track, i) => {
                const isSelected = currentTrackIndex === i;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(i)}
                    className={`w-full text-left p-4 rounded-sm border transition flex items-start gap-4 ${
                      isSelected
                        ? "bg-yellow/10 border-yellow text-yellow shadow-[0_0_15px_rgba(255,204,0,0.1)]"
                        : "bg-[#1C1C1C]/50 border-white/5 text-white/80 hover:bg-[#1C1C1C] hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4 w-4">
                          <div className="w-[3px] bg-yellow animate-bounce h-full" style={{ animationDelay: "0.1s" }} />
                          <div className="w-[3px] bg-yellow animate-bounce h-2/3" style={{ animationDelay: "0.3s" }} />
                          <div className="w-[3px] bg-yellow animate-bounce h-1/2" style={{ animationDelay: "0.5s" }} />
                        </div>
                      ) : (
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs font-mono ${
                          isSelected ? "border-yellow bg-yellow/10" : "border-white/10"
                        }`}>
                          {i + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold font-mono text-sm sm:text-base truncate">
                          {track.title}
                        </span>
                        <span className="text-xs font-mono opacity-50 shrink-0">
                          {track.duration}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isSelected ? "text-yellow/70" : "text-white/40"}`}>
                        {track.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Controls (Right side - 5 cols) */}
          <div className="md:col-span-5 bg-[#1C1C1C] border border-white/5 rounded-sm p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            {/* Current Track Info */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-yellow bg-yellow/10 border border-yellow/15 px-2 py-0.5 rounded-sm inline-block">
                Now Playing
              </span>
              <div className="space-y-1">
                <h4 className="font-mono text-lg font-bold text-yellow line-clamp-2 leading-snug">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-white/50">
                  {currentTrack.file}
                </p>
              </div>
            </div>

            {/* Visualizer Block */}
            <div className="h-20 bg-[#050505] rounded-sm flex items-center justify-center gap-1.5 px-4 overflow-hidden border border-white/5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-yellow rounded-t-sm transition-all duration-300"
                  style={{
                    height: isPlaying ? "100%" : "15%",
                    transform: isPlaying ? `scaleY(${0.2 + Math.random() * 0.8})` : "scaleY(1)",
                    transformOrigin: "bottom",
                    animation: isPlaying ? "bounce 0.8s ease-in-out infinite alternate" : "none",
                    animationDelay: `${0.05 * (i % 6)}s`,
                    opacity: 0.3 + (i / 24) * 0.7
                  }}
                />
              ))}
            </div>

            {/* Slider & Timing */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleTrackSelect((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length)}
                  className="p-2 rounded-full border border-white/10 text-white/75 hover:bg-white/5 hover:text-white transition"
                  title="Previous Track"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="19,20 9,12 19,4" />
                    <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>

                <button
                  onClick={togglePlay}
                  className="h-14 w-14 rounded-full bg-yellow text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,204,0,0.35)] hover:scale-105 transition"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="4" width="4" height="16" />
                      <rect x="15" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => handleTrackSelect((currentTrackIndex + 1) % TRACKS.length)}
                  className="p-2 rounded-full border border-white/10 text-white/75 hover:bg-white/5 hover:text-white transition"
                  title="Next Track"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,4 15,12 5,20" />
                    <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2.5 px-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 shrink-0">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-6 text-center text-[10px] text-white/30 font-mono uppercase tracking-wider">
        © {new Date().getFullYear()} Monkey Biz Poker Club. Confidential Demo Environment.
      </footer>
    </div>
  );
}
