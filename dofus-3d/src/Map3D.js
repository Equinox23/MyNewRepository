import * as THREE from 'three';
import { buildTree } from './models/tree.js';
import { buildRock } from './models/rock.js';

export const MAP_SIZE = 15;
export const TILE_SIZE = 1;

// Codes terrain :
//   0 = sol (herbe)         passable
//   1 = mur (arbre / rocher) bloquant
//   2 = eau                  bloquant sauf isAquatic
//   3 = pont                 passable pour tous

// Aides pour fabriquer une grille a partir d une notation textuelle.
// '.' = sol / '#' = mur / '~' = eau / '=' = pont
function gridFromAscii(rows) {
  const out = [];
  for (let r = 0; r < MAP_SIZE; r++) {
    const row = [];
    for (let c = 0; c < MAP_SIZE; c++) {
      const ch = rows[r][c];
      const code = ch === '#' ? 1 : ch === '~' ? 2 : ch === '=' ? 3 : 0;
      row.push(code);
    }
    out.push(row);
  }
  return out;
}

const FOREST_GRID = (() => {
  const grid = [];
  for (let r = 0; r < MAP_SIZE; r++) grid.push(new Array(MAP_SIZE).fill(0));
  const walls = [
    [7, 4], [7, 5], [7, 6], [7, 8], [7, 9], [7, 10],
    [3, 3], [11, 11], [3, 11], [11, 3],
    [4, 7], [10, 7],
  ];
  for (const [c, r] of walls) grid[r][c] = 1;
  return grid;
})();

// Riviere elargie a 5 cases qui serpente du nord-ouest au sud-est, avec
// une chute d eau a l extremite nord et un pont au milieu.
const CASCADE_GRID = gridFromAscii([
  '...~~~~~.......', // 0  cols 3-7
  '...~~~~~.......', // 1
  '...~~~~~.......', // 2
  '....~~~~~......', // 3  cols 4-8
  '.....~~~~~.#...', // 4  cols 5-9 + rocher col 11
  '.....~~~~~.....', // 5
  '......~~~~~....', // 6  cols 6-10
  '......=====....', // 7  pont elargi cols 6-10
  '......~~~~~....', // 8
  '......~~~~~....', // 9
  '#......~~~~~...', // 10 cols 7-11 + rocher col 0
  '.......~~~~~...', // 11
  '........~~~~~..', // 12 cols 8-12
  '........~~~~~.#', // 13 + rocher col 14
  '........~~~~~..', // 14
]);

// Cases qui accueillent un nenuphar (decoratif, sur l eau).
const CASCADE_LILY_PADS = [
  { c: 4, r: 1 },
  { c: 7, r: 5 },
  { c: 10, r: 11 },
];

// Helper : grille a partir d une liste de murs [c, r].
function gridFromWalls(walls) {
  const grid = [];
  for (let r = 0; r < MAP_SIZE; r++) grid.push(new Array(MAP_SIZE).fill(0));
  for (const [c, r] of walls) grid[r][c] = 1;
  return grid;
}

// Cimetiere : pierres tombales eparpillees.
const CIMETIERE_GRID = gridFromWalls([
  [5, 2], [9, 2], [3, 4], [11, 4], [6, 4], [10, 4],
  [4, 6], [8, 6], [7, 8], [5, 10], [10, 10], [3, 10],
  [11, 10], [6, 12], [9, 12],
]);

// Falaise venteuse : rochers epars + un eperon central.
const FALAISE_GRID = gridFromWalls([
  [4, 2], [10, 2], [2, 4], [12, 4], [6, 5], [8, 5],
  [7, 7], [2, 10], [12, 10], [6, 11], [8, 11],
  [4, 13], [10, 13],
]);

// Marais : flaques d eau stagnante reparties hors des couloirs de spawn.
const MARAIS_GRID = (() => {
  const grid = [];
  for (let r = 0; r < MAP_SIZE; r++) grid.push(new Array(MAP_SIZE).fill(0));
  const water = [
    [6, 1], [7, 1], [6, 2], [7, 2],
    [8, 5], [9, 5], [8, 6], [9, 6],
    [4, 9], [5, 9], [4, 10], [5, 10],
    [9, 11], [10, 11], [9, 12], [10, 12],
    [7, 13], [8, 13],
  ];
  for (const [c, r] of water) grid[r][c] = 2;
  return grid;
})();

// Nenuphars decoratifs du marais.
const MARAIS_LILY_PADS = [
  { c: 7, r: 1 },
  { c: 8, r: 6 },
  { c: 5, r: 9 },
  { c: 9, r: 12 },
];

export const MAPS = {
  foret: {
    name: 'Foret',
    grid: FOREST_GRID,
    style: 'forest',
    hasBackgroundForest: true,
    groundColor: 0x244018,
    bgColor: 0x88b07d,
  },
  cascade: {
    name: 'Cascade',
    grid: CASCADE_GRID,
    style: 'river',
    hasBackgroundForest: false,
    groundColor: 0x2a3a16,
    bgColor: 0xa4c4cc,
    waterfall: { c: 5, r: 0 }, // chute d eau a l extremite nord (cols 3-7)
    lilyPads: CASCADE_LILY_PADS,
  },
  cimetiere: {
    name: 'Cimetiere',
    grid: CIMETIERE_GRID,
    style: 'graveyard',
    wallStyle: 'tombstone',
    hasBackgroundForest: false,
    groundColor: 0x2a2d24,
    bgColor: 0x4a4658,
  },
  falaise: {
    name: 'Falaise Venteuse',
    grid: FALAISE_GRID,
    style: 'cliff',
    wallStyle: 'rock',
    hasBackgroundForest: false,
    groundColor: 0x6a5a3e,
    bgColor: 0xbcd4e6,
  },
  marais: {
    name: 'Marais',
    grid: MARAIS_GRID,
    style: 'swamp',
    wallStyle: 'rock',
    hasBackgroundForest: false,
    groundColor: 0x2c3a1c,
    bgColor: 0x6e7a52,
    lilyPads: MARAIS_LILY_PADS,
    murkyWater: true, // eau verdatre stagnante
  },
};

// Boosts permanents donnes a certaines creatures sur certaines cartes.
export const MAP_BOOSTS = {
  foret: {
    bouftou: { bonusPm: 1 },
    bouftouRoyal: { bonusPm: 1 },
  },
  cascade: {
    crapaud: { damageMult: 0.3 },
    crapaudChef: { damageMult: 0.3 },
  },
  cimetiere: {
    chafer: { damageMult: 0.3 },
    chaferRoyal: { damageMult: 0.3 },
  },
  falaise: {
    tofu: { bonusPa: 2 },
    tofuRoyal: { bonusPa: 2 },
  },
  marais: {
    champignon: { bonusPm: 1 },
    champignonRoyal: { bonusPm: 1 },
  },
};

export class Map3D {
  constructor(scene, mapId = 'foret') {
    this.scene = scene;
    this.currentMapId = null;
    // Tout ce qui est ajoute via this.scene.add() est tracke ici pour
    // pouvoir le retirer proprement lors du rebuild.
    this.spawned = [];
    this.tileGroup = null;
    this.rebuild(mapId);
  }

  rebuild(mapId) {
    if (this.currentMapId === mapId) return;
    this.cleanup();
    const map = MAPS[mapId] || MAPS.foret;
    this.currentMapId = mapId;
    this.mapData = map.grid;
    this.config = map;

    // Ambiance: change le ciel et le fog (le main passe via scene.background
    // directement, mais Map3D peut aussi customiser le ground exterieur).
    if (this.scene.background) this.scene.background.setHex(map.bgColor);
    if (this.scene.fog) this.scene.fog.color.setHex(map.bgColor);

    this.tileGroup = new THREE.Group();
    this.scene.add(this.tileGroup);
    this.spawned.push(this.tileGroup);

    this.buildGround(map);
    this.buildTiles(map);
    if (map.hasBackgroundForest) this.buildBackgroundForest();
    if (map.waterfall) this.buildWaterfall(map.waterfall);
    if (map.lilyPads) this.buildLilyPads(map.lilyPads);
  }

  cleanup() {
    for (const obj of this.spawned) {
      this.scene.remove(obj);
      obj.traverse(o => {
        if (o.isMesh) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
            else o.material.dispose();
          }
        }
      });
    }
    this.spawned = [];
    this.tileGroup = null;
  }

  // Vaste plan vert sombre (foret) ou greisatre humide (cascade).
  buildGround(map) {
    const baseGeom = new THREE.PlaneGeometry(120, 120);
    const baseMat = new THREE.MeshStandardMaterial({
      color: map.groundColor, roughness: 1,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.set((MAP_SIZE - 1) / 2, -0.06, (MAP_SIZE - 1) / 2);
    base.receiveShadow = true;
    this.scene.add(base);
    this.spawned.push(base);
  }

  buildTiles(map) {
    const tileW = 0.96;
    const tileH = 0.1;
    const tileGeom = new THREE.BoxGeometry(tileW, tileH, tileW);
    const grassColors = [0x6a9540, 0x5a8838, 0x4a7a30, 0x5d8e3a, 0x4f7d31];
    const grassMats = grassColors.map(c =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })
    );
    const dirtTileMat = new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.95 });
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x6e4a20, roughness: 0.85 });

    this.tiles = [];
    let wallIdx = 0;
    for (let r = 0; r < MAP_SIZE; r++) {
      const row = [];
      for (let c = 0; c < MAP_SIZE; c++) {
        const t = map.grid[r][c];
        const hash = ((c * 2654435761) ^ (r * 2246822519)) >>> 0;

        if (t === 2) {
          // EAU : plane horizontal bleu legerement sunken.
          const water = this.buildWaterTile(c, r);
          this.tileGroup.add(water);
          water.userData = { c, r, terrain: 2 };
          row.push(water);
          continue;
        }
        if (t === 3) {
          // PONT : planche bois posee au-dessus de l eau.
          // On dessine d abord l eau dessous (pour les flancs visibles).
          const water = this.buildWaterTile(c, r);
          this.tileGroup.add(water);
          // Puis la planche par-dessus.
          const plank = new THREE.Mesh(new THREE.BoxGeometry(tileW, 0.12, tileW), bridgeMat);
          plank.position.set(c, 0.06, r);
          plank.userData = { c, r, terrain: 3 };
          plank.castShadow = true;
          plank.receiveShadow = true;
          this.tileGroup.add(plank);
          // Petites planches paralleles pour l effet bois
          for (const ox of [-0.30, -0.10, 0.10, 0.30]) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.005, tileW * 0.95), new THREE.MeshStandardMaterial({ color: 0x4a2e14, roughness: 0.95 }));
            slat.position.set(c + ox, 0.13, r);
            this.tileGroup.add(slat);
          }
          row.push(plank);
          continue;
        }

        // Sol / mur
        const isWall = t === 1;
        const mat = isWall ? dirtTileMat : grassMats[hash % grassMats.length];
        const tile = new THREE.Mesh(tileGeom, mat);
        tile.position.set(c, 0, r);
        tile.receiveShadow = true;
        tile.userData = { c, r, terrain: t };
        this.tileGroup.add(tile);
        row.push(tile);

        if (isWall) {
          // Decor du mur selon la carte : arbre/rocher (foret),
          // pierre tombale (cimetiere), sinon rocher.
          const seed = (c + 1) * 113 + (r + 1) * 271 + wallIdx * 31;
          let model;
          if (map.wallStyle === 'tombstone') {
            model = buildTombstone(seed);
          } else {
            const useTree = map.style === 'forest' && (wallIdx % 3) !== 0;
            model = useTree ? buildTree(seed) : buildRock(seed);
          }
          model.position.set(c, 0.05, r);
          const s = 0.85 + ((seed % 100) / 100) * 0.35;
          model.scale.setScalar(s);
          model.rotation.y = (seed % 360) * Math.PI / 180;
          this.tileGroup.add(model);
          wallIdx++;
        }
      }
      this.tiles.push(row);
    }
  }

  buildWaterTile(c, r) {
    // Nuances de bleu (ou de vert pour un marais), choisies de maniere
    // pseudo-aleatoire et stable a partir des coordonnees.
    const bluePalette = [0x1d6f93, 0x2b8aab, 0x3aa1c2, 0x4cb3d1, 0x217fa0];
    const murkyPalette = [0x3e5a32, 0x4a6a38, 0x355028, 0x53703e, 0x42602f];
    const palette = (this.config && this.config.murkyWater) ? murkyPalette : bluePalette;
    const hash = ((c * 73) ^ (r * 137)) >>> 0;
    const color = palette[hash % palette.length];
    const waterMat = new THREE.MeshStandardMaterial({
      color,
      transparent: true, opacity: 0.85,
      roughness: 0.2, metalness: 0.45,
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(0.99, 0.99), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(c, -0.03, r);
    water.receiveShadow = true;
    // Petits reflets blancs aleatoires pour donner de la vie.
    const foamMat = new THREE.MeshBasicMaterial({ color: 0xeaf3f7, transparent: true, opacity: 0.55 });
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.06), foamMat);
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(c + ((hash % 7) - 3) * 0.04, -0.02, r + ((hash % 5) - 2) * 0.04);
    water.add(foam);
    // Deuxieme reflet plus petit, orientation differente.
    if ((hash >> 3) % 3 === 0) {
      const foam2 = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.05), foamMat);
      foam2.rotation.x = -Math.PI / 2;
      foam2.rotation.z = Math.PI / 4;
      foam2.position.set(c + ((hash % 5) - 2) * 0.05, -0.02, r - ((hash % 4) - 2) * 0.05);
      water.add(foam2);
    }
    return water;
  }

  // Petite chute d eau a l extremite nord de la riviere.
  // Position = case d arrivee (c, r) : on dresse une falaise au nord et on
  // y plaque un drapeau d eau qui descend vers la riviere.
  buildWaterfall(pos) {
    const grp = new THREE.Group();
    // Falaise rocheuse derriere la cascade : 3 blocs cubiques empiles.
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x3d4148, roughness: 1 });
    for (let i = -2; i <= 2; i++) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 0.8), cliffMat);
      block.position.set(pos.c + i, 1.2, pos.r - 1.4);
      block.rotation.y = (i * 0.07);
      block.castShadow = true;
      block.receiveShadow = true;
      grp.add(block);
    }
    // Pic en arriere plan (juste pour le silhouettage).
    const peak = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.5, 8), cliffMat);
    peak.position.set(pos.c, 3.2, pos.r - 2.0);
    grp.add(peak);

    // Rideau d eau (vertical), legerement courbe par 3 plans superposes.
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x66c0e0, transparent: true, opacity: 0.78,
      roughness: 0.1, metalness: 0.4, side: THREE.DoubleSide,
    });
    const fallWidth = 4.6;
    const fallHeight = 2.6;
    for (let i = 0; i < 3; i++) {
      const w = fallWidth - i * 0.4;
      const h = fallHeight - i * 0.2;
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, h), waterMat);
      sheet.position.set(pos.c, h / 2, pos.r - 1.0 + i * 0.05);
      grp.add(sheet);
    }

    // Pied de chute : flaque d ecume au sol (devant la chute).
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xeaf6fb, transparent: true, opacity: 0.85, roughness: 0.3,
    });
    const foamGeom = new THREE.CircleGeometry(2.2, 24);
    const foam = new THREE.Mesh(foamGeom, foamMat);
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(pos.c, -0.018, pos.r);
    grp.add(foam);
    // Petits jets / projections autour du pied de chute.
    const splashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const droplet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), splashMat);
      droplet.position.set(
        pos.c + Math.cos(a) * 1.4,
        0.20 + Math.sin(i) * 0.10,
        pos.r + Math.sin(a) * 1.2,
      );
      grp.add(droplet);
    }

    this.scene.add(grp);
    this.spawned.push(grp);
  }

  // Nenuphars : disque vert flottant + petite fleur jaune.
  buildLilyPads(positions) {
    const padMat = new THREE.MeshStandardMaterial({ color: 0x3b8a3a, roughness: 0.9 });
    const padMat2 = new THREE.MeshStandardMaterial({ color: 0x2c6f2a, roughness: 0.9 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xfff4c8, roughness: 0.85 });
    const heartMat = new THREE.MeshStandardMaterial({ color: 0xf6c761, roughness: 0.7 });
    for (const p of positions) {
      // Verifie que c est bien une case d eau ; sinon, on saute.
      if (this.mapData[p.r][p.c] !== 2) continue;
      const grp = new THREE.Group();
      // Disque principal : un cylindre tres aplati.
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), padMat);
      pad.castShadow = true;
      pad.receiveShadow = true;
      grp.add(pad);
      // Petite encoche : un autre disque plus sombre decale.
      const pad2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.045, 18), padMat2);
      pad2.position.set(0.15, 0.001, -0.10);
      grp.add(pad2);
      // Fleur : un noyau jaune avec quelques petales.
      const heart = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), heartMat);
      heart.position.set(-0.10, 0.10, 0.05);
      grp.add(heart);
      for (let i = 0; i < 6; i++) {
        const petalGeom = new THREE.SphereGeometry(0.06, 8, 6);
        const petal = new THREE.Mesh(petalGeom, flowerMat);
        const a = (i / 6) * Math.PI * 2;
        petal.position.set(-0.10 + Math.cos(a) * 0.09, 0.09, 0.05 + Math.sin(a) * 0.09);
        petal.scale.set(1, 0.7, 1);
        grp.add(petal);
      }
      // Place le nenuphar legerement au-dessus de l eau.
      grp.position.set(p.c, 0.005, p.r);
      // Petite rotation aleatoire pour varier l aspect.
      grp.rotation.y = ((p.c * 17 + p.r * 31) % 360) * Math.PI / 180;
      this.tileGroup.add(grp);
    }
  }

  buildBackgroundForest() {
    const rngBase = mulberry32(424242);
    const center = (MAP_SIZE - 1) / 2;
    const minDist = MAP_SIZE / 2 + 1.5;
    const maxDist = MAP_SIZE / 2 + 14;
    let placed = 0;
    let attempts = 0;
    while (placed < 130 && attempts < 800) {
      attempts++;
      const angle = rngBase() * Math.PI * 2;
      const dist = minDist + rngBase() * (maxDist - minDist);
      const x = center + Math.cos(angle) * dist;
      const z = center + Math.sin(angle) * dist;
      const jx = x + (rngBase() - 0.5) * 1.5;
      const jz = z + (rngBase() - 0.5) * 1.5;
      const seed = Math.floor(rngBase() * 1e7);
      const tree = buildTree(seed);
      tree.position.set(jx, 0, jz);
      const s = 0.9 + rngBase() * 0.9;
      tree.scale.setScalar(s);
      tree.rotation.y = rngBase() * Math.PI * 2;
      tree.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
      this.scene.add(tree);
      this.spawned.push(tree);
      placed++;
    }
  }

  inBounds(c, r) {
    return c >= 0 && c < MAP_SIZE && r >= 0 && r < MAP_SIZE;
  }

  // Mur : tile == 1 OU tile == 2 (eau) si non aquatique. Pour les
  // usages generiques, isWall renvoie true pour les obstacles solides.
  isWall(c, r) {
    if (!this.inBounds(c, r)) return true;
    return this.mapData[r][c] === 1;
  }

  isWater(c, r) {
    if (!this.inBounds(c, r)) return false;
    return this.mapData[r][c] === 2;
  }

  isBridge(c, r) {
    if (!this.inBounds(c, r)) return false;
    return this.mapData[r][c] === 3;
  }

  // Test de blocage adapte au combattant (les aquatiques traversent l eau).
  isBlockedFor(c, r, fighter) {
    if (!this.inBounds(c, r)) return true;
    const t = this.mapData[r][c];
    if (t === 1) return true;
    if (t === 2) return !(fighter && fighter.def && fighter.def.isAquatic);
    return false;
  }

  getTileType(c, r) {
    if (!this.inBounds(c, r)) return -1;
    return this.mapData[r][c];
  }

  getTileMesh(c, r) {
    if (!this.inBounds(c, r)) return null;
    return this.tiles[r][c];
  }

  getData() {
    return this.mapData;
  }
}

function mulberry32(seed) {
  let s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

// Pierre tombale : dalle de pierre arrondie, legerement inclinee,
// posee sur un petit socle, avec une croix gravee. `seed` varie la
// forme (croix ou dalle simple) et l inclinaison.
function buildTombstone(seed) {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8b8d92, roughness: 0.95 });
  const stoneDkMat = new THREE.MeshStandardMaterial({ color: 0x5f6066, roughness: 0.95 });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x4a6a38, roughness: 1 });

  // Socle.
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.44), stoneDkMat);
  base.position.y = 0.06;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const isCross = (seed % 3) === 0;
  if (isCross) {
    // Croix de pierre.
    const vert = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.80, 0.16), stoneMat);
    vert.position.y = 0.52;
    vert.castShadow = true;
    g.add(vert);
    const horiz = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.16, 0.15), stoneMat);
    horiz.position.y = 0.66;
    horiz.castShadow = true;
    g.add(horiz);
  } else {
    // Dalle arrondie.
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.66, 0.14), stoneMat);
    slab.position.y = 0.42;
    slab.castShadow = true;
    g.add(slab);
    const topRound = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.14, 16, 1, false, 0, Math.PI), stoneMat);
    topRound.rotation.x = Math.PI / 2;
    topRound.rotation.z = Math.PI;
    topRound.position.set(0, 0.75, 0);
    g.add(topRound);
    // Croix gravee.
    const eg = new THREE.MeshStandardMaterial({ color: 0x4a4b50, roughness: 1 });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.02), eg);
    cv.position.set(0, 0.52, 0.08);
    g.add(cv);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.02), eg);
    ch.position.set(0, 0.58, 0.08);
    g.add(ch);
  }
  // Touffe de mousse au pied.
  const moss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mossMat);
  moss.position.set(((seed % 5) - 2) * 0.08, 0.10, 0.20);
  moss.scale.set(1, 0.45, 1);
  g.add(moss);

  // Legere inclinaison "abandonnee".
  g.rotation.z = ((seed % 7) - 3) * 0.03;
  return g;
}
