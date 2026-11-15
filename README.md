# DESYR — magazine shopping website

A React 19, TypeScript and Vite project presenting Guzel, GoruGhash, and Wrongs & Rebels as interactive fashion magazines.

The DESYR homepage combines a silk-and-shadow clothing still life with three independently interactive magazine covers. Homepage branding, garment-tag navigation and cover shadows are styled in `src/desyr-home.css`.

Page turning uses StPageFlip (`page-flip`), with live HTML pages and React portals so shopping controls remain interactive. The earlier custom transition overlay has been replaced.

See [PROGRESS.md](./PROGRESS.md) for current features, design decisions, limitations, and the change log.

## Run locally

Requires Node.js and npm. From the project folder:

```powershell
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

Open the local URL printed by Vite, normally http://localhost:5173/. Vite may choose a different port when that port is already in use. The development server must stay running. This is a local development address, not a publicly deployed website.

`npm.cmd` works in Windows PowerShell environments where execution policy blocks `npm.ps1`.

## Build and preview

```powershell
npm.cmd run build
npm.cmd run preview
```

The build runs TypeScript checks and creates the production files in `dist`. Preview serves that build locally; it does not publish the website.

## Project structure

- `src/components/`: homepage, covers, viewer, editorial interiors, collection views.
- `src/data/`: brands, categories and catalog entries.
- `public/images/`: project photography and visual assets.
- `src/index.css`: shared styling and magazine animations.
- `src/components/editorial-interior.css`: current interior design styles.
- `src/components/FlipMagazine.tsx`: persistent book, page navigation and category spreads.
- `src/components/flip-magazine.css`: flipbook layout and collection-page styles.
- `src/components/CategoryShopping.tsx`: editorial/product pages for every category and shared per-brand local selection bags.
- `src/components/category-shopping.css`: Guzel, GoruGhash and Wrongs & Rebels shopping themes.
- `src/data/shopping-catalog.ts`: 24 curated products with locally saved photographs, prices, product links and published sizes where available (source snapshot: 15 November 2026).

The bag saves selections on the current device. Checkout and live inventory are not integrated; product links lead to each brand's store. Guzel size controls are preferences to confirm with the studio.

Fonts load from Google Fonts; some catalog images and product links point to external brand sites. Check assets, catalog accuracy and the purchasing flow before a public launch.

## GitHub Pages

Vite uses `base: './'` so built assets work under repository subpaths. Local images use relative URLs. Magazine routes use hashes, e.g. `/DESYR/#/brands/guzel/nawabpur`, allowing direct links and refreshes without server rewrites.

Run `npm.cmd run build` and publish the contents of `dist` to GitHub Pages.

## Complete the Look: GoruGhash and Wrongs & Rebels

GoruGhash and Wrongs & Rebels product pages have a small **Complete the look** link beneath Add to Bag. It opens a dedicated styling spread in the selected brand’s existing typography and palette, keeping the editorial-left and shopping-right layout. GoruGhash tops pair with Wrongs & Rebels denim, and trousers pair with Wrongs & Rebels tops. Wrongs & Rebels tops and outerwear pair with GoruGhash trousers, and denim pairs with GoruGhash polos. Customers can browse or swap curated suggestions, choose a size and quantity, and add only the pairing to the current magazine’s selection bag. Returning to the original product keeps its selected garment, size, quantity and scroll position while the magazine stays open.

Styling routes end in `-complete-look`, for example `#/brands/gorur-ghash/tshirts-polo-complete-look`. Direct links and refreshes open the first catalog garment for that category; individual product selections are kept in memory, while bag items persist on this device. Each item's store link goes to its actual brand. Checkout, live stock and live AI are not connected: the first version uses catalog-based curation and the existing price/size snapshot. Guzel does not expose this feature.

## Magazine controls

Use the Left/Right Arrow keys or the Previous/Next page buttons beneath the book. Hovering, clicking, dragging or swiping the page surface cannot turn or curl pages. Explicit collection and styling links still navigate, and selecting a garment updates the product without automatically turning a mobile page. Form controls keep their native arrow-key behavior; page shortcuts pause while the bag is open. Reduced-motion preferences use immediate page changes.

The top-right basket icon opens the selection bag and shows an item count with an accessible label. **All magazines** beneath the book returns to the three-magazine homepage; the top-right close control does the same.

## Smart Size Recommendation

Every magazine product and Complete the Look pairing has **Find my size** beside its size selector. The compact panel follows the current brand’s colours and typography. Customers can compare a specific garment they already wear, measure chest circumference in cm/inches, or estimate chest from height (cm) and weight (kg). Current fit of a known garment and desired fit of the new garment are separate inputs. Applying a result changes only the relevant size dropdown; it does not add items to a bag.

`src/data/size-charts.ts` contains 12 product-specific official chest charts checked on 15 November 2026: six GoruGhash and six Wrongs & Rebels tops/jackets. GoruGhash inch circumferences are converted to cm; WR half-chest widths are doubled. Product URLs, units and check dates are retained. The PDF’s illustrative chart data is not used. `src/data/size-recommendation.ts` implements the rule-based chest/fit calculation, larger-size tie breaking, listed-size filtering and optional stock filtering. The displayed chart-match score measures chart distance, not a validated fit probability. Live inventory is not connected.

Guzel’s checked product pages do not provide verified chest measurements: its panel can check/save a fit profile and compare charted items, but cannot suggest or apply a Guzel size until actual product charts are added. Trousers show an explanation and store link because waist/hip/inseam logic is not part of this chest-based version. Unknown or unsuitable sizes are never replaced by a guess.

Fit profile saving is opt-in under `desyr-size-profile-v1` in browser localStorage. Unchecking Remember removes the saved profile. No measurements are transmitted to a server. The panel traps keyboard focus, supports Escape, returns focus to its entry link and pauses magazine arrow-key turning while open. On phones it fits the viewport and scrolls independently.

Run `npm.cmd run test:size` to check the sizing calculation and chart-conversion invariants.

## Personalized price drop alerts

Every magazine and outfit pairing has a price-alert link beside the price. The bell opens a two-page watchlist with independent 10/20/30/40/50 percent thresholds, fixed-reference target calculations, editing, pause/resume/delete, triggered alerts and notification history. Existing bags, size finding and controlled magazine navigation remain in place.

The public GitHub Pages build defaults to a clearly labelled browser preview. Alerts persist on the current device, and a labelled simulation can demonstrate one-time triggering; it never sends email or claims live brand monitoring. `npm.cmd run test:alerts` verifies its monetary and lifecycle rules.

A separate Django/MySQL/Celery/Redis backend is implemented in `backend/` with session authentication, verified customer identities, CSRF, server-side Decimal prices, authorized audited price updates, persisted outbox, idempotent one-time notification events, delivery retries and email templates. Set `VITE_PRICE_ALERT_API_URL` to connect the frontend; API failures never silently turn into local alerts. See [backend setup and deployment](./backend/README.md).

Live delivery requires hosted services, verified SMTP sender/customer addresses, and an official price-source integration. None of those external services are connected to the public site yet. Local API/browser checks passed. The Django suite ran 24 tests: 23 passed and the MySQL concurrency test was skipped because MySQL is not running on this computer. Redis/Docker/real SMTP deployment still needs service-level verification.
