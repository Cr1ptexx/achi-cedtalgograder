export default {
  checker: 'exact',
  samples: [
    ['2 2 2 1 0\n', '8\nAA\nAB\nAC\nBA\nBB\nBC\nCA\nCB\n'],
    ['5 3 0 2 0\n', '10\nAAACC\nAACAC\nAACCA\nACAAC\nACACA\nACCAA\nCAAAC\nCAACA\nCACAA\nCCAAA\n'],
  ],
  gen: () => ['1 0 0 0 0\n', '1 1 1 1 1\n', '3 3 3 3 3\n', '4 1 1 1 1\n', '6 6 0 0 0\n', '6 2 2 2 2\n', '7 7 7 0 0\n', '7 3 2 2 2\n', '8 2 2 2 2\n', '9 3 3 3 3\n'],
  small: (H, r) => `${H.int(r, 1, 6)} ${H.int(r, 0, 4)} ${H.int(r, 0, 4)} ${H.int(r, 0, 4)} ${H.int(r, 0, 4)}\n`,
};