export default {
  checker: 'exact',
  samples: [
    ['2 0 1 3\n', '3\nBC\nCB\nCC\n'],
    ['2 1 1 3\n', '7\nAB\nAC\nBA\nBC\nCA\nCB\nCC\n'],
    ['4 2 1 1\n', '12\nAABC\nAACB\nABAC\nABCA\nACAB\nACBA\nBAAC\nBACA\nBCAA\nCAAB\nCABA\nCBAA\n'],
    ['5 2 3 0\n', '10\nAABBB\nABABB\nABBAB\nABBBA\nBAABB\nBABAB\nBABBA\nBBAAB\nBBABA\nBBBAA\n'],
  ],
  gen: () => ['1 0 0 0\n', '1 1 1 1\n', '3 0 0 0\n', '3 3 3 3\n', '6 6 0 0\n', '6 2 2 2\n', '8 3 3 2\n', '9 5 4 3\n', '9 9 0 9\n', '10 2 2 2\n'],
  small: (H, r) => `${H.int(r, 1, 6)} ${H.int(r, 0, 4)} ${H.int(r, 0, 4)} ${H.int(r, 0, 4)}\n`,
};