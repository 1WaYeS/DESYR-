import { SHOPPING_CATALOG, type ShoppingProduct } from './shopping-catalog';

export const COMPLETE_LOOK_SUFFIX = '-complete-look';
export function supportsCompleteLook(brandId: string): boolean {
  return brandId === 'gorur-ghash' || brandId === 'wrongs-and-rebels';
}
export function outfitSuggestions(brandId: string, category: string, anchor: ShoppingProduct): ShoppingProduct[] {
  // Catalog-based curation. No AI service or live inventory is claimed.
  const key = brandId === 'wrongs-and-rebels'
    ? category === 'pants-denims' ? 'gorur-ghash/tshirts-polo' : 'gorur-ghash/pants-outwear'
    : category === 'pants-outwear' ? 'wrongs-and-rebels/tops-shackets' : 'wrongs-and-rebels/pants-denims';
  const items = SHOPPING_CATALOG[key];
  const offset = /forest|olive|black/i.test(anchor.name) ? 1 : /cream|white/i.test(anchor.name) ? 2 : 0;
  return [...items.slice(offset), ...items.slice(0, offset)];
}
export function outfitReason(category: string): string {
  return category === 'pants-outwear' || category === 'pants-denims'
    ? 'A relaxed top balances the easy trouser shape. These cross-brand picks keep the outfit casual and comfortable.'
    : 'Relaxed trousers balance the texture and shape of your selected top. These cross-brand picks make an easy everyday pairing.';
}
