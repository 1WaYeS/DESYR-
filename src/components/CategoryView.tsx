import React from 'react';
import { BrandCategory, BrandDefinition } from '../data/brands';
import { NawabpurShopping } from './NawabpurShopping';

interface CategoryViewProps {
  brand: BrandDefinition;
  category: BrandCategory;
  transitionPhase: 'opening' | 'open' | 'closing';
  onBackToMagazine: () => void;
  onBackToFloor: () => void;
  onSwitchCategory: (categorySlug: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  brand,
  category,
  transitionPhase,
  onBackToMagazine,
  onBackToFloor,
  onSwitchCategory,
}) => {
  if (brand.id === 'guzel' && category.slug === 'nawabpur') {
    return <NawabpurShopping onBack={onBackToMagazine} onFloor={onBackToFloor} />;
  }
  return (
    <main
      className={`magazine-interior magazine-interior--${brand.themeVariant} category-view is-${transitionPhase}`}
      style={{ '--brand-accent': brand.accentTone } as React.CSSProperties}
      aria-label={`${brand.name} — ${category.title} Collection`}
    >
      <div className="magazine-interior__spine-seam" aria-hidden="true" />

      <div className="magazine-interior__inner">
        <nav className="magazine-interior__topbar" aria-label="Category navigation">
          <button
            type="button"
            className="magazine-interior__back"
            onClick={onBackToMagazine}
          >
            ← BACK TO MAGAZINE {brand.issueNumber}
          </button>

          <div className="category-view__switcher">
            {brand.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-view__tab ${
                  cat.slug === category.slug ? 'is-active' : ''
                }`}
                onClick={() => onSwitchCategory(cat.slug)}
              >
                <span>{cat.number}</span>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="magazine-interior__back"
            onClick={onBackToFloor}
          >
            FLOOR
          </button>
        </nav>

        {/* Category Editorial Intro */}
        <header className="category-view__header">
          <div className="category-view__lead-copy">
            <p className="category-view__kicker">
              {brand.name} · ISSUE {brand.issueNumber} · COLLECTION {category.number}
            </p>
            <h1 className="category-view__title">{category.title}</h1>
            <p className="category-view__subtitle">{category.subtitle}</p>
            <p className="category-view__caption">{category.editorialCaption}</p>
            <p className="category-view__count">
              {category.products.length > 0 ? `${category.products.length} PIECES FROM ` : 'EXPLORE THE COLLECTION AT '}
              <a
                href={brand.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="category-view__store-link"
              >
                {brand.storeUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '').toUpperCase()} ↗
              </a>
            </p>
          </div>

          <figure className="category-view__hero-photo">
            <img
              src={category.image}
              alt={`${brand.name} ${category.title}`}
              loading="eager"
              decoding="async"
            />
          </figure>
        </header>

        {/* Real Product Collection Grid */}
        {category.products.length === 0 && (
          <p className="category-view__caption">Browse this collection on <a href={brand.storeUrl} target="_blank" rel="noopener noreferrer">{brand.name} ↗</a>.</p>
        )}
        <section
          className="category-view__grid"
          aria-label={`${category.title} products`}
        >
          {category.products.map((product) => (
            <article key={product.id} className="product-card">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card__link"
              >
                <div className="product-card__media">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-card__img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="product-card__meta">
                  <h2 className="product-card__name">{product.name}</h2>
                  <div className="product-card__bottom">
                    <span className="product-card__price">{product.price}</span>
                    <span className="product-card__cta">VIEW PIECE ↗</span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

