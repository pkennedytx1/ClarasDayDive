import { useEffect } from 'react';
import { NavBar } from '@/components/NavBar';
import { SeoHead } from '@/components/SeoHead';
import { Hero } from '@/sections/Hero';
import { AskClara } from '@/sections/AskClara';
import { Drinks } from '@/sections/Drinks';
import { WhatsHere } from '@/sections/WhatsHere';
import { Gallery } from '@/sections/Gallery';
import { Events } from '@/sections/Events';
import { Faq } from '@/sections/Faq';
import { Contact } from '@/sections/Contact';
import { Footer } from '@/sections/Footer';
import { useActiveSection } from '@/hooks/useActiveSection';
import { scrollToHash } from '@/lib/scroll';
import { getNavLinks, getHomeSectionIds } from '@/lib/content';

export function HomePage() {
  const navLinks = getNavLinks();
  const sectionIds = getHomeSectionIds();
  const activeHref = useActiveSection(sectionIds);

  useEffect(() => {
    document.body.classList.add('has-site-nav');
    return () => document.body.classList.remove('has-site-nav');
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash));
    }

    const onPopState = () => {
      if (window.location.hash) scrollToHash(window.location.hash);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <>
      <SeoHead />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <NavBar
        logoSrc="/assets/wordmark-color.png"
        links={navLinks}
        activeHref={activeHref}
      />
      <main id="main">
        <Hero />
        <AskClara />
        <hr className="divider" />
        <Drinks />
        <hr className="divider" />
        <WhatsHere />
        <Gallery />
        <Events />
        <hr className="divider" />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
