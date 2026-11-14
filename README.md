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
