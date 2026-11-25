const str = (H, r, n, alpha) => Array.from({ length: n }, () => String.fromCharCode(97 + H.int(r, 0, alpha - 1))).join('');
export default {
  checker: 'exact',
  samples: [['acbdegcedbg\nbegcfeubk\n', '6\n'], ['aaa\nbbbbbbbbb\n', '0\n']],
  gen: (H) => {
    const r = H.rng(3);
    const a = str(H, r, 500, 2);
    return [
      'a\na\n', 'a\nb\n', 'abc\nabc\n', 'abcde\nedcba\n',
      `${str(H, r, 40, 3)}\n${str(H, r, 35, 3)}\n`,
      `${a}\n${a}\n`,                                    // identical
      `${'a'.repeat(500)}\n${'b'.repeat(500)}\n`,       // nothing in common
      `${str(H, r, 500, 2)}\n${str(H, r, 500, 2)}\n`,
      `${str(H, r, 500, 26)}\n${str(H, r, 500, 26)}\n`,
      `${str(H, r, 500, 4)}\n${str(H, r, 120, 4)}\n`,
    ];
  },
  small: (H, r) => `${str(H, r, H.int(r, 1, 8), 3)}\n${str(H, r, H.int(r, 1, 8), 3)}\n`,
};