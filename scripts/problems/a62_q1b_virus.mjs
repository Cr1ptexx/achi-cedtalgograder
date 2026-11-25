// "DIVOC" viruses: 2^k bits, built from two smaller viruses, the left one may be reversed
const rev = (a) => [...a].reverse().join('');
function valid(H, r, k) {
  if (k === 1) return '01';
  const a = valid(H, r, k - 1), b = valid(H, r, k - 1);
  return (r() < 0.5 ? rev(a) : a) + b;
}
/** a code of length 2^k: valid, or a valid one with some damage */
function code(H, r, k) {
  let s = valid(H, r, k);
  const t = r();
  if (t < 0.4) return s;
  const arr = [...s];
  if (t < 0.7) { const i = H.int(r, 0, arr.length - 1); arr[i] = arr[i] === '0' ? '1' : '0'; }       // flip one bit
  else if (t < 0.85) return rev(s);                                                                  // reverse the whole thing
  else for (let i = 0; i < arr.length; i++) arr[i] = r() < 0.5 ? '0' : '1';                         // random bits
  return arr.join('');
}
function inst(H, r, n, k) {
  return `${n} ${k}\n` + Array.from({ length: n }, () => [...code(H, r, k)].join(' ')).join('\n') + '\n';
}

export default {
  checker: 'exact',
  samples: [
    ['4 1\n0 1\n1 0\n0 0\n1 1\n', 'yes\nno\nno\nno\n'],
    ['3 2\n1 1 0 0\n1 0 0 1\n0 0 0 0\n', 'no\nyes\nno\n'],
    ['3 3\n1 0 0 1 0 1 0 1\n1 0 1 0 1 0 0 1\n1 0 1 1 1 0 0 0\n', 'yes\nyes\nno\n'],
    ['5 4\n0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1\n0 1 0 1 0 1 0 1 0 1 0 1 1 0 0 1\n0 1 0 1 0 1 0 1 1 0 0 1 0 1 0 1\n0 1 0 1 0 1 0 1 1 0 0 1 1 0 0 1\n0 1 0 1 0 1 0 1 1 0 1 0 0 1 0 1\n', 'yes\nyes\nyes\nyes\nyes\n'],
  ],
  gen: (H) => {
    const r = H.rng(62);
    return [1, 2, 3, 4, 5, 6, 7, 8, 8, 8].map((k, i) => inst(H, r, i < 4 ? 10 : 10, k));
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), H.int(r, 1, 4)),
};
