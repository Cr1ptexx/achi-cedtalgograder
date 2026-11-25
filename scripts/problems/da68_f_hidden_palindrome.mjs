const str = (H, r, n, alpha) => Array.from({ length: n }, () => String.fromCharCode(97 + H.int(r, 0, alpha - 1))).join('');
const pal = (s) => s + [...s].reverse().join('');
export default {
  checker: 'exact',
  samples: [['1\na\n', '1\n'], ['5\nabvba\n', '5\n'], ['5\nabcab\n', '3\n']],
  gen: (H) => {
    const r = H.rng(68);
    const half = str(H, r, 1500, 26);
    return [
      '2\nab\n', '2\naa\n', '3\naba\n', '6\nabcdef\n',
      `3000\n${pal(half)}\n`,                            // already a palindrome
      `3000\n${'a'.repeat(3000)}\n`,
      `3000\n${str(H, r, 3000, 2)}\n`,
      `3000\n${str(H, r, 3000, 26)}\n`,
      `2999\n${pal(half).slice(0, 1499) + 'z' + pal(half).slice(1500, 2999)}\n`,
      `1500\n${str(H, r, 1500, 5)}\n`,
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 12); return `${n}\n${str(H, r, n, 3)}\n`; },
};