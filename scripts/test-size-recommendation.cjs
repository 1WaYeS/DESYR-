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
const { SIZE_CHARTS, getSizeChart, isTrouserProduct } = load('src/data/size-charts.ts');
const { recommendSize, chestFromKnownSize, estimateChest } = load('src/data/size-recommendation.ts');
assert.equal(SIZE_CHARTS.length, 12);
assert.equal(getSizeChart('gg-210906').sizes[0].chestCm, 96.52);
assert.equal(getSizeChart('wr-8301191004346').sizes[0].chestCm, 114);
assert.equal(getSizeChart('dune'), undefined);
assert.ok(isTrouserProduct('gg-267643'));
assert.ok(isTrouserProduct('wr-8349485105338'));
assert.ok(!isTrouserProduct('gg-210906'));
const polo = getSizeChart('gg-210906');
assert.equal(recommendSize(polo, 92, 'regular').size, 'M');
assert.equal(recommendSize(polo, 92, 'regular').confidence, 84);
assert.equal(recommendSize(polo, 92, 'regular', ['S', 'L']).size, 'S');
assert.equal(recommendSize(polo, 92, 'regular', ['S', 'L'], { S: 0, L: 1 }).size, 'L');
assert.equal(recommendSize(polo, 150, 'regular').status, 'too-small');
assert.equal(recommendSize(polo, 92, 'regular', []).status, 'unavailable');
assert.throws(() => recommendSize(polo, NaN, 'regular'));
assert.throws(() => recommendSize(polo, 92, '__proto__'));
assert.equal(estimateChest(170, 65), 88.85);
const tie = { ...polo, sizes: [{ label:'S',chestCm:98 },{label:'M',chestCm:102}] };
assert.equal(recommendSize(tie,92,'regular').size,'M');
for (const chart of SIZE_CHARTS) {
  for (const fit of ['snug','regular','loose']) for (const row of chart.sizes) {
    assert.equal(recommendSize(chart, chestFromKnownSize(row.chestCm,fit),fit).size,row.label);
  }
  let previous = 0;
  for (let chest = 70; chest <= 130; chest += .5) {
    const result = recommendSize(chart,chest,'regular');
    if (result.status === 'ok') { assert.ok(result.chestCm >= previous); assert.ok(result.chestCm >= chest+2); previous=result.chestCm; }
  }
}
console.log('PASS: size-chart conversions, source-size round trips, fit choices, listed/stock filters, tie breaking, monotonic sizes, minimum chest room, and invalid inputs.');
