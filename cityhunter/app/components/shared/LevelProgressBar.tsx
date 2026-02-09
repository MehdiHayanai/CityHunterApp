"use client";

import React, { useEffect, useState } from 'react';
import { GamificationService } from '../../services/gamification';
import { LevelNode } from '../../types/profile';

interface LevelProgressBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export default function LevelProgressBar({ 
  currentXp, 
  nextLevelXp, 
  level, 
  className = "", 
  barClassName = "bg-accent",
  showLabel = false 
}: LevelProgressBarProps) {
  const [floorXp, setFloorXp] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        // Attempt to fetch levels to find the "floor" for the current level
        // (i.e., the XP required to reach the current level)
        const levels = await GamificationService.getLevels();
        
        // Find the level node for the *current* level to get its XP requirement (the floor)
        // Adjust logic based on how levels are defined in your backend
        // Assuming level 1 starts at 0 XP. 
        // If the API returns the XP required to REACH a level:
        // Level 1: 0 XP
        // Level 2: 1000 XP
        // If I am Level 1, floor is 0. If I am Level 2, floor is 1000.
        
        const currentLevelNode = levels.find((l: LevelNode) => l.level === level);
        
        // If we found the current level in the tree, its 'xp' value is the floor
        // (Assumes 'xp' in LevelNode is "XP required to reach this level")
        if (currentLevelNode) {
            setFloorXp(currentLevelNode.xp);
        } else {
            // Fallback: If level 1, floor is 0. If higher and not found, might need a guess or 0.
            // But realistically, Level 1 should be 0.
            if (level === 1) {
                setFloorXp(0);
            }
        }
      } catch (error) {
        console.error("Failed to fetch level data for progress bar", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelData();
  }, [level]);

  // Calculate percentage
  // Progress = (Current - Floor) / (Next - Floor)
  // Ensure we don't divide by zero
  const range = nextLevelXp - floorXp;
  const progressRaw = range > 0 ? ((currentXp - floorXp) / range) * 100 : 0;
  
  // Clamp between 0 and 100
  const progress = Math.min(Math.max(progressRaw, 0), 100);

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-secondary mb-1 font-mono">
            <span>XP Progress</span>
            <span className="text-accent">
                {isLoading ? "..." : `${(currentXp - floorXp).toLocaleString()} / ${range.toLocaleString()} XP`}
            </span>
        </div>
      )}
      <div className="h-full w-full bg-divider/10 rounded-full overflow-hidden relative">
        <div 
            className={`h-full transition-all duration-500 ease-out ${barClassName}`}
            style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
