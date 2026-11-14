# Magazine shopping website — progress

Last updated: 15 November 2026 (Asia/Dhaka).

## How to maintain this document

Update this file after meaningful features, approved design decisions, fixes, or changes in scope. Do not log every small edit. When the user asks for documentation, present the current completed work, decisions, known limitations, and next steps from this file. Record requested changes and their implementation status so later edits are easy to follow. Keep setup instructions in README.md.

## Project concept

Customers should feel they are interacting with a fashion magazine from which they can shop for clothing. Three brand magazines lie on silk. Covers begin monochrome; hovering reveals only the selected magazine in colour. Selecting a magazine lifts and opens it into an editorial interior. Collections are integrated into the magazine composition and lead into collection browsing.

## Current collections

| Brand | Collections |
| --- | --- |
| Guzel | Ethnic & Festive Wear; Nawabpur 26 |
| GoruGhash | T-shirts & Polo; Shirts & Tops; Pants & Outwear |
| Wrongs & Rebels | Tops & Shackets; Pants & Denims; Sweater & Outwear |

Guzel has two collections. Nawabpur 26 replaces the previous Groomsline & Couture label. Some old asset filenames and internal catalog keys still use groomsline; this is not the visible collection name.

## Completed work

- Replaced pure monochrome resting magazine filters with muted warm colour (subtle taupe/cream and subdued original garment hues), following the user's latest reference. Hover/focus/tap still reveals richer colour and retains the dynamic shadow treatment. This supersedes the original black-and-white-at-rest design decision. Desktop visual review and production build pass.

- Matched the latest homepage colour/light reference with a versioned backdrop: warmer taupe top polo, subtly coloured navy/green lower polos, beige measuring tape, and natural dappled foliage shadows over silk. Removed the backdrop's grayscale filter so these colours remain visible while the resting magazines stay monochrome.
- Added a soft foliage-shadow asset on live covers. A magazine's reveal/hover state now softens, shifts and slightly blurs its cover shadows as it lifts, with small pointer-position offsets; inactive covers retain their resting lighting. Existing ground/contact shadow transitions remain active. Keyboard-focus reveal was browser-checked to confirm only the selected cover's shadow changes. Reduced-motion users receive no shadow transform transition.

- Refined the live DESYR garment tag to better match the approved image: wider proportions, placement closer to the shadowed stack, a shallow perspective angle, woven paper texture, fine stitched edge, dark eyelet and curved cord. Kept the brand-picker interaction. Desktop visual comparison and production build pass.

- Applied the approved DESYR homepage concept. Replaced ATELIER platform branding with a bold minimal DESYR wordmark, “Curated clothing” descriptor, page title and metadata. Added Shop brands navigation and an Our story panel describing the magazine-shopping flow.
- Created a project-local background asset with folded polo shirts and a measuring tape concealed in the darker floor area, preserving silk composition. The magazines remain independent interactive elements in their original placements. Added separate non-interactive window-shadow overlays across their live covers, retained hover colour and opening behaviour, and added a physical-style DESYR garment tag that opens a brand picker.
- Removed the old large homepage editorial heading. Added the small “Open a magazine. Shop the look.” cue and mobile styling. Updated remaining Guzel cover Groomsline headings to Nawabpur 26.
- Browser-reviewed desktop and mobile homepage, garment-tag brand picker, and Our story open/close. Production build passes.

- Extended the scrolling-left / selected-product-right shopping spread to all eight categories: both Guzel categories, all three GoruGhash categories, and all three Wrongs & Rebels categories. Each contains three sourced pieces (24 total), editable descriptions, selected photos, listed prices, sizing, quantity, a local selection bag, and direct product-store links.
- Retrieved current public catalogs from Wrongs & Rebels' Shopify products feed, GoruGhash's WooCommerce Store API, and Guzel's homepage. Added 21 original photographs locally and retained the three Nawabpur photos. Corrected the former GoruGhash sample dollar prices to the Bangladesh catalog's BDT prices; used exact product links and matching images. Source snapshot: 15 November 2026.
- Added published size options from the Wrongs & Rebels/GoruGhash catalog data. Guzel sizes remain clearly labelled preferences requiring studio confirmation. Prices and availability remain a snapshot, not live stock integration.
- Applied distinct shopping themes: Guzel ivory/burgundy with Cormorant-style serif typography; GoruGhash green/navy with lime accents and bold sans-serif; Wrongs & Rebels black/grey/burgundy with condensed headings.
- Added shared per-brand bags so selections survive category changes, while each category keeps its own selected product. Browser-tested changing W&R sweater to jacket, sizing/add-to-bag, preserving that item when turning to Pants & Denims, and removing it. Also reviewed Guzel Ethnic, changed GoruGhash shirt selection, checked mobile pants read-to-shop turns, and checked the browser console. Build and all 24 product/photo integrity checks pass.

- Replaced the custom category-transition overlay with the actual StPageFlip (`page-flip` 2.0.7) library from the user's CSSScript reference. All three brands now use persistent HTML pages in a single flipbook; category navigation and Collections reverse navigation use its soft-page folding, clipping and shadows. Removed the superseded CategoryPageTurn files.
- Integrated Nawabpur's two live shopping pages into the book using React portals, preserving product selection, local bag and independently scrolling editorial/product content. Portrait mode shows one page at a time; selecting a look turns to its product page. Product controls and scrolling are isolated from page-margin/corner gestures using native DOM event capture.
- Browser-checked genuine forward and reverse folds, Guzel product updates without an unwanted desktop page turn, portrait category selection and read-to-shop turning, Wrongs & Rebels category selection, and GoruGhash category navigation. No captured console errors in the final browser check. Production build passes; npm installation reported no known vulnerabilities at installation time.

- Refined category navigation to use six articulated paper sections, an outer-edge lift, curved mid-turn motion, and a settling phase over 1.25 seconds. Added the opposite turn for the in-app Collections/Back to Magazine controls. Returning reveals the already-open brand spread instead of replaying the cover opening. Forward and reverse transition states and destinations were browser-checked; build passes. Browser history navigation still cancels pending animation and follows history directly.

- Added a one-second spine-hinged page-turn transition when selecting a category, with the outgoing editorial page, reverse paper face, moving light/shadow, and destination revealed mid-turn. Covers all brands' category buttons. Rapid repeat selections are blocked during the turn, pending transitions cancel on home/brand/history navigation, and reduced-motion users navigate immediately. Build passes; browser verified the transition state and arrival at Nawabpur 26.

- Implemented Nawabpur 26's approved shopping concept: independently scrolling editorial on the left and selected product details on the right. Dune, Grove and Luna use downloaded original collection photographs, names, and homepage-listed prices.
- Added size-preference selection, bounded quantity controls, a local selection bag with persistence/removal, and direct product links to Guzel. Sizes are preferences to confirm with the studio, not verified inventory. The bag does not submit orders or provide checkout.
- Enlarged opened desktop magazines to use more screen area and replaced the visible homepage backdrop with a solid dark scrim. The shopping spread fills almost the full viewport with a central paper crease.
- Added mobile Read/Shop pages for Nawabpur 26, preserving editorial browsing and product selection.

- Existing React/TypeScript/Vite project inspected and development server started.
- Existing silk-floor homepage, individual monochrome-to-colour cover hover, and magazine opening/closing animation retained.
- Created visual concepts for the brand interiors using project clothing/model photographs as image-generation references. Generated concepts are design references; live interiors use original photographs and editable HTML/CSS text.
- Implemented a shared two-page editorial interior with distinct styles for all three brands.
- Connected interior collection links and bottom collection navigation to collection views.
- Added mobile left/right page controls and keyboard arrows; Escape closes the magazine.
- Added compatibility mappings for older category URLs.
- Updated Guzel to its two requested collections, including Nawabpur 26.
- Enlarged Guzel's typography, oversized 26, body text, details, and editorial spacing in response to the reference comparison.
- Matched Guzel interior display typography to the existing cover's Cormorant Garamond family.
- Centered the Wrongs & Rebels cover lettering group horizontally and vertically.

## Design decisions and feedback

### GoruGhash

Approved direction: modern physical fashion-magazine presentation; bold sans-serif headings, navy and green with lime accents, large photography, and three clearly presented collection features. Use the brand's clothing/model photography, rather than invented garments or models. Colours are proposed editorial colours drawn from the clothing, not independently verified brand guidelines.

### Wrongs & Rebels

Approved revised direction: condensed bold typography, white/light-grey pages, black text and burgundy accents. Tops & Shackets occupies the left page. Pants & Denims and Sweater & Outwear have distinct prominent features on the right. User feedback explicitly rejected treating Pants & Denims as a small leftover feature. Cover lettering should sit in the middle of the cover.

### Guzel

The project already contained a custom Guzel interior before this work. The user requested an alternative concept for comparison, then requested the designs be implemented inside the magazines. Current direction uses warm bone paper, burgundy serif display type, full-length portraits, embroidery/pocket details, fine rules, and two collection features. Later feedback requested closer matching to the generated reference's typography and to Guzel's own cover font. Cormorant Garamond is the cover font used in this project; it is not a verified identification of the brand's proprietary font.

## Validation performed

- Latest shopping implementation: production build passes; browser-checked desktop layout, Grove selection updating the right page, size preference, add/remove bag actions, return to collections, larger magazine rendering, and mobile Read-to-Shop interaction. Removed the verification bag item afterward.

- Production build (`npm.cmd run build`) passes after the latest cover adjustment.
- Browser-reviewed all three desktop interiors during initial integration.
- Checked mobile page switching and navigated from GoruGhash's interior to Shirts & Tops.
- Browser-reviewed Guzel during typography refinement. The subsequent cover-font substitution and Wrongs & Rebels cover centering passed the build but have not had a separate final visual comparison.

## Known limitations / remaining work

- Catalog scope is three curated pieces per category; more pieces can be added in shopping-catalog.ts. This is not a live full-inventory integration.
- Current shopping entries were refreshed from brand sources. Legacy sample entries in catalog.ts are retained for historical code but are superseded by shopping-catalog.ts for the active magazine collections. Recheck current prices, sizes, inventory and product measurements before launch.
- Some category descriptions are placeholders. Replace with approved editorial and collection copy.
- Live layouts interpret the concepts with original photographs and responsive text; they are not pixel-identical to generated mockups.
- Recheck final typography, cover placement, opening/closing, and collection navigation across desktop and mobile sizes after future changes.
- Full cart, checkout, payments, inventory integration, and public deployment are not established by this work.

## Where to make changes

| Change | File |
| --- | --- |
| Brand names, collection titles, routes, category images and product grouping | src/data/brands.ts |
| Active shopping products, prices, sizes and source dates | src/data/shopping-catalog.ts |
| Legacy product samples (superseded for active collections) | src/data/catalog.ts |
| Interior content and photographs | src/components/EditorialInterior.tsx |
| Interior layout, typography and responsive rules | src/components/editorial-interior.css |
| Shared editorial shopping, selected products and per-brand selection bags | src/components/CategoryShopping.tsx |
| Shopping themes for each brand | src/components/category-shopping.css |
| Nawabpur shopping layout and responsive styles | src/components/nawabpur-shopping.css |
| Magazine viewer animation and page controls | src/components/BrandPage.tsx |
| Route handling and legacy URL mappings | src/App.tsx |
| Persistent flipbook, category-page navigation and scroll/gesture isolation | src/components/FlipMagazine.tsx |
| Flipbook layout and per-brand collection pages | src/components/flip-magazine.css |
| Local TypeScript declarations for the page-flip ES module | src/page-flip.d.ts |
| Cover wording and artwork | src/assets/BrandMarks.tsx |
| Cover positioning, floor and shared styles | src/index.css |
| DESYR logo, homepage garment tag, cover shadows and mobile styling | src/desyr-home.css |
| DESYR homepage scene and garment-tag brand picker | src/components/MagazineStage.tsx |
| DESYR navigation and Our story panel | src/components/Header.tsx |
| Current clothing/silk homepage backdrop | public/images/desyr-silk-wardrobe-v2.png |
| Original backdrop, retained | public/images/desyr-silk-wardrobe.png |
| Live cover foliage-shadow artwork | public/images/cover-foliage-shadow.svg |
| Loaded Google Fonts | index.html |

## Next useful steps

1. Visually approve the latest live fonts and centered cover against the references.
2. Audit and complete the real product catalog, especially Wrongs & Rebels outerwear.
3. Replace placeholder collection copy and confirm product destinations.
4. Decide the purchasing flow and deployment requirements.

## Change log

### 15 November 2026

- Documented the existing work, approved directions, implementation, validation, and outstanding work.
- Latest implemented requests: Guzel cover-matching interior serif family and centered Wrongs & Rebels cover lettering.

## Requested changes awaiting implementation

None explicitly pending at the time this document was created. Remaining work above is a backlog, not a record of completed features or a commitment to implement without a request.

### Homepage shopping clarity — proposed, not implemented

The user requested an image before implementation to make the first page read clearly as a clothing website. Generated a concept retaining silk, scattered magazines and individual colour-on-hover, with headline “Discover fashion. Shop the pages.”, a concise clothing-shopping description, “Choose your brand” CTA, brand clothing-type labels and an “Open & shop” hover cue. This is awaiting user review. No website code changed for this concept.

User rejected the headline-led concept. Latest requested direction: folded polo-shirt stacks in the shadowed floor areas, plus window/light shadows falling across the magazine covers. Generated a revised scene without the large marketing copy, keeping the silk, three magazines and restrained branding. This revised image is for review only; no homepage implementation has been made.

Latest homepage revision: user specified the site name is DESYR, requested a minimal bold logo, clothing stacks deeper in darkness, a creative clothing-store cue, and magazine positioning matching the actual website. Inspected the live homepage and generated a screenshot-based concept preserving its magazine arrangement. The proposal uses a bold DESYR wordmark, a partially shadowed polo stack, garment hangtag with “Wear the story”, a subtle measuring tape, and shared window/foliage shadows over covers. This remains an image proposal; live site branding and homepage have not yet been changed.

Implementation update: user approved this latest concept with “apply”. The DESYR homepage is now implemented as described under Completed work; the mockup-only statement above records the earlier review stage.

### Proposed shopping flow — visual exploration

Created two preview images for Wrongs & Rebels > Pants & Denims: (1) a shoppable collection spread with numbered product hotspots, filters and spread navigation; (2) a product-detail drawer over the same magazine with size selection and an Add to bag action. These are concepts for user review, not approved or implemented features. Product details and size options in the mockups are illustrative. Website code was not changed for this exploration.

The user then proposed keeping clothing options on the left magazine page and the selected item's description, price and size controls on the right. Generated a Guzel > Nawabpur 26 concept showing four project outfit photos on the left and Look 01 selected on the right, with size selection and Add to bag. This is a visual proposal only; category membership, price and sizes require confirmation. No shopping-flow implementation was made.

Latest refinement: the user requested an independently scrolling magazine narrative on the left (alternating outfit photographs, short passages, and descriptions) with selected photo, price, sizes and buying controls fixed on the right. Retrieved Guzel's public homepage and confirmed its Nawabpur 26 section lists Dune, Grove, Luna and Nocturne among its products. Downloaded Dune, Grove and Luna photographs to scratch for a revised preview. The new concept uses Dune selected (listed price BDT 28,000) with Grove as the next editorial feature. Size controls and descriptive copy remain illustrative. This replaces the proposed four-photo grid direction; it has not been implemented in the website.

Refined this same concept at the user's request with warm ivory, oxblood burgundy, muted brass rules, elegant Cormorant-style display serifs and clean sans-serif shopping text. This is the proposed Guzel editorial palette, not verified proprietary brand specifications. The scrolling-left/fixed-right composition remains unchanged; the latest output is still a mockup only.

Implementation update: the user subsequently approved applying this concept. It is now implemented for Guzel > Nawabpur 26 in the files listed above. Earlier mockup-only notes describe the exploration stage. On shorter screens, the product page can scroll independently so purchasing controls and supporting information remain accessible. Public checkout, verified sizes and full collection inventory remain outstanding.
