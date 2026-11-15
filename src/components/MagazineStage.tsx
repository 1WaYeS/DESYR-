import React, { useState } from 'react';
import { BRANDS, BrandDefinition } from '../data/brands';
import { Magazine, MagazineOriginRect } from './Magazine';

interface MagazineStageProps {
  openingBrandId: BrandDefinition['id'] | null;
  onSelectBrand: (brand: BrandDefinition, originRect?: MagazineOriginRect) => void;
}

export const MagazineStage: React.FC<MagazineStageProps> = ({
  openingBrandId,
  onSelectBrand,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeBrandId, setActiveBrandId] = useState<BrandDefinition['id'] | null>(
    null
  );

  const handleHoverStart = (id: BrandDefinition['id']) => {
    if (openingBrandId) return;
    setActiveBrandId(id);
  };

  const handleHoverEnd = (id: BrandDefinition['id']) => {
    setActiveBrandId((prev) => (prev === id ? null : prev));
  };

  const handleTapReveal = (id: BrandDefinition['id']) => {
    if (openingBrandId) return;
    setActiveBrandId(id);
  };

  const handleStageBackdropClick = () => {
    if (activeBrandId !== null && !openingBrandId) {
      setActiveBrandId(null);
    }
  };

  const handleNavigate = (brand: BrandDefinition, originRect?: MagazineOriginRect) => {
    if (openingBrandId) return;
    onSelectBrand(brand, originRect);
  };

  return (
    <main
      className="stage"
      onClick={handleStageBackdropClick}
      aria-label="Curated Fashion Publications Floor"
    >
      {/* Proportional 16:9 scene keeping all three physical magazines anchored to the silk drape */}
      <div className="stage__scene">
        <img
          src="./images/desyr-silk-wardrobe-v2.png"
          alt="White silk on dark stone, folded polo shirts in shadow, and a tailor's measuring tape"
          className="stage__backdrop"
          loading="eager"
          decoding="async"
          draggable={false}
        />

        {/* Subtle photographic ambient tone layer */}
        <div className="stage__vignette" aria-hidden="true" />

        <div className="stage__mobile-wardrobe" aria-hidden="true" />
        <button className="stage__garment-tag" onClick={(event) => { event.stopPropagation(); setPickerOpen(value => !value); }} aria-expanded={pickerOpen} aria-controls="desyr-brand-picker" aria-label="DESYR - explore the clothing collections">
          <svg className="stage__tag-cord" viewBox="0 0 100 180" aria-hidden="true"><path d="M 30 0 C 12 39, 49 63, 34 101 S 42 145, 56 165 C 64 177, 43 178, 47 163" /></svg>
          <span className="stage__tag-eyelet" aria-hidden="true" />
          <strong>DESYR</strong><span>WEAR THE STORY.</span><span className="stage__tag-rule" aria-hidden="true" /><small>EXPLORE THE COLLECTIONS &#8594;</small>
        </button>
        {/* Scattered physical magazines */}
        <div className="stage__magazines">
          {BRANDS.map((brand) => (
            <Magazine
              key={brand.id}
              brand={brand}
              isActive={activeBrandId === brand.id}
              isAnyActive={activeBrandId !== null}
              isOpening={openingBrandId === brand.id}
              onHoverStart={handleHoverStart}
              onHoverEnd={handleHoverEnd}
              onTapReveal={handleTapReveal}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </div>

      {pickerOpen && <section className="stage__brand-picker" id="desyr-brand-picker" aria-label="Choose a clothing brand" onClick={event => event.stopPropagation()}><header><span>Choose your story</span><button onClick={() => setPickerOpen(false)} aria-label="Close brand selection">&times;</button></header>{BRANDS.map(brand => <button key={brand.id} onClick={() => { setPickerOpen(false); handleNavigate(brand); }}><span>{brand.name}</span><small>{brand.categories.map(category => category.title).join(' / ')}</small><span aria-hidden="true">&#8599;</span></button>)}</section>}
      {/* Bottom exploration prompt — strictly monochromatic */}
      <div className="stage__prompt" aria-live="polite">
        <span className="stage__prompt-dot" aria-hidden="true" />
        <span className="stage__prompt-desktop">OPEN A MAGAZINE. SHOP THE LOOK.</span>
        <span className="stage__prompt-touch">
          {activeBrandId
            ? 'TAP THE EDITION AGAIN TO ENTER.'
            : 'TAP A MAGAZINE. DISCOVER YOUR LOOK.'}
        </span>
      </div>
    </main>
  );
};
