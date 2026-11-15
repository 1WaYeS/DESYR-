import { useContext, useEffect, useState, createContext, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BRANDS, BrandDefinition, BrandCategory } from '../data/brands';
import { SHOPPING_CATALOG, ShoppingProduct } from '../data/shopping-catalog';
import { PriceDropTrigger, AlertProductPrice } from '../features/price-alerts/PriceAlertsUI';
import { SizeFinder } from './SizeFinder';
import { supportsCompleteLook } from '../data/outfit-recommendations';
import './nawabpur-shopping.css';
import './category-shopping.css';

type BagItem = { id: string; size: string; quantity: number };
export const BagContext = createContext<{ bag: BagItem[]; setBag: Dispatch<SetStateAction<BagItem[]>> } | null>(null);
export function BrandBagProvider({ brand, children }: { brand: BrandDefinition; children: ReactNode }) {
 const key = brand.id === 'guzel' ? 'guzel-selection-bag' : brand.id + '-selection-bag';
 const products = supportsCompleteLook(brand.id) ? Object.values(SHOPPING_CATALOG).flat() : brand.categories.flatMap(category => SHOPPING_CATALOG[brand.id + '/' + category.slug] || []);
 const [bag, setBag] = useState<BagItem[]>(() => { try { const data: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data.filter(item => item && products.some(p => p.id === item.id) && typeof item.size === 'string' && Number.isInteger(item.quantity) && item.quantity > 0) : []; } catch { return []; } });
 useEffect(() => { try { localStorage.setItem(key, JSON.stringify(bag)); } catch { /* Storage is optional. */ } }, [key, bag]);
 return <BagContext.Provider value={{bag,setBag}}>{children}</BagContext.Provider>;
}
const totalPrice = (product: ShoppingProduct, quantity: number) => '\u09f3 ' + (Number(product.price.replace(/[^0-9.]/g,'')) * quantity).toLocaleString('en-BD');

export function CategoryShopping({ brand, category, targets, onBack, onChoose, active, onCompleteLook, onSelection }: { brand: BrandDefinition; category: BrandCategory; targets: { left: HTMLElement; right: HTMLElement; toolbar: HTMLElement }; onBack: () => void; onChoose: () => void; active: boolean; onCompleteLook?: () => void; onSelection?: (product: ShoppingProduct) => void }) {
 const products = SHOPPING_CATALOG[brand.id + '/' + category.slug];
 const allProducts = supportsCompleteLook(brand.id) ? Object.values(SHOPPING_CATALOG).flat() : brand.categories.flatMap(item => SHOPPING_CATALOG[brand.id + '/' + item.slug] || []);
 const { bag, setBag } = useContext(BagContext)!;
  const [selected, setSelected] = useState(products[0].id);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const [showBag, setShowBag] = useState(false);
  const look = products.find(item => item.id === selected)!;
  useEffect(() => { onSelection?.(look); }, [look, onSelection]);
  useEffect(() => { if (!active) setShowBag(false); }, [active]);
  function choose(id: string) { setSelected(id); setSize(''); setQuantity(1); setNotice(''); onChoose(); }
  function add() {
    if (!size) { setNotice('Choose a size preference first.'); return; }
    setBag(items => {
      const found = items.find(item => item.id === selected && item.size === size);
      return found ? items.map(item => item === found ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { id: selected, size, quantity }];
    });
    setNotice(`${look.name} added to your selection bag.`);
  }
  const readingPage = (<section className={`nawabpur-page nawabpur-reading shopping-theme shopping-theme--${brand.id}`} aria-label={`Scroll through ${category.title} looks`}>
        <div className="nawabpur-running">THE COLLECTION<span>{brand.name}</span></div>
        <div className="nawabpur-story-scroll" tabIndex={0} aria-label={`${category.title} editorial - scroll for more looks`}>
          <h1>{category.title}</h1>
          {products.map((item, index) => <div key={item.id}>
            <article className={`nawabpur-story ${index % 2 ? 'is-reversed' : ''}`}>
              <button className="nawabpur-story-image" onClick={() => choose(item.id)} aria-label={`Select ${item.name}`} aria-pressed={selected === item.id}><img src={item.image} alt={`${item.name} from ${brand.name}`} loading={index === 0 ? 'eager' : 'lazy'} /></button>
              <div className="nawabpur-story-copy"><span className="nawabpur-selected">{selected === item.id ? '● Viewing this look' : `LOOK 0${index + 1}`}</span><h2>0{index + 1} / {item.name}</h2><p>{item.description}</p><button className="nawabpur-text-link" onClick={() => choose(item.id)}>Select this look →</button></div>
            </article>
            {index === 0 && <aside className="nawabpur-passage"><h3>{brand.id === 'guzel' ? 'A quieter kind of statement.' : brand.id === 'gorur-ghash' ? 'Everyday, your way.' : 'Own your everyday.'}</h3><p>{category.editorialCaption}</p></aside>}
          </div>)}
          <p className="nawabpur-end">The end of this edit. <button onClick={onBack}>Explore the collections →</button></p>
        </div>
        <footer className="nawabpur-folio"><span>{String(2 + Number(category.number) * 2).padStart(2, '0')}</span><span>Scroll to discover more ↓</span></footer>
      </section>);
  const buyingPage = (<section className={`nawabpur-page nawabpur-buying shopping-theme shopping-theme--${brand.id}`} aria-label={`Selected look: ${look.name}`}>
        <div className="nawabpur-running">SELECTED LOOK / {look.name.toUpperCase()}<span>{brand.name}</span></div>
        <div className="nawabpur-product-scroll" key={look.id}>
          <div className="nawabpur-product-grid">
            <img className="nawabpur-product-image" src={look.image} alt={`${look.name}, selected piece`} />
            <div className="nawabpur-product-copy"><h2>{look.name}</h2><p className="nawabpur-product-category">{category.title}</p><p className="nawabpur-price"><AlertProductPrice product={look}/></p><PriceDropTrigger product={look} themeBrandId={brand.id}/><p>{look.description}</p>
              <div className="size-selector-heading"><label className="nawabpur-size-label" htmlFor={`size-${category.slug}`}>{look.sizes.length ? 'Select size' : 'Size preference'}</label><SizeFinder key={look.id} product={look} brandId={brand.id} active={active} onPickSize={value => { setSize(value); setNotice('Suggested size applied. You can still change it.'); }} /></div><select id={`size-${category.slug}`} value={size} onChange={event => { setSize(event.target.value); setNotice(''); }}><option value="">Choose a size</option>{(look.sizes.length ? look.sizes : ['S', 'M', 'L', 'XL', 'Confirm with studio']).map(value => <option key={value}>{value}</option>)}</select><small>{look.sizes.length ? 'Published sizes; confirm current availability on the brand store.' : 'Size preferences only; confirm final sizing with the studio.'}</small>
              <p className="nawabpur-colour">Colour: {look.colour || 'See photographs'}</p>
              <div className="nawabpur-quantity"><span>Quantity</span><div><button onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Decrease quantity">−</button><output aria-label="Quantity">{quantity}</output><button onClick={() => setQuantity(value => Math.min(99, value + 1))} disabled={quantity === 99} aria-label="Increase quantity">+</button></div></div>
              <button className="nawabpur-add" onClick={add}>ADD TO BAG →</button><p className="nawabpur-notice" role="status">{notice}</p>{supportsCompleteLook(brand.id) && onCompleteLook && <button className="complete-look-entry" onClick={onCompleteLook}>Complete the look →</button>}<a className="nawabpur-store-link" href={look.url} target="_blank" rel="noopener noreferrer">Shop on {brand.name} ↗</a>
            </div>
          </div>
          <p className="nawabpur-product-note">{brand.id === 'guzel' ? 'Considered detail. Quiet presence.' : brand.id === 'gorur-ghash' ? 'Comfort, character and everyday ease.' : 'Built for your everyday rotation.'}</p>
          <details><summary>Details</summary><p>{look.description} Photographs and listed prices come from {brand.name}. Confirm measurements, current price and availability on the brand store.</p></details>
          <details><summary>Delivery &amp; returns</summary><p>Delivery and returns are arranged through {brand.name}. Review the current terms on the product page before purchasing.</p></details>
        </div>
        <footer className="nawabpur-folio"><span>Your selected look</span><span>{String(3 + Number(category.number) * 2).padStart(2, '0')}</span></footer>
      </section>);
  return <div className={`category-shopping-controller shopping-theme--${brand.id}`} aria-label={`${brand.name} ${category.title} shopping`}>
    {active && createPortal(<button className="magazine-cart" onClick={() => setShowBag(!showBag)} aria-expanded={showBag} aria-label={`Open selection bag, ${bag.reduce((sum, item) => sum + item.quantity, 0)} items`} title="Your selection bag"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h18l-2 12H5L3 8Z"/><path d="m8 8 4-6 4 6M9 12v4m6-4v4"/></svg><span className="magazine-cart-count" aria-hidden="true">{bag.reduce((sum, item) => sum + item.quantity, 0)}</span></button>, targets.toolbar)}
    {createPortal(readingPage, targets.left)}{createPortal(buyingPage, targets.right)}
    {showBag && <aside className="nawabpur-bag" aria-label="Selection bag"><header><h2>Your selection</h2><button onClick={() => setShowBag(false)} aria-label="Close bag">×</button></header><p>Saved on this device. Complete each purchase through the item’s brand store.</p>{bag.length === 0 ? <p>Your bag is empty.</p> : bag.map((item, index) => { const product = allProducts.find(p => p.id === item.id)!; return <article key={`${item.id}-${item.size}`}><img src={product.image} alt={product.name} /><div><h3>{product.name}</h3><p>{item.size} · Qty {item.quantity}</p><p>{totalPrice(product, item.quantity)}</p><a href={product.url} target="_blank" rel="noopener noreferrer">Shop on {BRANDS.find(b => b.categories.some(c => (SHOPPING_CATALOG[b.id + '/' + c.slug] || []).some(p => p.id === product.id)))?.name || brand.name} ↗</a><button onClick={() => setBag(items => items.filter((_, i) => i !== index))}>Remove</button></div></article>; })}</aside>}
  </div>;
}
