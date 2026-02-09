"use client";

import React from "react";
import AnimateOnScroll from "./AnimateOnScroll";

export default function GameSection() {
  return (
    <section
      id="game"
      className="py-24 bg-surface border-y border-divider/5 overflow-hidden relative"
    >
      {/* Abstract BG Decoration */}
      <div className="absolute -right-20 top-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Text Side */}
        <AnimateOnScroll className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-primary">
            URBAN EXPLORATION, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
              GAMIFIED
            </span>
          </h2>
          <p className="text-secondary text-lg leading-relaxed">
            Gamifying the travel experience. The gamification creates a sense of
            achievement that turns every step into progress. Earn{" "}
            <span className="text-accent font-bold">XP</span> for every monument
            found.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-divider/10 bg-canvas/50">
              <i className="fa-solid fa-trophy text-yellow-500 text-2xl"></i>
              <div>
                <span className="block font-bold text-primary">Leagues</span>
                <span className="text-xs text-secondary">Weekly Ranking</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-divider/10 bg-canvas/50">
              <i className="fa-solid fa-medal text-accent text-2xl"></i>
              <div>
                <span className="block font-bold text-primary">Badges</span>
                <span className="text-xs text-secondary">Collectibles</span>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Visual Side */}
        <AnimateOnScroll className="relative" delay={200}>
          {/* Card Stack Effect */}
          <div className="relative z-10 glass p-8 rounded-3xl border border-divider/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs text-secondary uppercase font-bold tracking-widest">
                  Current Rank
                </p>
                <h3 className="text-3xl font-black text-primary">
                  #42
                  <span className="text-base font-normal text-secondary">
                    in Paris
                  </span>
                </h3>
              </div>
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-black font-bold text-lg">
                XP
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-canvas/50 p-3 rounded-xl border border-divider/5">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                  1
                </div>
                <img
                  src="https://ui-avatars.com/api/?name=Sarah+M&background=random"
                  className="w-8 h-8 rounded-full"
                  alt="Sarah M"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">Sarah M.</p>
                  <p className="text-[10px] text-secondary">15,400 XP</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-accent/10 p-3 rounded-xl border border-accent/20">
                <div className="w-8 h-8 rounded-full bg-accent text-black font-bold flex items-center justify-center text-xs">
                  42
                </div>
                <img
                  src="https://ui-avatars.com/api/?name=You&background=000&color=fff"
                  className="w-8 h-8 rounded-full"
                  alt="You"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">You</p>
                  <p className="text-[10px] text-secondary">12,450 XP</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-canvas/50 p-3 rounded-xl border border-divider/5">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                  43
                </div>
                <img
                  src="https://ui-avatars.com/api/?name=Mike+T&background=random"
                  className="w-8 h-8 rounded-full"
                  alt="Mike T"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">Mike T.</p>
                  <p className="text-[10px] text-secondary">11,900 XP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Backdrop Card */}
          <div className="absolute inset-0 bg-accent transform -rotate-3 rounded-3xl opacity-20 scale-95 -z-10 blur-sm"></div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
