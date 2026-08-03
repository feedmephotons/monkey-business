import React, { useState } from 'react';
import Image from 'next/image';

interface CalendarDay {
  day: number;
  weekday: string;
  type: 'default' | 'heads-up' | 'cash-loud' | 'seven-deuce' | 'special-event' | 'bomb-pot' | 'high-hand' | 'freeroll' | 'ladies-night';
  text: string;
}

const CALENDAR_DAYS: CalendarDay[] = [
  { day: 1, weekday: 'Sat', type: 'special-event', text: "Monkey's 10 Spot\nTourney at\nNoon Eastern" },
  { day: 2, weekday: 'Sun', type: 'heads-up', text: 'Heads Up\nTournament' },
  { day: 3, weekday: 'Mon', type: 'cash-loud', text: '🔥 1-2 CASH 🔥\nGAME NIGHT!\n💰♠️💸' },
  { day: 4, weekday: 'Tue', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 5, weekday: 'Wed', type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
  { day: 6, weekday: 'Thu', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 7, weekday: 'Fri', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 8, weekday: 'Sat', type: 'special-event', text: "Monkey's 10 Spot\nTourney at\n3 PM Eastern" },
  { day: 9, weekday: 'Sun', type: 'heads-up', text: 'Heads Up\nTournament' },
  { day: 10, weekday: 'Mon', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 11, weekday: 'Tue', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 12, weekday: 'Wed', type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
  { day: 13, weekday: 'Thu', type: 'bomb-pot', text: '💣🔥\nBomb\nPot\nNight' },
  { day: 14, weekday: 'Fri', type: 'high-hand', text: 'HIGHEST\nHAND\nOF THE\nNIGHT' },
  { day: 15, weekday: 'Sat', type: 'special-event', text: "Monkey's 10 Spot\nTourney at\nNoon Eastern" },
  { day: 16, weekday: 'Sun', type: 'heads-up', text: 'Heads Up\nTournament' },
  { day: 17, weekday: 'Mon', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 18, weekday: 'Tue', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 19, weekday: 'Wed', type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
  { day: 20, weekday: 'Thu', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 21, weekday: 'Fri', type: 'high-hand', text: 'HIGHEST\nHAND\nOF THE\nNIGHT' },
  { day: 22, weekday: 'Sat', type: 'special-event', text: "Monkey's 10 Spot\nTourney at\nNoon Eastern" },
  { day: 23, weekday: 'Sun', type: 'freeroll', text: 'Freeroll\nTournament\nNoon\nEastern' },
  { day: 24, weekday: 'Mon', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 25, weekday: 'Tue', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 26, weekday: 'Wed', type: 'seven-deuce', text: '7-2\nGame\nNight\n7️⃣2️⃣' },
  { day: 27, weekday: 'Thu', type: 'bomb-pot', text: '💣🔥\nBomb\nPot\nNight' },
  { day: 28, weekday: 'Fri', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
  { day: 29, weekday: 'Sat', type: 'ladies-night', text: 'Ladies\nNight\nTournament' },
  { day: 30, weekday: 'Sun', type: 'heads-up', text: 'Heads Up\nTournament' },
  { day: 31, weekday: 'Mon', type: 'default', text: 'Nightly Game\nstarts around\n6-7 pm Eastern' },
];

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const getEventStyle = (type: string) => {
    let borderClass = 'border-[#00c6ff]/30';
    let bgGradient = 'from-[#111] to-[#222]';
    let textClass = 'text-[#e2e8f0]';
    let badgeBg = 'bg-[#1e293b]';
    let badgeText = 'text-white/60';
    let accentColor = '#00c6ff';

    if (type === 'heads-up') {
      borderClass = 'border-[#00c6ff]';
      bgGradient = 'from-[#051a2e] to-[#0a2f4d]';
      textClass = 'text-white font-extrabold';
      badgeBg = 'bg-[#00c6ff]/20';
      badgeText = 'text-[#00c6ff]';
      accentColor = '#00c6ff';
    } else if (type === 'cash-loud') {
      borderClass = 'border-[#39ff14] border-2 sm:border-4 shadow-[0_0_15px_rgba(57,255,20,0.5)]';
      bgGradient = 'from-[#000] via-[#051c02] to-[#000]';
      textClass = 'text-[#39ff14] font-black';
      badgeBg = 'bg-[#39ff14]/20';
      badgeText = 'text-[#39ff14]';
      accentColor = '#39ff14';
    } else if (type === 'seven-deuce') {
      borderClass = 'border-[#00ffcc]';
      bgGradient = 'from-[#022119] to-[#053d2f]';
      textClass = 'text-[#00ffcc] font-black';
      badgeBg = 'bg-[#00ffcc]/20';
      badgeText = 'text-[#00ffcc]';
      accentColor = '#00ffcc';
    } else if (type === 'special-event') {
      borderClass = 'border-[#ffd13b]';
      bgGradient = 'from-[#1a1505] to-[#332a0a]';
      textClass = 'text-[#ffd13b] font-black';
      badgeBg = 'bg-[#ffd13b]/20';
      badgeText = 'text-[#ffd13b]';
      accentColor = '#ffd13b';
    } else if (type === 'bomb-pot') {
      borderClass = 'border-[#ff9900]';
      bgGradient = 'from-[#2e1d05] to-[#4d2f0a]';
      textClass = 'text-[#ff9900] font-black';
      badgeBg = 'bg-[#ff9900]/20';
      badgeText = 'text-[#ff9900]';
      accentColor = '#ff9900';
    } else if (type === 'high-hand') {
      borderClass = 'border-[#ffea00]';
      bgGradient = 'from-[#2b2703] to-[#474105]';
      textClass = 'text-[#ffea00] font-black';
      badgeBg = 'bg-[#ffea00]/20';
      badgeText = 'text-[#ffea00]';
      accentColor = '#ffea00';
    } else if (type === 'freeroll') {
      borderClass = 'border-[#ff3b30]';
      bgGradient = 'from-[#2e0505] to-[#4d0a0a]';
      textClass = 'text-[#ff3b30] font-black';
      badgeBg = 'bg-[#ff3b30]/20';
      badgeText = 'text-[#ff3b30]';
      accentColor = '#ff3b30';
    } else if (type === 'ladies-night') {
      borderClass = 'border-[#ff007f]';
      bgGradient = 'from-[#2e0018] to-[#4d0028]';
      textClass = 'text-[#ff007f] font-black';
      badgeBg = 'bg-[#ff007f]/20';
      badgeText = 'text-[#ff007f]';
      accentColor = '#ff007f';
    }

    return { borderClass, bgGradient, textClass, badgeBg, badgeText, accentColor };
  };

  // Dynamically generate Google Calendar invite link
  const getGoogleCalendarUrl = (day: CalendarDay) => {
    const title = `Monkey Biz Poker: ${day.text.replace(/\n/g, ' ')}`;
    const dateStr = `202608${day.day < 10 ? '0' + day.day : day.day}`;
    
    // Set Saturday 10-spots to noon start (16:00 UTC), ladies night and freerolls/cash to evening starts (23:00 UTC)
    const isSaturday = day.weekday === 'Sat';
    const isSunday = day.weekday === 'Sun';
    const startTime = isSaturday ? '160000' : isSunday ? '160000' : '230000';
    const endTime = isSaturday ? '210000' : isSunday ? '210000' : '030000';
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}T${startTime}Z/${dateStr}T${endTime}Z&details=${encodeURIComponent('Reminder from Monkey Biz Poker! Head over to the lounge and stack some chips! 🐒♠️')}&location=${encodeURIComponent('Monkey Biz Poker Lounge')}`;
  };

  // Generate iCal Download Data URI
  const getICalDataUri = (day: CalendarDay) => {
    const dateStr = `202608${day.day < 10 ? '0' + day.day : day.day}`;
    const isSaturday = day.weekday === 'Sat';
    const isSunday = day.weekday === 'Sun';
    const startTime = isSaturday ? '160000' : isSunday ? '160000' : '230000';
    const endTime = isSaturday ? '210000' : isSunday ? '210000' : '030000';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `URL:https://monkeybizpoker.com`,
      `DTSTART:${dateStr}T${startTime}Z`,
      `DTEND:${dateStr}T${endTime}Z`,
      `SUMMARY:Monkey Biz Poker: ${day.text.replace(/\n/g, ' ')}`,
      'DESCRIPTION:Reminder from Monkey Biz Poker! Head over to the lounge and stack some chips! 🐒♠️',
      'LOCATION:Monkey Biz Poker Lounge',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  };

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
      <div className="flex items-center justify-between border-b-4 border-[#00c6ff] pb-5 mb-5 px-2 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#ffd13b] shadow-lg flex-shrink-0">
            <Image src="/logo.png" alt="Mascot Logo" fill className="object-cover" />
          </div>
          <div className="text-left">
            <h1 className="font-black text-xl sm:text-4xl tracking-wider text-[#ffd13b] uppercase leading-none">
              Monkey Biz Poker
            </h1>
            <p className="font-extrabold text-[#ffd13b] text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.25em] mt-1.5 uppercase opacity-90">
              August 2026 Club Schedule
            </p>
          </div>
        </div>
        <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#ffd13b] shadow-lg hidden xs:block flex-shrink-0">
          <Image src="/mascot-dealer.png" alt="Mascot Dealer" fill className="object-cover" />
        </div>
      </div>

      <p className="text-center text-[11px] sm:text-xs text-white/50 mb-5 tracking-wide">
        💡 <span className="text-[#00c6ff] font-semibold">Tap on any date</span> to add a reminder straight to your phone's calendar!
      </p>

      {/* ─────────────────────────── DESKTOP VIEW ─────────────────────────── */}
      <div className="hidden sm:block">
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
          <div className="col-span-6 relative rounded-2xl overflow-hidden border border-[#00c6ff]/20 bg-black shadow-inner h-[150px]">
            <Image
              src="/monkey_eyes_clean.png"
              alt="Mascot Eyes"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Days 1 - 31 */}
          {CALENDAR_DAYS.map((d) => {
            const { borderClass, bgGradient, textClass } = getEventStyle(d.type);

            return (
              <div
                key={d.day}
                onClick={() => setSelectedDay(d)}
                className={`rounded-2xl border-2 ${borderClass} bg-gradient-to-b ${bgGradient} p-2 relative h-[150px] shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(0,198,255,0.2)] transition-all duration-300 group`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-black text-xs sm:text-sm text-white/40 group-hover:text-white transition-colors">{d.day}</span>
                  <span className="text-[10px] opacity-0 group-hover:opacity-100 text-[#00c6ff] font-bold transition-opacity">📅</span>
                </div>
                <div className={`font-black text-[10px] sm:text-[11px] leading-tight text-center ${textClass} uppercase pb-2 whitespace-pre-line`}>
                  {d.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────── MOBILE AGENDA LIST VIEW ─────────────────────────── */}
      <div className="sm:hidden space-y-3 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {CALENDAR_DAYS.map((d) => {
          const { borderClass, bgGradient, textClass, badgeBg, badgeText } = getEventStyle(d.type);

          return (
            <div
              key={d.day}
              onClick={() => setSelectedDay(d)}
              className={`rounded-xl border-2 ${borderClass} bg-gradient-to-r ${bgGradient} p-3 shadow-md flex items-center gap-4 relative overflow-hidden cursor-pointer active:scale-[0.97] hover:shadow-[0_0_15px_rgba(0,198,255,0.15)] transition-all duration-300`}
            >
              {/* Date Badge */}
              <div className={`w-14 h-14 rounded-xl ${badgeBg} flex flex-col items-center justify-center border border-white/5 flex-shrink-0`}>
                <span className={`text-xl font-black ${badgeText} leading-none`}>
                  {d.day}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 mt-0.5">
                  {d.weekday}
                </span>
              </div>

              {/* Event Content */}
              <div className="flex-1 text-left min-w-0">
                <div className={`font-extrabold text-xs tracking-wider uppercase ${textClass} whitespace-pre-line leading-tight`}>
                  {d.text}
                </div>
              </div>

              {/* Tap Indicator */}
              <div className="text-white/20 text-xs pr-1">
                📅
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────── MODAL DIALOG POPUP ─────────────────────────── */}
      {selectedDay && (() => {
        const { borderClass, bgGradient, textClass, accentColor } = getEventStyle(selectedDay.type);
        const eventTitle = selectedDay.text.replace(/\n/g, ' ');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
            {/* Modal Box */}
            <div 
              className={`w-full max-w-md rounded-3xl border-2 ${borderClass} bg-gradient-to-b from-[#0c162d] to-[#050b18] p-6 sm:p-8 text-center relative shadow-[0_0_35px_rgba(0,0,0,0.9)] animate-[scaleIn_0.25s_ease-out]`}
              style={{ boxShadow: `0 0 30px ${accentColor}25` }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDay(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white hover:scale-110 active:scale-90 text-2xl font-black transition-all h-8 w-8 rounded-full bg-black/40 flex items-center justify-center"
              >
                ×
              </button>

              {/* Date Header */}
              <span className="inline-block py-1 px-4 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-white/60 mb-4">
                📅 August {selectedDay.day} — {selectedDay.weekday}
              </span>

              {/* Title */}
              <h3 
                className={`font-black text-2xl sm:text-3xl uppercase leading-tight mb-4 ${textClass}`}
                style={{ textShadow: `0 0 10px ${accentColor}40` }}
              >
                {eventTitle}
              </h3>

              <div className="w-12 h-1 bg-[#00c6ff]/20 mx-auto rounded-full mb-6" />

              {/* Description */}
              <p className="font-[family-name:var(--font-body)] text-white/70 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                {selectedDay.type === 'seven-deuce' ? (
                  "Every Wednesday in august we’re putting 72 game on the table. must be 72 off suit to count."
                ) : selectedDay.type === 'bomb-pot' ? (
                  "Bomb pots every 15-25 minutes, 2 big blinds every bomb pot. Go straight to the flop."
                ) : selectedDay.type === 'default' ? (
                  ".50 1 dollar blinds classic 9 man hold em. Starts when 7 players sit. Good Luck!"
                ) : selectedDay.type === 'heads-up' ? (
                  "Find the table with your name on it and have a seat, games are done by appointment"
                ) : (
                  "Stack chips, splash pots, and make some mischief at the lounge! Add this event to your phone's calendar so you never miss a game."
                )}
              </p>

              {/* Calendar Buttons */}
              <div className="space-y-3.5">
                {/* Google Calendar */}
                <a
                  href={getGoogleCalendarUrl(selectedDay)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#4285F4] hover:border-[#4285F4] hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(66,133,244,0.3)] active:scale-95"
                >
                  <span className="text-lg">🤖</span> Add to Google Calendar
                </a>

                {/* iCal / Apple Calendar */}
                <a
                  href={getICalDataUri(selectedDay)}
                  download={`monkey-biz-august-${selectedDay.day}.ics`}
                  className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-[#ffd13b]/40 bg-[#ffd13b]/10 text-[#ffd13b] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#ffd13b] hover:text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,209,59,0.3)] active:scale-95"
                >
                  <span className="text-lg">🍏</span> Add to iPhone / iCal
                </a>
              </div>

              {/* Keep Riding Info */}
              <p className="text-[10px] text-white/30 font-mono uppercase mt-6 tracking-widest">
                Monkey Biz Lounge • Private Club Game
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
