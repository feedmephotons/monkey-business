"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBracketState, saveBracketState } from "../actions";

const INITIAL_PLAYERS = [
  "2up",
  "2pretty2call",
  "Singram",
  "Scar",
  "Tony",
  "Chickadee",
  "Dragon queen",
  "Diesel",
  "Ahab",
  "Bluffa",
  "Loucifer",
  "Boxman",
  "Ramhero",
  "Bluffnbaddie",
  "Aprob",
  "Cee Brooklyn"
];

interface Match {
  p1: string;
  p2: string;
  winner: string | null;
}

export default function HeadsUpBracketPreviewPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load state from Supabase
  useEffect(() => {
    async function loadState() {
      try {
        const res = await getBracketState('bracket_state');
        if (res.ok && res.state) {
          setMatches(JSON.parse(res.state));
        } else {
          // Initialize fresh bracket
          const list: Match[] = [];
          for (let i = 0; i < 8; i++) {
            list.push({
              p1: INITIAL_PLAYERS[i * 2],
              p2: INITIAL_PLAYERS[i * 2 + 1],
              winner: null,
            });
          }
          for (let i = 0; i < 7; i++) {
            list.push({ p1: "", p2: "", winner: null });
          }
          setMatches(list);
        }
      } catch (err) {
        console.error("Failed to load bracket:", err);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  // Save state to Supabase
  const persistState = async (updatedMatches: Match[]) => {
    setSavingStatus("saving");
    try {
      // Compact matches to stay under 500 characters database check constraint
      const compactMatches = updatedMatches.map(m => {
        const clean: any = {};
        if (m.p1) clean.p1 = m.p1;
        if (m.p2) clean.p2 = m.p2;
        if (m.winner) clean.winner = m.winner;
        return clean;
      });
      const res = await saveBracketState(JSON.stringify(compactMatches), 'bracket_state');
      if (res.ok) {
        setSavingStatus("saved");
        setTimeout(() => setSavingStatus("idle"), 2000);
      } else {
        setSavingStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSavingStatus("error");
    }
  };

  // Handle setting a winner for a match
  const selectWinner = (matchIndex: number, player: string) => {
    if (!player) return;
    
    const newMatches = [...matches];
    const prevWinner = newMatches[matchIndex].winner;
    newMatches[matchIndex].winner = player;

    // Propagate winner to next rounds
    let targetMatchIndex = -1;
    let targetSlot: "p1" | "p2" = "p1";

    if (matchIndex >= 0 && matchIndex <= 7) {
      targetMatchIndex = 8 + Math.floor(matchIndex / 2);
      targetSlot = matchIndex % 2 === 0 ? "p1" : "p2";
    } else if (matchIndex >= 8 && matchIndex <= 11) {
      targetMatchIndex = 12 + Math.floor((matchIndex - 8) / 2);
      targetSlot = (matchIndex - 8) % 2 === 0 ? "p1" : "p2";
    } else if (matchIndex >= 12 && matchIndex <= 13) {
      targetMatchIndex = 14;
      targetSlot = matchIndex === 12 ? "p1" : "p2";
    }

    if (targetMatchIndex !== -1) {
      if (prevWinner && prevWinner !== player) {
        clearCascade(newMatches, targetMatchIndex, prevWinner);
      }
      newMatches[targetMatchIndex][targetSlot] = player;
    }

    setMatches(newMatches);
    persistState(newMatches);
  };

  const clearCascade = (matchList: Match[], index: number, playerToClear: string) => {
    if (index >= matchList.length) return;
    
    let nextIndex = -1;
    let isP1 = matchList[index].p1 === playerToClear;
    let isP2 = matchList[index].p2 === playerToClear;

    if (isP1) matchList[index].p1 = "";
    if (isP2) matchList[index].p2 = "";

    if (matchList[index].winner === playerToClear) {
      matchList[index].winner = null;
      
      if (index >= 8 && index <= 11) {
        nextIndex = 12 + Math.floor((index - 8) / 2);
      } else if (index >= 12 && index <= 13) {
        nextIndex = 14;
      }
      
      if (nextIndex !== -1) {
        clearCascade(matchList, nextIndex, playerToClear);
      }
    }
  };

  const resetBracket = () => {
    if (!confirm("Are you sure you want to reset the entire tournament bracket?")) return;
    const list: Match[] = [];
    for (let i = 0; i < 8; i++) {
      list.push({
        p1: INITIAL_PLAYERS[i * 2],
        p2: INITIAL_PLAYERS[i * 2 + 1],
        winner: null,
      });
    }
    for (let i = 0; i < 7; i++) {
      list.push({ p1: "", p2: "", winner: null });
    }
    setMatches(list);
    persistState(list);
  };

  const getPlayerClass = (matchWinner: string | null, currentPlayer: string) => {
    if (!currentPlayer) return "text-white/20 italic font-mono text-[11px] h-9 px-3 flex items-center";
    if (matchWinner === currentPlayer) {
      return "text-black bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 font-extrabold font-mono text-xs h-9 px-3 flex items-center justify-between cursor-pointer transition shadow-[0_0_12px_rgba(255,255,255,0.25)] border border-white/20";
    }
    if (matchWinner && matchWinner !== currentPlayer) {
      return "text-[#ff4444]/60 bg-red-950/10 line-through font-mono text-xs h-9 px-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition";
    }
    return "text-white hover:bg-yellow/10 font-mono text-xs h-9 px-3 flex items-center justify-between cursor-pointer transition";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono text-sm">
        <div className="text-center space-y-2">
          <div className="text-yellow animate-pulse uppercase tracking-widest font-bold">Shuffling Deck...</div>
          <div className="text-white/40 text-[10px]">Lacing Up Tournament Bracket</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between select-none">
      {/* Header */}
      <header className="border-b border-yellow/10 bg-[#080808]/80 backdrop-blur sticky top-0 z-50 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-yellow font-bold uppercase tracking-wider hover:opacity-80 transition">
            <span>← Exit Preview</span>
          </Link>
          <div className="text-right">
            <h1 className="text-lg font-mono text-yellow font-bold tracking-widest uppercase">
              Heads Up Tournament 2 Preview 🦧🏆
            </h1>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Monkey Biz Exclusive Preview
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Title Block */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs bg-yellow/10 text-yellow border border-yellow/25 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
              Admin Control Panel
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight uppercase text-yellow pt-1">
              Heads Up Tournament 2
            </h2>
            <p className="text-xs text-white/50 uppercase tracking-wide">
              16 Players • Tap any player to advance them • Changes persist to live bracket instantly
            </p>
            <p className="text-xs text-yellow/95 font-bold uppercase tracking-wider mt-1.5 flex items-center justify-center md:justify-start gap-1.5 animate-pulse">
              <span>🏆</span> Championship Game is best 2 out of 3 to decide the winner
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Saving Indicator */}
            {savingStatus === "saving" && (
              <span className="text-xs font-mono text-yellow animate-pulse uppercase tracking-wider">● Saving...</span>
            )}
            {savingStatus === "saved" && (
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">✓ Saved to Live Site</span>
            )}
            {savingStatus === "error" && (
              <span className="text-xs font-mono text-rose-500 uppercase tracking-wider">⚠️ Error Saving</span>
            )}
            <button
              onClick={resetBracket}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 font-mono text-xs tracking-wider uppercase rounded-sm transition shrink-0"
            >
              Reset Bracket
            </button>
          </div>
        </div>

        {/* Bracket Grid Container */}
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="min-w-[1000px] grid grid-cols-4 gap-8 py-4 px-2">
            {/* COLUMN 1: Round 1 */}
            <div className="flex flex-col justify-around gap-4">
              <div className="text-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-yellow/70">Round 1</h3>
                <p className="text-[9px] text-white/30 font-mono">Best of 3 Rounds</p>
              </div>
              {matches.slice(0, 8).map((match, idx) => (
                <div key={idx} className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden shadow-md">
                  <div className="bg-[#181818] border-b border-white/5 px-2.5 py-1 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/40 uppercase font-bold">Round 1</span>
                    <span className="text-[9px] font-mono text-yellow/50 uppercase">Table {idx + 1}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    <div 
                      onClick={() => selectWinner(idx, match.p1)}
                      className={getPlayerClass(match.winner, match.p1)}
                    >
                      <span className="truncate">{match.p1 || "TBD"}</span>
                      {match.winner === match.p1 && <span className="text-[10px]">👑</span>}
                    </div>
                    <div 
                      onClick={() => selectWinner(idx, match.p2)}
                      className={getPlayerClass(match.winner, match.p2)}
                    >
                      <span className="truncate">{match.p2 || "TBD"}</span>
                      {match.winner === match.p2 && <span className="text-[10px]">👑</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* COLUMN 2: Round 2 */}
            <div className="flex flex-col justify-around gap-4">
              <div className="text-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-yellow/70">Round 2</h3>
                <p className="text-[9px] text-white/30 font-mono">Quarterfinals</p>
              </div>
              {matches.slice(8, 12).map((match, idx) => (
                <div key={idx} className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden shadow-md my-auto">
                  <div className="bg-[#181818] border-b border-white/5 px-2.5 py-1 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/40 uppercase font-bold">Round 2</span>
                    <span className="text-[9px] font-mono text-yellow/50 uppercase">Table {idx + 1}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    <div 
                      onClick={() => selectWinner(8 + idx, match.p1)}
                      className={getPlayerClass(match.winner, match.p1)}
                    >
                      <span className="truncate">{match.p1 || "Waiting for winner..."}</span>
                      {match.winner === match.p1 && match.p1 && <span className="text-[10px]">👑</span>}
                    </div>
                    <div 
                      onClick={() => selectWinner(8 + idx, match.p2)}
                      className={getPlayerClass(match.winner, match.p2)}
                    >
                      <span className="truncate">{match.p2 || "Waiting for winner..."}</span>
                      {match.winner === match.p2 && match.p2 && <span className="text-[10px]">👑</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* COLUMN 3: Round 3 */}
            <div className="flex flex-col justify-around gap-4">
              <div className="text-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-yellow/70">Round 3</h3>
                <p className="text-[9px] text-white/30 font-mono">Semifinals</p>
              </div>
              {matches.slice(12, 14).map((match, idx) => (
                <div key={idx} className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden shadow-md my-auto">
                  <div className="bg-[#181818] border-b border-white/5 px-2.5 py-1 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/40 uppercase font-bold">Round 3</span>
                    <span className="text-[9px] font-mono text-yellow/50 uppercase">Table {idx + 1}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    <div 
                      onClick={() => selectWinner(12 + idx, match.p1)}
                      className={getPlayerClass(match.winner, match.p1)}
                    >
                      <span className="truncate">{match.p1 || "Waiting for winner..."}</span>
                      {match.winner === match.p1 && match.p1 && <span className="text-[10px]">👑</span>}
                    </div>
                    <div 
                      onClick={() => selectWinner(12 + idx, match.p2)}
                      className={getPlayerClass(match.winner, match.p2)}
                    >
                      <span className="truncate">{match.p2 || "Waiting for winner..."}</span>
                      {match.winner === match.p2 && match.p2 && <span className="text-[10px]">👑</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* COLUMN 4: Round 4 & Champion */}
            <div className="flex flex-col justify-center gap-12">
              <div className="text-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-yellow/70">Round 4</h3>
                <p className="text-[9px] text-white/30 font-mono">Championship</p>
              </div>
              
              {/* Grand Final Match */}
              <div className="bg-[#121212] border-2 border-yellow/30 rounded-sm overflow-hidden shadow-xl">
                <div className="bg-[#1C1C1C] border-b border-white/5 px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-yellow font-bold uppercase">🏆 Championship Round</span>
                </div>
                <div className="divide-y divide-white/5">
                  <div 
                    onClick={() => selectWinner(14, matches[14].p1)}
                    className={getPlayerClass(matches[14].winner, matches[14].p1)}
                  >
                    <span className="truncate">{matches[14].p1 || "Waiting..."}</span>
                    {matches[14].winner === matches[14].p1 && matches[14].p1 && <span className="text-[10px]">🏆</span>}
                  </div>
                  <div 
                    onClick={() => selectWinner(14, matches[14].p2)}
                    className={getPlayerClass(matches[14].winner, matches[14].p2)}
                  >
                    <span className="truncate">{matches[14].p2 || "Waiting..."}</span>
                    {matches[14].winner === matches[14].p2 && matches[14].p2 && <span className="text-[10px]">🏆</span>}
                  </div>
                </div>
              </div>

              {/* Champion Podium */}
              <div className="bg-[#181818]/60 border border-yellow/10 rounded-sm p-4 text-center space-y-2">
                <span className="text-[9px] font-mono text-yellow/50 uppercase tracking-widest block">Championship Winner</span>
                <div className="text-xl font-bold font-mono tracking-tight text-yellow truncate">
                  {matches[14].winner ? `👑 ${matches[14].winner} 👑` : "UNDECIDED"}
                </div>
                <p className="text-[9px] text-white/30 font-mono uppercase">Monkey Biz Heads Up Champ</p>
              </div>
            </div>
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
