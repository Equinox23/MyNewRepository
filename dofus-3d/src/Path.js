import { MAP_SIZE } from './Map3D.js';

// BFS sur grille orthogonale 4-voisins. occupied est un Set de cles "c,r"
// representant les cases bloquees par des combattants.
export function bfs(mapData, occupied, start, maxDist = 999) {
  const key = (c, r) => `${c},${r}`;
  const dist = new Map();
  const prev = new Map();
  const queue = [start];
  dist.set(key(start.c, start.r), 0);

  while (queue.length) {
    const cur = queue.shift();
    const d = dist.get(key(cur.c, cur.r));
    if (d >= maxDist) continue;
    const neighbors = [
      { c: cur.c + 1, r: cur.r },
      { c: cur.c - 1, r: cur.r },
      { c: cur.c, r: cur.r + 1 },
      { c: cur.c, r: cur.r - 1 },
    ];
    for (const n of neighbors) {
      if (n.c < 0 || n.c >= MAP_SIZE || n.r < 0 || n.r >= MAP_SIZE) continue;
      const k = key(n.c, n.r);
      if (dist.has(k)) continue;
      if (mapData[n.r][n.c] === 1) continue;
      if (occupied.has(k)) continue;
      dist.set(k, d + 1);
      prev.set(k, key(cur.c, cur.r));
      queue.push(n);
    }
  }
  return { dist, prev };
}

export function pathTo(result, target) {
  const key = (c, r) => `${c},${r}`;
  const tk = key(target.c, target.r);
  if (!result.dist.has(tk)) return null;
  const path = [];
  let k = tk;
  while (k) {
    const [c, r] = k.split(',').map(Number);
    path.unshift({ c, r });
    k = result.prev.get(k);
  }
  return path;
}

// Ligne de vue Bresenham. Retourne true si les cases entre (c1, r1) et
// (c2, r2) (exclusives) ne contiennent aucun mur.
export function hasLOS(mapData, c1, r1, c2, r2) {
  let x0 = c1, y0 = r1;
  const x1 = c2, y1 = r2;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    if (x0 === x1 && y0 === y1) return true;
    if (!(x0 === c1 && y0 === r1)) {
      if (mapData[y0] && mapData[y0][x0] === 1) return false;
    }
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
