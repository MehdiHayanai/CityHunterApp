"use client";

import { useAuthStore } from "../../store/useAuthStore";
import ChatWidget from "../components/ChatWidget";
import LevelUpAnimation from "../components/LevelUpAnimation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { levelUpData, clearLevelUp } = useAuthStore();

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatWidget />
      </div>
      
      {/* Level Up Animation */}
      {levelUpData && (
        <LevelUpAnimation 
          newLevel={levelUpData.newLevel} 
          onComplete={clearLevelUp}
        />
      )}
    </>
  );
}
