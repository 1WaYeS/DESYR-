import { createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { CATALOG_PRODUCTS,PREVIEW_KEY,readPreview,createPreview,changePreview,simulatePreview,type AlertProduct,type PriceAlert,type PriceNotification,type PreviewState } from './model';

type User={username:string;email:string;emailVerified:boolean};
type Mode='browser-preview'|'backend-preview'|'live';
type View={kind:'create';productId:string;themeBrandId:string;editingId?:string}|{kind:'manage'}|null;
interface AlertsContextValue {
  alerts:PriceAlert[];notifications:PriceNotification[];mode:Mode;configured:boolean;user:User|null;ready:boolean;busy:boolean;error:string;message:string;view:View;selectedId:string|null;
  product:(id:string)=>AlertProduct|undefined;openProduct:(id:string,themeBrandId?:string)=>void;openManager:()=>void;close:()=>void;select:(id:string)=>void;
  create:(id:string,discount:number,requestId:string)=>Promise<void>;change:(id:string,action:'edit'|'pause'|'resume'|'delete',discount?:number)=>Promise<void>;simulate:(id:string)=>void;signIn:(username:string,password:string)=>Promise<void>;signOut:()=>Promise<void>;clearError:()=>void;
}
const AlertsContext=createContext<AlertsContextValue|null>(null);
const API=(import.meta.env.VITE_PRICE_ALERT_API_URL||'').replace(/\/$/,'');
const configured=!!API;
export function PriceAlertsProvider({children}:{children:ReactNode}) {
  const [preview,setPreview]=useState<PreviewState>(()=>{try{return readPreview(localStorage.getItem(PREVIEW_KEY));}catch{return readPreview(null);}});
  const [alerts,setAlerts]=useState<PriceAlert[]>([]);const [notifications,setNotifications]=useState<PriceNotification[]>([]);
  const [products,setProducts]=useState<AlertProduct[]>(configured?[]:CATALOG_PRODUCTS);
  const [mode,setMode]=useState<Mode>(configured?'backend-preview':'browser-preview');const [user,setUser]=useState<User|null>(null);
  const [ready,setReady]=useState(!configured);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
  const [view,setView]=useState<View>(()=>window.location.hash==='#/price-alerts'?{kind:'manage'}:null);const [selectedId,setSelectedId]=useState<string|null>(null);
  const csrf=useRef('');const previewRef=useRef(preview);previewRef.current=preview;
  const request=useCallback(async(path:string,method='GET',data?:unknown)=>{
    const response=await fetch(API+'/'+path,{method,credentials:'include',headers:method==='GET'?{}:{'Content-Type':'application/json','X-CSRFToken':csrf.current},body:data===undefined?undefined:JSON.stringify(data)});
    const result=await response.json().catch(()=>({error:'The backend returned an unexpected response. Refresh and try again.'}));
    if(response.status===401&&path!=='login/'){setUser(null);setAlerts([]);setNotifications([]);}
    if(!response.ok)throw new Error(result.error||'The price-alert service is unavailable.');return result;
  },[]);
  const refresh=useCallback(async()=>{const [data,catalog]=await Promise.all([request('alerts/'),request('products/')]);setAlerts(data.alerts);setNotifications(data.notifications);setProducts(catalog.products);},[request]);
  useEffect(()=>{
    if(!configured)return;
    let stopped=false;
    (async()=>{try{const session=await request('session/');const catalog=await request('products/');if(stopped)return;csrf.current=session.csrfToken;setUser(session.user);setMode(session.mode);setProducts(catalog.products);setReady(true);if(session.user)await refresh();}catch(e){if(!stopped)setError(e instanceof Error?e.message:'Could not connect to the price-alert backend.');}})();
    return()=>{stopped=true;};
  },[request,refresh]);
  useEffect(()=>{if(!configured||!user)return;const timer=window.setInterval(()=>{refresh().catch(()=>setError('Could not refresh your alerts. Please reopen this panel.'));},30000);return()=>clearInterval(timer);},[user,refresh]);
  useEffect(()=>{if(configured)return;const listener=(event:StorageEvent)=>{if(event.key===PREVIEW_KEY)setPreview(readPreview(event.newValue));};window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);},[]);
  const savePreview=(state:PreviewState)=>{
    // Do not claim a preview was saved if browser persistence fails.
    try{localStorage.setItem(PREVIEW_KEY,JSON.stringify(state));}catch{throw new Error('This browser could not save your alert. Allow site storage or free some space and try again.');}previewRef.current=state;setPreview(state);
  };
  useEffect(()=>{const route=()=>{if(window.location.hash==='#/price-alerts')setView({kind:'manage'});};window.addEventListener('hashchange',route);return()=>window.removeEventListener('hashchange',route);},[]);
  const currentAlerts=configured?alerts:preview.alerts;const currentNotes=configured?notifications:preview.notifications;
  const product=(id:string)=>products.find(p=>p.id===id);
  const openProduct=(id:string,themeBrandId?:string)=>{const existing=currentAlerts.find(a=>a.productId===id&&['ACTIVE','PAUSED'].includes(a.status));setError('');setMessage('');if(configured&&ready)request('products/').then(data=>setProducts(data.products)).catch(()=>setError('Could not refresh the official price. Please try again.'));setView({kind:'create',productId:id,themeBrandId:themeBrandId||CATALOG_PRODUCTS.find(p=>p.id===id)?.brandId||'gorur-ghash',editingId:existing?.id});};
  const mutate=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Could not save your alert.');throw e;}finally{setBusy(false);}};
  const create=async(id:string,discount:number,requestId:string)=>mutate(async()=>{
    let alert:PriceAlert;
    if(configured){if(!ready)throw new Error('The backend is not connected. No alert was saved.');const data=await request('alerts/','POST',{productId:id,discount,requestId});alert=data.alert;await refresh();}
    else {const entry=product(id);if(!entry)throw new Error('Product not found.');const result=createPreview(previewRef.current,entry,discount,requestId);savePreview(result.state);alert=result.alert;}
    setSelectedId(alert.id);setMessage(configured?'Price alert saved.':'Preview alert saved on this device. Live monitoring and email are not connected.');setView({kind:'manage'});
  });
  const change=async(id:string,action:'edit'|'pause'|'resume'|'delete',discount?:number)=>mutate(async()=>{
    if(configured){await request('alerts/'+id+'/','POST',{action,discount});await refresh();}
    else savePreview(changePreview(previewRef.current,id,action,discount));
    setMessage(action==='delete'?'Alert deleted. Notification history is retained.':action==='edit'?'Discount updated. The reference price stays unchanged.':action==='pause'?'Alert paused.':'Alert resumed.');
    if(action==='edit'){setSelectedId(id);setView({kind:'manage'});}
  });
  const simulate=(id:string)=>{try{savePreview(simulatePreview(previewRef.current,id));setMessage('Simulated target price reached. A preview event was recorded; no email was sent.');}catch(e){setError(e instanceof Error?e.message:'Browser storage is unavailable.');}};
  const signIn=async(username:string,password:string)=>mutate(async()=>{const session=await request('login/','POST',{username,password});csrf.current=session.csrfToken;setUser(session.user);setMode(session.mode);await refresh();});
  const signOut=async()=>mutate(async()=>{const session=await request('logout/','POST');csrf.current=session.csrfToken;setUser(null);setAlerts([]);setNotifications([]);});
  return <AlertsContext.Provider value={{alerts:currentAlerts,notifications:currentNotes,mode,configured,user,ready,busy,error,message,view,selectedId,product,openProduct,openManager:()=>{setError('');setMessage('');setView({kind:'manage'});if(configured&&user)refresh().catch(()=>setError('Could not refresh your alerts.'));},close:()=>{setView(null);if(window.location.hash==='#/price-alerts')window.history.replaceState({},'','#/');},select:setSelectedId,create,change,simulate,signIn,signOut,clearError:()=>setError('')}}>{children}</AlertsContext.Provider>;
}
export function usePriceAlerts(){const context=useContext(AlertsContext);if(!context)throw new Error('PriceAlertsProvider is missing.');return context;}
