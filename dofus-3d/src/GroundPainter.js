import * as THREE from 'three';

// Sol "peint a la main" facon Dofus, genere sur canvas : taches de
// couleur douces, coups de pinceau d herbe, fleurs, terre... puis le
// quadrillage de combat (cases alternees claires / sombres, liseres
// lumineux) dessine par-dessus. Aucune image externe.

// Palettes par style de carte.
export const GROUND_PALETTES = {
  forest: {
    base: '#6e9a38',
    blotches: ['#7fae44', '#5f8c30', '#8cbb4e', '#557f2b', '#76a23c', '#9ac35a'],
    strokes: ['#9cc85c', '#4f7a26', '#86b548', '#3f6a1f', '#b0d46e'],
    dirt: ['#9a7b48', '#8a6a3c', '#a88a55'],
    dirtAmount: 0.35,
    flowers: ['#ffffff', '#fff27a', '#ff9ec4', '#ffd24a', '#c8a2ff'],
    flowerAmount: 1,
    wallSoil: '#4a3a1e',
    shore: '#b8a468',
    waterBed: '#2f6f7e',
  },
  river: {
    base: '#6aa040',
    blotches: ['#79b04a', '#5a8e34', '#86bd55', '#4f8230', '#93c562'],
    strokes: ['#9ccb62', '#4a7a2a', '#86b850', '#3d6a22', '#b3d878'],
    dirt: ['#a08650', '#8e7444', '#b39a64'],
    dirtAmount: 0.25,
    flowers: ['#ffffff', '#fff27a', '#9ed0ff', '#ffd24a'],
    flowerAmount: 0.8,
    wallSoil: '#4d4030',
    shore: '#c4b07a',
    waterBed: '#2a6c86',
  },
  graveyard: {
    base: '#5f6446',
    blotches: ['#6b7050', '#52563c', '#747a58', '#4a4e36', '#666a4a'],
    strokes: ['#7d825c', '#43462f', '#8a8e66', '#3a3d28'],
    dirt: ['#6a5a44', '#5a4c38', '#7a6a52'],
    dirtAmount: 0.7,
    flowers: ['#d8d0e8', '#9a8ab8'],
    flowerAmount: 0.15,
    wallSoil: '#3a3226',
    shore: '#7a6e58',
    waterBed: '#2e3e44',
  },
  cliff: {
    base: '#b6a462',
    blotches: ['#c4b474', '#a39352', '#cfc082', '#988848', '#b8aa6a', '#d8cc94'],
    strokes: ['#d2c585', '#8f7f42', '#c8ba78', '#7e7038', '#9aa05a'],
    dirt: ['#a08a60', '#8e7a52', '#b49e70'],
    dirtAmount: 0.6,
    flowers: ['#ffffff', '#fff27a'],
    flowerAmount: 0.25,
    wallSoil: '#6a5a3e',
    shore: '#d8c898',
    waterBed: '#3a7088',
  },
  swamp: {
    base: '#56703a',
    blotches: ['#607a40', '#4a6232', '#6a8448', '#42582c', '#5a6a36'],
    strokes: ['#7a9450', '#3a5226', '#6e8a46', '#34481f'],
    dirt: ['#5a4a30', '#4a3c26', '#6a583a'],
    dirtAmount: 0.8,
    flowers: ['#e8e0a0', '#c0d890'],
    flowerAmount: 0.3,
    wallSoil: '#33291a',
    shore: '#6a5a38',
    waterBed: '#34482a',
  },
};

function mulberry32(seed) {
  let s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Couche "peinture" commune : taches, terre, coups de pinceau, fleurs.
// `wrap` = dessine chaque element aussi decale d une largeur pour que la
// texture soit raccordable (tuilage sans couture).
function paintTerrain(ctx, size, pal, rng, opts = {}) {
  const pxPerUnit = opts.pxPerUnit || 100;
  const wrap = !!opts.wrap;
  const draws = (fn) => {
    if (!wrap) { fn(0, 0); return; }
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) fn(ox, oy);
  };

  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, size, size);

  // 1. Grandes taches douces (variations de teinte du terrain).
  const nBlotch = Math.round((size * size) / (pxPerUnit * pxPerUnit) * 2.2);
  for (let i = 0; i < nBlotch; i++) {
    const x = rng() * size, y = rng() * size;
    const rad = pxPerUnit * (0.4 + rng() * 1.6);
    const col = pal.blotches[Math.floor(rng() * pal.blotches.length)];
    const a = 0.25 + rng() * 0.35;
    draws((ox, oy) => {
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      g.addColorStop(0, rgba(col, a));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x + ox, y + oy, rad, rad * (0.6 + rng() * 0.4), rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 2. Plaques de terre battue.
  const nDirt = Math.round((size * size) / (pxPerUnit * pxPerUnit) * 0.12 * pal.dirtAmount);
  for (let i = 0; i < nDirt; i++) {
    const x = rng() * size, y = rng() * size;
    const rad = pxPerUnit * (0.3 + rng() * 0.8);
    const col = pal.dirt[Math.floor(rng() * pal.dirt.length)];
    draws((ox, oy) => {
      for (let k = 0; k < 5; k++) {
        const dx = (rng() - 0.5) * rad, dy = (rng() - 0.5) * rad;
        const rr = rad * (0.35 + rng() * 0.5);
        const g = ctx.createRadialGradient(x + ox + dx, y + oy + dy, 0, x + ox + dx, y + oy + dy, rr);
        g.addColorStop(0, rgba(col, 0.75));
        g.addColorStop(0.7, rgba(col, 0.45));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x + ox + dx, y + oy + dy, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // 3. Coups de pinceau d herbe (petits traits courbes).
  const nStroke = Math.round((size * size) / (pxPerUnit * pxPerUnit) * 260);
  ctx.lineCap = 'round';
  for (let i = 0; i < nStroke; i++) {
    const x = rng() * size, y = rng() * size;
    const len = pxPerUnit * (0.05 + rng() * 0.09);
    const ang = -Math.PI / 2 + (rng() - 0.5) * 1.3;
    const col = pal.strokes[Math.floor(rng() * pal.strokes.length)];
    ctx.strokeStyle = rgba(col, 0.35 + rng() * 0.4);
    ctx.lineWidth = Math.max(1, pxPerUnit * (0.012 + rng() * 0.014));
    const bend = (rng() - 0.5) * len * 0.8;
    draws((ox, oy) => {
      ctx.beginPath();
      ctx.moveTo(x + ox, y + oy);
      ctx.quadraticCurveTo(
        x + ox + Math.cos(ang) * len * 0.5 + bend, y + oy + Math.sin(ang) * len * 0.5,
        x + ox + Math.cos(ang) * len, y + oy + Math.sin(ang) * len
      );
      ctx.stroke();
    });
  }

  // 4. Petites fleurs (grappes de points).
  const nFlowerClusters = Math.round((size * size) / (pxPerUnit * pxPerUnit) * 0.5 * pal.flowerAmount);
  for (let i = 0; i < nFlowerClusters; i++) {
    const cx = rng() * size, cy = rng() * size;
    const col = pal.flowers[Math.floor(rng() * pal.flowers.length)];
    const n = 3 + Math.floor(rng() * 6);
    for (let k = 0; k < n; k++) {
      const x = cx + (rng() - 0.5) * pxPerUnit * 0.5;
      const y = cy + (rng() - 0.5) * pxPerUnit * 0.35;
      const r = pxPerUnit * (0.018 + rng() * 0.014);
      draws((ox, oy) => {
        ctx.fillStyle = 'rgba(40,60,20,0.35)';
        ctx.beginPath(); ctx.arc(x + ox + r * 0.3, y + oy + r * 0.4, r * 1.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,80,0.9)';
        ctx.beginPath(); ctx.arc(x + ox, y + oy, r * 0.4, 0, Math.PI * 2); ctx.fill();
      });
    }
  }
}

// Texture raccordable pour le grand sol exterieur au plateau.
export function paintOuterGround(style, seed = 1) {
  const pal = GROUND_PALETTES[style] || GROUND_PALETTES.forest;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // 512 px pour 6 unites monde.
  paintTerrain(ctx, size, pal, mulberry32(seed), { pxPerUnit: size / 6, wrap: true });
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Texture du plateau de combat : terrain peint + quadrillage + trous
// (alpha 0) sur les cases d eau pour laisser voir la riviere animee.
// Le plateau deborde de `margin` cases, fondues progressivement dans le
// sol exterieur.
export function paintBoard(grid, style, opts = {}) {
  const pal = GROUND_PALETTES[style] || GROUND_PALETTES.forest;
  const n = grid.length;
  const margin = opts.margin !== undefined ? opts.margin : 2;
  const units = n + margin * 2;
  const size = opts.size || 2048;
  const ppu = size / units;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rng = mulberry32(opts.seed || 777);
  paintTerrain(ctx, size, pal, rng, { pxPerUnit: ppu });

  // Case (c, r) -> rectangle pixel. Le centre de la case (c, r) est en
  // monde a (c, r) ; le plateau commence a -0.5 - margin.
  const cellX = (c) => (c + margin) * ppu;
  const cellY = (r) => (r + margin) * ppu;

  // Terre sombre sous les obstacles (arbres, rochers, tombes).
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 1) continue;
      const x = cellX(c) + ppu / 2, y = cellY(r) + ppu / 2;
      const g = ctx.createRadialGradient(x, y, 0, x, y, ppu * 0.62);
      g.addColorStop(0, rgba(pal.wallSoil, 0.85));
      g.addColorStop(0.65, rgba(pal.wallSoil, 0.55));
      g.addColorStop(1, rgba(pal.wallSoil, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - ppu, y - ppu, ppu * 2, ppu * 2);
    }
  }

  // Berges : bande sableuse autour de l eau.
  const isWater = (c, r) => r >= 0 && r < n && c >= 0 && c < n && (grid[r][c] === 2 || grid[r][c] === 3);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!isWater(c, r)) continue;
      const x = cellX(c), y = cellY(r);
      const pad = ppu * 0.22;
      const g = ctx.createRadialGradient(x + ppu / 2, y + ppu / 2, ppu * 0.3, x + ppu / 2, y + ppu / 2, ppu * 0.95);
      g.addColorStop(0, rgba(pal.shore, 0.95));
      g.addColorStop(1, rgba(pal.shore, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - pad * 2, y - pad * 2, ppu + pad * 4, ppu + pad * 4);
    }
  }

  // Quadrillage de combat : cases alternees + liseres (style Dofus).
  const inset = Math.max(1, ppu * 0.035);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = grid[r][c];
      if (t === 2 || t === 3) continue;
      const x = cellX(c) + inset, y = cellY(r) + inset;
      const w = ppu - inset * 2;
      const even = (c + r) % 2 === 0;
      ctx.fillStyle = even ? 'rgba(255,255,230,0.10)' : 'rgba(30,40,10,0.08)';
      ctx.fillRect(x, y, w, w);
      // Ombre interne basse/droite + lumiere haute/gauche : petit relief.
      ctx.lineWidth = Math.max(1, ppu * 0.022);
      ctx.strokeStyle = 'rgba(255,255,225,0.30)';
      ctx.beginPath();
      ctx.moveTo(x, y + w); ctx.lineTo(x, y); ctx.lineTo(x + w, y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(20,30,5,0.22)';
      ctx.beginPath();
      ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + w); ctx.lineTo(x, y + w);
      ctx.stroke();
    }
  }
  // Cadre sombre discret autour du plateau.
  ctx.strokeStyle = 'rgba(30,25,10,0.35)';
  ctx.lineWidth = Math.max(2, ppu * 0.05);
  ctx.strokeRect(cellX(0), cellY(0), n * ppu, n * ppu);

  // Alpha : trous pour l eau + fondu progressif dans la marge.
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  const b0 = margin * ppu, b1 = (margin + n) * ppu;
  const fade = ppu * (margin - 0.2);
  for (let py = 0; py < size; py++) {
    const dy = py < b0 ? b0 - py : py > b1 ? py - b1 : 0;
    for (let px = 0; px < size; px++) {
      const dx = px < b0 ? b0 - px : px > b1 ? px - b1 : 0;
      const i = (py * size + px) * 4;
      if (dx || dy) {
        const dist = Math.hypot(dx, dy) / fade;
        const a = dist >= 1 ? 0 : 1 - dist * dist * (3 - 2 * dist);
        d[i + 3] = Math.round(d[i + 3] * a);
      } else {
        const c = Math.floor((px - b0) / ppu), r = Math.floor((py - b0) / ppu);
        if (r >= 0 && r < n && c >= 0 && c < n && (grid[r][c] === 2 || grid[r][c] === 3)) d[i + 3] = 0;
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { texture: tex, units, margin };
}
