// Grille tactique isometrique facon Dofus.
// Coordonnees: (col, row) entieres.
// Conversion vers ecran (iso): un losange par case.

import { MAP_COLS, MAP_ROWS } from '../data/maps.js';

export const TILE_W = 64;
export const TILE_H = 32;

// Origine ecran de la grille (centre superieur de la case 0,0).
export const ORIGIN_X = 540;
export const ORIGIN_Y = 90;

export function tileToScreen(c, r) {
  return {
    x: ORIGIN_X + (c - r) * (TILE_W / 2),
    y: ORIGIN_Y + (c + r) * (TILE_H / 2),
  };
}

// Inversion ecran -> case (approximation losange).
export function screenToTile(sx, sy) {
  const dx = sx - ORIGIN_X;
  const dy = sy - ORIGIN_Y;
  const c = Math.round((dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2);
  const r = Math.round((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2);
  return { c, r };
}

export function inBounds(c, r) {
  return c >= 0 && c < MAP_COLS && r >= 0 && r < MAP_ROWS;
}

export function manhattan(a, b) {
  return Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
}

export function inLine(a, b) {
  return a.c === b.c || a.r === b.r;
}

// Renvoie la liste des 4 voisins orthogonaux (mouvement sans diagonale).
function neighbors(c, r) {
  return [
    { c: c + 1, r },
    { c: c - 1, r },
    { c, r: r + 1 },
    { c, r: r - 1 },
  ];
}

// BFS depuis (c, r). Une case est bloquee si:
//   - obstacle dans tiles
//   - occupee par un fighter (sauf la case de depart)
// Retourne { dist: Map(key -> nb pas), prev: Map(key -> prevKey) }.
export function bfs(tiles, occupied, start, maxDist) {
  const key = (c, r) => `${c},${r}`;
  const dist = new Map();
  const prev = new Map();
  const queue = [start];
  dist.set(key(start.c, start.r), 0);

  while (queue.length) {
    const cur = queue.shift();
    const d = dist.get(key(cur.c, cur.r));
    if (d >= maxDist) continue;
    for (const n of neighbors(cur.c, cur.r)) {
      if (!inBounds(n.c, n.r)) continue;
      const k = key(n.c, n.r);
      if (dist.has(k)) continue;
      if (tiles[n.r][n.c] === 1) continue;
      if (occupied.has(k)) continue;
      dist.set(k, d + 1);
      prev.set(k, key(cur.c, cur.r));
      queue.push(n);
    }
  }
  return { dist, prev };
}

// Reconstitue le chemin (liste de {c, r}) depuis le BFS jusqu a target.
export function pathTo(bfsResult, target) {
  const key = (c, r) => `${c},${r}`;
  const tk = key(target.c, target.r);
  if (!bfsResult.dist.has(tk)) return null;
  const path = [];
  let k = tk;
  while (k) {
    const [c, r] = k.split(',').map(Number);
    path.unshift({ c, r });
    k = bfsResult.prev.get(k);
  }
  return path;
}

// Toutes les cases dans un rayon "manhattan" entre min et max
// (sans tenir compte des obstacles -- pour la portee d un sort).
export function tilesInRange(c, r, min, max, opts = {}) {
  const out = [];
  for (let dr = -max; dr <= max; dr++) {
    for (let dc = -max; dc <= max; dc++) {
      const d = Math.abs(dr) + Math.abs(dc);
      if (d < min || d > max) continue;
      const nc = c + dc;
      const nr = r + dr;
      if (!inBounds(nc, nr)) continue;
      if (opts.inLine && !(dc === 0 || dr === 0)) continue;
      out.push({ c: nc, r: nr });
    }
  }
  return out;
}

// Cases d effet d un sort selon son type d aire.
export function tilesInArea(area, center) {
  if (!area) area = { type: 'single' };
  const out = [];
  if (area.type === 'single') {
    out.push({ c: center.c, r: center.r });
  } else if (area.type === 'cross') {
    const size = area.size || 1;
    out.push({ c: center.c, r: center.r });
    for (let i = 1; i <= size; i++) {
      out.push({ c: center.c + i, r: center.r });
      out.push({ c: center.c - i, r: center.r });
      out.push({ c: center.c, r: center.r + i });
      out.push({ c: center.c, r: center.r - i });
    }
  } else if (area.type === 'circle') {
    const size = area.size || 1;
    for (let dr = -size; dr <= size; dr++) {
      for (let dc = -size; dc <= size; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= size) {
          out.push({ c: center.c + dc, r: center.r + dr });
        }
      }
    }
  }
  return out.filter(t => inBounds(t.c, t.r));
}

// Ligne de vue facon Bresenham. Renvoie true si rien ne bloque
// entre from et to (sauf la case de depart et d arrivee).
export function hasLineOfSight(tiles, occupied, from, to) {
  let x0 = from.c, y0 = from.r;
  const x1 = to.c, y1 = to.r;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (!(x0 === from.c && y0 === from.r) && !(x0 === to.c && y0 === to.r)) {
      if (!inBounds(x0, y0)) return false;
      if (tiles[y0][x0] === 1) return false;
      if (occupied.has(`${x0},${y0}`)) return false;
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 <  dx) { err += dx; y0 += sy; }
  }
  return true;
}

// Direction unitaire pour une poussee/traction (axe principal).
export function pushDirection(from, to) {
  const dc = to.c - from.c;
  const dr = to.r - from.r;
  if (Math.abs(dc) >= Math.abs(dr)) {
    return { dc: Math.sign(dc), dr: 0 };
  }
  return { dc: 0, dr: Math.sign(dr) };
}
