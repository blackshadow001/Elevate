"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms, default 1800ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1800,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current) {
      setDisplayValue(value);
      return;
    }
    let frameId: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;

          // Check if user prefers reduced motion
          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (prefersReducedMotion) {
            setDisplayValue(value);
            return;
          }

          const startTime = performance.now();
          const startVal = 0;

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic formula
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentNumber = startVal + (value - startVal) * easeProgress;

            setDisplayValue(currentNumber);

            if (progress < 1) {
              frameId = requestAnimationFrame(step);
            } else {
              setDisplayValue(value);
            }
          };

          frameId = requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
