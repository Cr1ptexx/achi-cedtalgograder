/* C++ runner worker (classic worker).
 * Uses binji/wasm-clang (clang + lld compiled to WebAssembly, Apache-2.0)
 * loaded at runtime. Two modes:
 *   - "compile": keeps clang/lld warm, turns C++ source into a wasm binary
 *   - "exec":    runs a compiled binary against one stdin; the main thread
 *                kills this worker on time limit and spawns a fresh one.
 */
const BASE = 'https://binji.github.io/wasm-clang/';
importScripts(BASE + 'shared.js');

const STDCXX = [
  'algorithm', 'array', 'bitset', 'cassert', 'cctype', 'climits', 'cmath',
  'cstdio', 'cstdlib', 'cstring', 'deque', 'functional', 'iomanip',
  'iostream', 'iterator', 'limits', 'list', 'map', 'numeric', 'queue',
  'set', 'sstream', 'stack', 'string', 'tuple', 'unordered_map',
  'unordered_set', 'utility', 'vector',
].map((h) => `#include <${h}>`).join('\n') + '\n';

let out = '';
let api = null;
let mode = null;
let seq = 0;
const modules = new Map();

const readBuffer = async (name) => {
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`fetch ${name}: ${res.status}`);
  return res.arrayBuffer();
};

function makeApi(m) {
  const a = new API({
    // The exec worker never compiles, so give it an empty tar instead of the
    // multi-MB sysroot (Tar.readEntry stops at a block without "ustar").
    readBuffer: (name) => (m === 'exec' && name === 'sysroot.tar')
      ? Promise.resolve(new ArrayBuffer(1024)) : readBuffer(name),
    compileStreaming: async (name) => WebAssembly.compile(await readBuffer(name)),
    hostWrite: (s) => { out += s; },
  });
  a.hostLog = () => {};
  a.hostLogAsync = async (_msg, p) => p;
  return a;
}

const stripAnsi = (s) => s
  .replace(/\x1b\[[0-9;]*m/g, '')
  .replace(/u\d+\.(cc|o|wasm)/g, 'main.cpp')
  .replace(/^Error: process exited with code \d+\.\s*$/gm, '');

async function init(m) {
  mode = m;
  api = makeApi(m);
  await api.ready;
  if (mode === 'compile') {
    // libc++ has no <bits/stdc++.h>, but students use it everywhere.
    try { api.memfs.addDirectory('include/bits'); } catch { /* exists */ }
    api.memfs.addFile('include/bits/stdc++.h', STDCXX);
    await api.getModule(api.clangFilename);
    await api.getModule(api.lldFilename);
  }
}

async function compile(code) {
  const n = ++seq;
  const src = `u${n}.cc`, obj = `u${n}.o`, wasm = `u${n}.wasm`;
  api.memfs.addFile(src, code);
  const common = api.clangCommonArgs.filter((x) => x !== '-fcolor-diagnostics');
  out = '';
  const clang = await api.getModule(api.clangFilename);
  try {
    await api.run(clang, 'clang', '-cc1', '-emit-obj', ...common,
      '-std=c++17', '-O2', '-o', obj, '-x', 'c++', src);
  } catch (e) { /* diagnostics are in `out` */ }
  const diag = stripAnsi(out).trim();
  let objBytes;
  try { objBytes = api.memfs.getFileContents(obj); } catch { objBytes = null; }
  if (!objBytes || !objBytes.length) return { ok: false, log: diag || 'compile failed' };

  out = '';
  const lld = await api.getModule(api.lldFilename);
  const lib = 'lib/wasm32-wasi';
  try {
    await api.run(lld, 'wasm-ld', '--no-threads', '--export-dynamic',
      '-z', `stack-size=${8 * 1024 * 1024}`, `-L${lib}`, `${lib}/crt1.o`, obj,
      '-lc', '-lc++', '-lc++abi', '-lcanvas', '-o', wasm);
  } catch (e) { /* link errors are in `out` */ }
  let bin;
  try { bin = api.memfs.getFileContents(wasm); } catch { bin = null; }
  if (!bin || !bin.length) return { ok: false, log: stripAnsi(out).trim() || 'link failed' };
  return { ok: true, log: diag, wasm: bin.slice().buffer };
}

async function exec(key, wasm, input) {
  let mod = modules.get(key);
  if (!mod) {
    mod = await WebAssembly.compile(wasm);
    modules.clear();
    modules.set(key, mod);
  }
  api.memfs.setStdinStr(input);
  out = '';
  const t0 = performance.now();
  let error = null;
  let stdout;
  try {
    await api.run(mod, 'main');
    // api.run appends one '\n' after the program finishes.
    stdout = out.endsWith('\n') ? out.slice(0, -1) : out;
  } catch (e) {
    // App.run writes a red "Error: ..." banner to stdout before rethrowing.
    const cut = out.indexOf('\x1b[91mError:');
    stdout = cut >= 0 ? out.slice(0, cut) : out;
    error = String(e && e.message || e);
  }
  const ms = performance.now() - t0;
  return { stdout, error, ms };
}

onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg.type === 'init') {
      await init(msg.mode);
      postMessage({ type: 'ready' });
    } else if (msg.type === 'compile') {
      const r = await compile(msg.code);
      postMessage({ type: 'compiled', id: msg.id, ...r }, r.wasm ? [r.wasm] : []);
    } else if (msg.type === 'exec') {
      const r = await exec(msg.key, msg.wasm, msg.input);
      postMessage({ type: 'result', id: msg.id, ...r });
    }
  } catch (err) {
    postMessage({ type: 'fatal', id: msg.id, error: String(err && err.stack || err) });
  }
};
