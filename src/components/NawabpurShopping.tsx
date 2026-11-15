import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './nawabpur-shopping.css';

export const NAWABPUR_LOOKS = [
  { id: 'dune', name: 'Dune', price: 28000, image: './images/nawabpur-dune.jpeg', colour: 'Olive', colourHex: '#77724e', description: 'A relaxed olive-toned jacket with a stand collar and understated structure.', note: 'Soft structure. A considered silhouette for everyday ceremony.' },
  { id: 'grove', name: 'Grove', price: 28000, image: './images/nawabpur-grove.jpeg', colour: 'Sage', colourHex: '#777c69', description: 'A double-breasted silhouette in a muted sage tone, paired with light trousers.', note: 'Measured presence and a modern, composed character.' },
  { id: 'luna', name: 'Luna', price: 27000, image: './images/nawabpur-luna.jpeg', colour: 'Ivory', colourHex: '#e8e1ce', description: 'An ivory-toned tailored jacket with a clean profile and considered finishing details.', note: 'Quiet contrast. Light tones, sharp lines and an assured silhouette.' },
];
type BagItem = { id: string; size: string; quantity: number };
const money = (price: number) => `৳ ${price.toLocaleString('en-BD')}`;

export function NawabpurShopping({ onBack, onFloor, targets, onChoose }: { onBack: () => void; onFloor: () => void; targets?: { left: HTMLElement; right: HTMLElement; toolbar: HTMLElement }; onChoose?: () => void }) {
  const [selected, setSelected] = useState('dune');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const [showBag, setShowBag] = useState(false);
  const [mobilePage, setMobilePage] = useState<'read' | 'shop'>('read');
  const [bag, setBag] = useState<BagItem[]>(() => {
    try {
      const data: unknown = JSON.parse(localStorage.getItem('guzel-selection-bag') || '[]');
      return Array.isArray(data) ? data.filter((item): item is BagItem => item && NAWABPUR_LOOKS.some(p => p.id === item.id) && typeof item.size === 'string' && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch { return []; }
  });
  const look = NAWABPUR_LOOKS.find(item => item.id === selected)!;
  useEffect(() => { try { localStorage.setItem('guzel-selection-bag', JSON.stringify(bag)); } catch { /* Browsing works without storage. */ } }, [bag]);
  useEffect(() => {
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') { if (showBag) setShowBag(false); else onBack(); } };
    window.addEventListener('keydown', handle);
    return () => { document.body.style.overflow = prior; window.removeEventListener('keydown', handle); };
  }, [onBack, showBag]);
  function choose(id: string) { setSelected(id); setSize(''); setQuantity(1); setNotice(''); setMobilePage('shop'); onChoose?.(); }
  function add() {
    if (!size) { setNotice('Choose a size preference first.'); return; }
    setBag(items => {
      const found = items.find(item => item.id === selected && item.size === size);
      return found ? items.map(item => item === found ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { id: selected, size, quantity }];
    });
    setNotice(`${look.name} added to your selection bag.`);
  }
  const readingPage = (<section className="nawabpur-page nawabpur-reading" aria-label="Scroll through Nawabpur 26 looks">
        <div className="nawabpur-running">THE COLLECTION<span>NAWABPUR 26</span></div>
        <div className="nawabpur-story-scroll" tabIndex={0} aria-label="Nawabpur 26 editorial — scroll for more looks">
          <h1>Nawabpur 26</h1>
          {NAWABPUR_LOOKS.map((item, index) => <div key={item.id}>
            <article className={`nawabpur-story ${index % 2 ? 'is-reversed' : ''}`}>
              <button className="nawabpur-story-image" onClick={() => choose(item.id)} aria-label={`Select ${item.name}`} aria-pressed={selected === item.id}><img src={item.image} alt={`${item.name} from Guzel's Nawabpur 26 collection`} loading={index === 0 ? 'eager' : 'lazy'} /></button>
              <div className="nawabpur-story-copy"><span className="nawabpur-selected">{selected === item.id ? '● Viewing this look' : `LOOK 0${index + 1}`}</span><h2>0{index + 1} / {item.name}</h2><p>{item.note}</p><button className="nawabpur-text-link" onClick={() => choose(item.id)}>Select this look →</button></div>
            </article>
            {index === 0 && <aside className="nawabpur-passage"><h3>A quieter kind of statement.</h3><p>Refined silhouettes, measured details, and an ease that feels distinctly modern. Explore the balance between structure and quiet confidence.</p></aside>}
          </div>)}
          <p className="nawabpur-end">The end of this edit. <button onClick={onBack}>Explore the collections →</button></p>
        </div>
        <footer className="nawabpur-folio"><span>06</span><span>Scroll to discover more ↓</span></footer>
      </section>);
  const buyingPage = (<section className="nawabpur-page nawabpur-buying" aria-label={`Selected look: ${look.name}`}>
        <div className="nawabpur-running">SELECTED LOOK / {look.name.toUpperCase()}<span>GUZEL</span></div>
        <div className="nawabpur-product-scroll" key={look.id}>
          <div className="nawabpur-product-grid">
            <img className="nawabpur-product-image" src={look.image} alt={`${look.name}, selected outfit`} />
            <div className="nawabpur-product-copy"><h2>{look.name}</h2><p className="nawabpur-product-category">NAWABPUR 26</p><p className="nawabpur-price">{money(look.price)}</p><p>{look.description}</p>
              <label className="nawabpur-size-label" htmlFor="guzel-size">Size preference</label><select id="guzel-size" value={size} onChange={event => { setSize(event.target.value); setNotice(''); }}><option value="">Choose a preference</option>{['S', 'M', 'L', 'XL', 'Confirm with studio'].map(value => <option key={value}>{value}</option>)}</select><small>Final sizing and availability confirmed by the studio.</small>
              <p className="nawabpur-colour"><span style={{ background: look.colourHex }} />{look.colour}</p>
              <div className="nawabpur-quantity"><span>Quantity</span><div><button onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Decrease quantity">−</button><output aria-label="Quantity">{quantity}</output><button onClick={() => setQuantity(value => Math.min(99, value + 1))} disabled={quantity === 99} aria-label="Increase quantity">+</button></div></div>
              <button className="nawabpur-add" onClick={add}>ADD TO BAG →</button><p className="nawabpur-notice" role="status">{notice}</p><a className="nawabpur-store-link" href={`https://guzeldesigner.studio/product/${look.id}/`} target="_blank" rel="noopener noreferrer">Purchase on Guzel ↗</a>
            </div>
          </div>
          <p className="nawabpur-product-note">A study in relaxed refinement.<br />Considered detail, quiet presence.</p>
          <details><summary>Details</summary><p>{look.description} Photographs are from Guzel’s collection. Confirm garment composition, measurements and current price with the studio.</p></details>
          <details><summary>Delivery &amp; returns</summary><p>Delivery and returns are arranged through Guzel. Review the current terms on the product page before purchasing.</p></details>
        </div>
        <footer className="nawabpur-folio"><span>Your selected look</span><span>07</span></footer>
      </section>);
  return <main className={targets ? 'nawabpur-shop nawabpur-shop--embedded' : 'nawabpur-shop'} aria-label="Guzel Nawabpur 26 shopping magazine">
    {targets ? createPortal(<button onClick={() => setShowBag(!showBag)} aria-expanded={showBag}>Bag ({bag.reduce((sum, item) => sum + item.quantity, 0)})</button>, targets.toolbar) : (<header className="nawabpur-toolbar"><button onClick={onBack}>← Collections</button><button className="nawabpur-wordmark" onClick={onFloor} aria-label="Guzel — return to table">GUZEL</button><button onClick={() => setShowBag(!showBag)} aria-expanded={showBag}>Bag ({bag.reduce((sum, item) => sum + item.quantity, 0)})</button></header>)}
    {!targets && <nav className="nawabpur-mobile-tabs" aria-label="Magazine pages"><button aria-pressed={mobilePage === 'read'} onClick={() => setMobilePage('read')}>Read the collection</button><button aria-pressed={mobilePage === 'shop'} onClick={() => setMobilePage('shop')}>Shop {look.name} →</button></nav>}
    {targets ? <>{createPortal(readingPage, targets.left)}{createPortal(buyingPage, targets.right)}</> : <div className={`nawabpur-book nawabpur-mobile--${mobilePage}`}>{readingPage}{buyingPage}</div>}
    {showBag && <aside className="nawabpur-bag" aria-label="Selection bag"><header><h2>Your selection</h2><button onClick={() => setShowBag(false)} aria-label="Close bag">×</button></header><p>Saved on this device. Complete purchases through Guzel.</p>{bag.length === 0 ? <p>Your bag is empty.</p> : bag.map((item, index) => { const product = NAWABPUR_LOOKS.find(p => p.id === item.id)!; return <article key={`${item.id}-${item.size}`}><img src={product.image} alt={product.name} /><div><h3>{product.name}</h3><p>{item.size} · Qty {item.quantity}</p><p>{money(product.price * item.quantity)}</p><a href={`https://guzeldesigner.studio/product/${item.id}/`} target="_blank" rel="noopener noreferrer">Purchase on Guzel ↗</a><button onClick={() => setBag(items => items.filter((_, i) => i !== index))}>Remove</button></div></article>; })}</aside>}
  </main>;
}
