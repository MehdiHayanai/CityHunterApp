"use client";

import React from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => (
  <div className="relative group z-20">
    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
      <i className="fa-solid fa-magnifying-glass"></i>
    </div>
    <input 
      type="text" 
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search name, address, or coords..." 
      className="w-full h-12 bg-surface border border-divider/10 rounded-2xl pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm text-primary placeholder:text-secondary/50"
    />
    <button 
      onClick={() => setSearchQuery('')}
      className={`absolute inset-y-0 right-2 px-3 text-secondary hover:text-primary transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  </div>
);

interface CategoryPillProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryPill = ({ icon, label, isActive, onClick }: CategoryPillProps) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
      isActive 
      ? 'bg-primary text-canvas border-primary shadow-lg transform scale-105' 
      : 'bg-surface text-secondary border-divider/10 hover:border-accent hover:text-primary'
    }`}
  >
    {isActive && <i className="fa-solid fa-check text-[10px] mr-1"></i>}
    <i className={`fa-solid ${icon}`}></i>
    {label}
  </button>
);
