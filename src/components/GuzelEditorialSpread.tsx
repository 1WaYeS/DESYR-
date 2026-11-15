import React from 'react';
import { BrandDefinition } from '../data/brands';

export interface GuzelEditorialPageProps {
  brand: BrandDefinition;
  onSelectCategory?: (categorySlug: string) => void;
  isMobileActive?: boolean;
}

/**
 * GUZEL LEFT PAGE (Page 01): Ethnic & Festive Wear
 * Exact specifications:
 * - High-Res Fabric Swatch: 165px x 115px embroidered fabric detail image flush next to 32px x 115px #521E22 maroon rectangle (gap: 10px)
 * - Sharp Rendering: image-rendering: -webkit-optimize-contrast; object-fit: cover; filter: contrast(1.04);
 * - Background: Warm parchment cream (#EDE6DC)
 * - Spine Crease Shadow: linear-gradient(90deg, rgba(0,0,0,0.09) 0%, transparent 4.5%, transparent 95.5%, rgba(0,0,0,0.09) 100%)
 * - Burgundy Maroon Accents: #521E22
 * - Off-Black Ink: #1C1A18 for all titles, subtitles, and body text
 * - Micro-Text & Rules: #2B2825 for labels, 1px solid #9E9589 for rules
 * - Giant Drop-Cap 'E': Playfair Display, 195px, #521E22, top: -18px, left: -4px
 * - Overlapping Title: "THNIC & FESTIVE WEAR" in Cormorant Garamond, 24px, #1C1A18, padding-left: 78px, padding-top: 56px, max-width: 240px
 * - Italic Subtitle: "Tradition in Every Thread.", 17.5px, max-width: 170px, margin: 18px 0 26px 0
 * - Body Paragraphs: 14px, line-height: 1.48, max-width: 175px (wraps 5-6 lines), margin-bottom: 18px
 * - Top Header: GUZEL (12px, letter-spacing: 0.28em, #2B2825) next to horizontal rule
 * - Bottom Footer: Full-width 1px solid #9E9589 rule above the footer row, with 11.5px (#2B2825) GUZEL and 01 below
 * - Main Portrait: Tall column with arched top frame (border-radius: 140px 140px 0 0)
 */
export const GuzelLeftEditorialPage: React.FC<GuzelEditorialPageProps> = ({
  onSelectCategory,
  isMobileActive = true,
}) => {
  const handleClick = () => {
    onSelectCategory?.('festive');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={`guzel-spread-page guzel-page--left ${
        isMobileActive ? 'is-mobile-visible' : 'is-mobile-hidden'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Page 01: Ethnic & Festive Wear Collection"
    >
      {/* Texture grain & warm parchment cream paper substrate (#EDE6DC) */}
      <div className="guzel-page__grain" aria-hidden="true" />

      {/* Top Folio Header: GUZEL ————————— */}
      <header className="guzel-page__header guzel-page__header--left">
        <span
          className="guzel-header-brand"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#2B2825',
          }}
        >
          GUZEL
        </span>
        <div
          className="guzel-header-hairline"
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#9E9589',
          }}
          aria-hidden="true"
        />
      </header>

      {/* Left Column (38%): Typographic & Editorial Notes */}
      <div className="guzel-editorial-col guzel-editorial-col--left">
        {/* Exact Overlapping Drop-Cap Header Wrapper (height: 175px) */}
        <div
          className="editorial-header"
          style={{ position: 'relative', height: '175px', marginBottom: '16px' }}
        >
          {/* Giant Initial Letter 'E' in Deep Burgundy Maroon (#521E22) */}
          <span
            className="drop-cap editorial-header__giant-letter"
            style={{
              position: 'absolute',
              top: '-18px',
              left: '-4px',
              zIndex: 1,
              fontFamily: "'Playfair Display', serif",
              fontSize: '195px',
              fontWeight: 400,
              lineHeight: 0.85,
              color: '#521E22',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            E
          </span>

          {/* Overlapping Category Title (First letter omitted: reads directly off giant maroon initial) */}
          <h2
            className="editorial-header__title"
            style={{
              position: 'relative',
              zIndex: 2,
              paddingLeft: '78px',
              paddingTop: '56px',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: '#1C1A18',
              maxWidth: '240px',
              margin: 0,
            }}
          >
            THNIC &amp;
            <br />
            FESTIVE
            <br />
            WEAR
          </h2>
        </div>

        {/* Italic Subtitle */}
        <p
          className="guzel-tagline"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '17.5px',
            lineHeight: 1.28,
            color: '#1C1A18',
            margin: '18px 0 26px 0',
            maxWidth: '170px',
          }}
        >
          Tradition in
          <br />
          Every Thread.
        </p>

        {/* Thin Divider Line (1px solid #9E9589) */}
        <div
          className="guzel-divider-rule"
          style={{
            width: '78%',
            height: '1px',
            backgroundColor: '#9E9589',
            margin: '0 0 22px 0',
          }}
          aria-hidden="true"
        />

        {/* Editorial Body Text (Narrower 175px measure: wraps 5-6 lines) */}
        <div className="guzel-copy-block">
          <p
            className="guzel-body-para"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: 1.48,
              color: '#1C1A18',
              maxWidth: '175px',
              marginBottom: '18px',
            }}
          >
            Rooted in heritage, designed for today — our Ethnic &amp; Festive
            wear collection blends timeless craftsmanship with modern elegance.
          </p>
          <p
            className="guzel-body-para"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: 1.48,
              color: '#1C1A18',
              maxWidth: '175px',
              marginBottom: '18px',
            }}
          >
            From festive celebrations to cherished traditions, step into
            sophistication with Guzel.
          </p>
        </div>
      </div>

      {/* Bottom Left Detail Inset: Crisp high-res fabric detail (165px x 115px) flush next to #521E22 maroon bar (32px x 115px, gap: 10px) */}
      <div
        className="guzel-swatch-combo--left"
        style={{
          position: 'absolute',
          bottom: '8.5%',
          left: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
        }}
      >
        <div
          className="guzel-accent-bar--swatch"
          style={{
            width: '32px',
            height: '115px',
            backgroundColor: '#521E22',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <div
          className="guzel-swatch-box--left"
          style={{
            width: '165px',
            height: '115px',
            overflow: 'hidden',
            backgroundColor: '#181614',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <img
            src="./images/guzel-highres-embroidery-focus.jpg"
            alt="Crisp embroidered fabric detail"
            className="guzel-swatch-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.04)',
              display: 'block',
            }}
            loading="eager"
          />
        </div>
      </div>

      {/* Main Hero Photograph (62%): Tall column with arched top frame */}
      <div className="guzel-hero-frame guzel-hero-frame--left">
        <img
          src="./images/guzel-ethnic-editorial.jpg"
          alt="Male model in black embroidered kurta and cream trousers standing among traditional carpets"
          className="guzel-hero-img"
          loading="eager"
        />
        <div className="guzel-hero-vignette" aria-hidden="true" />
        <div className="guzel-hover-tag" aria-hidden="true">
          <span>EXPLORE ETHNIC &amp; FESTIVE ↗</span>
        </div>
      </div>

      {/* Bottom Folio: Full-width 1px solid #9E9589 rule above footer row, with GUZEL and 01 below */}
      <footer className="guzel-page__footer guzel-page__footer--left">
        <div
          className="guzel-footer-divider"
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#9E9589',
            marginBottom: '8px',
          }}
          aria-hidden="true"
        />
        <div
          className="guzel-footer-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span
            className="guzel-footer-brand"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '11.5px',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#2B2825',
            }}
          >
            GUZEL
          </span>
          <div
            className="guzel-folio-number"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '11.5px',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#2B2825',
            }}
            aria-label="Page 1"
          >
            01
          </div>
        </div>
      </footer>

      {/* Spine Crease Depth Shadow on Right Edge */}
      <div className="guzel-spine-shadow guzel-spine-shadow--right" aria-hidden="true" />
    </article>
  );
};

/**
 * GUZEL RIGHT PAGE (Page 02): Groomsline & Couture
 * Exact specifications:
 * - Layered Cards at Bottom-Left: Square close-up card (140px x 140px) overlapped on right edge by 25px with taller dark textured fabric card (125px x 180px, 1.5px solid #EDE6DC border)
 * - Upper-Right Maroon Bar: Solid #521E22 vertical maroon rectangle (16px x 105px) in upper-right margin
 * - Right-Edge Damask Watermark: Vertical floral damask watermark (opacity: 0.14) running along far-right border top to bottom
 * - Background: Warm parchment cream (#EDE6DC)
 * - Spine Crease Shadow: linear-gradient(90deg, rgba(0,0,0,0.09) 0%, transparent 4.5%, transparent 95.5%, rgba(0,0,0,0.09) 100%)
 * - Burgundy Maroon Accents: #521E22
 * - Off-Black Ink: #1C1A18 for all titles, subtitles, and body text
 * - Micro-Text & Rules: #2B2825 for labels, 1px solid #9E9589 for rules
 * - Giant Drop-Cap 'G': Playfair Display, 195px, #521E22, top: -18px, left: -4px
 * - Overlapping Title: "ROOMSLINE & COUTURE" in Cormorant Garamond, 24px, #1C1A18, padding-left: 78px, padding-top: 56px, max-width: 240px
 * - Italic Subtitle: "For the Modern Gentleman.", 17.5px, max-width: 170px, margin: 18px 0 26px 0
 * - Body Paragraphs: 14px, line-height: 1.48, max-width: 175px (wraps 5-6 lines), margin-bottom: 18px
 * - Top Header: Horizontal rule next to GUZEL (12px, letter-spacing: 0.28em, #2B2825)
 * - Bottom Footer: Full-width 1px solid #9E9589 rule above the footer row, with 11.5px (#2B2825) GUZEL — ELEGANCE, REDEFINED. and 02 below
 * - Main Portrait: Sharp rectangular full-height portrait
 */
export const GuzelRightEditorialPage: React.FC<GuzelEditorialPageProps> = ({
  onSelectCategory,
  isMobileActive = true,
}) => {
  const handleClick = () => {
    onSelectCategory?.('groomsline');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={`guzel-spread-page guzel-page--right ${
        isMobileActive ? 'is-mobile-visible' : 'is-mobile-hidden'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Page 02: Groomsline & Couture Collection"
    >
      {/* Texture grain & warm parchment cream paper substrate (#EDE6DC) */}
      <div className="guzel-page__grain" aria-hidden="true" />

      {/* Subtle Tonal Floral Damask Watermark along far-right border from top to bottom (opacity: 0.14) */}
      <div className="guzel-damask-watermark" aria-hidden="true" />

      {/* Solid #521E22 Vertical Maroon Rectangle (16px x 105px) in Upper-Right Margin */}
      <div
        className="guzel-accent-bar--top-right"
        style={{
          position: 'absolute',
          top: '7.0%',
          right: '2.0%',
          width: '16px',
          height: '105px',
          backgroundColor: '#521E22',
          zIndex: 10,
        }}
        aria-hidden="true"
      />

      {/* Top Folio Header: ————————— GUZEL */}
      <header className="guzel-page__header guzel-page__header--right">
        <div
          className="guzel-header-hairline"
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#9E9589',
          }}
          aria-hidden="true"
        />
        <span
          className="guzel-header-brand"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#2B2825',
          }}
        >
          GUZEL
        </span>
      </header>

      {/* Left Column (38%): Typographic & Editorial Notes */}
      <div className="guzel-editorial-col guzel-editorial-col--right">
        {/* Exact Overlapping Drop-Cap Header Wrapper (height: 175px) */}
        <div
          className="editorial-header"
          style={{ position: 'relative', height: '175px', marginBottom: '16px' }}
        >
          {/* Giant Initial Letter 'G' in Deep Burgundy Maroon (#521E22) */}
          <span
            className="drop-cap editorial-header__giant-letter"
            style={{
              position: 'absolute',
              top: '-18px',
              left: '-4px',
              zIndex: 1,
              fontFamily: "'Playfair Display', serif",
              fontSize: '195px',
              fontWeight: 400,
              lineHeight: 0.85,
              color: '#521E22',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            G
          </span>

          {/* Overlapping Category Title (First letter omitted: reads directly off giant maroon initial) */}
          <h2
            className="editorial-header__title"
            style={{
              position: 'relative',
              zIndex: 2,
              paddingLeft: '78px',
              paddingTop: '56px',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: '#1C1A18',
              maxWidth: '260px',
              margin: 0,
            }}
          >
            ROOMSLINE&nbsp;&amp;
            <br />
            COUTURE
          </h2>
        </div>

        {/* Italic Subtitle */}
        <p
          className="guzel-tagline"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '17.5px',
            lineHeight: 1.28,
            color: '#1C1A18',
            margin: '18px 0 26px 0',
            maxWidth: '170px',
          }}
        >
          For the
          <br />
          Modern Gentleman.
        </p>

        {/* Thin Divider Line (1px solid #9E9589) */}
        <div
          className="guzel-divider-rule"
          style={{
            width: '78%',
            height: '1px',
            backgroundColor: '#9E9589',
            margin: '0 0 22px 0',
          }}
          aria-hidden="true"
        />

        {/* Editorial Body Text (Narrower 175px measure: wraps 5-6 lines) */}
        <div className="guzel-copy-block">
          <p
            className="guzel-body-para"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: 1.48,
              color: '#1C1A18',
              maxWidth: '175px',
              marginBottom: '18px',
            }}
          >
            Refined silhouettes. Elevated details. Our Groomsline &amp;
            Couture collection is crafted for the man who values elegance in
            every occasion.
          </p>
          <p
            className="guzel-body-para"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: 1.48,
              color: '#1C1A18',
              maxWidth: '175px',
              marginBottom: '18px',
            }}
          >
            Because true style never goes out of fashion.
          </p>
        </div>
      </div>

      {/* Main Hero Photograph (62%): Sharp rectangular full-height portrait */}
      <div className="guzel-hero-frame guzel-hero-frame--right">
        <img
          src="./images/guzel-groomsline-editorial.jpg"
          alt="Male model wearing dark tailored outfit with grey trousers and red pocket flower"
          className="guzel-hero-img"
          loading="eager"
        />
        <div className="guzel-hero-vignette" aria-hidden="true" />
        <div className="guzel-hover-tag" aria-hidden="true">
          <span>EXPLORE GROOMSLINE &amp; COUTURE ↗</span>
        </div>
      </div>

      {/* Right Page Bottom-Left Layered Cards: Square card (140px x 140px) overlapped on right edge by 25px with taller textured card (125px x 180px) */}
      <div
        className="guzel-layered-cards--right"
        style={{
          position: 'absolute',
          bottom: '7.8%',
          left: '7.0%',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 15,
        }}
      >
        {/* Square close-up card (140px x 140px) */}
        <div
          className="guzel-card--square"
          style={{
            width: '140px',
            height: '140px',
            overflow: 'hidden',
            backgroundColor: '#181614',
            border: '1.5px solid #EDE6DC',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.28)',
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          <img
            src="./images/guzel-highres-pocket-square.jpg"
            alt="Pocket square close-up detail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.04)',
              display: 'block',
            }}
            loading="eager"
          />
        </div>

        {/* Taller dark textured fabric card (125px x 180px) overlapping right edge by 25px */}
        <div
          className="guzel-card--tall"
          style={{
            width: '125px',
            height: '180px',
            marginLeft: '-25px',
            overflow: 'hidden',
            backgroundColor: '#181614',
            border: '1.5px solid #EDE6DC',
            boxShadow: '0 8px 26px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          <img
            src="./images/guzel-highres-pocket.jpg"
            alt="Dark textured suiting fabric detail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '20% 50%',
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.04)',
              display: 'block',
            }}
            loading="eager"
          />
        </div>
      </div>

      {/* Bottom Folio: Full-width 1px solid #9E9589 rule above footer row, with GUZEL — ELEGANCE, REDEFINED. and 02 below */}
      <footer className="guzel-page__footer guzel-page__footer--right">
        <div
          className="guzel-footer-divider"
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#9E9589',
            marginBottom: '8px',
          }}
          aria-hidden="true"
        />
        <div
          className="guzel-footer-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span
            className="guzel-footer-tagline"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '11.5px',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#2B2825',
            }}
          >
            GUZEL — ELEGANCE, REDEFINED.
          </span>
          <div
            className="guzel-folio-number"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '11.5px',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#2B2825',
            }}
            aria-label="Page 2"
          >
            02
          </div>
        </div>
      </footer>

      {/* Spine Crease Depth Shadow on Left Edge */}
      <div className="guzel-spine-shadow guzel-spine-shadow--left" aria-hidden="true" />
    </article>
  );
};
