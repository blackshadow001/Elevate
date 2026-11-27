"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  delay = 0,
  className = "",
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const displayRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20px" });
  const shouldReduceMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;

    if (shouldReduceMotion || value <= 0) {
      el.textContent = String(value);
      return;
    }

    if (!hasAnimatedRef.current) {
      el.textContent = "0";
    }

    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const effectiveDuration = value <= 10 ? Math.min(duration, 0.9) : duration;
    const controls = animate(0, value, {
      duration: Math.max(0.65, effectiveDuration),
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (displayRef.current) {
          displayRef.current.textContent = String(Math.round(latest));
        }
      },
      onComplete() {
        if (displayRef.current) {
          displayRef.current.textContent = String(value);
        }
      },
    });

    return () => controls.stop();
  }, [delay, duration, isInView, shouldReduceMotion, value]);

  return (
    <span ref={containerRef} className={`tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      <span ref={displayRef} aria-hidden="true">
        {value}
      </span>
    </span>
  );
}
