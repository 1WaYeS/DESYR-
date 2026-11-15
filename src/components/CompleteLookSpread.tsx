import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingProduct } from '../data/shopping-catalog';
import type { BrandDefinition } from '../data/brands';
import { outfitSuggestions, outfitReason } from '../data/outfit-recommendations';
import { PriceDropTrigger, AlertProductPrice } from '../features/price-alerts/PriceAlertsUI';
import { SizeFinder } from './SizeFinder';
import { BagContext } from './CategoryShopping';

export function CompleteLookSpread({ brand, anchor, category, targets, onBack, onChoose }: {
  brand: BrandDefinition; anchor: ShoppingProduct; category: string; targets: { left: HTMLElement; right: HTMLElement };
  onBack: () => void; onChoose: () => void;
}) {
  const suggestions = outfitSuggestions(brand.id, category, anchor);
  const pairingBrandId = brand.id === 'wrongs-and-rebels' ? 'gorur-ghash' : 'wrongs-and-rebels';
  const pairingBrand = brand.id === 'wrongs-and-rebels' ? 'GORUR GHASH' : 'WRONGS & REBELS';
  const [selected, setSelected] = useState(suggestions[0].id);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const { bag, setBag } = useContext(BagContext)!;
  const pairing = suggestions.find(item => item.id === selected)!;
  const choose = (id: string) => { setSelected(id); setSize(''); setQuantity(1); setNotice(''); onChoose(); };
  const add = () => {
    if (!size) { setNotice('Choose a size first.'); return; }
    setBag(items => {
      const found = items.find(item => item.id === pairing.id && item.size === size);
      return found ? items.map(item => item === found ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { id: pairing.id, size, quantity }];
    });
    setNotice(pairing.name + ' added to your selection bag. Your original piece was not added again.');
  };
  const theme = 'nawabpur-page shopping-theme shopping-theme--' + brand.id;
  return <>
    {createPortal(<section className={theme + ' nawabpur-reading'} aria-label="Complete the look editorial">
      <div className="nawabpur-running">THE STYLE EDIT<span>{brand.name}</span></div>
      <div className="nawabpur-story-scroll" tabIndex={0}>
        <h1>COMPLETE THE LOOK</h1>
        <article className="nawabpur-story">
          <div className="nawabpur-story-image"><img src={anchor.image} alt={anchor.name} /></div>
          <div className="nawabpur-story-copy"><span className="nawabpur-selected">Your selected piece / {brand.name}</span><h2>{anchor.name}</h2><p>{anchor.description}</p><button className="nawabpur-text-link" onClick={onBack}>← Back to your item</button></div>
        </article>
        <aside className="nawabpur-passage"><h3>Everyday, together.</h3><p>Pieces from another brand, curated to work with your selection. Choose a pairing below.</p></aside>
        {suggestions.map((item, index) => <article className={'nawabpur-story' + (index % 2 === 0 ? ' is-reversed' : '')} key={item.id}>
          <button className="nawabpur-story-image" onClick={() => choose(item.id)} aria-label={'Pair with ' + item.name} aria-pressed={selected === item.id}><img src={item.image} alt={item.name + ' from ' + pairingBrand} loading="lazy" /></button>
          <div className="nawabpur-story-copy"><span className="nawabpur-selected">{selected === item.id ? '● Viewing this pairing' : pairingBrand}</span><h2>{String(index + 2).padStart(2, '0')} / {item.name}</h2><p>{item.description}</p><button className="nawabpur-text-link" onClick={() => choose(item.id)}>Select this pairing →</button></div>
        </article>)}
      </div>
      <footer className="nawabpur-folio"><span>THE CROSS-BRAND EDIT</span><span>Scroll for more pairings ↓</span></footer>
    </section>, targets.left)}
    {createPortal(<section className={theme + ' nawabpur-buying'} aria-label={'Outfit pairing: ' + pairing.name}>
      <div className="nawabpur-running">OUTFIT SELECTION<span>{pairingBrand}</span></div>
      <div className="nawabpur-product-scroll" key={pairing.id}>
        <div className="nawabpur-product-grid">
          <img className="nawabpur-product-image" src={pairing.image} alt={pairing.name} />
          <div className="nawabpur-product-copy"><h2>{pairing.name}</h2><p className="nawabpur-product-category">{pairingBrand} / SUGGESTED PAIRING</p><p className="nawabpur-price"><AlertProductPrice product={pairing}/></p><PriceDropTrigger product={pairing} themeBrandId={brand.id}/><p>{pairing.description}</p>
            <div className="size-selector-heading"><label className="nawabpur-size-label" htmlFor={'pairing-size-' + category}>Select size</label><SizeFinder key={pairing.id} product={pairing} brandId={pairingBrandId} themeBrandId={brand.id} onPickSize={value => { setSize(value); setNotice('Suggested size applied. You can still change it.'); }} /></div><select id={'pairing-size-' + category} value={size} onChange={event => { setSize(event.target.value); setNotice(''); }}><option value="">Choose a size</option>{pairing.sizes.map(value => <option key={value}>{value}</option>)}</select><small>Catalog prices and sizes are a snapshot. Confirm current availability on the brand store.</small>
            <div className="nawabpur-quantity"><span>Quantity</span><div><button disabled={quantity === 1} onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease pairing quantity">−</button><output aria-label="Pairing quantity">{quantity}</output><button disabled={quantity === 99} onClick={() => setQuantity(q => Math.min(99, q + 1))} aria-label="Increase pairing quantity">+</button></div></div>
            <button className="nawabpur-add" onClick={add}>ADD PAIRING TO BAG →</button><p className="nawabpur-notice" role="status">{notice}</p>
            <button className="complete-look-entry" onClick={() => choose(suggestions[(suggestions.findIndex(item => item.id === selected) + 1) % suggestions.length].id)}>Swap suggestion →</button>
            <a className="nawabpur-store-link" href={pairing.url} target="_blank" rel="noopener noreferrer">Shop on {pairingBrand} ↗</a>
          </div>
        </div>
        <p className="nawabpur-product-note">Keep your piece. Complete your outfit.</p><p className="complete-look-note">{bag.some(item => item.id === anchor.id) ? 'Your original piece is already in your bag. Add only the pairing.' : 'This adds only the pairing. Return to your original piece to add it separately.'}</p>
        <details><summary>Why this pairing?</summary><p>{outfitReason(category)} Suggestions are curated from the DESYR catalog.</p></details>
        <details><summary>Delivery &amp; returns</summary><p>Purchase and delivery are arranged separately through each item’s brand store. Your selection bag does not process checkout.</p></details>
        <button className="nawabpur-text-link complete-look-back" onClick={onBack}>← Back to your item</button>
      </div>
      <footer className="nawabpur-folio"><span>Your original selection is saved</span><span>THE STYLE EDIT</span></footer>
    </section>, targets.right)}
  </>;
}
