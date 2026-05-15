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
    flow: { x: 0.42, z: 1.25 }, // courant : la riviere coule vers le sud-est
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

// Aspect des touffes d herbe selon le style de carte.
const GRASS_STYLE = {
  forest:    { density: 42, colors: [0x6fae46, 0x5d9a3a, 0x7cbf4e, 0x4f8a31] },
  river:     { density: 32, colors: [0x6aa848, 0x5a9038, 0x76b850] },
  graveyard: { density: 22, colors: [0x6a6a44, 0x55552f, 0x7a6a40] },
  cliff:     { density: 18, colors: [0xb9aa60, 0xa89a55, 0xc7b96a] },
  swamp:     { density: 34, colors: [0x5f8a3e, 0x6e7a3a, 0x4f7030] },
};

export class Map3D {
  constructor(scene, mapId = 'foret') {
    this.scene = scene;
    this.currentMapId = null;
    // Tout ce qui est ajoute via this.scene.add() est tracke ici pour
    // pouvoir le retirer proprement lors du rebuild.
    this.spawned = [];
    this.tileGroup = null;
    // Elements animes (eau, herbe, cascade, nuages).
    this.anim = { water: [], waterfall: [], grass: [], clouds: [] };
    this.rebuild(mapId);
  }

  rebuild(mapId) {
    if (this.currentMapId === mapId) return;
    this.cleanup();
    const map = MAPS[mapId] || MAPS.foret;
    this.currentMapId = mapId;
    this.mapData = map.grid;
    this.config = map;
    this.anim = { water: [], waterfall: [], grass: [], clouds: [] };

    // Ambiance: change le ciel et le fog (le main passe via scene.background
    // directement, mais Map3D peut aussi customiser le ground exterieur).
    if (this.scene.background) this.scene.background.setHex(map.bgColor);
    if (this.scene.fog) this.scene.fog.color.setHex(map.bgColor);

    this.tileGroup = new THREE.Group();
    this.scene.add(this.tileGroup);
    this.spawned.push(this.tileGroup);

    this.buildGround(map);
    this.buildTiles(map);
    this.buildBackgroundDecor(map);
    if (map.waterfall) this.buildWaterfall(map.waterfall);
    if (map.lilyPads) this.buildLilyPads(map.lilyPads);
  }

  // Anime les elements vivants de la carte. Appele chaque frame depuis
  // la boucle de rendu principale.
  update(dt, time) {
    if (!this.anim) return;
    // Eau : ondulation verticale douce + derive de l ecume.
    for (const w of this.anim.water) {
      w.mesh.position.y = w.baseY + Math.sin(time * 1.6 + w.phase) * 0.02;
      for (const f of w.streaks) {
        f.t += dt;
        const k = (f.t % f.dur) / f.dur;
        f.mesh.position.x = f.x0 + f.dx * k;
        f.mesh.position.z = f.z0 + f.dz * k;
        f.mesh.material.opacity = Math.sin(k * Math.PI) * 0.5;
      }
    }
    // Cascade : gouttes qui tombent en boucle.
    for (const d of this.anim.waterfall) {
      d.mesh.position.y -= d.speed * dt;
      if (d.mesh.position.y < d.minY) {
        d.mesh.position.y = d.maxY;
      }
    }
    // Herbe : balancement sous le vent (rafales globales + phase locale).
    const gust = Math.sin(time * 0.9) * 0.06;
    for (const g of this.anim.grass) {
      g.mesh.rotation.z = g.base + Math.sin(time * 2.5 + g.phase) * 0.17 + gust;
    }
    // Nuages : derive lente, bouclage de part et d autre de la carte.
    for (const c of this.anim.clouds) {
      c.mesh.position.x += c.speed * dt;
      if (c.mesh.position.x > c.wrapMax) c.mesh.position.x = c.wrapMin;
    }
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
        } else {
          // Touffe d herbe sur le sol : elle ondule sous le vent.
          this.maybeAddGrass(map, c, r, hash);
        }
      }
      this.tiles.push(row);
    }
  }

  // Pose une touffe d herbe sur une case de sol (probabilite et teinte
  // dependent de la carte). Enregistre la touffe pour l animation vent.
  maybeAddGrass(map, c, r, hash) {
    const cfg = GRASS_STYLE[map.style] || GRASS_STYLE.forest;
    // ~density% des cases de sol reçoivent une touffe (pseudo-aleatoire).
    if (((hash >> 5) % 100) >= cfg.density) return;
    const blades = 2 + ((hash >> 2) % 2);  // 2 a 3 brins
    const tuft = new THREE.Group();
    for (let i = 0; i < blades; i++) {
      const palIdx = (hash + i * 7) % cfg.colors.length;
      const mat = new THREE.MeshStandardMaterial({ color: cfg.colors[palIdx], roughness: 1 });
      const h = 0.20 + ((hash + i * 13) % 12) * 0.012;
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.022, h, 5), mat);
      blade.position.set(
        ((((hash + i * 31) % 20) - 10) / 10) * 0.22,
        h / 2,
        ((((hash + i * 53) % 20) - 10) / 10) * 0.22,
      );
      blade.rotation.z = ((((hash + i * 17) % 14) - 7) / 7) * 0.25;
      tuft.add(blade);
    }
    tuft.position.set(c, 0.05, r);
    this.tileGroup.add(tuft);
    this.anim.grass.push({
      mesh: tuft,
      base: tuft.rotation.z,
      phase: (hash % 628) / 100,
    });
  }

  buildWaterTile(c, r) {
    // Nuances de bleu (ou de vert pour un marais), choisies de maniere
    // pseudo-aleatoire et stable a partir des coordonnees.
    const bluePalette = [0x1d6f93, 0x2b8aab, 0x3aa1c2, 0x4cb3d1, 0x217fa0];
    const murkyPalette = [0x3e5a32, 0x4a6a38, 0x355028, 0x53703e, 0x42602f];
    const murky = !!(this.config && this.config.murkyWater);
    const palette = murky ? murkyPalette : bluePalette;
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

    // Stries d ecume qui derivent : vers l aval pour une riviere
    // (config.flow), quasi immobiles et scintillantes pour un marais.
    const flow = this.config && this.config.flow;
    const streaks = [];
    const nStreaks = murky ? 1 : 2;
    for (let i = 0; i < nStreaks; i++) {
      const foamMat = new THREE.MeshBasicMaterial({
        color: murky ? 0xcfe0b0 : 0xeaf3f7, transparent: true, opacity: 0.0,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.07), foamMat);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = ((hash + i * 19) % 100) / 100 * Math.PI;
      const ox = ((((hash + i * 31) % 16) - 8) / 8) * 0.30;
      const oz = ((((hash + i * 53) % 16) - 8) / 8) * 0.30;
      const dx = flow ? flow.x : 0;
      const dz = flow ? flow.z : 0;
      m.position.set(c + ox - dx / 2, -0.012, r + oz - dz / 2);
      this.tileGroup.add(m);
      streaks.push({
        mesh: m,
        x0: c + ox - dx / 2, z0: r + oz - dz / 2,
        dx, dz,
        t: ((hash + i * 137) % 300) / 100,
        dur: murky ? 5.0 : 2.6,
      });
    }
    this.anim.water.push({
      mesh: water,
      baseY: -0.03,
      phase: (hash % 628) / 100,
      streaks,
    });
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

    // Gouttes qui devalent en continu le rideau d eau (animees).
    const dropMat = new THREE.MeshBasicMaterial({ color: 0xdff2fb });
    for (let i = 0; i < 18; i++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), dropMat);
      drop.scale.set(1, 2.0, 1);
      const dx = (((i * 97) % 100) / 100 - 0.5) * 4.2;
      const y0 = ((i * 53) % 100) / 100 * 2.6;
      drop.position.set(pos.c + dx, y0, pos.r - 0.86);
      grp.add(drop);
      this.anim.waterfall.push({
        mesh: drop,
        speed: 2.0 + ((i * 31) % 100) / 100 * 1.6,
        minY: -0.05,
        maxY: 2.6,
      });
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

  // Decor exterieur au plateau, propre a chaque theme de carte.
  buildBackgroundDecor(map) {
    switch (map.style) {
      case 'forest':
        this._scatterRing(buildTree, 130, { seedBase: 424242, scale: [0.9, 1.8] });
        break;
      case 'river':
        this._scatterRing(buildTree, 60, { seedBase: 71717, scale: [0.9, 1.7] });
        this._scatterRing(buildPeak, 8, { seedBase: 313, minD: 17, maxD: 27, scale: [2.0, 3.6] });
        this._buildClouds(6);
        break;
      case 'graveyard':
        this._scatterRing(buildDeadTree, 78, { seedBase: 99001, scale: [0.9, 1.7] });
        this._scatterRing(buildTombstone, 24, { seedBase: 5151, minD: 9, maxD: 15, scale: [0.8, 1.4] });
        break;
      case 'cliff':
        this._scatterRing(buildPeak, 28, { seedBase: 8080, minD: 11, maxD: 27, scale: [2.4, 5.2] });
        this._buildClouds(16);
        break;
      case 'swamp':
        this._scatterRing(buildDeadTree, 54, { seedBase: 33221, scale: [0.9, 1.6] });
        this._scatterRing(buildReed, 64, { seedBase: 7777, minD: 9, maxD: 18, scale: [0.8, 1.5] });
        break;
    }
  }

  // Disperse `count` props (builder(seed)) en couronne autour du plateau.
  _scatterRing(builder, count, opts = {}) {
    const rng = mulberry32(opts.seedBase || 12345);
    const center = (MAP_SIZE - 1) / 2;
    const minD = opts.minD !== undefined ? opts.minD : MAP_SIZE / 2 + 1.5;
    const maxD = opts.maxD !== undefined ? opts.maxD : MAP_SIZE / 2 + 14;
    const [sMin, sMax] = opts.scale || [0.9, 1.6];
    let placed = 0, attempts = 0;
    while (placed < count && attempts < count * 6) {
      attempts++;
      const angle = rng() * Math.PI * 2;
      const dist = minD + rng() * (maxD - minD);
      const x = center + Math.cos(angle) * dist + (rng() - 0.5) * 1.6;
      const z = center + Math.sin(angle) * dist + (rng() - 0.5) * 1.6;
      const prop = builder(Math.floor(rng() * 1e7));
      prop.position.set(x, 0, z);
      const s = sMin + rng() * (sMax - sMin);
      prop.scale.setScalar(s);
      prop.rotation.y = rng() * Math.PI * 2;
      prop.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
      this.scene.add(prop);
      this.spawned.push(prop);
      placed++;
    }
  }

  // Nuages qui derivent lentement dans le ciel.
  _buildClouds(count) {
    const center = (MAP_SIZE - 1) / 2;
    const rng = mulberry32(80808);
    for (let i = 0; i < count; i++) {
      const cloud = buildCloud(Math.floor(rng() * 1e7));
      const y = 9 + rng() * 8;
      const x = center + (rng() - 0.5) * 60;
      const z = center + (rng() - 0.5) * 60;
      cloud.position.set(x, y, z);
      cloud.scale.setScalar(1.4 + rng() * 2.6);
      this.scene.add(cloud);
      this.spawned.push(cloud);
      this.anim.clouds.push({
        mesh: cloud,
        speed: 0.3 + rng() * 0.6,
        wrapMin: center - 36,
        wrapMax: center + 36,
      });
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

// Arbre mort : tronc tordu et sombre, quelques branches nues.
function buildDeadTree(seed) {
  const g = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x2e261c, roughness: 1 });
  const trunkH = 1.6 + (seed % 10) * 0.12;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.18, trunkH, 7), barkMat);
  trunk.position.y = trunkH / 2;
  trunk.rotation.z = ((seed % 9) - 4) * 0.025;
  g.add(trunk);
  // Branches nues.
  const nBranch = 3 + (seed % 3);
  for (let i = 0; i < nBranch; i++) {
    const len = 0.5 + ((seed + i * 23) % 10) * 0.06;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.06, len, 5), barkMat);
    const a = (i / nBranch) * Math.PI * 2 + (seed % 10) * 0.1;
    const h = trunkH * (0.55 + ((i * 7) % 4) * 0.1);
    branch.position.set(Math.cos(a) * 0.18, h, Math.sin(a) * 0.18);
    branch.rotation.set(Math.PI / 2 - 0.6, 0, -a + Math.PI / 2);
    g.add(branch);
    // Petite ramille au bout.
    const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.025, len * 0.5, 4), barkMat);
    twig.position.set(Math.cos(a) * (0.18 + len * 0.5), h + len * 0.4, Math.sin(a) * (0.18 + len * 0.5));
    twig.rotation.set(Math.PI / 2 - 1.0, 0, -a + Math.PI / 2);
    g.add(twig);
  }
  return g;
}

// Pic rocheux : silhouette de montagne lointaine.
function buildPeak(seed) {
  const g = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a5f68, roughness: 1 });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xe9eef2, roughness: 0.9 });
  const h = 3.0 + (seed % 12) * 0.25;
  const base = new THREE.Mesh(new THREE.ConeGeometry(1.5, h, 6 + (seed % 3)), rockMat);
  base.position.y = h / 2;
  base.rotation.y = (seed % 12) * 0.5;
  g.add(base);
  // Calotte neigeuse au sommet.
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, h * 0.28, 6 + (seed % 3)), snowMat);
  cap.position.y = h * 0.86;
  cap.rotation.y = base.rotation.y;
  g.add(cap);
  return g;
}

// Touffe de roseaux : tiges fines avec un epi sombre (typha).
function buildReed(seed) {
  const g = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x6a7a38, roughness: 1 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: 0.95 });
  const n = 4 + (seed % 4);
  for (let i = 0; i < n; i++) {
    const h = 0.9 + ((seed + i * 17) % 12) * 0.07;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, h, 5), stemMat);
    const ox = ((((seed + i * 31) % 16) - 8) / 8) * 0.30;
    const oz = ((((seed + i * 53) % 16) - 8) / 8) * 0.30;
    stem.position.set(ox, h / 2, oz);
    stem.rotation.z = ((((seed + i * 7) % 12) - 6) / 6) * 0.18;
    g.add(stem);
    // Epi de roseau.
    const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.18, 4, 8), headMat);
    head.position.set(ox, h + 0.05, oz);
    g.add(head);
  }
  return g;
}

// Nuage : amas de spheres blanches aplaties.
function buildCloud(seed) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf4f7fb, roughness: 1, transparent: true, opacity: 0.92,
  });
  const puffs = 4 + (seed % 4);
  for (let i = 0; i < puffs; i++) {
    const rad = 0.55 + ((seed + i * 29) % 10) * 0.06;
    const puff = new THREE.Mesh(new THREE.SphereGeometry(rad, 10, 8), mat);
    puff.position.set(
      ((((seed + i * 41) % 20) - 10) / 10) * 1.5,
      ((((seed + i * 13) % 8) - 4) / 8) * 0.4,
      ((((seed + i * 67) % 20) - 10) / 10) * 0.7,
    );
    puff.scale.set(1, 0.62, 1);
    g.add(puff);
  }
  return g;
}
