"use client";

import React, { useRef, MouseEvent, useEffect, useState } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

export default function SpotlightCard({
  children,
  className = "",
  delay = 0,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // If the user passes 'animate-on-scroll' in className, we handle the is-visible toggle
  const computedClassName = className.includes("animate-on-scroll")
    ? `${className} ${isVisible ? "is-visible" : ""}`
    : className;

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${computedClassName}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}

