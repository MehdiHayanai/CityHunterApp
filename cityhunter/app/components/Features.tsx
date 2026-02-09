"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import AnimateOnScroll from "./AnimateOnScroll";

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-primary">
            NOT A GUIDEBOOK.<br />A <span className="text-accent">SMART COMPASS</span>.
          </h2>
          <p className="text-secondary max-w-2xl mx-auto">
            CityHunter solves the biggest problem of modern travel: the passive
            tourist trap. It turns a wandering walk into a meaningful quest,
            whether you're alone or with a crew.
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <SpotlightCard delay={100} className="group bg-surface border border-divider/5 p-8 rounded-3xl hover:border-accent/50 transition-all hover:-translate-y-2 h-full animate-on-scroll">
            <div className="w-14 h-14 bg-canvas rounded-2xl flex items-center justify-center text-2xl text-primary mb-6 group-hover:bg-accent group-hover:text-black transition-colors">
              <i className="fa-solid fa-location-arrow"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">
              Wander with Purpose
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              Stop scrolling maps. Start following the signal. Your next
              discovery is 200m away. We’ll show you where using our unique
              directional interface.
            </p>
          </SpotlightCard>

          {/* Feature 2 */}
          <SpotlightCard delay={200} className="group bg-surface border border-divider/5 p-8 rounded-3xl hover:border-accent/50 transition-all hover:-translate-y-2 h-full animate-on-scroll">
            <div className="w-14 h-14 bg-canvas rounded-2xl flex items-center justify-center text-2xl text-primary mb-6 group-hover:bg-accent group-hover:text-black transition-colors">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">
              The City Talks Back
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              Don't just look. Observe. Then answer. Our AI challenges you to
              prove you're actually there by solving riddles and finding hidden
              intel at each location.
            </p>
          </SpotlightCard>

          {/* Feature 3 */}
          <SpotlightCard delay={300} className="group bg-surface border border-divider/5 p-8 rounded-3xl hover:border-accent/50 transition-all hover:-translate-y-2 h-full animate-on-scroll">
            <div className="w-14 h-14 bg-canvas rounded-2xl flex items-center justify-center text-2xl text-primary mb-6 group-hover:bg-accent group-hover:text-black transition-colors">
              <i className="fa-solid fa-person-hiking"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">
              Exploration, Gamified
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              No tour groups. No umbrellas. Just you and the quest. Explore on
              your own terms, at your own pace, while competing on a global
              leaderboard.
            </p>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
