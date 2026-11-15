import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
import 'page-flip/src/Style/stPageFlip.css';
import { BrandDefinition } from '../data/brands';
import { EditorialInterior } from './EditorialInterior';
import { CategoryShopping, BrandBagProvider } from './CategoryShopping';
import { CompleteLookSpread } from './CompleteLookSpread';
import { SHOPPING_CATALOG, type ShoppingProduct } from '../data/shopping-catalog';
import { COMPLETE_LOOK_SUFFIX, supportsCompleteLook } from '../data/outfit-recommendations';
import { PriceAlertsBell } from '../features/price-alerts/PriceAlertsUI';
import './flip-magazine.css';

type BookTargets = { host: HTMLElement; pages: HTMLElement[]; toolbar: HTMLElement };
export function FlipMagazine({ brand, categorySlug, onRouteChange, onClose }: {
  brand: BrandDefinition; categorySlug: string | null; onRouteChange: (slug: string | null) => void; onClose: () => void;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const engine = useRef<PageFlip | null>(null);
  const callbacks = useRef({ onRouteChange, onClose });
  callbacks.current = { onRouteChange, onClose };
  const initialCategory = useRef(categorySlug);
  const [targets, setTargets] = useState<BookTargets | null>(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const hasOutfits = supportsCompleteLook(brand.id);
  const stride = hasOutfits ? 4 : 2;
  const isOutfit = hasOutfits && !!categorySlug?.endsWith(COMPLETE_LOOK_SUFFIX);
  const baseCategory = isOutfit ? categorySlug!.slice(0, -COMPLETE_LOOK_SUFFIX.length) : categorySlug;
  const [anchors, setAnchors] = useState<Record<string, ShoppingProduct>>({});
  const indexFor = (slug: string | null) => {
    if (!slug) return 0;
    const outfit = hasOutfits && slug.endsWith(COMPLETE_LOOK_SUFFIX);
    const base = outfit ? slug.slice(0, -COMPLETE_LOOK_SUFFIX.length) : slug;
    const index = brand.categories.findIndex(item => item.slug === base);
    return index < 0 ? 0 : 2 + index * stride + (outfit ? 2 : 0);
  };
  const indexRef = useRef(indexFor);
  indexRef.current = indexFor;

  useLayoutEffect(() => {
    const host = document.createElement('div');
    host.className = 'flip-magazine-engine';
    const pages = Array.from({ length: 2 + brand.categories.length * stride }, (_, index) => {
      const node = document.createElement('div');
      node.className = `flip-magazine-page flip-magazine-page--${brand.id}`;
      node.dataset.density = 'soft';
      node.dataset.page = String(index);
      host.appendChild(node);
      return node;
    });
    slot.current!.appendChild(host);
    setTargets({ host, pages, toolbar: toolbar.current! });
    return () => { host.remove(); };
  }, [brand]);

  useEffect(() => {
    if (!targets) return;
    const book = new PageFlip(targets.host, {
      width: 492, height: 600,
      size: 'stretch', minWidth: 260, maxWidth: 1800, minHeight: 320, maxHeight: 1800,
      startPage: indexRef.current(initialCategory.current), usePortrait: true, showCover: false,
      drawShadow: true, maxShadowOpacity: .3, flippingTime: 1050,
      autoSize: false, mobileScrollSupport: false, clickEventForward: true,
      // No pointer handlers or hover curls. The click gate also blocks the library's
      // programmatic backward flips on centered books, so leave that gate open.
      useMouseEvents: false, showPageCorners: false, disableFlipByClick: false,
    });
    book.on('flip', event => {
      const current = Number(event.data);
      setPage(current);
      const categoryIndex = Math.floor((current - 2) / stride);
      const outfit = hasOutfits && current >= 2 && (current - 2) % stride >= 2;
      callbacks.current.onRouteChange(categoryIndex < 0 ? null : brand.categories[categoryIndex].slug + (outfit ? COMPLETE_LOOK_SUFFIX : ''));
    });
    book.on('changeState', event => setBusy(event.data !== 'read'));
    book.loadFromHTML(targets.pages);
    engine.current = book;
    setPage(book.getCurrentPageIndex());
    const observer = new ResizeObserver(() => book.update());
    observer.observe(slot.current!);
    return () => { observer.disconnect(); engine.current = null; book.destroy(); };
  }, [targets, brand]);

  const turn = (slug: string | null, selectedPage = false) => {
    const book = engine.current;
    if (!book || book.getState() === 'flipping') return;
    const portrait = book.getOrientation() === 'portrait';
    const target = indexFor(slug) + (selectedPage && portrait ? 1 : 0);
    if (portrait ? book.getCurrentPageIndex() === target : Math.floor(book.getCurrentPageIndex() / 2) === Math.floor(target / 2)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) book.turnToPage(target);
    else book.flip(target, 'bottom');
  };
  const step = (direction: 'next' | 'previous') => {
    const book = engine.current;
    if (!book || book.getState() !== 'read') return;
    const width = book.getOrientation() === 'portrait' ? 1 : 2;
    const current = book.getCurrentPageIndex();
    const target = current + (direction === 'next' ? width : -width);
    if (target < 0 || target >= 2 + brand.categories.length * stride) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) book.turnToPage(target);
    else if (direction === 'next') book.flipNext('bottom');
    else book.flipPrev('bottom');
  };
  useEffect(() => { turn(categorySlug); }, [categorySlug, targets]); // External history / brand navigation stays in sync.
  useEffect(() => {
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handle = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('input,select,textarea,[contenteditable=true]') || document.querySelector('.nawabpur-bag,.size-finder-overlay,.price-alert-overlay')) return;
      if (event.key === 'Escape') isOutfit ? turn(baseCategory, true) : categorySlug ? turn(null) : callbacks.current.onClose();
      if (event.key === 'ArrowRight') { event.preventDefault(); step('next'); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step('previous'); }
    };
    window.addEventListener('keydown', handle);
    return () => { document.body.style.overflow = prior; window.removeEventListener('keydown', handle); };
  }, [categorySlug]);

  return <BrandBagProvider brand={brand}><div className={`flip-magazine flip-magazine--${brand.id}`} role="dialog" aria-modal="true" aria-label={`${brand.name} interactive magazine`}>
    <header className="flip-magazine-toolbar"><button onClick={() => isOutfit ? turn(baseCategory, true) : categorySlug ? turn(null) : onClose()}>{isOutfit ? '← Back to selected look' : categorySlug ? '← Collections' : '← Return to table'}</button><span className="flip-magazine-title">{brand.name}</span><div ref={toolbar} className="flip-magazine-actions"><PriceAlertsBell /></div><button onClick={onClose} aria-label="Return to magazine homepage" title="All magazines">×</button></header>
    <div ref={slot} className="flip-magazine-slot" />
    <nav className="flip-magazine-navigation" aria-label="Magazine navigation"><button className="flip-magazine-home" onClick={onClose} aria-label="Return to homepage with three magazines">← All magazines</button><button disabled={busy || page === 0} onClick={() => step('previous')}>← Previous page</button><button onClick={() => turn(null)}>Collections</button>{brand.categories.map(category => <button key={category.slug} aria-current={baseCategory === category.slug ? 'page' : undefined} onClick={() => turn(category.slug)} disabled={busy}>{category.title}</button>)}<button disabled={busy || page >= 2 + brand.categories.length * stride - (engine.current?.getOrientation() === 'portrait' ? 1 : 2)} onClick={() => step('next')}>Next page →</button></nav>
    <p className="flip-magazine-hint">Use ← / → keys or the controls below to turn pages.</p>
    {targets && <>
      {createPortal(<EditorialInterior brand={brand} side="left" onSelect={turn} />, targets.pages[0])}
      {createPortal(<EditorialInterior brand={brand} side="right" onSelect={turn} />, targets.pages[1])}
      {brand.categories.map((category, index) => <CategoryShopping key={category.slug} brand={brand} category={category} active={baseCategory === category.slug} onBack={() => turn(null)} targets={{ left: targets.pages[2 + index * stride], right: targets.pages[3 + index * stride], toolbar: targets.toolbar }} onCompleteLook={hasOutfits ? () => turn(category.slug + COMPLETE_LOOK_SUFFIX) : undefined} onSelection={hasOutfits ? product => setAnchors(previous => previous[category.slug]?.id === product.id ? previous : { ...previous, [category.slug]: product }) : undefined} onChoose={() => { /* Selecting a garment does not turn the page. */ }} />)}
      {hasOutfits && brand.categories.map((category, index) => {
        const anchor = anchors[category.slug] || SHOPPING_CATALOG[brand.id + '/' + category.slug][0];
        return <CompleteLookSpread brand={brand} key={category.slug + anchor.id} anchor={anchor} category={category.slug} targets={{ left: targets.pages[4 + index * stride], right: targets.pages[5 + index * stride] }} onBack={() => turn(category.slug, true)} onChoose={() => { /* Selecting a garment does not turn the page. */ }} />;
      })}
    </>}
  </div></BrandBagProvider>;
}
