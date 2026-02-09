"use client";

import React, { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { USER_PROFILE_DATA as ME_DATA } from '../../constants/user-profile';
import { useThemeContext } from '../../context/ThemeContext';
import { Achievement, Mission, UserProfileData, SwaggItem } from '../../types/profile';
import DashboardNavbar from '../DashboardNavbar';

/* --- SUB-COMPONENTS --- */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  delay: number;
}

const StatCard = ({ label, value, icon, delay }: StatCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    cardRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
    cardRef.current.style.setProperty('--mouse-y', `${mouseY}px`);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="spotlight-card group relative overflow-hidden rounded-xl bg-surface border border-divider p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(204,255,0,0.05)]"
    >
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex justify-between items-start">
          <p className="text-secondary text-xs uppercase tracking-wider font-semibold">{label}</p>
          <div className="p-2 rounded-lg bg-primary/5 text-secondary group-hover:text-accent group-hover:bg-accent/10 transition-colors">
            <i className={`fa-solid ${icon} text-lg`}></i>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-mono text-primary font-bold tracking-tight group-hover:text-accent transition-colors">
            {value}
          </h3>
          <div className="h-1 w-12 bg-primary/10 mt-3 rounded-full group-hover:w-full group-hover:bg-accent/50 transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};

const AchievementBadge = ({ name, desc, icon, unlocked }: Achievement) => (
  <div className={`relative p-4 rounded-xl border ${unlocked ? 'bg-surface border-accent/20' : 'bg-surface/50 border-divider opacity-60'} flex items-center gap-4 group transition-all`}>
    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${unlocked ? 'bg-accent/10 text-accent' : 'bg-primary/5 text-secondary'}`}>
      <i className={`fa-solid ${unlocked ? 'fa-trophy' : 'fa-shield-halved'} text-xl`}></i>
    </div>
    <div>
      <h4 className={`font-bold text-sm ${unlocked ? 'text-primary' : 'text-secondary'}`}>{name}</h4>
      <p className="text-xs text-secondary mt-0.5">{desc}</p>
    </div>
    {unlocked && (
      <div className="absolute inset-0 border border-accent/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_0_15px_rgba(204,255,0,0.1)]" />
    )}
  </div>
);

const HistoryRow = ({ item }: { item: Mission }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'walk': return 'fa-person-walking';
      case 'monument': return 'fa-landmark';
      case 'event': return 'fa-calendar-star';
      default: return 'fa-map-pin';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-surface border border-divider hover:border-accent/20 transition-all group cursor-pointer relative overflow-hidden">
      
      {/* Type Marker Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status === 'Complete' ? 'bg-accent/50' : 'bg-secondary/20'}`} />

      <div className="flex items-center gap-4 pl-2">
        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${item.status === 'Complete' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
          <i className={`fa-solid ${getIcon(item.type)}`}></i>
        </div>
        <div>
          <h4 className="text-primary font-bold text-sm group-hover:text-accent transition-colors">{item.zone}</h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary mt-1">
            <span className="uppercase font-bold tracking-wider text-[10px]">{item.type}</span>
            <span className="w-1 h-1 rounded-full bg-primary/5" />
            <span>{item.city}</span>
            <span className="w-1 h-1 rounded-full bg-primary/5" />
            <span>{item.date}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-4 justify-between md:justify-end w-full md:w-auto pl-2 md:pl-0">
        
        {/* Rewards Chips */}
        <div className="flex items-center gap-2">
           {item.swagg && (
              <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                 <i className="fa-solid fa-gem"></i>
                 SWAGG
              </div>
           )}
           {item.xp && (
             <div className="px-2 py-1 rounded bg-accent/5 border border-accent/10 text-accent text-[10px] font-mono font-bold">
               +{item.xp} XP
             </div>
           )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-secondary">Score</p>
            <span className={`font-mono font-bold ${item.score >= 90 ? 'text-accent' : 'text-primary'}`}>{item.score}%</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- MAIN PAGE COMPONENT --- */
import { useAuthStore } from '../../../store/useAuthStore';
import ComingSoonWrapper from './ComingSoonWrapper';
import { GamificationService } from '../../services/gamification';
import { LevelNode } from '../../types/profile';

import LevelProgressBar from '../shared/LevelProgressBar';

const COMING_SOON_SWAGG = true;
const COMING_SOON_ACTIVITIES = true;
const COMING_SOON_MISSION_LOG = true;
const COMING_SOON_ACHIEVEMENTS = true;

// ...

export default function UserProfile({ initialUser }: { initialUser?: UserProfileData }) {
  const { theme, toggleTheme } = useThemeContext();
  const { user: storeUser } = useAuthStore();
  
  // If initialUser is passed, use it; otherwise use storeUser, fallback to ME_DATA
  const USER_DATA = initialUser || storeUser || ME_DATA;
  const isMe = initialUser ? initialUser.id === storeUser?.id : true; // Assuming if no initialUser, it's me

  const [activeTab, setActiveTab] = useState('overview');
  const levelListRef = useRef<HTMLDivElement>(null);
  
  // State for Level Tree Pagination (1 future level by default)
  const [futureCap, setFutureCap] = useState(1);
  const [levels, setLevels] = useState<LevelNode[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      setIsLoadingLevels(true);
      try {
        const fetchedLevels = await GamificationService.getLevels();
        setLevels(fetchedLevels);
      } catch (error) {
        console.error("Failed to fetch levels", error);
        // Fallback or empty? keeping empty will show nothing or we can keep a backup constant for offline dev if needed.
      } finally {
        setIsLoadingLevels(false);
      }
    };
    fetchLevels();
  }, []);

  const sortedFriends = [...ME_DATA.friends.map(f => ({ ...f, isMe: f.id === ME_DATA.id })), {
    id: ME_DATA.id,
    name: ME_DATA.name, 
    handle: ME_DATA.handle, 
    level: ME_DATA.level, 
    xp: ME_DATA.xp, 
    avatar: "ME", 
    status: "online",
    isMe: true 
  }].sort((a, b) => b.xp - a.xp);

  // Level Logic
  // Use fetched levels if available, otherwise fallback to USER_DATA.levelTree (which might be mock data for now)
  // But our goal is to prefer 'levels' state.
  const levelsToUse = levels.length > 0 ? levels : USER_DATA.levelTree;
  
  const allLevelsDesc = [...levelsToUse].sort((a, b) => b.level - a.level);
  const maxTreeLevel = allLevelsDesc[0]?.level || 0;
  const visibleLevels = allLevelsDesc.filter(lvl => lvl.level <= USER_DATA.level + futureCap);
  const hasMoreFuture = (USER_DATA.level + futureCap) < maxTreeLevel;

  // Tabs Configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-user', visible: true },
    { id: 'levels', label: 'Level Map', icon: 'fa-star', visible: isMe },
    { id: 'community', label: 'Friends', icon: 'fa-users', visible: true }, 
    { id: 'history', label: 'Mission Log', icon: 'fa-clock', visible: true },
    { id: 'achievements', label: 'Achievements', icon: 'fa-award', visible: true },
    { id: 'settings', label: 'Settings', icon: 'fa-gear', visible: isMe },
  ].filter(t => t.visible);

  // Auto-scroll logic
  useEffect(() => {
    if (activeTab === 'levels' && levelListRef.current) {
      setTimeout(() => {
        const currentLevelEl = document.getElementById(`level-${USER_DATA.level}`);
        if (currentLevelEl) currentLevelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-canvas text-primary font-sans selection:bg-accent selection:text-black transition-colors duration-300">
      
      {/* NAVBAR */}
      <DashboardNavbar />

      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20">

        {/* --- BACK BUTTON --- */}
        <div className="mb-6">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-secondary hover:text-accent transition-colors font-medium text-sm group"
            >
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span>Back to Dashboard</span>
            </Link>
        </div>
        
        {/* --- 1. PROFILE HEADER --- */}
        <header className="mb-6">
          <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Background Gradient/Mesh */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              {/* Avatar Ring */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-primary/20 p-1 relative z-10 bg-canvas">
                  <div className="w-full h-full rounded-full bg-surface border border-divider overflow-hidden flex items-center justify-center">
                    {USER_DATA.id === 1 ? (
                        <i className="fa-solid fa-user text-4xl text-secondary"></i>
                    ) : (
                        <span className="text-3xl font-bold font-mono text-primary">{(USER_DATA as any).avatar || "U"}</span>
                    )}
                  </div>
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 bg-surface border border-accent text-accent px-3 py-1 rounded-full text-xs font-bold font-mono tracking-tighter shadow-[0_0_10px_rgba(204,255,0,0.2)] z-20">
                  LVL {USER_DATA.level}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-2">{USER_DATA.name}</h1>
                    <p className="text-accent font-mono text-sm md:text-base">{USER_DATA.title} <span className="text-secondary opacity-50 mx-2">|</span> {USER_DATA.handle}</p>
                  </div>
                  
                  {isMe ? (
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/10 hover:border-accent/50 hover:bg-accent/5 text-sm font-medium transition-all group cursor-pointer text-primary">
                        <i className="fa-solid fa-pen-to-square group-hover:text-accent"></i>
                        <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-accent/20 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium transition-all group cursor-pointer">
                        <i className="fa-solid fa-user-plus"></i>
                        <span>Add Rival</span>
                    </button>
                  )}

                </div>

                {/* XP Bar */}
                <div className="mt-6 max-w-xl">
                  <LevelProgressBar 
                    currentXp={USER_DATA.xp}
                    nextLevelXp={USER_DATA.nextLevelXp}
                    level={USER_DATA.level}
                    className="h-2 w-full"
                    showLabel={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- 2. HORIZONTAL TAB NAVIGATION --- */}
        <div className="sticky top-16 z-40 bg-canvas/95 backdrop-blur border-b border-divider/10 mb-8 -mx-4 px-4 md:-mx-6 md:px-6">
           <div className="flex overflow-x-auto no-scrollbar gap-8">
             {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                    ${activeTab === tab.id 
                      ? 'border-accent text-accent' 
                      : 'border-transparent text-secondary hover:text-primary'}
                  `}
                >
                  <i className={`fa-solid ${tab.icon}`}></i>
                  {tab.label}
                </button>
             ))}
           </div>
        </div>

        {/* --- 3. MAIN CONTENT --- */}
        <main className="min-h-[500px] animate-on-scroll is-visible">
              
              {activeTab === 'overview' && (
                <div className="space-y-4"> {/* Reduced spacing from 8 to 4 */}
                  
                  {/* Quick Stats Grid - Now inside Overview because we removed sidebar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Reduced gap from 6 to 4 */}
                    <StatCard label="Distance Walked" value={USER_DATA.stats.distance} icon="fa-compass" delay={100} />
                    <StatCard label="Cities Unlocked" value={USER_DATA.stats.cities} icon="fa-map-location-dot" delay={200} />
                    <StatCard label="Secrets Found" value={USER_DATA.stats.secrets} icon="fa-arrow-trend-up" delay={300} />
                  </div>

                  {/* Current Objective */}
                  <div className="glass p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                      <i className="fa-solid fa-compass text-accent text-xl"></i>
                      Current Objective
                    </h2>
                    <div className="bg-surface rounded-xl p-8 border border-divider relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] bg-cover bg-center opacity-20 transition-opacity group-hover:opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="max-w-2xl">
                          <div className="flex gap-4 mb-4">
                            <span className="text-accent text-xs font-bold uppercase tracking-wider border border-accent/20 px-2 py-1 rounded bg-accent/5">Active Quest</span>
                            <span className="font-mono text-secondary text-xs flex items-center gap-1"><i className="fa-solid fa-location-dot"/> 2.4km away</span>
                          </div>
                          <h3 className="text-3xl font-bold text-primary mb-4">The Brutalist Shadows of London</h3>
                          <p className="text-secondary text-base leading-relaxed mb-0">
                            Discover the concrete giants hidden in plain sight. This route takes you through the Barbican and beyond. The city is waiting for you to listen.
                          </p>
                        </div>
                        <button className="bg-accent text-black px-8 py-4 rounded-xl font-bold text-base hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.2)] shrink-0 whitespace-nowrap cursor-pointer">
                          Continue Quest
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Swagg Collection Preview */}
                  <ComingSoonWrapper active={COMING_SOON_SWAGG} className="rounded-lg">
                  <div className="glass p-8 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                            <i className="fa-solid fa-gem text-purple-400"></i>
                            Recent Swagg
                        </h3>
                        <span className="text-xs text-secondary bg-surface px-2 py-1 rounded border border-divider">Collection Level 12</span>
                    </div>
                   
                    {USER_DATA.collection && USER_DATA.collection.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {USER_DATA.collection.slice(0, 6).map((item: SwaggItem) => (
                                <div key={item.id} className="bg-surface border border-divider hover:border-accent/40 rounded-xl p-4 text-center group cursor-pointer transition-all">
                                    <div className="h-12 w-12 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <i className={`fa-solid ${item.icon} text-xl ${item.rarity === 'rare' ? 'text-blue-400' : item.rarity === 'epic' ? 'text-purple-400' : 'text-gray-400'}`}></i>
                                    </div>
                                    <h4 className="text-sm font-bold truncate text-primary">{item.name}</h4>
                                    <p className="text-[10px] text-secondary uppercase tracking-wider">{item.rarity}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center border border-dashed border-divider rounded-xl text-secondary">
                            No swagg collected yet.
                        </div>
                    )}
                  </div>
                  </ComingSoonWrapper>

                  {/* Recent Activity */}
                  <ComingSoonWrapper active={COMING_SOON_ACTIVITIES} className="rounded-lg">
                  <div className="glass p-8 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-primary">Recent Activity</h3>
                      <button onClick={() => setActiveTab('history')} className="text-sm text-accent hover:underline font-bold cursor-pointer">View Full History</button>
                    </div>
                    {USER_DATA.history && USER_DATA.history.length > 0 ? (
                        <div className="space-y-3">
                            {USER_DATA.history.slice(0,3).map((item: Mission) => (
                                <HistoryRow key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-surface/50 text-secondary text-sm italic">
                            No recent activity recorded.
                        </div>
                    )}
                  </div>
                  </ComingSoonWrapper>
                </div>
              )}

              {activeTab === 'levels' && (
                <div className="glass rounded-2xl p-0 overflow-hidden flex flex-col h-[800px]">
                  {/* ... Existing Levels Logic ... */}
                   {/* Level Header */}
                   <div className="p-8 border-b border-divider bg-surface/50 z-20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-primary">Progression Map</h2>
                        <p className="text-secondary text-sm">Scroll to see past milestones.</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-secondary uppercase tracking-wider block mb-1">Current Level</span>
                        <span className="text-accent font-mono text-xl font-bold">{USER_DATA.level}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable Level Timeline */}
                  <div 
                    ref={levelListRef}
                    className="flex-1 overflow-y-auto custom-scrollbar p-8 relative"
                  >
                     {/* Timeline Line */}
                     <div className="absolute left-14 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />

                    <div className="space-y-2 relative z-10 pb-20">
                      
                      {/* Loading State */}
                      {isLoadingLevels && (
                        <div className="flex justify-center py-10">
                          <i className="fa-solid fa-circle-notch fa-spin text-accent text-3xl"></i>
                        </div>
                      )}

                      {/* EXPLORE FUTURE LEVELS BUTTON */}
                      {hasMoreFuture && (
                        <div className="flex justify-center pb-8">
                          <button 
                            onClick={() => setFutureCap(c => c + 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface border border-dashed border-divider hover:border-accent hover:text-accent transition-all group cursor-pointer"
                          >
                            <i className="fa-solid fa-arrow-up group-hover:-translate-y-1 transition-transform"></i>
                            <span className="text-sm font-bold uppercase tracking-wider">Explore Future Level</span>
                          </button>
                        </div>
                      )}

                      {visibleLevels.map((lvl, index) => {
                        const isUnlocked = USER_DATA.level >= lvl.level;
                        const isCurrent = USER_DATA.level === lvl.level;
                        const isNext = USER_DATA.level + 1 === lvl.level;
                        
                        return (
                          <div 
                            id={`level-${lvl.level}`}
                            key={lvl.level} 
                            className={`group flex gap-8 transition-all duration-500 animate-on-scroll is-visible ${isUnlocked || isNext ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
                          >
                            {/* Level Number & Icon */}
                            <div className="flex flex-col items-center gap-2 w-12 shrink-0 pt-2">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 relative z-10 transition-transform duration-300 group-hover:scale-110
                                ${isCurrent ? 'bg-accent border-accent text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 
                                  isUnlocked ? 'bg-surface border-accent/50 text-accent' : 
                                  'bg-canvas border-surface text-secondary'}`}>
                                {isUnlocked ? <i className="fa-solid fa-unlock"></i> : <i className="fa-solid fa-lock"></i>}
                              </div>
                              <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-accent' : 'text-secondary/50'}`}>
                                Lvl {lvl.level}
                              </span>
                            </div>

                            {/* Card Content */}
                            <div className={`flex-1 rounded-xl p-6 border transition-all relative
                              ${isCurrent ? 'bg-surface border-accent shadow-[0_0_30px_rgba(204,255,0,0.1)] scale-100' : 
                                isUnlocked ? 'bg-surface/50 border-divider' : 
                                'bg-transparent border-divider border-dashed'}
                            `}>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  {isCurrent && <span className="text-accent text-[10px] uppercase font-bold tracking-widest mb-1 block">Current Status</span>}
                                  {isNext && <span className="text-primary/50 text-[10px] uppercase font-bold tracking-widest mb-1 block">Next Goal</span>}
                                  <h3 className={`text-xl font-bold ${isCurrent ? 'text-primary' : 'text-primary/80'}`}>{lvl.title}</h3>
                                </div>
                                <div className={`font-mono text-xs px-3 py-1 rounded-full ${isCurrent ? 'bg-accent text-black font-bold' : 'bg-primary/5 text-secondary'}`}>
                                  {lvl.xp.toLocaleString()} XP
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 text-sm text-secondary border-t border-divider pt-3 mt-2">
                                <i className={`fa-solid fa-bolt ${isUnlocked ? 'text-accent' : ''}`}></i>
                                <span>Unlocks: <span className={isUnlocked ? 'text-primary' : ''}>{lvl.reward}</span></span>
                              </div>

                              {isCurrent && (
                                <div className="mt-4 bg-black/20 rounded-lg p-3">
                                  <div className="flex justify-between text-[10px] text-secondary mb-1 uppercase tracking-wider">
                                    <span>Progress to Lvl {lvl.level + 1}</span>
                                  </div>
                                  <LevelProgressBar 
                                    currentXp={USER_DATA.xp}
                                    nextLevelXp={USER_DATA.nextLevelXp}
                                    level={USER_DATA.level}
                                    className="h-2 w-full"
                                    barClassName="bg-accent"
                                    showLabel={true}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Hint at bottom */}
                      <div className="text-center py-8 text-secondary text-xs uppercase tracking-widest opacity-50">
                        Beginning of Journey
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'community' && (
                <div className="space-y-8">
                  {/* Leaderboard Section */}
                  <div className="glass rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                      <i className="fa-solid fa-arrow-trend-up text-accent"></i>
                      Friend Ranking
                    </h2>
                    
                    <div className="space-y-2">
                      {sortedFriends.map((friend, index) => (
                        <Link 
                          href={friend.isMe ? "/dashboard/profile" : `/dashboard/profile/${friend.id}`}
                          key={friend.id}
                          className={`flex flex-col md:flex-row items-stretch md:items-center gap-4 p-5 rounded-xl border border-divider transition-all cursor-pointer
                            ${friend.isMe 
                              ? 'bg-accent/10 border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.05)]' 
                              : 'bg-surface hover:bg-surface/80 hover:border-accent/40'}`}
                        >
                          {/* Rank & Avatar Row on Mobile */}
                          <div className="flex items-center gap-4">
                            {/* Rank Number */}
                            <div className={`w-8 font-mono font-bold text-xl text-center ${index < 3 ? 'text-accent' : 'text-secondary'}`}>
                              #{index + 1}
                            </div>

                            {/* Avatar Circle */}
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary relative">
                                {friend.avatar}
                                {friend.status === 'online' && (
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface" />
                                )}
                            </div>

                            {/* Info (Name & Level) - Visible inline on Desktop, Wrap on Mobile */}
                            <div className="flex-1 md:hidden">
                                <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-base ${friend.isMe ? 'text-accent' : 'text-primary'}`}>
                                    {friend.name}
                                </h4>
                                <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-secondary font-mono">Lvl {friend.level}</span>
                                </div>
                                <p className="text-sm text-secondary">{friend.handle}</p>
                            </div>
                          </div>

                           {/* Info (Desktop) */}
                           <div className="flex-1 hidden md:block">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold text-base ${friend.isMe ? 'text-accent' : 'text-primary'}`}>
                                {friend.name} {friend.isMe && "(You)"}
                              </h4>
                              <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-secondary font-mono">Lvl {friend.level}</span>
                            </div>
                            <p className="text-sm text-secondary">{friend.handle}</p>
                          </div>

                          {/* XP Stat (Wraps to bottom on mobile) */}
                          <div className="text-left md:text-right pl-14 md:pl-0 border-t border-divider pt-2 md:border-t-0 md:pt-0 mt-2 md:mt-0">
                            <div className="flex items-center justify-between md:block">
                                <span className="text-[10px] text-secondary uppercase md:hidden">Experience</span>
                                <div>
                                    <span className="font-mono text-base font-bold text-primary block">{friend.xp.toLocaleString()}</span>
                                    <span className="text-[10px] text-secondary uppercase hidden md:inline">XP Total</span>
                                </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Add Friends Box */}
                  <div className="bg-surface border border-dashed border-divider rounded-xl p-10 text-center hover:border-accent/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-primary/5 mx-auto flex items-center justify-center text-secondary group-hover:bg-accent/10 group-hover:text-accent transition-colors mb-4">
                      <i className="fa-solid fa-users text-2xl"></i>
                    </div>
                    <h3 className="text-primary font-bold text-lg mb-2">Invite Crew</h3>
                    <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">Solo travel is better with rivals. Share your handle to compete on the leaderboard.</p>
                    <button className="text-accent text-sm font-bold hover:underline">Copy Invite Link</button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="glass rounded-2xl p-0 overflow-hidden flex flex-col h-[700px]">
                  {/* History Header */}
                  <div className="p-8 border-b border-divider bg-surface/50 z-20">
                    <div className="flex justify-between items-end">
                      <div>
                         <h2 className="text-2xl font-bold text-primary">Mission Log</h2>
                         <p className="text-secondary text-sm">Track your urban conquests.</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-secondary uppercase tracking-wider block mb-1">Total Time</span>
                        <span className="text-primary font-mono text-xl font-bold">124h 30m</span>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
                     <ComingSoonWrapper active={COMING_SOON_MISSION_LOG} className="h-full">
                     {USER_DATA.history && USER_DATA.history.length > 0 ? (
                        <div className="space-y-3">
                          {USER_DATA.history.map((item: Mission) => (
                              <HistoryRow key={item.id} item={item} />
                          ))}
                          <div className="p-4 text-center text-secondary text-sm italic mt-8 border-t border-divider">
                            Older missions are archived in the cloud.
                          </div>
                        </div>
                     ) : (
                        <div className="p-10 text-center text-secondary">
                            <i className="fa-solid fa-wind text-2xl mb-2 opacity-50"></i>
                            <p>No history recorded yet.</p>
                        </div>
                     )}
                     </ComingSoonWrapper>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <ComingSoonWrapper active={COMING_SOON_ACHIEVEMENTS} className="rounded-2xl">
                <div className="glass p-8 rounded-2xl">
                   <h2 className="text-2xl font-bold mb-6 text-primary">Badges & Titles</h2>
                   {USER_DATA.achievements && USER_DATA.achievements.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {USER_DATA.achievements.map((ach: Achievement) => (
                           <AchievementBadge key={ach.id} {...ach} />
                         ))}
                       </div>
                   ) : (
                        <div className="p-8 text-center bg-surface/50 rounded-xl text-secondary">
                            No achievements unlocked yet.
                        </div>
                   )}
                </div>
                </ComingSoonWrapper>
              )}

              {isMe && activeTab === 'settings' && (
                <div className="glass rounded-2xl p-8 w-full">
                  <h2 className="text-2xl font-bold mb-6 text-primary">Explorer Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Appearance */}
                    <section>
                      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-divider pb-2">Appearance</h3>
                      <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-divider">
                        <div>
                          <p className="font-bold text-primary">Theme Mode</p>
                          <p className="text-xs text-secondary">Switch between dark text and light text environments.</p>
                        </div>
                        <button 
                          onClick={toggleTheme}
                          className="px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary border border-divider transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} text-accent`}></i>
                          <span className="capitalize font-medium">{theme} Mode</span>
                        </button>
                      </div>
                    </section>

                    {/* Account Section */}
                    <section>
                      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-divider pb-2">Account</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-secondary mb-1">Display Name</label>
                            <input 
                              type="text" 
                              value={USER_DATA.name} 
                              readOnly
                              className="w-full bg-surface/50 border border-divider rounded-lg px-4 py-2 text-secondary cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-secondary mb-1">Email</label>
                            <input 
                              type="email" 
                              value={USER_DATA.email || "No email provided"}
                              readOnly 
                              className="w-full bg-surface/50 border border-divider rounded-lg px-4 py-2 text-secondary cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-secondary mb-1">Handle (Read-only)</label>
                            <input 
                              type="text" 
                              value={USER_DATA.handle} 
                              readOnly
                              className="w-full bg-surface/50 border border-divider rounded-lg px-4 py-2 text-secondary cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-secondary mb-1">Role (Read-only)</label>
                            <input 
                              type="text" 
                              value={USER_DATA.role ? USER_DATA.role.charAt(0).toUpperCase() + USER_DATA.role.slice(1) : 'User'} 
                              readOnly
                              className="w-full bg-surface/50 border border-divider rounded-lg px-4 py-2 text-secondary cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-secondary mb-1">User ID (Read-only)</label>
                            <input 
                              type="text" 
                              value={USER_DATA.id} 
                              readOnly
                              className="w-full bg-surface/50 border border-divider rounded-lg px-4 py-2 text-secondary cursor-not-allowed font-mono text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-secondary mb-1">Joined Date</label>
                            <input 
                              type="text" 
                              value={USER_DATA.joined} 
                              readOnly
                              className="w-full bg-surface/50 border border-divider rounded-lg px-4 py-2 text-secondary cursor-not-allowed" 
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                    
                    {/* Danger Zone */}
                    <section className="pt-4">
                      <button className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-medium transition-colors cursor-pointer">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        Sign Out
                      </button>
                    </section>
                  </div>
                </div>
              )}

        </main>
      </div>
    </div>
  );
}
