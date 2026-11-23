const assert = require('assert');
const { protocol, demoData, analyze } = require('../engine.js');
const plan = protocol(3, 3, 1);
assert.strictEqual(plan.length, 18);
assert.strictEqual(plan.filter(c => c === 'on').length, 9);
assert.strictEqual(analyze(demoData(plan.slice(0, 6), 25)).verdict, 'not_enough'); // too few nights

// Operating characteristics over 200 simulated experiments (different plans and noise each time).
function rate(trueEffect, verdict) {
  let hit = 0;
  for (let s = 1; s <= 200; s++) if (analyze(demoData(protocol(3, 3, s), trueEffect, 1000 + s), { iters: 1000 }).verdict === verdict) hit++;
  return hit / 200;
}
const falsePositive = rate(0, 'helps'), power25 = rate(25, 'helps'), power40 = rate(40, 'helps');
console.log({ falsePositive, power25, power40 });
assert(falsePositive <= 0.1, 'too many false "helps" when there is no effect');
assert(power40 > power25 && power25 > falsePositive, 'power should rise with effect size');
console.log('all tests passed');
