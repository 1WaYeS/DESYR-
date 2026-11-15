import { SHOPPING_CATALOG } from './shopping-catalog';

export interface SizeChartRow { label: string; chestCm: number; }
export interface ProductSizeChart {
  productId: string;
  brandId: string;
  sourceUrl: string;
  checkedOn: string;
  measurement: string;
  sizes: SizeChartRow[];
}

// Product-specific garment measurements, checked against the official product
// pages on 2026-11-15. Never substitute a brand-wide or sample PDF chart.
const published: [string, string, string[], number[], 'inches-full' | 'cm-half'][] = [
  ['gg-210906', 'gorur-ghash', ['S', 'M', 'L', 'XL', 'XXL'], [38, 40, 42, 44, 46], 'inches-full'],
  ['gg-206658', 'gorur-ghash', ['S', 'M', 'L', 'XL'], [44, 46, 48, 50], 'inches-full'],
  ['gg-268128', 'gorur-ghash', ['S', 'M', 'L', 'XL', 'XXL'], [42, 44, 46, 48, 50], 'inches-full'],
  ['gg-210609', 'gorur-ghash', ['S', 'M', 'L', 'XL', 'XXL'], [45, 47, 49, 51, 53], 'inches-full'],
  ['gg-210603', 'gorur-ghash', ['S', 'M', 'L', 'XL', 'XXL'], [43, 45, 47, 49, 51], 'inches-full'],
  ['gg-210519', 'gorur-ghash', ['S', 'M', 'L', 'XL', 'XXL'], [40, 42, 44, 46, 48], 'inches-full'],
  ['wr-8301191004346', 'wrongs-and-rebels', ['S', 'M', 'L', 'XL'], [57, 59, 62, 66], 'cm-half'],
  ['wr-8349443457210', 'wrongs-and-rebels', ['S', 'M', 'L', 'XL'], [56, 59, 62, 64], 'cm-half'],
  ['wr-8349525901498', 'wrongs-and-rebels', ['XS', 'S', 'M', 'L', 'XL', 'XXL'], [54, 56, 58, 60, 62, 64], 'cm-half'],
  ['wr-8301191495866', 'wrongs-and-rebels', ['S', 'M', 'L'], [53, 56, 59], 'cm-half'],
  ['wr-8301193265338', 'wrongs-and-rebels', ['S', 'M', 'L', 'XL'], [53, 56, 58, 60], 'cm-half'],
  ['wr-8301191987386', 'wrongs-and-rebels', ['S', 'M', 'L'], [53, 56, 59], 'cm-half'],
];

const products = Object.values(SHOPPING_CATALOG).flat();
export const SIZE_CHARTS: ProductSizeChart[] = published.map(([productId, brandId, labels, values, unit]) => ({
  productId, brandId,
  sourceUrl: products.find(product => product.id === productId)!.url,
  checkedOn: '2026-11-15',
  measurement: unit === 'inches-full' ? 'Published garment chest circumference in inches, converted to cm.' : 'Published half-chest width in cm, doubled to full circumference.',
  sizes: labels.map((label, index) => ({ label, chestCm: Math.round(values[index] * (unit === 'inches-full' ? 2.54 : 2) * 100) / 100 })),
}));

export const getSizeChart = (productId: string) => SIZE_CHARTS.find(chart => chart.productId === productId);
export const isTrouserProduct = (productId: string) => Object.entries(SHOPPING_CATALOG).some(([key, items]) => key.includes('pants') && items.some(item => item.id === productId));
