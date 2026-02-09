"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
}

export default function LevelUpAnimation({ newLevel, onComplete }: LevelUpAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          {/* Radial glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-96 h-96 rounded-full bg-accent/30 blur-3xl"
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Level badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
              className="relative"
            >
              {/* Outer ring animation */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 rounded-full border-4 border-accent/30"
                style={{ width: '200px', height: '200px', margin: '-10px' }}
              />
              
              {/* Inner glow */}
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 rounded-full bg-accent/20 blur-xl"
              />

              {/* Level circle */}
              <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-accent via-accent/80 to-accent/60 flex items-center justify-center shadow-2xl shadow-accent/50 border-4 border-accent/50">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-black/60 text-sm font-bold uppercase tracking-widest"
                  >
                    Level
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.7,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="text-7xl font-black text-black"
                  >
                    {newLevel}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center space-y-2"
            >
              <h2 className="text-4xl font-black text-accent uppercase tracking-wider italic">
                Level Up!
              </h2>
              <p className="text-secondary text-lg font-mono">
                Neural link upgraded
              </p>
            </motion.div>

            {/* Particle effects */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  x: Math.cos((i * 30) * Math.PI / 180) * 200,
                  y: Math.sin((i * 30) * Math.PI / 180) * 200,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.8 + (i * 0.05),
                  ease: "easeOut"
                }}
                className="absolute w-3 h-3 bg-accent rounded-full"
                style={{ 
                  boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.8)' 
                }}
              />
            ))}
          </div>

          {/* Sound effect indicator (optional) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-8 right-8 text-accent/50 text-sm font-mono"
          >
            <i className="fa-solid fa-volume-high mr-2"></i>
            ACHIEVEMENT UNLOCKED
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
