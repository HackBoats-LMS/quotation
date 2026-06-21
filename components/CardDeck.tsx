"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function CardDeck({ children }: { children: React.ReactNode[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const totalCards = children.length;

  const handleNext = () => {
    if (animatingOut) return;
    setAnimatingOut(true);
    
    // Slide out duration
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
      setAnimatingOut(false);
    }, 300);
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center">
      <div className="relative w-full h-full max-w-sm mx-auto" onClick={handleNext}>
        {children.map((child, idx) => {
          const isTop = idx === activeIndex;
          const isAnimatingOut = isTop && animatingOut;
          
          let depthOffset = (idx - activeIndex + totalCards) % totalCards;
          if (animatingOut && !isTop) {
             // Other cards begin their move upward immediately
             depthOffset = (depthOffset - 1 + totalCards) % totalCards;
          }

          return (
            <motion.div
              key={idx}
              animate={{
                scale: isAnimatingOut ? 1 : 1 - depthOffset * 0.05,
                y: isAnimatingOut ? 0 : depthOffset * 12,
                x: isAnimatingOut ? 150 : 0,
                rotate: isAnimatingOut ? 15 : 0,
                opacity: isAnimatingOut ? 0 : (isTop ? 1 : depthOffset === 1 ? 0.8 : depthOffset === 2 ? 0.4 : 0),
                zIndex: isAnimatingOut ? totalCards + 1 : totalCards - depthOffset,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="absolute inset-0 cursor-pointer shadow-xl rounded-2xl"
              style={{
                pointerEvents: isTop ? "auto" : "none"
              }}
            >
              {child}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {children.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (!animatingOut) setActiveIndex(idx);
              }}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "bg-zinc-400 w-4" : "bg-zinc-700 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold tracking-widest text-zinc-600 animate-pulse uppercase">
          Tap cards to cycle
        </span>
      </div>
    </div>
  );
}
