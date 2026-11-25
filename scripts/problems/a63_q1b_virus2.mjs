// "DIVOC-20" viruses: two halves that are viruses and whose number of 1s differs by at most 1
const ones = (s) => [...s].filter((c) => c === '1').length;
// Pools of valid strings per level, so building level k only combines two already-built strings.
const pools = new Map();
function pool(H, r, k) {
  if (pools.has(k)) return pools.get(k);
  let list;
  if (k === 1) list = ['00', '01', '10', '11'];
  else {
    const prev = pool(H, r, k - 1);
    list = [];
    for (let tries = 0; list.length < 60 && tries < 4000; tries++) {
      const a = H.pick(r, prev), b = H.pick(r, prev);
      if (Math.abs(ones(a) - ones(b)) <= 1) list.push(a + b);
    }
    if (!list.length) list = prev.map((a) => a + a);          // equal counts are always legal
  }
  pools.set(k, list);
  return list;
}
const valid = (H, r, k) => H.pick(r, pool(H, r, k));
function code(H, r, k) {
  const s = valid(H, r, k);
  const t = r();
  if (t < 0.4) return s;
  const arr = [...s];
  if (t < 0.75) { const i = H.int(r, 0, arr.length - 1); arr[i] = arr[i] === '0' ? '1' : '0'; }     // flip one bit
  else if (t < 0.9) { for (let i = 0; i < arr.length / 2; i++) arr[i] = '1'; }                       // unbalanced halves
  else for (let i = 0; i < arr.length; i++) arr[i] = r() < 0.5 ? '0' : '1';
  return arr.join('');
}
function inst(H, r, n, k) {
  return `${n} ${k}\n` + Array.from({ length: n }, () => [...code(H, r, k)].join(' ')).join('\n') + '\n';
}

export default {
  checker: 'exact',
  samples: [
    ['5 2\n0 0 0 0\n0 0 1 1\n0 1 1 1\n1 0 0 0\n0 1 0 1\n', 'yes\nno\nyes\nyes\nyes\n'],
    ['4 3\n0 0 1 1 0 0 1 1\n0 0 1 1 1 0 0 0\n0 1 0 1 0 1 1 1\n0 1 0 1 1 1 0 0\n', 'no\nno\nyes\nno\n'],
    ['3 4\n1 1 1 1 1 1 1 0 0 1 1 1 1 1 0 0\n1 1 1 1 1 1 1 0 0 1 1 1 1 1 0 1\n1 1 1 0 0 1 1 1 1 0 0 1 1 0 1 1\n', 'no\nyes\nyes\n'],
  ],
  gen: (H) => {
    const r = H.rng(63);
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10].map((k, i) => inst(H, r, i < 6 ? 12 : 15, k));
  },
  small: (H, r) => inst(H, r, H.int(r, 2, 8), H.int(r, 1, 3)),
};
