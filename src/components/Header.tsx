import React, { useEffect, useState } from 'react';
import { PriceAlertsBell } from '../features/price-alerts/PriceAlertsUI';
import { BRANDS } from '../data/brands';
interface HeaderProps { currentSlug: string | null; onNavigateHome: () => void; onNavigateBrand: (slug: string) => void; }
export const Header: React.FC<HeaderProps> = ({ currentSlug, onNavigateHome, onNavigateBrand }) => {
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setBrandsOpen(false); setStoryOpen(false); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return <>
    <header className="site-header desyr-header">
      <button className="site-logo desyr-logo" onClick={() => { setBrandsOpen(false); onNavigateHome(); }} aria-label="DESYR Home"><span className="desyr-logo__word">DESYR</span><span className="desyr-logo__caption">CURATED CLOTHING</span></button>
      <nav className="site-nav desyr-nav" aria-label="Primary navigation">
        <div className="site-nav__dropdown">
          <button className="site-nav__link" aria-expanded={brandsOpen} aria-controls="desyr-header-brands" onClick={() => setBrandsOpen(value => !value)}>Shop brands</button>
          {brandsOpen && <div className="site-nav__menu" id="desyr-header-brands" aria-label="Clothing brands">{BRANDS.map(brand => <button key={brand.id} className={`site-nav__menu-item ${currentSlug === brand.slug ? 'is-active' : ''}`} onClick={() => { setBrandsOpen(false); onNavigateBrand(brand.slug); }}><span className="site-nav__menu-num">{brand.issueNumber}</span><span>{brand.name}</span></button>)}</div>}
        </div>
        <PriceAlertsBell /><button className="site-nav__link" onClick={() => { setBrandsOpen(false); setStoryOpen(true); }}>Our story</button>
      </nav>
    </header>
    {storyOpen && <div className="desyr-story-scrim" onClick={() => setStoryOpen(false)}><section className="desyr-story" role="dialog" aria-modal="true" aria-labelledby="desyr-story-title" onClick={event => event.stopPropagation()}><button className="desyr-story__close" onClick={() => setStoryOpen(false)} aria-label="Close our story">&times;</button><span className="desyr-logo__word">DESYR</span><h2 id="desyr-story-title">Wear the story.</h2><p>Three clothing brands, each with a story of its own. Discover Guzel, GoruGhash and Wrongs &amp; Rebels through magazines you can open, turn and shop.</p><p>Choose a brand, explore its collections, and select a look to see the details. Your selection bag stays on this device; complete purchases on the brand's store.</p><button className="desyr-story__action" onClick={() => { setStoryOpen(false); setBrandsOpen(true); }}>Explore the brands &rarr;</button></section></div>}
  </>;
};
