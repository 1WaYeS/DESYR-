import React, { useRef } from 'react';
import { BrandDefinition } from '../data/brands';
import { BrandCoverArtwork } from '../assets/BrandMarks';

export interface MagazineOriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
  transform: string;
}

interface MagazineProps {
  brand: BrandDefinition;
  isActive: boolean;
  isAnyActive: boolean;
  isOpening: boolean;
  onHoverStart: (id: BrandDefinition['id']) => void;
  onHoverEnd: (id: BrandDefinition['id']) => void;
  onTapReveal: (id: BrandDefinition['id']) => void;
  onNavigate: (brand: BrandDefinition, originRect?: MagazineOriginRect) => void;
}

export const Magazine: React.FC<MagazineProps> = ({
  brand,
  isActive,
  isAnyActive,
  isOpening,
  onHoverStart,
  onHoverEnd,
  onTapReveal,
  onNavigate,
}) => {
  const lastPointerTypeRef = useRef<string>('mouse');

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    lastPointerTypeRef.current = e.pointerType || 'mouse';
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse') {
      onHoverStart(brand.id);
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.removeProperty('--window-shadow-x');
    e.currentTarget.style.removeProperty('--window-shadow-y');
    if (e.pointerType === 'mouse') {
      onHoverEnd(brand.id);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const isTouch =
      lastPointerTypeRef.current === 'touch' ||
      lastPointerTypeRef.current === 'pen';

    if (isTouch && !isActive) {
      onTapReveal(brand.id);
      return;
    }

    const scene = e.currentTarget.closest('.stage__scene');
    const sceneRect = scene?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const originRect: MagazineOriginRect = {
      left: Math.round(sceneRect.left + e.currentTarget.offsetLeft),
      top: Math.round(sceneRect.top + e.currentTarget.offsetTop),
      width: Math.round(e.currentTarget.offsetWidth),
      height: Math.round(e.currentTarget.offsetHeight),
      transform: isActive
        ? brand.stagePlacement.hoverTransform
        : brand.stagePlacement.baseTransform,
    };

    onNavigate(brand, originRect);
  };

  const revealed = isActive || isOpening;

  return (
    <button
      type="button"
      className={`magazine magazine--${brand.id} ${revealed ? 'is-revealed' : ''} ${isAnyActive && !revealed ? 'is-resting' : ''
        } ${isOpening ? 'is-opening' : ''}`}
      aria-label={`${brand.name} — ${brand.tagline}. ${revealed ? 'Open magazine' : 'Reveal edition in colour'
        }`}
      style={
        {
          '--mag-left': brand.stagePlacement.left,
          '--mag-top': brand.stagePlacement.top,
          '--mag-width': brand.stagePlacement.width,
          '--mag-aspect': brand.stagePlacement.aspectRatio,
          '--mag-z': brand.stagePlacement.zIndex,
          '--mag-transform-base': brand.stagePlacement.baseTransform,
          '--mag-transform-hover': brand.stagePlacement.hoverTransform,
          '--mag-transform-open': brand.stagePlacement.openTransform,
          '--mag-tab-left': brand.tabletPlacement.left,
          '--mag-tab-top': brand.tabletPlacement.top,
          '--mag-tab-width': brand.tabletPlacement.width,
          '--mag-spine-color': brand.spineColor,
          '--brand-accent': brand.accentTone,
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        event.currentTarget.style.setProperty('--window-shadow-x', `${(-x * 4).toFixed(1)}px`);
        event.currentTarget.style.setProperty('--window-shadow-y', `${(-y * 3).toFixed(1)}px`);
      }}
      onPointerLeave={handlePointerLeave}
      onFocus={() => onHoverStart(brand.id)}
      onBlur={() => onHoverEnd(brand.id)}
      onClick={handleClick}
    >
      {/* Multi-layered natural floor shadows anchored in the magazine's perspective plane */}
      <span className="magazine__shadow-ambient" aria-hidden="true" />
      <span className="magazine__shadow-contact" aria-hidden="true" />

      {/*
        3D physical volume container (kept filter-free so CSS preserve-3d never flattens).
        Grayscale-to-colour transitions are applied directly on each physical surface.
      */}
      <span className="magazine__volume">
        {/* Back hardcover board resting on the silk surface */}
        <span className="magazine__back-board" aria-hidden="true" />

        {/* Left rounded hardcover spine */}
        <span className="magazine__spine" aria-hidden="true" />

        {/* Stacked paper block edges recessed slightly inside the cover overhang */}
        <span
          className={`magazine__pages-bottom magazine__pages-bottom--${brand.pageEdgeTone}`}
          aria-hidden="true"
        />
        <span
          className={`magazine__pages-right magazine__pages-right--${brand.pageEdgeTone}`}
          aria-hidden="true"
        />

        {/* Interior paper page revealed as the front cover swings open (right page of spread) */}
        <span
          className={`magazine__inner-page magazine__inner-page--${brand.themeVariant}`}
          aria-hidden="true"
        >
          <span className="magazine__inner-shadow" aria-hidden="true" />
          <span className="magazine__inner-gutter" aria-hidden="true" />

          <span className="magazine__inner-body">
            <span className="magazine__inner-header">
              <span className="magazine__inner-page-eyebrow">
                ISSUE {brand.issueNumber} · ARCHIVE
              </span>
              <span className="magazine__inner-page-title">CONTENTS</span>
              <span className="magazine__inner-page-rule" />
            </span>

            <span className="magazine__inner-page-cats">
              {brand.categories.map((cat, idx) => (
                <span key={cat.id} className="magazine__inner-cat-row">
                  <span className="magazine__inner-cat-idx">0{idx + 1}</span>
                  <span className="magazine__inner-cat-name">{cat.title}</span>
                </span>
              ))}
            </span>

            <span className="magazine__inner-footer">
              <span className="magazine__inner-enter">ENTER EDITION ↗</span>
            </span>
          </span>
        </span>

        {/* Hinged front cover swinging open around the spine */}
        <span className="magazine__cover">
          {/* Front face of the cover (visible when closed, rotates away when opening) */}
          <span className="magazine__cover-face magazine__cover-face--front">
            <img
              className="magazine__cover-texture"
              src={brand.coverTexture}
              alt=""
              loading="eager"
              decoding="async"
              draggable={false}
            />

            <BrandCoverArtwork brandId={brand.id} />
            <span className="magazine__window-shadow" aria-hidden="true" />

            {/* Binding hinge groove & directional studio window lighting */}
            <span className="magazine__hinge" aria-hidden="true" />
            <span className="magazine__lighting" aria-hidden="true" />
            <span className="magazine__cover-turn-sheen" aria-hidden="true" />
          </span>

          {/* Inside front cover (left-hand page of opened spread) */}
          <span
            className={`magazine__cover-face magazine__cover-face--inside magazine__cover-face--inside-${brand.themeVariant}`}
            aria-hidden="true"
          >
            <span className="magazine__inside-gutter" />
            <span className="magazine__inside-body">
              <span className="magazine__inside-issue">
                {brand.season.toUpperCase()}
              </span>
              <span className="magazine__inside-title">{brand.displayTitle}</span>
              <span className="magazine__inside-rule" />
              <span className="magazine__inside-subhead">
                {brand.editorialSubhead}
              </span>
              <span className="magazine__inside-origin">{brand.origin}</span>
            </span>
          </span>
        </span>
      </span>

      {/* Strictly monochromatic editorial explore indicator */}
      <span className="magazine__explore" aria-hidden="true">
        <span className="magazine__explore-num">{brand.issueNumber}</span>
        <span className="magazine__explore-label">
          <span className="magazine__explore-desktop">EXPLORE</span>
          <span className="magazine__explore-touch">
            {revealed ? 'TAP TO ENTER' : 'EXPLORE'}
          </span>
        </span>
        <span className="magazine__explore-arrow">↗</span>
      </span>
    </button>
  );
};
