import React from 'react';
import { BrandDefinition } from '../data/brands';

interface BrandCoverArtworkProps {
  brandId: BrandDefinition['id'];
}

/**
 * Editorial Imprinted Brand Masthead System
 * The models appear directly BEHIND the brand logo and logo name,
 * with authentic editorial print depth, hot-stamped foil shadows, and spot-UV luster.
 */
export const BrandCoverArtwork: React.FC<BrandCoverArtworkProps> = ({ brandId }) => {
  if (brandId === 'guzel') {
    return (
      <div className="cover-art cover-art--guzel" aria-hidden="true">
        {/* Top Folio Header */}
        <header className="cover-folio-strip">
          <span className="cover-folio__issue">ISSUE 01</span>
          <span className="cover-folio__center">ETHNIC &amp; FESTIVE / NAWABPUR 26</span>
          <span className="cover-folio__origin">DHAKA ATELIER</span>
        </header>

        {/* Grand Royal Masthead Imprinted in Front of Model */}
        <div className="cover-imprinted-brand cover-imprinted-brand--guzel">
          <h1 className="cover-wordmark cover-wordmark--guzel">G U Z E L</h1>
          <p className="cover-subline cover-subline--guzel">LUXURY HERITAGE &amp; BRIDAL COUTURE</p>
          <div className="cover-accent-rule cover-accent-rule--guzel" />
        </div>

        {/* Bottom Editorial Callout */}
        <footer className="cover-footer cover-footer--guzel">
          <div className="cover-footer__headlines">
            <span className="cover-footer__kicker">CEREMONIAL ARCHIVE '26</span>
            <span className="cover-footer__title">THE NAWABPUR 26 EDIT</span>
          </div>
          <span className="cover-footer__badge">01</span>
        </footer>

        {/* Glossy Laminate Sheen & Spot UV */}
        <div className="cover-art__film-sheen" />
        <div className="cover-art__spot-uv cover-art__spot-uv--guzel" />
      </div>
    );
  }

  if (brandId === 'wrongs-and-rebels') {
    return (
      <div className="cover-art cover-art--wrongs" aria-hidden="true">
        {/* Top Folio Header */}
        <header className="cover-folio-strip">
          <span className="cover-folio__issue">ISSUE 02 // S/S '26</span>
          <span className="cover-folio__center">PREMIUM URBAN STREETWEAR</span>
          <span className="cover-folio__origin">WRCLO.COM</span>
        </header>

        {/* Modernist Monolithic Masthead Imprinted in Front of Model */}
        <div className="cover-imprinted-brand cover-imprinted-brand--wrongs">
          <h1 className="cover-wordmark cover-wordmark--wrongs">
            Wrongs&amp;Rebels.<sup className="cover-wordmark__tm">™</sup>
          </h1>
          <p className="cover-subline cover-subline--wrongs">
            UNIFORMS OF THE CONCRETE AGE // VOLUME 02
          </p>
          <div className="cover-accent-rule cover-accent-rule--wrongs" />
        </div>

        {/* Bottom Editorial Callout */}
        <footer className="cover-footer cover-footer--wrongs">
          <div className="cover-footer__headlines">
            <span className="cover-footer__kicker">SPRING / SUMMER '26</span>
            <span className="cover-footer__title">BOXY SHIRTS &amp; 14OZ DENIM</span>
          </div>
          <span className="cover-footer__badge">02</span>
        </footer>

        {/* Glossy Laminate Sheen & Spot UV */}
        <div className="cover-art__film-sheen" />
        <div className="cover-art__spot-uv cover-art__spot-uv--wrongs" />
      </div>
    );
  }

  // Gorur Ghash (brandId === 'gorur-ghash')
  return (
    <div className="cover-art cover-art--gorur-ghash" aria-hidden="true">
      {/* Top Folio Header */}
      <header className="cover-folio-strip">
        <span className="cover-folio__issue">ISSUE 03 · ZINE</span>
        <span className="cover-folio__center">CONTEMPORARY ESSENTIALS</span>
        <span className="cover-folio__origin">GORURGHASH.COM</span>
      </header>

      {/* Bold Stylized Cow Emblem & Wordmark Imprinted in Front of Model */}
      <div className="cover-imprinted-brand cover-imprinted-brand--gg">
        <svg
          className="cover-gg-emblem"
          viewBox="0 0 240 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized cow ears/horns & spectacles */}
          <path
            d="M112 48 C96 28, 60 28, 46 49 C33 69, 44 96, 68 100 C88 103, 108 91, 108 75 L78 75"
            stroke="#14110c"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M196 42 C180 24, 146 25, 133 47 C121 67, 133 93, 157 96 C178 99, 196 86, 196 70 L166 70"
            stroke="#14110c"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="122" cy="103" r="5" fill="#14110c" />
          <path
            d="M123 114 C103 110, 82 119, 80 137 C78 156, 97 167, 118 160 C128 157, 134 148, 137 140 C140 148, 146 157, 158 160 C179 166, 197 153, 195 135 C193 116, 172 108, 153 114 C143 117, 139 124, 137 131 C135 124, 131 116, 123 114 Z"
            stroke="#14110c"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="106" cy="138" r="5" fill="#14110c" />
          <circle cx="168" cy="137" r="5" fill="#14110c" />
        </svg>

        <h1 className="cover-wordmark cover-wordmark--gg">GORUR GHASH</h1>
        <p className="cover-subline cover-subline--gg">
          100% NO BULL · ATHLETIC LAB &amp; RELAXED SILHOUETTES
        </p>
      </div>

      {/* Bottom Editorial Callout */}
      <footer className="cover-footer cover-footer--gg">
        <div className="cover-footer__headlines">
          <span className="cover-footer__kicker">MIGHTO &amp; TEXTURED KNITS</span>
          <span className="cover-footer__title">CONTEMPORARY MEN'S '26</span>
        </div>
        <span className="cover-footer__badge">03</span>
      </footer>

      {/* Glossy Laminate Sheen & Spot UV */}
      <div className="cover-art__film-sheen" />
      <div className="cover-art__spot-uv cover-art__spot-uv--gg" />
    </div>
  );
};
