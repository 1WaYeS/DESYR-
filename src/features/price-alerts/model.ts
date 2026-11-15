import { SHOPPING_CATALOG } from '../../data/shopping-catalog';

export const DISCOUNTS = [10,20,30,40,50] as const;
export type AlertStatus = 'ACTIVE' | 'PAUSED' | 'TRIGGERED' | 'CANCELLED';
export interface AlertProduct { id: string; name: string; brandId: string; url: string; image: string; referenceCents: number; currentCents: number; isLive: boolean; }
export interface PriceAlert { id: string; productId: string; product: AlertProduct; discount: number; referenceCents: number; currentCents: number; targetCents: number; status: AlertStatus; createdAt: string; }
export interface PriceNotification { id: string; alertId: string; productId: string; referenceCents: number; targetCents: number; sellingCents: number; discount: number; deliveryStatus: 'PENDING'|'SENDING'|'RETRY'|'SENT'|'PREVIEW'|'FAILED'|'UNKNOWN'; createdAt: string; deliveredAt: string|null; }
export interface PreviewState { alerts: PriceAlert[]; notifications: PriceNotification[]; }
export function parseCents(value: string): number {
  if(value.includes('-'))throw new Error('Invalid price.');
  const cleaned = value.replace(/[^0-9.]/g,'');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) throw new Error('Invalid price.');
  const [whole, fraction=''] = cleaned.split('.');
  const result = Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(result) || result<0 || result>999999999999) throw new Error('Invalid price.');
  return result;
}
export function targetCents(reference: number, discount: number): number {
  if (!Number.isSafeInteger(reference) || reference <= 0 || reference > 999999999999 || !(DISCOUNTS as readonly number[]).includes(discount)) throw new Error('Choose a valid discount.');
  return Math.floor((reference*(100-discount)+50)/100);
}
export const formatPrice = (value: number) => '৳ '+(value/100).toLocaleString('en-BD',{minimumFractionDigits:value%100?2:0,maximumFractionDigits:2});
export const CATALOG_PRODUCTS: AlertProduct[] = Object.entries(SHOPPING_CATALOG).flatMap(([key,items])=>items.map(p=>({id:p.id,name:p.name,brandId:key.split('/')[0],url:p.url,image:p.image,referenceCents:parseCents(p.price),currentCents:parseCents(p.price),isLive:false})));
export const PREVIEW_KEY = 'desyr-price-alerts-preview-v1';
export const emptyPreview = (): PreviewState => ({alerts:[],notifications:[]});

export function readPreview(raw: string|null): PreviewState {
  try {
    const data = JSON.parse(raw||'null');
    if (!data || !Array.isArray(data.alerts) || !Array.isArray(data.notifications)) return emptyPreview();
    const open = new Set<string>();
    const alerts: PriceAlert[] = data.alerts.slice(0,2000).flatMap((a: PriceAlert) => {
      const product=CATALOG_PRODUCTS.find(p=>p.id===a?.productId);
      if (!product || typeof a.id!=='string' || a.id.length>80 || !['ACTIVE','PAUSED','TRIGGERED','CANCELLED'].includes(a.status) || !DISCOUNTS.some(v=>v===a.discount) || !Number.isSafeInteger(a.referenceCents) || a.referenceCents<=0 || a.referenceCents>999999999999 || !Number.isSafeInteger(a.currentCents) || a.currentCents<0 || !Number.isFinite(Date.parse(a.createdAt))) return [];
      if (['ACTIVE','PAUSED'].includes(a.status)) {if(open.has(a.productId))return [];open.add(a.productId);}
      return [{...a,product,targetCents:targetCents(a.referenceCents,a.discount)}];
    });
    const seen=new Set<string>();
    const notifications: PriceNotification[] = data.notifications.slice(0,2000).flatMap((n: PriceNotification)=>{
      const alert=alerts.find(a=>a.id===n?.alertId);
      if (!alert || seen.has(alert.id) || typeof n.id!=='string' || !Number.isFinite(Date.parse(n.createdAt)) || !Number.isSafeInteger(n.sellingCents) || n.sellingCents<0 || !Number.isSafeInteger(n.referenceCents) || n.referenceCents<=0 || !DISCOUNTS.some(v=>v===n.discount) || !Number.isSafeInteger(n.targetCents)) return [];
      seen.add(alert.id);
      return [{...n,productId:alert.productId,deliveryStatus:'PREVIEW' as const,deliveredAt:null}];
    });
    return {alerts,notifications};
  } catch {return emptyPreview();}
}

export function createPreview(state: PreviewState, product: AlertProduct, discount: number, requestId: string): {state: PreviewState; alert: PriceAlert} {
  const retry=state.alerts.find(a=>a.id===requestId);
  if(retry)return {state,alert:retry};
  if(state.alerts.some(a=>a.productId===product.id&&['ACTIVE','PAUSED'].includes(a.status))) throw new Error('An active or paused alert already exists. Edit it from My Price Alerts.');
  const alert:PriceAlert={id:requestId,productId:product.id,product,discount,referenceCents:product.referenceCents,currentCents:product.currentCents,targetCents:targetCents(product.referenceCents,discount),status:'ACTIVE',createdAt:new Date().toISOString()};
  return {state:{...state,alerts:[alert,...state.alerts]},alert};
}
export function changePreview(state: PreviewState,id: string,action: 'edit'|'pause'|'resume'|'delete',discount?: number): PreviewState {
  const current=state.alerts.find(a=>a.id===id);
  if(!current||current.status==='CANCELLED')throw new Error('This alert is no longer available.');
  let updated={...current};
  if(action==='edit'){updated.discount=discount!;updated.targetCents=targetCents(current.referenceCents,discount!);}
  else if(action==='pause'&&current.status==='ACTIVE')updated.status='PAUSED';
  else if(action==='resume'&&current.status==='PAUSED')updated.status='ACTIVE';
  else if(action==='delete')updated.status='CANCELLED';
  else throw new Error('This action is not available for this alert.');
  return evaluatePreview({...state,alerts:state.alerts.map(a=>a.id===id?updated:a)});
}
function evaluatePreview(state:PreviewState):PreviewState {
  const notes=[...state.notifications];
  const alerts=state.alerts.map(a=>{
    if(a.status!=='ACTIVE'||a.currentCents>a.targetCents||notes.some(n=>n.alertId===a.id))return a;
    notes.unshift({id:crypto.randomUUID(),alertId:a.id,productId:a.productId,referenceCents:a.referenceCents,targetCents:a.targetCents,sellingCents:a.currentCents,discount:a.discount,deliveryStatus:'PREVIEW',createdAt:new Date().toISOString(),deliveredAt:null});
    return {...a,status:'TRIGGERED' as const};
  });
  return {alerts,notifications:notes};
}
export function simulatePreview(state: PreviewState,id:string):PreviewState {
  const selected=state.alerts.find(a=>a.id===id);
  if(!selected)throw new Error('Alert not found.');
  return evaluatePreview({...state,alerts:state.alerts.map(a=>a.productId===selected.productId?{...a,currentCents:selected.targetCents}:a)});
}
