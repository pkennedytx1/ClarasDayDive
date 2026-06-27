import { useEffect, useState } from 'react';

/** Hides the fixed nav when scrolling down; reveals it when scrolling up or near the top. */
export function useNavScrollHide(disabled = false): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (disabled) {
      setHidden(false);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let lastY = window.scrollY;
    let ticking = false;
    const threshold = 6;
    const revealTop = 48;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (y < revealTop) {
        setHidden(false);
      } else if (delta > threshold) {
        setHidden(true);
      } else if (delta < -threshold) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [disabled]);

  return hidden;
}
