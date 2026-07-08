import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { scrollToSection, scrollToHash } from '@/lib/scroll';
import { getNavLinks, getHomeSectionIds } from '@/lib/content';
import { LEGACY_HASH_TO_PATH, pathToSectionId } from '@/lib/sections';

export function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = getNavLinks();
  const sectionIds = getHomeSectionIds();
  const activeHref = useActiveSection(sectionIds);

  useEffect(() => {
    document.body.classList.add('has-site-nav');
    return () => document.body.classList.remove('has-site-nav');
  }, []);

  useEffect(() => {
    const { hash, pathname } = location;
    if (!hash) return;

    const targetPath = LEGACY_HASH_TO_PATH[hash];
    if (targetPath && targetPath !== pathname) {
      navigate(targetPath, { replace: true });
      return;
    }

    if (!targetPath) {
      requestAnimationFrame(() => scrollToHash(hash));
    }
  }, [location.hash, location.pathname, navigate]);

  useEffect(() => {
    const sectionId = pathToSectionId(location.pathname);
    if (!sectionId) return;
    requestAnimationFrame(() => scrollToSection(sectionId));
  }, [location.pathname]);

  return (
    <>
      <SeoHead path={location.pathname} />
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
