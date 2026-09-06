/* =====================================================================
 * sim.js — Mini simulateur de circuit (analyse nodale modifiée, MNA)
 * ---------------------------------------------------------------------
 * Le circuit est décrit par une liste de « primitives » :
 *   { kind:'wire', a, b }            fil idéal (les deux noeuds sont fusionnés)
 *   { kind:'R',    a, b, value }     résistance (ohms), Infinity = circuit ouvert
 *   { kind:'V',    a, b, value }     source de tension, + sur a, - sur b
 *   { kind:'I',    a, b, value }     source de courant injectant dans a, sortant par b
 * Les noeuds sont des chaînes ("comp.pin"). Le résultat donne la tension de
 * chaque noeud et le courant dans chaque résistance / source.
 * Pour le 230 V alternatif on travaille en valeurs efficaces (RMS), les
 * charges étant considérées résistives : c'est suffisant pour l'apprentissage.
 * ===================================================================== */
const Sim = (() => {
  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-18) return null;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        if (f === 0) continue;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((row, i) => row[n] / row[i]);
  }

  /**
   * analyze(prims, {ground}) -> { V(node), current(prim), find(node), ok }
   */
  function analyze(prims, opts = {}) {
    const parent = new Map();
    const find = (x) => {
      let r = x;
      while (parent.has(r) && parent.get(r) !== r) r = parent.get(r);
      // compression
      let c = x;
      while (parent.has(c) && parent.get(c) !== r) { const nx = parent.get(c); parent.set(c, r); c = nx; }
      return r;
    };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
    const nodes = new Set();
    prims.forEach((p) => { nodes.add(p.a); nodes.add(p.b); });
    (opts.nodes || []).forEach((n) => nodes.add(n));
    nodes.forEach((n) => { if (!parent.has(n)) parent.set(n, n); });
    prims.forEach((p) => { if (p.kind === 'wire') union(p.a, p.b); });

    const reps = [...new Set([...nodes].map(find))];
    const ground = opts.ground && nodes.has(opts.ground) ? find(opts.ground) : reps[0];
    const idx = new Map();
    let n = 0;
    reps.forEach((r) => { if (r !== ground) idx.set(r, n++); });
    const vs = prims.filter((p) => p.kind === 'V');
    const m = vs.length;
    const N = n + m;
    const A = Array.from({ length: N }, () => new Array(N).fill(0));
    const b = new Array(N).fill(0);
    const LEAK = 1e-9; // conductance de fuite : évite les matrices singulières
    for (let i = 0; i < n; i++) A[i][i] += LEAK;
    const ix = (node) => { const r = find(node); return r === ground ? -1 : idx.get(r); };
    const stamp = (i, j, g) => {
      if (i >= 0) A[i][i] += g;
      if (j >= 0) A[j][j] += g;
      if (i >= 0 && j >= 0) { A[i][j] -= g; A[j][i] -= g; }
    };
    prims.forEach((p) => {
      if (p.kind === 'R') {
        if (!(p.value > 0) || !isFinite(p.value)) return;
        stamp(ix(p.a), ix(p.b), 1 / p.value);
      } else if (p.kind === 'I') {
        const i = ix(p.a), j = ix(p.b);
        if (i >= 0) b[i] += p.value;
        if (j >= 0) b[j] -= p.value;
      }
    });
    vs.forEach((p, k) => {
      const i = ix(p.a), j = ix(p.b), r = n + k;
      if (i >= 0) { A[i][r] += 1; A[r][i] += 1; }
      if (j >= 0) { A[j][r] -= 1; A[r][j] -= 1; }
      b[r] = p.value;
    });
    const x = N ? (solveLinear(A, b) || new Array(N).fill(0)) : [];
    const V = (node) => { if (!nodes.has(node)) return 0; const i = ix(node); return i < 0 ? 0 : x[i]; };
    const current = (p) => {
      if (p.kind === 'R') {
        if (!(p.value > 0) || !isFinite(p.value)) return 0;
        return (V(p.a) - V(p.b)) / p.value;
      }
      if (p.kind === 'V') return -x[n + vs.indexOf(p)]; // courant débité par la source
      if (p.kind === 'I') return p.value;
      return 0;
    };
    return { V, current, find, nodes };
  }

  /** Résistance équivalente vue entre deux noeuds (circuit hors tension). */
  function resistanceBetween(prims, a, b) {
    const passive = prims.filter((p) => p.kind !== 'V' && p.kind !== 'I');
    const r = analyze(passive.concat([{ kind: 'I', a, b, value: 1 }]), { nodes: [a, b] });
    if (r.find(a) === r.find(b)) return 0;
    const R = r.V(a) - r.V(b);
    if (!isFinite(R) || Math.abs(R) > 5e7) return Infinity;
    return Math.max(0, R);
  }

  return { analyze, resistanceBetween, solveLinear };
})();
