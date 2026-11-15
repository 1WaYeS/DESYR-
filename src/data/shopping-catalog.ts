import type { BrandProduct } from './catalog';

export interface ShoppingProduct extends BrandProduct { description: string; sizes: string[]; colour?: string; sourceChecked: string; }

// Public brand catalogs checked on 15 November 2026. Prices and sizes are a snapshot.
export const SHOPPING_CATALOG: Record<string, ShoppingProduct[]> = {
  "wrongs-and-rebels/tops-shackets": [
    {
      "id": "wr-8301191004346",
      "name": "W&R Range Check Shacket",
      "price": "৳ 1,899",
      "url": "https://wrclo.com/products/w-r-range-check-shacket",
      "description": "A check-patterned shacket for easy, structured layering.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colour": "Checkered",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8301191004346.jpg"
    },
    {
      "id": "wr-8349443457210",
      "name": "W&R Coast Boxy Shirt",
      "price": "৳ 1,799",
      "url": "https://wrclo.com/products/wr-coast-boxy-check-shirt",
      "description": "A brown checked shirt with a boxy silhouette.",
      "sizes": [
        "S",
        "M"
      ],
      "colour": "Brown",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8349443457210.jpg"
    },
    {
      "id": "wr-8349525901498",
      "name": "W&R Light Wash Fig T-shirt",
      "price": "৳ 1,399",
      "url": "https://wrclo.com/products/wr-light-wash-fig-boxy-tshirt",
      "description": "A washed T-shirt with an easy, boxy fit.",
      "sizes": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ],
      "colour": "Plum",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8349525901498.jpg"
    }
  ],
  "wrongs-and-rebels/pants-denims": [
    {
      "id": "wr-8349485105338",
      "name": "W&R Yard Baggy Pants",
      "price": "৳ 1,899",
      "url": "https://wrclo.com/products/wr-yard-baggy-denim-pants",
      "description": "Washed denim with a relaxed, baggy silhouette.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "colour": "Grey Blue",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8349485105338.jpg"
    },
    {
      "id": "wr-8349477273786",
      "name": "W&R Harbour Baggy Pants",
      "price": "৳ 1,899",
      "url": "https://wrclo.com/products/wr-harbour-baggy-denim-pants",
      "description": "A baggy denim shape for an everyday streetwear wardrobe.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "colour": "Grey Blue",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8349477273786.jpg"
    },
    {
      "id": "wr-8349438050490",
      "name": "W&R Moss Baggy Pants",
      "price": "৳ 1,899",
      "url": "https://wrclo.com/products/wr-moss-baggy-denim-pants",
      "description": "A green-blue denim wash with faded detailing.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL",
        "4XL"
      ],
      "colour": "Light Green",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8349438050490.jpg"
    }
  ],
  "wrongs-and-rebels/sweater-outwear": [
    {
      "id": "wr-8301191495866",
      "name": "W&R Vintage Olive Sweater",
      "price": "৳ 1,999",
      "url": "https://wrclo.com/products/w-r-vintage-olive-sweater",
      "description": "An olive sweater with a textured, vintage finish.",
      "sizes": [
        "S",
        "M",
        "L"
      ],
      "colour": "Olive",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8301191495866.jpg"
    },
    {
      "id": "wr-8301193265338",
      "name": "W&R Windbreaker Jacket",
      "price": "৳ 1,999",
      "url": "https://wrclo.com/products/w-r-windbreaker-jacket",
      "description": "A black windbreaker for light layering.",
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "colour": "Black",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8301193265338.jpg"
    },
    {
      "id": "wr-8301191987386",
      "name": "W&R Blue Cat Feather Sweater",
      "price": "৳ 1,999",
      "url": "https://wrclo.com/products/w-r-blue-cat-feather-sweater",
      "description": "A blue textured sweater with a soft visual finish.",
      "sizes": [
        "S",
        "M",
        "L"
      ],
      "colour": "Blue",
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-wr-8301191987386.jpg"
    }
  ],
  "gorur-ghash/tshirts-polo": [
    {
      "id": "gg-210906",
      "name": "Diamond Knit Polo in Maroon",
      "price": "৳ 1,500",
      "url": "https://gorurghash.com/product/diamond-knit-polo-in-maroon/",
      "description": "A maroon knit polo with a diamond-patterned texture.",
      "sizes": [
        "XXL",
        "XL",
        "L",
        "M",
        "S"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-210906.jpg"
    },
    {
      "id": "gg-206658",
      "name": "Unisex Horizontal Striped Knit Polo in Forest Green",
      "price": "৳ 1,750",
      "url": "https://gorurghash.com/product/unisex-horizontal-striped-knit-polo-in-forest-green/",
      "description": "A striped knit polo in forest green.",
      "sizes": [
        "XXL",
        "XL",
        "L",
        "M",
        "S"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-206658.jpg"
    },
    {
      "id": "gg-268128",
      "name": "Unisex Henley Full Sleeve Textured T-shirt in Soft White",
      "price": "৳ 900",
      "url": "https://gorurghash.com/product/unisex-henley-full-sleeve-textured-t-shirt-in-soft-white/",
      "description": "A soft-white, full-sleeve textured Henley.",
      "sizes": [
        "L",
        "M",
        "S",
        "XL",
        "XXL"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-268128.jpg"
    }
  ],
  "gorur-ghash/shirts-tops": [
    {
      "id": "gg-210609",
      "name": "Half Sleeve Embroidered Boxy Shirt in Cream",
      "price": "৳ 1,800",
      "url": "https://gorurghash.com/product/half-sleeve-embroidered-boxy-shirt-in-cream/",
      "description": "A cream boxy shirt with contrasting floral embroidery.",
      "sizes": [
        "L",
        "M",
        "S",
        "XL",
        "XXL"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-210609.jpg"
    },
    {
      "id": "gg-210603",
      "name": "Half Sleeve Embroidered Boxy Shirt in Navy Blue",
      "price": "৳ 1,800",
      "url": "https://gorurghash.com/product/half-sleeve-embroidered-boxy-shirt-in-navy-blue/",
      "description": "A navy embroidered shirt in a relaxed, boxy shape.",
      "sizes": [
        "L",
        "M",
        "S",
        "XL",
        "XXL"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-210603.jpg"
    },
    {
      "id": "gg-210519",
      "name": "Men’s Full Sleeve Safari Shirt in Olive",
      "price": "৳ 1,600",
      "url": "https://gorurghash.com/product/mens-full-sleeve-safari-shirt-in-olive/",
      "description": "An olive safari shirt with full sleeves.",
      "sizes": [
        "L",
        "M",
        "S",
        "XL",
        "XXL"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-210519.jpg"
    }
  ],
  "gorur-ghash/pants-outwear": [
    {
      "id": "gg-267643",
      "name": "Relaxed Fit Pants in Cream",
      "price": "৳ 1,800",
      "url": "https://gorurghash.com/product/relaxed-fit-pants-in-cream/",
      "description": "Cream trousers with a relaxed fit.",
      "sizes": [
        "XXL",
        "XL",
        "L",
        "M",
        "S"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-267643.jpg"
    },
    {
      "id": "gg-267633",
      "name": "Relaxed Fit Pants in Black",
      "price": "৳ 1,800",
      "url": "https://gorurghash.com/product/relaxed-fit-pants-in-black/",
      "description": "Black trousers with an easy, relaxed silhouette.",
      "sizes": [
        "XXL",
        "XL",
        "L",
        "M",
        "S"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-267633.jpg"
    },
    {
      "id": "gg-217330",
      "name": "Baggy Fit Cargo Pants in Off-White",
      "price": "৳ 1,500",
      "url": "https://gorurghash.com/product/baggy-fit-cargo-pants-in-off-white/",
      "description": "Off-white cargo pants with a baggy fit.",
      "sizes": [
        "L",
        "M",
        "S",
        "XL",
        "XS",
        "XXL"
      ],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gg-217330.jpg"
    }
  ],
  "guzel/festive": [
    {
      "id": "gz-zayrish",
      "name": "Zayrish",
      "price": "৳ 11,000",
      "url": "https://guzeldesigner.studio/product/zayrish/",
      "description": "Embroidered festive dressing, with the focus on fine detail.",
      "sizes": [],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gz-zayrish.jpg"
    },
    {
      "id": "gz-wahaj",
      "name": "Wahaj",
      "price": "৳ 13,000",
      "url": "https://guzeldesigner.studio/product/wahaj/",
      "description": "A festive silhouette designed for special occasions.",
      "sizes": [],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gz-wahaj.jpg"
    },
    {
      "id": "gz-zaim",
      "name": "Zaim",
      "price": "৳ 11,000",
      "url": "https://guzeldesigner.studio/product/zaim/",
      "description": "A considered addition to the ethnic and festive edit.",
      "sizes": [],
      "sourceChecked": "2026-11-15",
      "image": "./images/shop-gz-zaim.jpg"
    }
  ],
  "guzel/nawabpur": [
    {
      "id": "dune",
      "name": "Dune",
      "price": "৳ 28,000",
      "image": "./images/nawabpur-dune.jpeg",
      "url": "https://guzeldesigner.studio/product/dune/",
      "description": "A relaxed olive-toned jacket with a stand collar and understated structure.",
      "colour": "Olive",
      "sizes": [],
      "sourceChecked": "2026-11-15"
    },
    {
      "id": "grove",
      "name": "Grove",
      "price": "৳ 28,000",
      "image": "./images/nawabpur-grove.jpeg",
      "url": "https://guzeldesigner.studio/product/grove/",
      "description": "A double-breasted silhouette in a muted sage tone.",
      "colour": "Sage",
      "sizes": [],
      "sourceChecked": "2026-11-15"
    },
    {
      "id": "luna",
      "name": "Luna",
      "price": "৳ 27,000",
      "image": "./images/nawabpur-luna.jpeg",
      "url": "https://guzeldesigner.studio/product/luna/",
      "description": "An ivory-toned tailored jacket with a clean profile.",
      "colour": "Ivory",
      "sizes": [],
      "sourceChecked": "2026-11-15"
    }
  ]
};
