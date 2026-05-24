import React from "react";
import { motion } from "motion/react";

interface InteractiveTextProps {
  text: string;
  className?: string;
}

export default function InteractiveText({ text, className = "" }: InteractiveTextProps) {
  // Split text into letters
  const characters = Array.from(text);

  return (
    <span className={`inline-block select-none ${className}`}>
      {characters.map((char, index) => {
        if (char === " ") {
          return <span key={index} className="inline-block">&nbsp;</span>;
        }

        return (
          <motion.span
            key={index}
            className="inline-block origin-bottom will-change-transform"
            style={{ display: "inline-block" }}
            initial={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: 0,
            }}
            whileHover={{
              y: -16,
              scale: 1.28,
              rotate: index % 2 === 0 ? 8 : -8,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 14,
              }
            }}
            transition={{
              type: "spring",
              stiffness: 12,   // Slow zero-gravity float-back to make text highly readable
              damping: 22,     // High damping to eliminate jarring oscillation
              mass: 1.6,       // High heavy inertia mass to hold the hover state longer in space
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
