// Control Group of One: experiment engine. Pure functions, no network, no dependencies.
(function (root) {
  const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;

  // Randomised crossover plan: each cycle has one habit-on and one habit-off block, in random order.
  function protocol(cycles = 3, blockDays = 3, seed = 1) {
    const r = mulberry32(seed), out = [];
    for (let c = 0; c < cycles; c++) for (const k of (r() < 0.5 ? ['on', 'off'] : ['off', 'on'])) for (let d = 0; d < blockDays; d++) out.push(k);
    return out;
  }

  // Synthetic nights (minutes asleep) with a known true effect. For demos and tests only.
  function demoData(plan, trueEffect, seed = 7) {
    const r = mulberry32(seed), z = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
    return plan.map((cond, i) => ({ cond, value: Math.round(400 + (i % 7 > 4 ? 20 : 0) + (cond === 'on' ? trueEffect : 0) + 25 * z()), followed: r() < 0.9 }));
  }

  // Difference in means (on minus off) on nights where the plan was followed, with a bootstrap 95% range.
  // minEffect is the smallest change we call meaningful (an assumption, in minutes).
  function analyze(nights, { iters = 5000, seed = 1, minEffect = 15 } = {}) {
    const used = nights.filter(n => n.followed !== false);
    const on = used.filter(n => n.cond === 'on').map(n => n.value), off = used.filter(n => n.cond === 'off').map(n => n.value);
    const base = { nOn: on.length, nOff: off.length, adherence: used.length / nights.length };
    if (on.length < 5 || off.length < 5) return { ...base, verdict: 'not_enough', reason: 'Need at least 5 followed nights in each condition.' };
    const r = mulberry32(seed), pick = a => a[Math.floor(r() * a.length)], d = [];
    for (let i = 0; i < iters; i++) { let s1 = 0, s2 = 0; for (let j = 0; j < on.length; j++) s1 += pick(on); for (let j = 0; j < off.length; j++) s2 += pick(off); d.push(s1 / on.length - s2 / off.length); }
    d.sort((a, b) => a - b);
    const effect = mean(on) - mean(off), lo = d[Math.floor(iters * 0.025)], hi = d[Math.floor(iters * 0.975)];
    let verdict = 'not_enough';
    if (lo > 0 && effect >= minEffect) verdict = 'helps';
    else if (hi < 0 && effect <= -minEffect) verdict = 'hurts';
    else if (lo > -minEffect && hi < minEffect) verdict = 'no_effect';
    return { ...base, effect, lo, hi, verdict };
  }

  const api = { protocol, demoData, analyze };
  if (typeof module !== 'undefined') module.exports = api; else root.CGO = api;
})(this);
