import React, { useEffect, useState, useRef } from 'react';
import { BrandDefinition } from '../data/brands';
import { BrandCoverArtwork } from '../assets/BrandMarks';
import { MagazineOriginRect } from './Magazine';
import { EditorialInterior } from './EditorialInterior';
import { FlipMagazine } from './FlipMagazine';
export interface BrandPageProps {
 brand: BrandDefinition; originRect?: MagazineOriginRect | null; isClosing?: boolean;
 onFinishClose?: () => void; onBack: () => void; onSelectCategory?: (slug: string) => void; onSelectBrand?: (slug: string) => void;
 categorySlug: string | null; onBookRouteChange: (slug: string | null) => void;
}
export const BrandPage: React.FC<BrandPageProps> = ({ brand, originRect, isClosing = false, onFinishClose, onBack, onSelectCategory, categorySlug, onBookRouteChange }) => {
 const [stage, setStage] = useState(originRect ? 'mounting' : 'opened');
 const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left');
 const timersRef = useRef<number[]>([]);
 useEffect(() => {
 const handle = (e: KeyboardEvent) => { if(stage === 'opened') return; if(e.key === 'Escape') onBack(); if(e.key === 'ArrowRight') setMobileSide('right'); if(e.key === 'ArrowLeft') setMobileSide('left'); };
 window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
 }, [onBack, stage]);
  // Initial Lift & Open Animation Sequence
  useEffect(() => {
    if (!originRect) {
      setStage('opened');
      return;
    }

    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        setStage('lifting');
      });
      timersRef.current.push(r2);
    });

    // 620ms: Magazine reaches center and swings open cover
    const t1 = window.setTimeout(() => {
      setStage('opening');
    }, 620);

    // 1400ms: Fully open and interactive
    const t2 = window.setTimeout(() => {
      setStage('opened');
    }, 1400);

    return () => {
      cancelAnimationFrame(r1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [originRect]);

  // Closing sequence back to table
  useEffect(() => {
    if (isClosing) {
      setStage('closing-cover');

      const t1 = window.setTimeout(() => {
        setStage('closing-drop');
      }, 420);

      const t2 = window.setTimeout(() => {
        onFinishClose?.();
      }, 980);

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
  }, [isClosing, onFinishClose]);

  const originStyle = originRect
    ? ({
        '--origin-x': `${originRect.left}px`,
        '--origin-y': `${originRect.top}px`,
        '--origin-w': `${originRect.width}px`,
        '--origin-h': `${originRect.height}px`,
        '--origin-transform': originRect.transform,
        '--spine-color': brand.spineColor,
        '--brand-accent': brand.accentTone,
      } as React.CSSProperties)
    : ({
        '--spine-color': brand.spineColor,
        '--brand-accent': brand.accentTone,
      } as React.CSSProperties);


 if (stage === 'opened' && !isClosing) return <FlipMagazine brand={brand} categorySlug={categorySlug} onRouteChange={onBookRouteChange} onClose={onBack} />;
 return <div className={`magazine-viewer magazine-edition is-${stage} magazine-viewer--${brand.themeVariant} edition-mobile--${mobileSide}`} style={originStyle} role="dialog" aria-modal="true" aria-label={`${brand.name} magazine`}>
 <div className="magazine-viewer__scrim" onClick={onBack} aria-hidden="true" />
 <header className="magazine-viewer__topbar">
 <button className="magazine-viewer__back-btn" onClick={onBack}>&larr; RETURN TO TABLE</button>
 <div className="magazine-viewer__folio-group"><span className="magazine-viewer__issue-pill">ISSUE {brand.issueNumber}</span><span className="magazine-viewer__brand-title">{brand.name}</span></div>
 <button className="magazine-viewer__close-icon-btn" onClick={onBack} aria-label="Close magazine">&times;</button>
 </header>
 <div className="magazine-viewer__book">
 <div className="magazine-viewer__shadow" aria-hidden="true" />
 <div className="magazine-viewer__interior-spread"><EditorialInterior brand={brand} side="right" onSelect={onSelectCategory} /></div>
 <div className="magazine-viewer__cover">
 <div className="magazine-viewer__cover-face magazine-viewer__cover-face--front"><img className="magazine-viewer__cover-texture" src={brand.coverTexture} alt="" /><BrandCoverArtwork brandId={brand.id} /><span className="magazine__window-shadow" aria-hidden="true" /></div>
 <div className="magazine-viewer__cover-face magazine-viewer__cover-face--inside"><EditorialInterior brand={brand} side="left" onSelect={onSelectCategory} /></div>
 </div></div>
 <nav className="edition-mobile-navigation" aria-label="Magazine pages"><button onClick={() => setMobileSide('left')} aria-pressed={mobileSide === 'left'}>&larr; Page 02</button><button onClick={() => setMobileSide('right')} aria-pressed={mobileSide === 'right'}>Page 03 &rarr;</button></nav>
 <nav className="magazine-category-bar" aria-label="Shop magazine collections"><div className="magazine-category-bar__inner"><span className="category-bar__label">COLLECTIONS</span><div className="category-bar__tabs">{brand.categories.map(cat => <button className="category-bar__tab" key={cat.id} onClick={() => onSelectCategory?.(cat.slug)}><span className="category-bar__num">{cat.number}</span><span className="category-bar__title">{cat.title}</span><span aria-hidden="true">&#8599;</span></button>)}</div></div></nav>
 </div>;
};
