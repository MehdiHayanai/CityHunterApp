import React from "react";
import Link from "next/link";
import { DEFAULT_CITIES } from "../constants/cities";

export default function Hero() {
  const activeCities = DEFAULT_CITIES.filter((c) => c.active);
  const count = activeCities.length;
  
  // Logic: 
  // 1: Live in City1
  // 2: Live in City1 & City2
  // 3+: Live in City1, City2 and +X others
  
  let liveText = "Live in ";
  
  if (count === 0) {
    liveText += "Global Beta";
  } else if (count === 1) {
    liveText += activeCities[0].city;
  } else if (count === 2) {
    // Capitalize properly? The data is uppercase "PARIS". User reference showed "Paris & London".
    // I will keep the string case from the data but Title Case might be better. 
    // The user data is "PARIS", "LONDON". 
    // The reference text in Hero was "Live in Paris & London".
    // I should probably convert to Title Case for better aesthetics if the data is uppercase.
    
    const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    liveText += `${toTitleCase(activeCities[0].city)} & ${toTitleCase(activeCities[1].city)}`;
  } else {
    const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const remaining = count - 2;
    // Attempting to match user provided logic broadly: 
    // "Live in City1 & City2" ... wait, generally 3+ gets "and +N other(s)"
    // Let's stick to showing top 2 names if possible, or just the text required.
    // User wrote: "Live in {citi} { & city   if len(cities)>= } and {+{number of cities -= 2 and other citie(' ' if len(cities)==3 and 's' if len(cities) >= 3if len cities >=3}"
    
    // If count >= 2, we show "City1 & City2".
    // Then if count >= 3, appendage starts.
    
    liveText += `${toTitleCase(activeCities[0].city)} & ${toTitleCase(activeCities[1].city)}`;
    
    if (remaining > 0) {
       liveText += ` and +${remaining} other cit${remaining === 1 ? 'y' : 'ies'}`;
    }
  }

  return (
    <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-hero-gradient"></div>
        <div className="absolute inset-0 bg-grid opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest animate-pulse-slow">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            {liveText}
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-primary">
            DON'T JUST <br />
            VISIT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
              PLAY THE CITY
            </span>
          </h1>

          <p className="text-secondary text-lg sm:text-xl max-w-md leading-relaxed">
            The interactive guide for modern explorers. Skip the boring audio loops and discover hidden history through AI-driven quests.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/login" className="bg-accent text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-accentHover transition-transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer">
              Start Your Quest <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-secondary pt-4">
            <div className="flex -space-x-3">
              <img
                className="w-8 h-8 rounded-full border-2 border-canvas"
                src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-canvas"
                src="https://ui-avatars.com/api/?name=Jane+Doe&background=random"
                alt="User"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-canvas"
                src="https://ui-avatars.com/api/?name=Alex+Smith&background=random"
                alt="User"
              />
            </div>
            <span>10k+ Hunters joined this week</span>
          </div>
        </div>

        {/* UI Mockup (Floating) */}
        <div className="relative hidden h-[800px] w-full perspective-1000">
          {/* Phone Mockup */}
          <div className="absolute top-10 left-10 w-[380px] h-[780px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl animate-float z-20 overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-30"></div>

            {/* App Screen Simulator */}
            <div className="w-full h-full bg-[#121212] relative text-white overflow-hidden">
              {/* Animated Map Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center animate-pan-slow"
                style={{
                  backgroundImage:
                    "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')",
                  filter: "invert(1) grayscale(1)",
                  backgroundSize: "200%",
                }}
              ></div>

              {/* Radar HUD */}
              <div className="absolute top-12 left-0 right-0 flex justify-center z-10">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-4">
                  <div className="text-center">
                    <span className="block text-[#CCFF00] font-mono font-bold text-lg">
                      120m
                    </span>
                    <span className="block text-[8px] uppercase tracking-widest text-gray-400">
                      Distance
                    </span>
                  </div>
                  <div className="w-px h-6 bg-white/10"></div>
                  <div className="text-center">
                    <i className="fa-solid fa-location-arrow text-white animate-pulse"></i>
                  </div>
                </div>
              </div>

              {/* User Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-[#CCFF00] rounded-full border-2 border-white relative z-10 shadow-[0_0_20px_rgba(204,255,0,0.6)]"></div>
                <div className="absolute inset-0 w-full h-full bg-[#CCFF00] rounded-full animate-ping opacity-50"></div>
              </div>

              {/* Interaction Sheet (Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e1e] rounded-t-[2rem] p-6 pb-10 border-t border-white/10">
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-1">Eiffel Tower</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Zone detected. Unlock challenge.
                </p>
                <button className="w-full bg-[#CCFF00] text-black font-bold py-3 rounded-xl uppercase tracking-widest text-xs cursor-pointer">
                  Unlock
                </button>
              </div>
            </div>
          </div>

          {/* Floating Stats Card (Behind) */}
          <div className="absolute top-40 right-10 w-64 bg-surface/90 glass p-5 rounded-2xl border border-divider/5 z-10 transform rotate-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center">
                <i className="fa-solid fa-trophy text-yellow-500"></i>
              </div>
              <div>
                <p className="text-xs text-secondary uppercase font-bold">
                  Total XP
                </p>
                <p className="font-mono font-bold text-xl text-primary">
                  12,450
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-canvas rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[70%]"></div>
            </div>
            <p className="text-right text-[10px] text-secondary mt-1">
              Level 5 Explorer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
