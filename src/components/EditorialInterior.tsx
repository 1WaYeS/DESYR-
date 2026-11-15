import { BrandDefinition } from '../data/brands';
import './editorial-interior.css';

export function EditorialInterior({ brand, side, onSelect }: {
  brand: BrandDefinition; side: 'left' | 'right'; onSelect?: (slug: string) => void;
}) {
  const guzel = brand.id === 'guzel';
  const rebels = brand.id === 'wrongs-and-rebels';
  const category = (index: number) => brand.categories[index];
  const link = (index: number) => <button className="edition-link" onClick={() => onSelect?.(category(index).slug)}>Explore collection <span aria-hidden="true">→</span></button>;
  const title = (index: number) => <h2><span>{category(index).number} /</span>{guzel ? index === 1 ? <>NAWABPUR<strong className="edition-year">26</strong></> : <>ETHNIC &amp;<br /><em className="edition-category-line">FESTIVE WEAR</em></> : category(index).title}</h2>;
  const photo = (src: string, alt: string, className = '') => <img className={className} src={`./images/${src}`} alt={alt} draggable={false} />;
  return <article className={`edition edition--${brand.id} edition--${side}`}>
    <header className="edition-running"><strong>{brand.name}</strong><span>{guzel ? 'A STUDY IN FORM' : rebels ? 'THE URBAN ISSUE' : 'THE EVERYDAY EDIT'}</span></header>
    {side === 'left' ? guzel ? <div className="edition-atelier">
      <div className="edition-atelier-copy"><h1>Tradition,<br />in the present.</h1>{title(0)}<p>Festive dressing, reimagined for today. Rich craftsmanship, refined detail and considered silhouettes honour heritage while feeling modern.</p><figure>{photo('guzel-highres-embroidery-focus.jpg', 'Copper embroidery on dark Guzel fabric')}<figcaption>Fig. 01 — A study in threadwork.</figcaption></figure>{link(0)}</div>
      {photo('guzel-ethnic-editorial.jpg', 'Guzel black embroidered kurta with cream trousers', 'edition-atelier-portrait')}
    </div> : <div className="edition-cover-story">
      {photo(rebels ? 'model-wr-shirt.jpg' : 'gg-m1.jpg', rebels ? 'Wrongs & Rebels burgundy tee with washed denim' : 'GoruGhash navy, cream and green striped polo', 'edition-hero')}
      <h1>{rebels ? <>OWN YOUR<br />EVERYDAY.</> : <>EVERYDAY,<br />YOUR WAY.</>}</h1>
      <section className="edition-main-copy">{title(0)}<p>{rebels ? 'Core tops and light shackets built for daily city life. Relaxed silhouettes, considered fabrics and a lived-in attitude.' : 'Clean staples with a GoruGhash twist. Comfortable, versatile and easy to style for the rhythm of everyday life.'}</p>
        {!rebels && <figure className="edition-knit-detail">{photo('gg-m1.jpg', 'Striped polo knit detail')}<figcaption>DETAIL STUDY 01<br />Texture, colour & everyday ease.</figcaption></figure>}{link(0)}</section>
    </div> : guzel ? <div className="edition-atelier">
      <div className="edition-atelier-copy">{title(1)}<p>A curated expression of contemporary heritage. Disciplined tailoring, tactile fabrics and subtle detailing for an assured silhouette.</p><figure>{photo('guzel-highres-pocket-square.jpg', 'Guzel pocket square detail')}<figcaption>Fig. 02 — The finishing detail.</figcaption></figure>{link(1)}</div>
      {photo('guzel-groomsline-editorial.jpg', 'Nawabpur 26 dark tailored jacket with grey trousers', 'edition-atelier-portrait')}
    </div> : <div className="edition-features">
      <section className={`edition-feature ${rebels ? 'edition-feature--denim' : ''}`}>
        <div className="edition-photo-frame">{photo(rebels ? 'model-wr-shirt.jpg' : 'model-gg-henley.jpg', rebels ? 'Washed denim from Wrongs & Rebels' : 'GoruGhash cream shirt with black floral embroidery', 'edition-feature-photo')}</div>
        <div>{title(1)}<p>{rebels ? 'Washed denims with a natural fade and relaxed fit. A durable everyday foundation for the modern city wardrobe.' : 'Statement shirts and easy tops. Thoughtful details, natural textures and wearable prints built for self-expression.'}</p>{link(1)}<small>{rebels ? 'DETAIL 02 / WASHED DENIM' : 'DETAIL 02 / PATTERN & TEXTURE'}</small></div>
      </section>
      <section className="edition-feature edition-feature--lower">
        {photo(rebels ? 'wr-anchor.jpg' : 'model-gg-pants.jpg', rebels ? 'Wrongs & Rebels cream and burgundy gradient sweater' : 'GoruGhash cream relaxed trousers', 'edition-feature-photo')}
        <div>{title(2)}<p>{rebels ? 'Textured knits and functional outerwear for the city’s changing pace. Layering pieces that bring warmth, structure and versatility.' : 'Modern tailoring for real life. Structured yet relaxed, designed to move with you, from day to night.'}</p>{link(2)}
          {rebels && <figure className="edition-jacket-detail">{photo('wr-summit.jpg', 'Black zip jacket with cream piping')}<figcaption>DETAIL 03 / PIPED ZIP JACKET</figcaption></figure>}</div>
      </section>
    </div>}
    <footer className="edition-folio"><span>{side === 'left' ? '02' : '03'}</span><span>{brand.name} / ISSUE {brand.issueNumber}</span><span>{side === 'left' ? 'COLLECTION NOTES' : 'THE COLLECTIONS'}</span></footer>
  </article>;
}
