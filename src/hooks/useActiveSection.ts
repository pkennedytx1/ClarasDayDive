import { useEffect, useState } from 'react';

/** Highlights the nav link for whichever section is currently in view. */
export function useActiveSection(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0] ?? '#top');

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.querySelector(id))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActive(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: '-32% 0px -52% 0px',
        threshold: [0, 0.15, 0.35],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}
