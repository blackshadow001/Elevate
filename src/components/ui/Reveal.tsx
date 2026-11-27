"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  variant?: "slide" | "mask";
  immediate?: boolean;
  className?: string;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  variant = "slide",
  immediate = false,
  className = "",
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (variant === "mask") {
    const maskInitial = shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: "100%" };
    const maskTarget = shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: "0%" };

    return (
      <div className={`overflow-hidden ${className}`}>
        <motion.div
          initial={maskInitial}
          {...(immediate
            ? { animate: maskTarget }
            : {
                whileInView: maskTarget,
                viewport: { once: true, margin: "-30px" },
              })}
          transition={{
            duration: shouldReduceMotion ? 0.18 : duration,
            delay: shouldReduceMotion ? 0 : delay,
            ease: EASE_OUT_EXPO,
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  const getInitial = () => {
    if (shouldReduceMotion || direction === "none") return { opacity: 0 };
    switch (direction) {
      case "up":
        return { opacity: 0, y: 20 };
      case "down":
        return { opacity: 0, y: -20 };
      case "left":
        return { opacity: 0, x: 20 };
      case "right":
        return { opacity: 0, x: -20 };
    }
  };

  const getAnimate = () => {
    if (shouldReduceMotion || direction === "none") return { opacity: 1 };
    return { opacity: 1, x: 0, y: 0 };
  };

  return (
    <motion.div
      initial={getInitial()}
      {...(immediate
        ? { animate: getAnimate() }
        : {
            whileInView: getAnimate(),
            viewport: { once: true, margin: "-40px" },
          })}
      transition={{
        duration: shouldReduceMotion ? 0.18 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
