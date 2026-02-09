import React from "react";

import { CityItem } from "../interfaces/CityItem";
import { DEFAULT_CITIES } from "../constants/cities";

interface MarqueeProps {
  items?: CityItem[];
}

export default function Marquee({ items = DEFAULT_CITIES }: MarqueeProps) {
  // Triple the items to ensure smooth infinite scrolling even on wide screens
  const displayItems = [...items, ...items, ...items];

  return (
    <div
      id="cities"
      className="py-8 bg-surface border-y border-divider/5 overflow-hidden"
    >
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {displayItems.map((item, index) => (
          <span
            key={`${item.city}-${index}`}
            className={`text-4xl font-black ${
              item.active ? "text-accent" : "text-transparent text-stroke"
            }`}
          >
            {item.city}
          </span>
        ))}
      </div>
    </div>
  );
}
