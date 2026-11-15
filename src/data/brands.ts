import { SHOPPING_CATALOG } from './shopping-catalog';
import { BrandProduct, REAL_CATALOG } from './catalog';

export type { BrandProduct };

export interface BrandCategory {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  editorialCaption: string;
  image: string;
  products: BrandProduct[];
}

export interface BrandDefinition {
  id: 'guzel' | 'gorur-ghash' | 'wrongs-and-rebels';
  slug: string;
  issueNumber: string;
  name: string;
  displayTitle: string;
  storeUrl: string;
  editorialHeadline: string;
  editorialSubhead: string;
  tagline: string;
  season: string;
  origin: string;
  editorialNote: string;
  secondaryCopy: string;
  stickyNoteText?: string;
  coverTexture: string;
  accentTone: string;
  spineColor: string;
  pageEdgeTone: 'cream' | 'warm-grey' | 'charcoal';
  themeVariant: 'atelier' | 'experimental-zine' | 'architectural';
  categories: BrandCategory[];
  /** Exact desktop placement & perspective on the table */
  stagePlacement: {
    left: string;
    top: string;
    width: string;
    aspectRatio: string;
    zIndex: number;
    baseTransform: string;
    hoverTransform: string;
    openTransform: string;
  };
  tabletPlacement: {
    left: string;
    top: string;
    width: string;
  };
}

const BRAND_DEFINITIONS: BrandDefinition[] = [
  {
    id: 'guzel',
    slug: 'guzel',
    issueNumber: '01',
    name: 'GUZEL',
    displayTitle: 'GUZEL',
    storeUrl: 'https://guzeldesigner.studio/',
    editorialHeadline: 'ATELIER HERITAGE',
    editorialSubhead: 'LUXURY HERITAGE & BRIDAL COUTURE',
    tagline: 'Luxury Heritage & Bridal Couture',
    season: 'Edition 01 — Atelier',
    origin: 'Dhaka — Studio',
    editorialNote:
      'Handcrafted formal groomswear, finely embroidered panjabis, and heirloom couture silhouettes rendered in obsidian black and antique burnished copper.',
    secondaryCopy:
      'Each piece in Issue 01 balances ceremonial precision against fluid artisanal embroidery from the Guzel Designer Studio archive.',
    coverTexture: './images/cover-model-guzel.jpg',
    accentTone: '#c68344',
    spineColor: '#1a1715',
    pageEdgeTone: 'cream',
    themeVariant: 'atelier',
    categories: [
      { id: 'festive', slug: 'festive', number: '01', title: 'ETHNIC & FESTIVE WEAR', subtitle: 'ETHNIC & FESTIVE WEAR', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/guzel-ethnic-editorial.jpg', products: REAL_CATALOG.guzel.festive },
      { id: 'nawabpur', slug: 'nawabpur', number: '02', title: 'NAWABPUR 26', subtitle: 'NAWABPUR 26', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/nawabpur-dune.jpeg', products: ['dune', 'grove', 'luna'].map((id, index) => ({ id: 'gz-' + id, name: ['Dune', 'Grove', 'Luna'][index], price: ['\u09f3 28,000', '\u09f3 28,000', '\u09f3 27,000'][index], image: './images/nawabpur-' + id + '.jpeg', url: 'https://guzeldesigner.studio/product/' + id + '/' })) },
    ],
    stagePlacement: {
      left: '53.6%',
      top: '9.8%',
      width: '22.8%',
      aspectRatio: '0.80 / 1',
      zIndex: 10,
      baseTransform:
        'perspective(1500px) rotateX(43deg) rotateY(-4deg) rotateZ(20deg)',
      hoverTransform:
        'perspective(1500px) rotateX(43deg) rotateY(-4deg) rotateZ(20deg) translate3d(0px, -5px, 12px) scale(1.016)',
      openTransform:
        'perspective(1500px) rotateX(43deg) rotateY(-4deg) rotateZ(20deg) translate3d(0px, -12px, 30px) scale(1.025)',
    },
    tabletPlacement: {
      left: '51%',
      top: '10%',
      width: '25%',
    },
  },
  {
    id: 'wrongs-and-rebels',
    slug: 'wrongs-and-rebels',
    issueNumber: '02',
    name: 'WRONGS & REBELS',
    displayTitle: 'Wrongs&Rebels.',
    storeUrl: 'https://wrclo.com/',
    editorialHeadline: 'REFRACTED UNIFORMS',
    editorialSubhead: 'PREMIUM URBAN STREETWEAR — SPRING \'26',
    tagline: 'Premium Urban Streetwear — Spring \'26',
    season: 'Spring \'26 — Volume 02',
    origin: 'Dhaka — Street Archive',
    editorialNote:
      'Pigment-washed boxy tees, heavyweight feather-knit sweaters, and sharp windbreakers distilled into WRCLO’s stark petrol-slate and charcoal uniform aesthetic.',
    secondaryCopy:
      'Built around washed tones, graphic iconography, and structured outerwear silhouettes that move effortlessly across concrete landscapes.',
    coverTexture: './images/cover-model-wrongs.jpg',
    accentTone: '#53737a',
    spineColor: '#141c1e',
    pageEdgeTone: 'charcoal',
    themeVariant: 'architectural',
    categories: [
      { id: 'tops-shackets', slug: 'tops-shackets', number: '01', title: 'TOPS & SHACKETS', subtitle: 'TOPS & SHACKETS', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/model-wr-shirt.jpg', products: [...REAL_CATALOG.wrclo['boxy-shirts'], ...REAL_CATALOG.wrclo['graphic-tees']] },
      { id: 'pants-denims', slug: 'pants-denims', number: '02', title: 'PANTS & DENIMS', subtitle: 'PANTS & DENIMS', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/model-wr-shirt.jpg', products: REAL_CATALOG.wrclo['baggy-denims'] },
      { id: 'sweater-outwear', slug: 'sweater-outwear', number: '03', title: 'SWEATER & OUTWEAR', subtitle: 'SWEATER & OUTWEAR', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/wr-anchor.jpg', products: [] },
    ],
    stagePlacement: {
      left: '67.8%',
      top: '36.2%',
      width: '25.2%',
      aspectRatio: '0.78 / 1',
      zIndex: 30,
      baseTransform:
        'perspective(1500px) rotateX(40deg) rotateY(-5deg) rotateZ(24.5deg)',
      hoverTransform:
        'perspective(1500px) rotateX(40deg) rotateY(-5deg) rotateZ(24.5deg) translate3d(0px, -5px, 12px) scale(1.016)',
      openTransform:
        'perspective(1500px) rotateX(40deg) rotateY(-5deg) rotateZ(24.5deg) translate3d(0px, -12px, 30px) scale(1.025)',
    },
    tabletPlacement: {
      left: '62%',
      top: '38%',
      width: '27%',
    },
  },
  {
    id: 'gorur-ghash',
    slug: 'gorur-ghash',
    issueNumber: '03',
    name: 'GORUR GHASH',
    displayTitle: 'GORUR GHASH',
    storeUrl: 'https://gorurghash.com/product-category/men/',
    editorialHeadline: 'EXPERIMENTAL FASHION',
    editorialSubhead: 'CONTEMPORARY ESSENTIALS & ACTIVEWEAR',
    tagline: 'Contemporary Essentials & Activewear',
    season: 'Issue 03 — Contemporary',
    origin: 'Dhaka — Independent',
    editorialNote:
      'Born out of tactile knits, high-performance athletic stretch, and wide-cut relaxed trousers—Gorur Ghash approaches modern everyday wear with playful character and pure comfort.',
    secondaryCopy:
      'From Mighto activewear compression to breathable textured waffle henleys and relaxed fluid pants, every chapter carries an authentic Dhaka pulse.',
    stickyNoteText: 'GG ISSUE 03\nACTIVEWEAR · HENLEYS\n& RELAXED PANTS',
    coverTexture: './images/cover-model-gg.jpg',
    accentTone: '#ecd75a',
    spineColor: '#c8932e',
    pageEdgeTone: 'cream',
    themeVariant: 'experimental-zine',
    categories: [
      { id: 'tshirts-polo', slug: 'tshirts-polo', number: '01', title: 'T-SHIRTS & POLO', subtitle: 'T-SHIRTS & POLO', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/gg-m1.jpg', products: REAL_CATALOG.gorurghash['textured-henleys'].filter(p => /henley|t-shirt|polo/i.test(p.name)) },
      { id: 'shirts-tops', slug: 'shirts-tops', number: '02', title: 'SHIRTS & TOPS', subtitle: 'SHIRTS & TOPS', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/model-gg-henley.jpg', products: REAL_CATALOG.gorurghash['textured-henleys'].filter(p => !/henley|t-shirt|polo/i.test(p.name)) },
      { id: 'pants-outwear', slug: 'pants-outwear', number: '03', title: 'PANTS & OUTWEAR', subtitle: 'PANTS & OUTWEAR', editorialCaption: 'Discover the collection, its textures and its silhouettes.', image: './images/model-gg-pants.jpg', products: REAL_CATALOG.gorurghash['relaxed-pants'] },
    ],
    stagePlacement: {
      left: '34.6%',
      top: '36.6%',
      width: '24.4%',
      aspectRatio: '0.78 / 1',
      zIndex: 20,
      baseTransform:
        'perspective(1500px) rotateX(40deg) rotateY(8deg) rotateZ(-25deg)',
      hoverTransform:
        'perspective(1500px) rotateX(40deg) rotateY(8deg) rotateZ(-25deg) translate3d(0px, -5px, 12px) scale(1.016)',
      openTransform:
        'perspective(1500px) rotateX(40deg) rotateY(8deg) rotateZ(-25deg) translate3d(0px, -12px, 30px) scale(1.025)',
    },
    tabletPlacement: {
      left: '28%',
      top: '37%',
      width: '26.5%',
    },
  },
];

const COLLECTION_COPY: Record<string, string> = {
 'guzel/festive': 'Festive silhouettes, delicate detail and a sense of occasion. Explore the ethnic edit, one look at a time.',
 'guzel/nawabpur': 'Refined silhouettes, measured details and quiet confidence. Discover the Nawabpur 26 collection.',
 'wrongs-and-rebels/tops-shackets': 'Boxy shirts, washed tees and shackets. Build your everyday rotation, one layer at a time.',
 'wrongs-and-rebels/pants-denims': 'Washed tones and relaxed proportions. Explore the denim edit and find your everyday fit.',
 'wrongs-and-rebels/sweater-outwear': 'Textured sweaters and functional jackets. Layers for the city and its changing pace.',
 'gorur-ghash/tshirts-polo': 'Knit texture, considered colour and easy everyday shapes. Meet the polo and T-shirt edit.',
 'gorur-ghash/shirts-tops': 'Statement embroidery and relaxed shirts. Small details, plenty of character.',
 'gorur-ghash/pants-outwear': 'Relaxed trousers and cargo shapes. Comfortable movement, considered silhouettes.'
};

export const BRANDS: BrandDefinition[] = BRAND_DEFINITIONS.map(brand => ({
 ...brand, categories: brand.categories.map(category => {
  const key = brand.id + '/' + category.slug;
  const products = SHOPPING_CATALOG[key] || category.products;
  return { ...category, products, image: products[0]?.image || category.image, editorialCaption: COLLECTION_COPY[key] || category.editorialCaption };
 })
}));
