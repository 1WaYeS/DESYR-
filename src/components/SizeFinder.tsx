import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { BRANDS } from '../data/brands';
import { SHOPPING_CATALOG, type ShoppingProduct } from '../data/shopping-catalog';
import { SIZE_CHARTS, getSizeChart, isTrouserProduct } from '../data/size-charts';
import { chestFromKnownSize, estimateChest, recommendSize, type Fit, type SizeRecommendation } from '../data/size-recommendation';
import './size-finder.css';

const STORAGE_KEY = 'desyr-size-profile-v1';
const allProducts = Object.values(SHOPPING_CATALOG).flat();
type Profile = { method: 'brand' | 'body'; knownProductId: string; sizeLabel: string; sourceFit: Fit; fit: Fit; measurement: 'chest' | 'estimate'; chest: string; unit: 'cm' | 'in'; height: string; weight: string };
type Result = { chestCm: number; basedOn: string; estimated: boolean; recommendation?: SizeRecommendation };
const isFit = (value: unknown): value is Fit => value === 'snug' || value === 'regular' || value === 'loose';
function readProfile(): Profile | null {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!data || typeof data !== 'object') return null;
    const p = data as Partial<Profile>;
    const chart = SIZE_CHARTS.find(item => item.productId === p.knownProductId);
    if (!chart || typeof p.sizeLabel !== 'string' || p.sizeLabel.length > 10 || (p.method === 'brand' && !chart.sizes.some(row => row.label === p.sizeLabel)) || !isFit(p.fit) || !isFit(p.sourceFit)) return null;
    if ((p.method !== 'brand' && p.method !== 'body') || (p.measurement !== 'chest' && p.measurement !== 'estimate') || (p.unit !== 'cm' && p.unit !== 'in')) return null;
    if (![p.chest, p.height, p.weight].every(value => typeof value === 'string' && value.length < 16)) return null;
    return { method: p.method, knownProductId: chart.productId, sizeLabel: p.sizeLabel!, sourceFit: p.sourceFit, fit: p.fit, measurement: p.measurement, unit: p.unit, chest: p.chest!, height: p.height!, weight: p.weight! };
  } catch { return null; }
}
const rounded = (value: number) => Math.round(value * 10) / 10;

export function SizeFinder({ product, brandId, themeBrandId = brandId, onPickSize, active = true }: { product: ShoppingProduct; brandId: string; themeBrandId?: string; onPickSize: (size: string) => void; active?: boolean }) {
  const id = useId();
  const source = getSizeChart(product.id) || SIZE_CHARTS[0];
  const [profile, setProfile] = useState<Profile>({ method: 'brand', knownProductId: source.productId, sizeLabel: '', sourceFit: 'regular', fit: 'regular', measurement: 'chest', chest: '', unit: 'cm', height: '', weight: '' });
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [storageNote, setStorageNote] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const targetChart = getSizeChart(product.id);
  const trousers = isTrouserProduct(product.id);
  const knownChart = getSizeChart(profile.knownProductId)!;
  const knownProduct = allProducts.find(item => item.id === knownChart.productId)!;
  const brandName = BRANDS.find(brand => brand.id === brandId)!.name;
  const change = (values: Partial<Profile>) => { setProfile(p => ({ ...p, ...values })); setResult(null); setError(''); };
  const close = () => setOpen(false);
  const show = () => {
    const saved = readProfile();
    if (saved) setProfile(saved);
    setRemember(!!saved); setResult(null); setError(''); setStorageNote(''); setOpen(true);
  };
  useEffect(() => { if (!active) setOpen(false); }, [active]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => heading.current?.focus());
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')).filter(item => item.getClientRects().length > 0);
      const first = items[0]; const last = items[items.length - 1];
      const outside = !panel.current!.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current || outside)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === heading.current || outside)) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handle, true);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', handle, true); trigger.current?.focus({ preventScroll: true }); };
  }, [open]);

  function calculate(event: FormEvent) {
    event.preventDefault(); setError(''); setStorageNote('');
    let chestCm: number; let basedOn: string; let estimated = false;
    if (profile.method === 'brand') {
      const row = knownChart.sizes.find(item => item.label === profile.sizeLabel);
      if (!row) { setError('Choose a charted garment and size.'); return; }
      chestCm = chestFromKnownSize(row.chestCm, profile.sourceFit);
      basedOn = knownProduct.name + ' / ' + row.label;
    } else if (profile.measurement === 'chest') {
      chestCm = Number(profile.chest) * (profile.unit === 'in' ? 2.54 : 1);
      if (!Number.isFinite(chestCm) || chestCm < 60 || chestCm > 150) { setError('Enter chest circumference between 60 and 150 cm (23.6–59.1 in).'); return; }
      basedOn = 'your chest measurement';
    } else {
      const height = Number(profile.height); const weight = Number(profile.weight);
      if (!Number.isFinite(height) || height < 120 || height > 220 || !Number.isFinite(weight) || weight < 30 || weight > 200) { setError('Enter height 120–220 cm and weight 30–200 kg.'); return; }
      chestCm = estimateChest(height, weight); estimated = true; basedOn = 'height and weight estimate';
    }
    const recommendation = targetChart ? recommendSize(targetChart, chestCm, profile.fit, product.sizes.length ? product.sizes : undefined) : undefined;
    setResult({ chestCm, basedOn, estimated, recommendation });
    try {
      if (remember) { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); setStorageNote('Fit profile saved on this device.'); }
      else localStorage.removeItem(STORAGE_KEY);
    } catch { setStorageNote('Your result works, but this browser could not save the profile.'); }
  }
  const forget = () => {
    setRemember(false);
    try { localStorage.removeItem(STORAGE_KEY); setStorageNote('Saved fit profile removed from this device.'); } catch { setStorageNote('This browser could not update saved preferences.'); }
  };
  const rec = result?.recommendation;
  const comparisons = result ? BRANDS.filter(brand => brand.id !== brandId).map(brand => {
    const chart = SIZE_CHARTS.find(item => item.brandId === brand.id);
    const item = allProducts.find(p => p.id === chart?.productId);
    return { brand, chart, item, recommendation: chart && item ? recommendSize(chart, result.chestCm, profile.fit, item.sizes) : undefined };
  }) : [];
  return <>
    <button ref={trigger} type="button" className="size-finder-trigger" onClick={show} aria-haspopup="dialog" aria-controls={open ? id : undefined}>Find my size</button>
    {open && active && createPortal(<div className="size-finder-overlay">
      <div className="size-finder-scrim" onClick={close} aria-hidden="true" />
      <div ref={panel} id={id} className={'size-finder-panel size-finder--' + themeBrandId} role="dialog" aria-modal="true" aria-labelledby={id + '-title'}>
        <header><h2 ref={heading} tabIndex={-1} id={id + '-title'}>{result ? 'Your suggested fit' : 'Find your fit'}</h2><button type="button" onClick={close} aria-label="Close size finder">×</button></header>
        <p className="size-finder-item">{brandName} / {product.name}</p>
        {trousers ? <div className="size-finder-unavailable"><h3>Trousers need a different measure.</h3><p>This finder currently uses chest measurements for tops and jackets. We need waist, hip and inseam charts before suggesting a trouser size.</p><a href={product.url} target="_blank" rel="noopener noreferrer">Check sizing with {brandName} ↗</a></div> : <>
          {!targetChart && <p className="size-finder-unavailable" role="note">A verified chest chart is not available for this item yet. You can check your fit profile below, but we cannot recommend or apply a {brandName} size until the brand supplies its measurements.</p>}
          {!result ? <form onSubmit={calculate} noValidate>
            <p>Compare a garment you already wear, or use your measurements.</p>
            <div className="size-finder-tabs" role="group" aria-label="How to find your size"><button type="button" aria-pressed={profile.method === 'brand'} onClick={() => change({ method: 'brand' })}>Compare a brand I wear</button><button type="button" aria-pressed={profile.method === 'body'} onClick={() => change({ method: 'body' })}>Use measurements</button></div>
            {profile.method === 'brand' ? <>
              <label>Brand<select value={knownChart.brandId} onChange={event => { const chart = SIZE_CHARTS.find(c => c.brandId === event.target.value)!; change({ knownProductId: chart.productId, sizeLabel: '' }); }}>{BRANDS.map(brand => <option key={brand.id} value={brand.id} disabled={!SIZE_CHARTS.some(chart => chart.brandId === brand.id)}>{brand.name}{!SIZE_CHARTS.some(chart => chart.brandId === brand.id) ? ' — chart unavailable' : ''}</option>)}</select></label>
              <label>Item I already wear<select value={knownChart.productId} onChange={event => { const chart = getSizeChart(event.target.value)!; change({ knownProductId: chart.productId, sizeLabel: '' }); }}>{SIZE_CHARTS.filter(chart => chart.brandId === knownChart.brandId).map(chart => <option key={chart.productId} value={chart.productId}>{allProducts.find(item => item.id === chart.productId)!.name}</option>)}</select></label>
              <div className="size-finder-fields"><label>Size I wear<select value={profile.sizeLabel} onChange={event => change({ sizeLabel: event.target.value })}><option value="">Choose a size</option>{knownChart.sizes.map(row => <option key={row.label}>{row.label}</option>)}</select></label><label>How does it fit?<select value={profile.sourceFit} onChange={event => change({ sourceFit: event.target.value as Fit })}><option value="snug">Snug</option><option value="regular">Regular</option><option value="loose">Loose</option></select></label></div>
              <small>Choose the actual item: size measurements vary within a brand.</small>
            </> : <>
              <div className="size-finder-tabs size-finder-tabs--small" role="group" aria-label="Measurement method"><button type="button" aria-pressed={profile.measurement === 'chest'} onClick={() => change({ measurement: 'chest' })}>Chest measurement</button><button type="button" aria-pressed={profile.measurement === 'estimate'} onClick={() => change({ measurement: 'estimate' })}>Height &amp; weight</button></div>
              {profile.measurement === 'chest' ? <><div className="size-finder-fields"><label>Chest circumference<input type="number" inputMode="decimal" step="0.1" value={profile.chest} onChange={event => change({ chest: event.target.value })} /></label><label>Unit<select value={profile.unit} onChange={event => change({ unit: event.target.value as 'cm' | 'in', chest: '' })}><option value="cm">Centimetres</option><option value="in">Inches</option></select></label></div><small>Measure around the fullest part of your chest, with the tape level and relaxed. Enter the full circumference, not half-width.</small></> : <><div className="size-finder-fields"><label>Height (cm)<input type="number" inputMode="decimal" value={profile.height} onChange={event => change({ height: event.target.value })} /></label><label>Weight (kg)<input type="number" inputMode="decimal" value={profile.weight} onChange={event => change({ weight: event.target.value })} /></label></div><small>Height and weight give an approximate chest estimate. A tape measurement is a better starting point.</small></>}
            </>}
            <label>Preferred fit for this item<select value={profile.fit} onChange={event => change({ fit: event.target.value as Fit })}><option value="snug">Snug</option><option value="regular">Regular</option><option value="loose">Loose</option></select></label>
            <label className="size-finder-remember"><input type="checkbox" checked={remember} onChange={event => event.target.checked ? setRemember(true) : forget()} />Remember my fit on this device</label>
            <p className="size-finder-error" role="alert">{error}</p><button type="submit" className="size-finder-primary">{targetChart ? 'Find my size →' : 'Check my fit profile →'}</button>
          </form> : <div className="size-finder-result" aria-live="polite">
            <p>Chest {result.estimated || profile.method === 'brand' ? 'estimate' : 'measurement'}: <strong>{rounded(result.chestCm)} cm</strong><br /><small>Based on {result.basedOn} / {profile.fit} fit</small></p>
            {rec?.status === 'ok' ? <><div className="size-finder-size">{rec.size}</div><p>{Math.abs(rec.differenceCm) < .1 ? 'Closest to your preferred chest room.' : (rec.differenceCm > 0 ? 'More room' : 'Less room') + ' than your preferred fit (' + (rec.differenceCm > 0 ? '+' : '') + rounded(rec.differenceCm) + ' cm).'}</p><p>Chart match: {rec.confidence}%<small>A chart-distance score, not a fit guarantee. Chest fit does not check shoulders, length or fabric stretch.</small></p>{rec.confidence < 50 && <p className="size-finder-unavailable">This is the closest listed size, but its chart match is weak. Consider another garment or confirm with the brand.</p>}<button className="size-finder-primary" type="button" onClick={() => { onPickSize(rec.size); close(); }}>Use size {rec.size} for this item →</button></> : <p className="size-finder-unavailable">{rec?.message || 'Your fit profile is ready, but this item still needs a verified brand chart before we can suggest a size.'}</p>}
            <button type="button" className="size-finder-link" onClick={() => setResult(null)}>Edit my details</button>
            <details><summary>Compare other charted items</summary>{comparisons.map(({ brand, chart, item, recommendation }) => <p key={brand.id}><strong>{brand.name}</strong><br />{item ? <>{item.name}<br />{recommendation?.status === 'ok' ? 'Suggested ' + recommendation.size : recommendation?.message}<br /><a href={chart!.sourceUrl} target="_blank" rel="noopener noreferrer">Check this item’s chart ↗</a></> : 'Verified measurements are not available yet.'}</p>)}<small>Each recommendation is specific to the named garment, not every item from that brand.</small></details>
          </div>}
          {targetChart && <details className="size-finder-chart"><summary>Measurements &amp; source</summary><p>{targetChart.measurement} Checked {targetChart.checkedOn}.</p><table><caption>{product.name} — full garment chest</caption><thead><tr><th>Size</th><th>Chest (cm)</th></tr></thead><tbody>{targetChart.sizes.map(row => <tr key={row.label}><td>{row.label}</td><td>{rounded(row.chestCm)}</td></tr>)}</tbody></table><a href={targetChart.sourceUrl} target="_blank" rel="noopener noreferrer">View the brand’s product chart ↗</a></details>}
          <p className="size-finder-storage" role="status">{storageNote}</p><p className="size-finder-footnote">Listed sizes are a catalog snapshot; live stock is not connected. Confirm current measurements and availability with the brand. Fit details stay in this browser and are not sent to a server.</p>
        </>}
      </div>
    </div>, document.body)}
  </>;
}
