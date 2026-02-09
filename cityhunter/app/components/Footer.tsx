import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-divider/5 pt-20 pb-10 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-primary">
              START YOUR <br />
              HUNT TODAY.
            </h2>
            <p className="text-secondary max-w-md mb-8">
              Join the fastest growing community of urban explorers. The city is
              hiding secrets. Can you find them?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary text-canvas px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer">
                Download Now
              </button>
            </div>
          </div>
          <div className="relative">
            {/* Decorative abstract graphic */}
            <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full"></div>
            <div className="relative glass rounded-3xl p-8 border border-divider/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-canvas font-bold text-xl">
                  CH
                </div>
                <div>
                  <h4 className="font-bold text-primary">CityHunter Pro</h4>
                  <p className="text-xs text-secondary">Premium Subscription</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-2 bg-primary/10 rounded-full w-full"></div>
                <div className="h-2 bg-primary/10 rounded-full w-3/4"></div>
                <div className="h-2 bg-primary/10 rounded-full w-1/2"></div>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-secondary">
                <span>UNLIMITED ACCESS</span>
                <span className="text-accent">FREE FOREVER</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-divider/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary">
          <p>&copy; 2024 CityHunter Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary">
              Instagram
            </Link>
            <Link href="#" className="hover:text-primary">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
