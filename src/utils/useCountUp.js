import { useState, useEffect } from "react";

export function useCountUp(targetValue, duration = 600) {
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") return targetValue;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return prefersReducedMotion || targetValue === 0 ? targetValue : 0;
  });

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    let startTime = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      const currentCount = Math.floor(easedProgress * targetValue);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration]);

  return count;
}
