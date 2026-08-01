import React from 'react';
import Image from 'next/image';

export default function Calendar() {
  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 sm:p-6 rounded-3xl border-4 border-[#ffd13b] bg-[#0c162d]/95 text-white font-sans relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)]">
      {/* Decorative corners */}
      <span className="absolute top-2 left-2 text-[#ffd13b] opacity-40 text-xl">✦</span>
      <span className="absolute top-2 right-2 text-[#ffd13b] opacity-40 text-xl">✦</span>
      <span className="absolute bottom-2 left-2 text-[#ffd13b] opacity-40 text-xl">✦</span>
      <span className="absolute bottom-2 right-2 text-[#ffd13b] opacity-40 text-xl">✦</span>

      {/* Pinned Banana */}
      <div className="absolute top-[-10px] right-[-15px] text-[65px] rotate-[45deg] drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] select-none z-20">
        🍌
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#00c6ff] pb-5 mb-5 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#ffd13b] shadow-lg">
            <Image src="/logo.png" alt="Mascot Logo" fill className="object-cover" />
          </div>
          <div className="text-left">
            <h1 className="font-black text-2xl sm:text-4xl tracking-wider text-[#ffd13b] uppercase leading-none">
              Monkey Biz Poker
            </h1>
            <p className="font-extrabold text-[#ffd13b] text-xs sm:text-sm tracking-[0.25em] mt-1.5 uppercase opacity-90">
              August 2026 Club Schedule
            </p>
          </div>
        </div>
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#ffd13b] shadow-lg hidden xs:block">
          <Image src="/mascot-dealer.png" alt="Mascot Dealer" fill className="object-cover" />
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-1.5 rounded-md font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-gradient-to-b from-[#bf0a30] to-[#800720] shadow-md border border-[#ff3b69]/20"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2.5">
        {/* Week 1 empty cell block / Widescreen custom banner */}
        <div className="col-span-6 relative rounded-2xl overflow-hidden border border-[#00c6ff]/20 bg-black shadow-inner h-[130px] sm:h-[150px]">
          <Image
            src="/monkey_eyes_clean.png"
            alt="Mascot Eyes"
            fill
            className="object-cover object-center"
          />
        </div>

        {/* Saturday 1st */}
        <div className="rounded-2xl border-2 border-[#ffd13b] bg-gradient-to-b from-[#111] to-[#222] p-2 relative h-[130px] sm:h-[150px] shadow-lg flex flex-col justify-between overflow-hidden">
          <span className="font-black text-xs sm:text-sm text-[#ffd13b]">1</span>
          <div className="font-black text-[10px] sm:text-[11px] leading-tight text-center text-[#ffd13b] uppercase pb-2">
            Monkey's 10 Spot<br />Tourney at<br />Noon Eastern
          </div>
        </div>

        {/* Days 2 - 29 */}
        {renderDays()}
      </div>
    </div>
  );
}

// Simple logic helper to render remaining calendar cards matching the style
function renderDays() {
  const days = [
    { day: 2, type: 'heads-up', text: 'Heads Up\nTournament' },
    { day: 3, type: 'cash-loud', text: '🔥 1-2 CASH 🔥\nGAME NIGHT!\n💰♠️💸' },
    { day: 4, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 5, type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
    { day: 6, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 7, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 8, type: 'special-event', text: "Monkey's 10 Spot\nTourney at\nNoon Eastern" },
    { day: 9, type: 'heads-up', text: 'Heads Up\nTournament' },
    { day: 10, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 11, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 12, type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
    { day: 13, type: 'bomb-pot', text: 'Bomb\nPot\nNight\n💣🔥' },
    { day: 14, type: 'high-hand', text: 'HIGHEST\nHAND\nOF THE\nNIGHT' },
    { day: 15, type: 'special-event', text: "Monkey's 10 Spot\nTourney at\nNoon Eastern" },
    { day: 16, type: 'heads-up', text: 'Heads Up\nTournament' },
    { day: 17, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 18, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 19, type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
    { day: 20, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 21, type: 'high-hand', text: 'HIGHEST\nHAND\nOF THE\nNIGHT' },
    { day: 22, type: 'special-event', text: "Monkey's 10 Spot\nTourney at\nNoon Eastern" },
    { day: 23, type: 'freeroll', text: 'Freeroll\nTournament\nNoon\nEastern' },
    { day: 24, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 25, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 26, type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
    { day: 27, type: 'bomb-pot', text: 'Bomb\nPot\nNight\n💣🔥' },
    { day: 28, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
    { day: 29, type: 'ladies-night', text: 'Ladies\nNight\nTournament' },
    { day: 30, type: 'heads-up', text: 'Heads Up\nTournament' },
    { day: 31, type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  ];

  return days.map((d) => {
    let borderClass = 'border-[#00c6ff]/30';
    let bgGradient = 'from-[#111] to-[#222]';
    let textClass = 'text-[#e2e8f0]';

    if (d.type === 'heads-up') {
      borderClass = 'border-[#00c6ff]';
      bgGradient = 'from-[#051a2e] to-[#0a2f4d]';
      textClass = 'text-white font-extrabold';
    } else if (d.type === 'cash-loud') {
      borderClass = 'border-[#39ff14] border-4 shadow-[0_0_15px_rgba(57,255,20,0.5)] scale-[1.02] z-10';
      bgGradient = 'from-[#000] via-[#051c02] to-[#000]';
      textClass = 'text-[#39ff14] font-black';
    } else if (d.type === 'seven-deuce') {
      borderClass = 'border-[#00ffcc]';
      bgGradient = 'from-[#022119] to-[#053d2f]';
      textClass = 'text-[#00ffcc] font-black';
    } else if (d.type === 'special-event') {
      borderClass = 'border-[#ffd13b]';
      textClass = 'text-[#ffd13b] font-black';
    } else if (d.type === 'bomb-pot') {
      borderClass = 'border-[#ff9900]';
      bgGradient = 'from-[#2e1d05] to-[#4d2f0a]';
      textClass = 'text-[#ff9900] font-black';
    } else if (d.type === 'high-hand') {
      borderClass = 'border-[#ffea00]';
      bgGradient = 'from-[#2b2703] to-[#474105]';
      textClass = 'text-[#ffea00] font-black';
    } else if (d.type === 'freeroll') {
      borderClass = 'border-[#ff3b30]';
      bgGradient = 'from-[#2e0505] to-[#4d0a0a]';
      textClass = 'text-[#ff3b30] font-black';
    } else if (d.type === 'ladies-night') {
      borderClass = 'border-[#ff007f]';
      bgGradient = 'from-[#2e0018] to-[#4d0028]';
      textClass = 'text-[#ff007f] font-black';
    }

    return (
      <div
        key={d.day}
        className={`rounded-2xl border-2 ${borderClass} bg-gradient-to-b ${bgGradient} p-2 relative h-[130px] sm:h-[150px] shadow-lg flex flex-col justify-between overflow-hidden`}
      >
        <span className="font-black text-xs sm:text-sm text-white/40">{d.day}</span>
        <div className={`font-black text-[10px] sm:text-[11px] leading-tight text-center ${textClass} uppercase pb-2 whitespace-pre-line`}>
          {d.text}
        </div>
      </div>
    );
  });
}