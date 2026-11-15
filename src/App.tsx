import { PriceAlertsProvider } from './features/price-alerts/PriceAlertsContext';
import { PriceAlertsLayer } from './features/price-alerts/PriceAlertsUI';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supportsCompleteLook } from './data/outfit-recommendations';
import { BRANDS, BrandDefinition } from './data/brands';
import { Header } from './components/Header';
import { MagazineStage } from './components/MagazineStage';
import { BrandPage } from './components/BrandPage';
import { MagazineOriginRect } from './components/Magazine';

interface RouteState {
  brandSlug: string | null;
  categorySlug: string | null;
}

function getRouteFromLocation(): RouteState {
  const path = (window.location.hash.slice(1) || '/').replace(/\/+$/, '');
  const match = path.match(/^\/brands\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/i);
  if (!match) return { brandSlug: null, categorySlug: null };

  const brandSlug = match[1].toLowerCase();
  const brand = BRANDS.find((b) => b.slug === brandSlug);
  if (!brand) return { brandSlug: null, categorySlug: null };

  let rawCat = match[2]?.toLowerCase() ?? null;
  if (brand.slug === 'guzel' && rawCat === 'groomsline') {
    rawCat = 'nawabpur';
  }
  const aliases: Record<string, Record<string, string>> = {
    guzel: { couture: 'nawabpur' },
    'wrongs-and-rebels': { 'boxy-shirts': 'tops-shackets', 'graphic-tees': 'tops-shackets', 'baggy-denims': 'pants-denims' },
    'gorur-ghash': { 'mighto-activewear': 'tshirts-polo', 'textured-henleys': 'shirts-tops', 'relaxed-pants': 'pants-outwear' },
  };
  if (rawCat) rawCat = aliases[brand.slug]?.[rawCat] ?? rawCat;
  const categoryBase = supportsCompleteLook(brand.id) ? rawCat?.replace(/-complete-look$/, '') : rawCat;
  const validCat =
    rawCat && brand.categories.some((c) => c.slug === categoryBase) ? rawCat : null;

  return { brandSlug: brand.slug, categorySlug: validCat };
}

export const App: React.FC = () => {
  const [route, setRoute] = useState<RouteState>(() => getRouteFromLocation());
  const [originRect, setOriginRect] = useState<MagazineOriginRect | null>(null);
  const [isClosingToFloor, setIsClosingToFloor] = useState<boolean>(false);
  const routeRef = useRef<RouteState>(route);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  const closeToFloor = useCallback(
    (updateHistory: boolean) => {
      if (routeRef.current.brandSlug === null) return;

      if (updateHistory && window.location.hash !== '#/') {
        window.history.pushState({}, '', '#/');
      }

      if (originRect && routeRef.current.categorySlug === null) {
        setIsClosingToFloor(true);
      } else {
        setRoute({ brandSlug: null, categorySlug: null });
        setOriginRect(null);
        setIsClosingToFloor(false);
        window.scrollTo({ top: 0 });
      }
    },
    [originRect]
  );

  const handleFinishClose = useCallback(() => {
    setIsClosingToFloor(false);
    setOriginRect(null);
    setRoute({ brandSlug: null, categorySlug: null });
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const next = getRouteFromLocation();
      const prev = routeRef.current;

      if (prev.brandSlug !== null && next.brandSlug === null) {
        closeToFloor(false);
        return;
      }

      setOriginRect(null);
      setIsClosingToFloor(false);
      setRoute(next);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [closeToFloor]);

  const navigateHome = useCallback(() => {
    closeToFloor(true);
  }, [closeToFloor]);

  const navigateFromMagazine = useCallback(
    (brand: BrandDefinition, rect?: MagazineOriginRect) => {
      setOriginRect(rect ?? null);
      setIsClosingToFloor(false);

      const targetPath = `/brands/${brand.slug}`;
      if (window.location.hash !== '#' + targetPath) {
        window.history.pushState({}, '', '#' + targetPath);
      }

      setRoute({ brandSlug: brand.slug, categorySlug: null });
    },
    []
  );

  const navigateBrandDirect = useCallback((slug: string) => {
    const brand = BRANDS.find((b) => b.slug === slug);
    if (!brand) return;

    const targetPath = `/brands/${slug}`;
    if (window.location.hash !== '#' + targetPath) {
      window.history.pushState({}, '', '#' + targetPath);
    }
    setOriginRect(null);
    setIsClosingToFloor(false);
    setRoute({ brandSlug: slug, categorySlug: null });
    window.scrollTo({ top: 0 });
  }, []);

  const navigateBookRoute = useCallback((categorySlug: string | null) => {
    const brandSlug = routeRef.current.brandSlug;
    if (!brandSlug) return;
    const next = { brandSlug, categorySlug };
    if (routeRef.current.categorySlug === categorySlug) return;
    const path = '/brands/' + brandSlug + (categorySlug ? '/' + categorySlug : '');
    if (window.location.hash !== '#' + path) window.history.pushState({}, '', '#' + path);
    routeRef.current = next;
    setRoute(next);
  }, []);

  const activeBrand =
    BRANDS.find((b) => b.slug === route.brandSlug) ?? null;

  return (
    <PriceAlertsProvider><div className="app-shell">
      <Header
        currentSlug={route.brandSlug}
        onNavigateHome={navigateHome}
        onNavigateBrand={navigateBrandDirect}
      />

      {/* The 3-magazine floor stage (always visible beneath or when on floor) */}
      <MagazineStage
        openingBrandId={activeBrand && originRect ? activeBrand.id : null}
        onSelectBrand={navigateFromMagazine}
      />

      {activeBrand && (
        <BrandPage
          key={activeBrand.id}
          brand={activeBrand}
          originRect={originRect}
          isClosing={isClosingToFloor}
          onFinishClose={handleFinishClose}
          onBack={navigateHome}
          onSelectCategory={slug => navigateBookRoute(slug)}
          categorySlug={route.categorySlug}
          onBookRouteChange={navigateBookRoute}
          onSelectBrand={navigateBrandDirect}
        />
      )}


      <PriceAlertsLayer />
    </div></PriceAlertsProvider>
  );
};

export default App;
