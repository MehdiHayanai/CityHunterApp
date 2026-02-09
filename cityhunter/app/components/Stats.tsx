"use client";

import React from "react";
import AnimateOnScroll from "./AnimateOnScroll";

export default function Stats() {
  return (
    <section id="community" className="py-24 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-12">
          Live Community Stats
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimateOnScroll>
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">
              1.2M
            </div>
            <div className="text-secondary text-xs font-bold uppercase">
              Km Walked
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">
              85k
            </div>
            <div className="text-secondary text-xs font-bold uppercase">
              Monuments Found
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">
              120
            </div>
            <div className="text-secondary text-xs font-bold uppercase">
              Cities Active
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={300}>
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">
              4.9
            </div>
            <div className="text-secondary text-xs font-bold uppercase">
              App Rating
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
