import type { ProductSizeChart } from './size-charts';

export type Fit = 'snug' | 'regular' | 'loose';
export const EASE: Record<Fit, number> = { snug: 4, regular: 8, loose: 14 };
export const normalizeSize = (label: string) => label.trim().toUpperCase().replace(/^2XL$/, 'XXL');
export const estimateChest = (heightCm: number, weightKg: number) => .33 * heightCm + .35 * weightKg + 10;
export const chestFromKnownSize = (garmentChestCm: number, sourceFit: Fit) => garmentChestCm - EASE[sourceFit];
export type SizeRecommendation =
  | { status: 'ok'; size: string; chestCm: number; targetCm: number; differenceCm: number; confidence: number }
  | { status: 'unavailable' | 'too-small'; message: string };

export function recommendSize(chart: ProductSizeChart, bodyChestCm: number, fit: Fit, availableLabels?: string[], stock?: Record<string, number>): SizeRecommendation {
  if (!Number.isFinite(bodyChestCm) || bodyChestCm <= 0 || !['snug', 'regular', 'loose'].includes(fit)) throw new Error('Enter valid measurements and a fit preference.');
  const targetCm = bodyChestCm + EASE[fit];
  const valid = chart.sizes.filter(row => row.chestCm >= bodyChestCm + 2);
  if (!valid.length) return { status: 'too-small', message: 'No size in this chart has enough chest room. Please check with the brand.' };
  const listed = valid.filter(row => !availableLabels || availableLabels.some(label => normalizeSize(label) === normalizeSize(row.label)))
    .filter(row => !stock || Object.entries(stock).some(([label, count]) => normalizeSize(label) === normalizeSize(row.label) && count > 0));
  if (!listed.length) return { status: 'unavailable', message: 'No suitable size is listed for this item. Please check current options with the brand.' };
  const best = [...listed].sort((a, b) => {
    const delta = Math.abs(a.chestCm - targetCm) - Math.abs(b.chestCm - targetCm);
    return Math.abs(delta) < .00001 ? b.chestCm - a.chestCm : delta;
  })[0];
  const size = availableLabels?.find(label => normalizeSize(label) === normalizeSize(best.label)) || best.label;
  return { status: 'ok', size, chestCm: best.chestCm, targetCm, differenceCm: best.chestCm - targetCm, confidence: Math.max(0, Math.round(100 - 10 * Math.abs(best.chestCm - targetCm))) };
}
