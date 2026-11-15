const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', code)(name => name.startsWith('.') ? load(path.resolve(path.dirname(filename), name + '.ts')) : require(name), module, module.exports);
  return module.exports;
}

const {CATALOG_PRODUCTS,parseCents,targetCents,createPreview,changePreview,simulatePreview,readPreview}=load('src/features/price-alerts/model.ts');
assert.equal(targetCents(1005,50),503);assert.equal(targetCents(189900,30),132930);
assert.equal(parseCents('৳ 1,899.50'),189950);assert.throws(()=>parseCents('-1'));assert.throws(()=>targetCents(150000,15));
let state={alerts:[],notifications:[]};const polo=CATALOG_PRODUCTS.find(p=>p.id==='gg-210906');const shacket=CATALOG_PRODUCTS.find(p=>p.id==='wr-8301191004346');
state=createPreview(state,polo,20,'first').state;assert.equal(state.alerts[0].targetCents,120000);
assert.throws(()=>createPreview(state,polo,30,'duplicate'));assert.equal(createPreview(state,polo,40,'first').state.alerts.length,1);
state=createPreview(state,shacket,30,'second').state;state=changePreview(state,'first','edit',40);
assert.equal(state.alerts.find(a=>a.id==='first').referenceCents,150000);assert.equal(state.alerts.find(a=>a.id==='first').targetCents,90000);assert.equal(state.alerts.find(a=>a.id==='second').targetCents,132930);
state=changePreview(state,'first','pause');state=simulatePreview(state,'first');assert.equal(state.notifications.length,0);
state=changePreview(state,'first','resume');assert.equal(state.notifications.length,1);assert.equal(state.alerts.find(a=>a.id==='first').status,'TRIGGERED');
state=simulatePreview(state,'first');state=changePreview(state,'first','edit',50);assert.equal(state.notifications.length,1);assert.equal(state.notifications[0].discount,40);assert.throws(()=>changePreview(state,'first','resume'));
state=changePreview(state,'first','delete');assert.equal(state.notifications.length,1);assert.equal(state.alerts.find(a=>a.id==='first').status,'CANCELLED');
state=createPreview(state,polo,20,'new-cycle').state;assert.equal(state.alerts.filter(a=>a.productId===polo.id&&a.status==='ACTIVE').length,1);
assert.equal(readPreview(JSON.stringify(state)).alerts.length,3);assert.equal(readPreview('{invalid').alerts.length,0);
const tampered=JSON.parse(JSON.stringify(state));tampered.notifications[0].deliveryStatus='SENT';assert.equal(readPreview(JSON.stringify(tampered)).notifications[0].deliveryStatus,'PREVIEW');
console.log('PASS: exact minor-unit targets, independent discounts, duplicate protection, fixed references, pause/resume/delete, explicit cycles, one preview event and safe storage hydration.');
