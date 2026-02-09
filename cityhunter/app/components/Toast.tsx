"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

import { TOAST_STYLES } from "../constants/toastStyles";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    let timeoutId: NodeJS.Timeout;
    
    const startTimer = () => {
       timeoutId = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for transition out
      }, duration);
    };

    if (!isPaused) {
      startTimer();
    }

    return () => clearTimeout(timeoutId);
  }, [duration, onClose, isPaused]);

  // Handle styles
  const style = TOAST_STYLES[type] || TOAST_STYLES.success;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-6 right-6 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl ${style.bg} ${style.border} border transform transition-all duration-500 ease-out cursor-default ${
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-10 opacity-0 scale-95"
      }`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-canvas/30 ${style.iconColor} backdrop-blur-sm`}>
         <i className={`fa-solid ${style.icon} text-lg`}></i>
      </div>
      
      <div className="flex flex-col">
          <span className={`font-bold text-sm tracking-tight ${style.titleColor}`}>
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}
          </span>
          <span className="text-xs text-primary/90 font-medium">{message}</span>
      </div>

      <button 
        onClick={() => setIsVisible(false)} 
        className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-secondary transition-colors cursor-pointer"
      >
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>

      {/* Glossy highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>
    </div>
  );
}
