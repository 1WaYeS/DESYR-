import { useEffect,useRef,useState,type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingProduct } from '../../data/shopping-catalog';
import { BRANDS } from '../../data/brands';
import { CATALOG_PRODUCTS,DISCOUNTS,formatPrice,targetCents,type PriceAlert,type PriceNotification } from './model';
import { usePriceAlerts } from './PriceAlertsContext';
import './price-alerts.css';

export function BellIcon(){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>;}
export function PriceAlertsBell(){const ctx=usePriceAlerts();const count=ctx.alerts.filter(a=>['ACTIVE','PAUSED'].includes(a.status)).length;return <button type="button" className="price-alerts-bell" aria-label={`My price alerts, ${count} tracked products`} title="My Price Alerts" onClick={ctx.openManager}><BellIcon/>{count>0&&<span aria-hidden="true">{count}</span>}</button>;}
export function PriceDropTrigger({product,themeBrandId}:{product:ShoppingProduct;themeBrandId?:string}){const ctx=usePriceAlerts();const exists=ctx.alerts.some(a=>a.productId===product.id&&['ACTIVE','PAUSED'].includes(a.status));return <button className="price-drop-entry" type="button" onClick={()=>ctx.openProduct(product.id,themeBrandId)}><BellIcon/>{exists?'Edit your price alert':'Notify me of a price drop'}</button>;}
export function AlertProductPrice({product}:{product:ShoppingProduct}){const ctx=usePriceAlerts();const entry=ctx.product(product.id);return <>{ctx.configured&&entry?formatPrice(entry.currentCents):product.price}</>;}
const brandName=(id:string)=>BRANDS.find(b=>b.id===id)?.name||id;
const statusLabel=(status:string):string=>({ACTIVE:'Waiting',PAUSED:'Paused',TRIGGERED:'Triggered',CANCELLED:'Deleted',PENDING:'Queued',SENDING:'Sending',RETRY:'Retrying',SENT:'Sent',PREVIEW:'Preview only',FAILED:'Not delivered',UNKNOWN:'Needs delivery review'} as Record<string,string>)[status]||status;
const date=(value:string)=>new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
const ignore=()=>{};

function ModeNote(){const ctx=usePriceAlerts();return <p className="price-mode-note">{ctx.mode==='browser-preview'?'Browser preview — saved on this device. Live price checks and email are not connected.':ctx.mode==='backend-preview'?'Development backend — catalog snapshots may be used. Check history for delivery status.':'Your alerts use your account and the connected official price source.'}</p>;}
function SignIn(){const ctx=usePriceAlerts();const [username,setUsername]=useState('');const [password,setPassword]=useState('');const submit=(event:FormEvent)=>{event.preventDefault();ctx.signIn(username,password).catch(ignore);};return <form className="price-signin" onSubmit={submit}><h3>Sign in for your alerts.</h3><p>Use your DESYR account to save alerts and receive notifications.</p><label>Username<input autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Password<input autoComplete="current-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><p className="price-error" role="alert">{ctx.error}</p><button className="price-primary" disabled={ctx.busy||!ctx.ready}>Sign in →</button></form>;}

function CreateAlert(){
  const ctx=usePriceAlerts();const view=ctx.view;
  const editing=view?.kind==='create'?ctx.alerts.find(a=>a.id===view.editingId):undefined;
  const [discount,setDiscount]=useState(editing?.discount||20);const [requestId]=useState(()=>crypto.randomUUID());
  if(view?.kind!=='create')return null;
  const entry=ctx.product(view.productId);const display=entry||CATALOG_PRODUCTS.find(p=>p.id===view.productId);
  const reference=editing?.referenceCents??entry?.referenceCents;
  const target=reference?targetCents(reference,discount):undefined;
  const canCreate=ctx.ready&&entry&&(!ctx.configured||(ctx.user?.emailVerified&&(ctx.mode!=='live'||entry.isLive)));
  const save=(event:FormEvent)=>{event.preventDefault();if(editing)ctx.change(editing.id,'edit',discount).catch(ignore);else ctx.create(view.productId,discount,requestId).catch(ignore);};
  return <div className={'price-create-panel price-theme--'+view.themeBrandId}>
    <header><h2 tabIndex={-1} data-price-heading>{editing?'Edit price alert':'Create price alert'}</h2><button type="button" onClick={ctx.close} aria-label="Close price alert">×</button></header>
    {display&&<div className="price-create-product"><img src={display.image} alt={display.name}/><div><span>{brandName(display.brandId)}</span><h3>{display.name}</h3></div></div>}
    <ModeNote/>
    <p className="price-error" role="alert">{ctx.error}</p>
    {ctx.configured&&!ctx.ready?<p>The price-alert backend is unavailable. Refresh this page after reconnecting; no alert has been saved.</p>:ctx.configured&&!ctx.user?<SignIn/>:<form onSubmit={save}>
      {ctx.configured&&!ctx.user?.emailVerified&&<p className="price-error">Confirm your account email with DESYR before enabling email alerts.</p>}
      {ctx.configured&&entry&&!entry.isLive&&<p className="price-mode-note">This item uses a catalog snapshot. Its alerts cannot send live email until an official price source is connected.</p>}
      <dl className="price-create-prices"><div><dt>Reference price</dt><dd>{reference?formatPrice(reference):'Unavailable'}</dd></div><div><dt>Current price</dt><dd>{entry?formatPrice(editing?.currentCents??entry.currentCents):'Unavailable'}</dd></div></dl>
      <fieldset><legend>Notify me when the price drops by</legend><div className="price-discounts">{DISCOUNTS.map(value=><label className={discount===value?'is-selected':''} key={value}><input type="radio" name="price-discount" checked={discount===value} value={value} onChange={()=>setDiscount(value)}/>{value}%</label>)}</div></fieldset>
      <p className="price-target">Alert me at <strong>{target===undefined?'—':formatPrice(target)}</strong> or less.</p>
      <p className="price-small">Editing your discount keeps this reference price. Each product has its own preference.</p>
      <p className="price-small">One notification per alert. Further price drops will not send another. A new cycle must be created explicitly.</p>
      {ctx.user&&<p className="price-small">Notification email: {ctx.user.email}</p>}
      <button className="price-primary" disabled={ctx.busy||!canCreate}>{ctx.busy?'Saving…':editing?'Save discount →':'Create alert →'}</button>
    </form>}
  </div>;
}

function PriceDetails({alert}:{alert:PriceAlert}){
  const ctx=usePriceAlerts();const [confirm,setConfirm]=useState(false);
  const note=ctx.notifications.find(n=>n.alertId===alert.id);
  return <>
    <div className="price-detail-grid"><img src={alert.product.image} alt={alert.product.name}/><div><span className="price-brand">{brandName(alert.product.brandId)}</span><h2>{alert.product.name}</h2><dl className="price-fields"><div><dt>Reference price</dt><dd>{formatPrice(alert.referenceCents)}</dd></div><div><dt>{ctx.mode==='browser-preview'?'Preview current price':'Current price'}</dt><dd>{formatPrice(alert.currentCents)}</dd></div><div><dt>Your discount</dt><dd>{alert.discount}%</dd></div><div><dt>Target price</dt><dd>{formatPrice(alert.targetCents)}</dd></div></dl><span className={'price-status price-status--'+alert.status.toLowerCase()}>{statusLabel(alert.status)}</span></div></div>
    <p>{alert.status==='ACTIVE'?'We are waiting for the selling price to reach your target.':alert.status==='PAUSED'?'This alert is paused. It will not trigger until you resume it.':alert.status==='TRIGGERED'?'This alert cycle is complete. Further price changes will not send another notification.':'This alert has been deleted. Its notification history remains available.'}</p>
    <div className="price-actions">
      {alert.status!=='CANCELLED'&&<button onClick={()=>ctx.openProduct(alert.productId,alert.product.brandId)} disabled={ctx.busy}>{alert.status==='TRIGGERED'?'Create a new alert':'Edit discount'}</button>}
      {['ACTIVE','PAUSED'].includes(alert.status)&&<button disabled={ctx.busy} onClick={()=>ctx.change(alert.id,alert.status==='ACTIVE'?'pause':'resume').catch(ignore)}>{alert.status==='ACTIVE'?'Pause alert':'Resume alert'}</button>}
      {alert.status!=='CANCELLED'&&<button disabled={ctx.busy} onClick={()=>setConfirm(true)}>Delete alert</button>}
    </div>
    {confirm&&<div className="price-delete-confirm"><p>Delete this alert? It will stop watching this product.</p><button onClick={()=>ctx.change(alert.id,'delete').then(()=>setConfirm(false)).catch(ignore)} disabled={ctx.busy}>Delete alert</button><button onClick={()=>setConfirm(false)}>Keep alert</button></div>}
    {ctx.mode==='browser-preview'&&['ACTIVE','PAUSED'].includes(alert.status)&&<aside className="price-preview-tools"><h3>Try the browser preview</h3><p>Simulate this item reaching its target. This does not change a brand’s price or send email.</p><button onClick={()=>ctx.simulate(alert.id)}>Simulate target price</button></aside>}
    {note&&<div className="price-history-summary"><h3>Notification recorded</h3><p>{date(note.createdAt)} · {statusLabel(note.deliveryStatus)}</p><p>Price at notification: {formatPrice(note.sellingCents)}</p><small>{note.deliveryStatus==='PREVIEW'?'A preview event was recorded. No email was sent.':'View the event in History for its recorded delivery status.'}</small></div>}
    <a className="price-shop-link" href={alert.product.url} target="_blank" rel="noopener noreferrer">Shop this item ↗</a>
  </>;
}
function NotificationDetails({note}:{note:PriceNotification}){
  const ctx=usePriceAlerts();const product=ctx.alerts.find(a=>a.id===note.alertId)?.product||CATALOG_PRODUCTS.find(p=>p.id===note.productId);
  return <><h2>Notification history</h2>{product&&<div className="price-history-product"><img src={product.image} alt={product.name}/><h3>{product.name}</h3></div>}<dl className="price-fields"><div><dt>Reference at notification</dt><dd>{formatPrice(note.referenceCents)}</dd></div><div><dt>Selected discount</dt><dd>{note.discount}%</dd></div><div><dt>Target price</dt><dd>{formatPrice(note.targetCents)}</dd></div><div><dt>Selling price at notification</dt><dd>{formatPrice(note.sellingCents)}</dd></div><div><dt>Delivery</dt><dd>{statusLabel(note.deliveryStatus)}</dd></div></dl><p>{date(note.createdAt)}</p>{note.deliveredAt&&<p>Email accepted by the sending service: {date(note.deliveredAt)}</p>}<p>{note.deliveryStatus==='PREVIEW'?'This is a preview only. No email was sent.':note.deliveryStatus==='UNKNOWN'?'Delivery needs review. The system will not blindly resend an email that may already have been accepted.':'Each alert records one notification event. Delivery retries do not create new alert cycles.'}</p>{product&&<a className="price-shop-link" href={product.url} target="_blank" rel="noopener noreferrer">Shop this item ↗</a>}</>;
}

function AlertManager(){
  const ctx=usePriceAlerts();const [filter,setFilter]=useState('ALL');const [mobileDetail,setMobileDetail]=useState(false);const [noteId,setNoteId]=useState<string|null>(null);
  const filtered=ctx.alerts.filter(a=>a.status!=='CANCELLED'&&(filter==='ALL'||filter==='HISTORY'||a.status===filter));
  const selected=filtered.find(a=>a.id===ctx.selectedId)||filtered[0];
  const note=ctx.notifications.find(n=>n.id===noteId)||ctx.notifications[0];
  return <div className="price-manager">
    <header className="price-manager-toolbar"><button onClick={ctx.close}>← Back to magazine</button><strong>MY PRICE ALERTS</strong><button onClick={ctx.close} aria-label="Close My Price Alerts">×</button></header>
    <div className={'price-manager-book '+(mobileDetail?'is-detail':'is-list')}>
      <section className="price-manager-page price-manager-list"><div className="price-running">YOUR WATCHLIST<span>DESYR / YOUR EDIT</span></div><h1 tabIndex={-1} data-price-heading>Worth the wait.</h1><ModeNote/>
        {ctx.configured&&ctx.user&&<p className="price-account">{ctx.user.email} <button onClick={()=>ctx.signOut().catch(ignore)} disabled={ctx.busy}>Sign out</button></p>}
        <div className="price-filters" role="group" aria-label="Filter price alerts">{[['ALL','All'],['ACTIVE','Waiting'],['PAUSED','Paused'],['TRIGGERED','Triggered'],['HISTORY','History']].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setMobileDetail(false);}}>{label}</button>)}</div>
        <div className="price-alert-list">
          {ctx.configured&&!ctx.user?<SignIn/>:filter==='HISTORY'?ctx.notifications.length?ctx.notifications.map(n=>{const product=ctx.alerts.find(a=>a.id===n.alertId)?.product||CATALOG_PRODUCTS.find(p=>p.id===n.productId);return <button className={'price-alert-row '+(note?.id===n.id?'is-selected':'')} key={n.id} onClick={()=>{setNoteId(n.id);setMobileDetail(true);}}>{product&&<img src={product.image} alt=""/>}<span><strong>{product?.name||'Price alert'}</strong><small>{date(n.createdAt)}</small><span className="price-status">{statusLabel(n.deliveryStatus)}</span></span></button>;}):<p>No notification history yet.</p>:filtered.length?filtered.map(a=><button className={'price-alert-row '+(selected?.id===a.id?'is-selected':'')} key={a.id} onClick={()=>{ctx.select(a.id);setMobileDetail(true);}}><img src={a.product.image} alt=""/><span><strong>{a.product.name}</strong><small>{brandName(a.product.brandId)} · {a.discount}% drop</small><span className={'price-status price-status--'+a.status.toLowerCase()}>{statusLabel(a.status)}</span></span></button>):<p>No {filter==='ALL'?'saved':statusLabel(filter).toLowerCase()} alerts yet. Open a product and choose “Notify me of a price drop.”</p>}
        </div><footer className="price-running">YOUR PERSONAL PRICE EDIT</footer>
      </section>
      <section className="price-manager-page price-manager-detail"><div className="price-running">{filter==='HISTORY'?'NOTIFICATION HISTORY':'SELECTED ALERT'}<span>DESYR</span></div><button className="price-mobile-back" onClick={()=>setMobileDetail(false)}>← Your alerts</button>
        <p className="price-error" role="alert">{ctx.error}</p><p className="price-feedback" role="status">{ctx.message}</p>
        <div className="price-detail-scroll">{ctx.configured&&!ctx.user?<p>Sign in to view your saved alerts and notification history.</p>:filter==='HISTORY'?note?<NotificationDetails note={note}/>:<p>No recorded notifications yet.</p>:selected?<PriceDetails key={selected.id} alert={selected}/>:<div className="price-empty"><h2>Your price, your choice.</h2><p>Track each product with its own discount threshold. You decide when it becomes worth another look.</p></div>}</div>
        <footer className="price-running">{ctx.mode==='browser-preview'?'PREVIEW / NO EMAIL DELIVERY':'ONE NOTIFICATION PER ALERT'}</footer>
      </section>
    </div>
    <footer className="price-manager-controls"><button onClick={ctx.close}>← Back to magazine</button><button onClick={()=>{ctx.close();window.location.hash='/';}}>All magazines</button></footer>
  </div>;
}

export function PriceAlertsLayer(){
  const ctx=usePriceAlerts();const frame=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!ctx.view)return;
    const previous=document.activeElement as HTMLElement|null;
    const timer=requestAnimationFrame(()=>frame.current?.querySelector<HTMLElement>('[data-price-heading]')?.focus());
    const handle=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();ctx.close();}
      if(event.key!=='Tab')return;
      const controls=Array.from(frame.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')||[]).filter(el=>el.getClientRects().length>0);
      const active=document.activeElement;const outside=!frame.current?.contains(active);const heading=active?.hasAttribute('data-price-heading');
      if(event.shiftKey&&(active===controls[0]||outside||heading)){event.preventDefault();controls[controls.length-1]?.focus();}
      else if(!event.shiftKey&&(active===controls[controls.length-1]||outside||heading)){event.preventDefault();controls[0]?.focus();}
    };
    document.addEventListener('keydown',handle,true);
    return()=>{cancelAnimationFrame(timer);document.removeEventListener('keydown',handle,true);if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[ctx.view?.kind]);
  if(!ctx.view)return null;
  return createPortal(<div ref={frame} className={'price-alert-overlay '+(ctx.view.kind==='create'?'price-alert-overlay--create':'')} role="dialog" aria-modal="true" aria-label={ctx.view.kind==='create'?'Product price alert':'My Price Alerts'}>
    {ctx.view.kind==='create'?<><div className="price-alert-scrim" aria-hidden="true" onClick={ctx.close}/><CreateAlert key={ctx.view.productId+':'+(ctx.view.editingId||'new')}/></>:<AlertManager/>}
  </div>,document.body);
}
