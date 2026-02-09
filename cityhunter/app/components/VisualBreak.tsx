"use client";

import React from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import SpotlightCard from "./SpotlightCard";

export default function VisualBreak() {
  return (
    <section className="py-24 bg-surface border-y border-divider/5">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <SpotlightCard className="relative h-[500px] rounded-3xl overflow-hidden group shadow-2xl animate-on-scroll">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Exploration"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8 relative z-20">
              <div>
                <div className="bg-accent text-black text-xs font-bold px-3 py-1 inline-block rounded-full mb-2">
                  FEATURED WALK
                </div>
                <h3 className="text-3xl font-black text-white">
                  Midnight in Paris
                </h3>
                <p className="text-gray-300 mt-2">
                  3.4 km • 45 min • Historic District
                </p>
              </div>
            </div>
          </SpotlightCard>

        <AnimateOnScroll className="space-y-8" delay={200}>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-primary">
            YOUR CITY. <br />
            <span className="text-gradient">YOUR GAME.</span>
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-divider/10 flex items-center justify-center shrink-0 text-accent font-mono font-bold">
                01
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary">
                  Choose Your Mission
                </h4>
                <p className="text-secondary text-sm">
                  Stop scrolling maps. Select a quest based on your mood or
                  available time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-divider/10 flex items-center justify-center shrink-0 text-accent font-mono font-bold">
                02
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary">
                  Follow the Signal
                </h4>
                <p className="text-secondary text-sm">
                  Wander without getting lost. Our directional interface guides
                  you to the spot.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-divider/10 flex items-center justify-center shrink-0 text-accent font-mono font-bold">
                03
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary">
                  The City Talks Back
                </h4>
                <p className="text-secondary text-sm">
                  No passive listening. Answer the AI's riddle about what you see
                  to unlock the reward.
                </p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
