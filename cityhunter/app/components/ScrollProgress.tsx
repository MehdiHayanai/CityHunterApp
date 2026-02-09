"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = (scrolled / maxScroll) * 100;
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="absolute bottom-0 left-0 h-[2px] bg-accent z-50 transition-all duration-100 ease-out shadow-[0_0_10px_rgb(var(--c-accent))]"
      style={{ width: `${progress}%` }}
    />
  );
}
