"use client";

import React, { useState } from "react";
import ChatInterface from "./ChatInterface";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button - Hide when open to create "morph" effect or keep visible? 
          User said "link the chat to the widget effect of chat widget popping from the button". 
          Common pattern: Button stays, Window appears above. 
      */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-surface border border-divider/10 shadow-xl flex items-center justify-center text-accent hover:scale-110 transition-all duration-300 cursor-pointer group ${isOpen ? "rotate-90 opacity-0 scale-50 pointer-events-none" : "rotate-0 opacity-100 scale-100"}`}
      >
        <i className="fa-solid fa-robot text-xl group-hover:rotate-12 transition-transform"></i>
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-pulse-slow"></div>
      </button>

      {/* Chat Window Overlay - No Blur, Positioned Bottom-Right */}
      {/* We use a fixed container for positioning, but removed the full screen blocking bg or at least the visual blur */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 origin-bottom-right animate-in zoom-in-0 slide-in-from-bottom-5 fade-in duration-300 ease-out">
            <div className="w-[90vw] md:w-[450px] h-[600px] max-h-[80vh]">
               <ChatInterface onClose={() => setIsOpen(false)} />
            </div>
        </div>
      )}
    </>
  );
}
