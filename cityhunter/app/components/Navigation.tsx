"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../hooks/useTheme";
import ScrollProgress from "./ScrollProgress";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        {/* Logo */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={scrollToTop}
        >
          <div className="w-10 h-10 bg-primary text-canvas flex items-center justify-center rounded-lg font-black text-xl tracking-tighter group-hover:bg-accent group-hover:text-black transition-colors">
            CH
          </div>
          <span className="font-bold tracking-tight text-lg">CityHunter</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <Link href="#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#game" className="hover:text-primary transition-colors">
            Game
          </Link>
          <Link href="#cities" className="hover:text-primary transition-colors">
            Locations
          </Link>
          <Link href="#community" className="hover:text-primary transition-colors">
            Community
          </Link>
        </div>

        {/* CTA & Theme Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-divider/10 text-secondary hover:text-primary hover:bg-surface hover:border-accent flex items-center justify-center transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <i className="fa-solid fa-moon"></i>
            ) : (
              <i className="fa-solid fa-sun"></i>
            )}
          </button>

          <Link href="/signup" className="hidden md:flex items-center gap-2 bg-surface border border-divider/10 hover:border-accent hover:text-accent px-5 py-2.5 rounded-full text-sm font-bold transition-all group cursor-pointer">
            <span>Create Account</span>
            <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </Link>
          
          <Link href="/login" className="hidden md:flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-accent/90 hover:scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)] cursor-pointer mr-2">
            Login
          </Link>


          {/* Mobile Menu Btn */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-primary text-xl cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-bars"></i>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full mobile-glass p-6 flex flex-col gap-4 shadow-xl border-b border-divider/10">
          <Link
            href="#features"
            className="text-secondary hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#game"
            className="text-secondary hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Game
          </Link>
          <Link
            href="#cities"
            className="text-secondary hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Locations
          </Link>
          <Link
            href="#community"
            className="text-secondary hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Community
          </Link>
          <Link href="/login" className="bg-accent text-black px-5 py-3 rounded-full text-sm font-bold transition-all w-full text-center cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)]" onClick={() => setIsMobileMenuOpen(false)}>
            Login
          </Link>
          <Link href="/signup" className="bg-surface border border-divider/10 hover:border-accent hover:text-accent px-5 py-3 rounded-full text-sm font-bold transition-all w-full text-center cursor-pointer">
            Create Account
          </Link>
        </div>
      )}

      {/* SCROLL PROGRESS BAR */}
      <ScrollProgress />
    </nav>
  );
}
