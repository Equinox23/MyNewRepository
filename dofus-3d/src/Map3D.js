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

const CASCADE_GRID = gridFromAscii([
  '....~~~........', // 0
  '....~~~........', // 1
  '....~~~........', // 2
  '.....~~~.......', // 3
  '......~~~..#...', // 4
  '......~~~......', // 5
  '.......~~~.....', // 6
  '.......===.....', // 7  pont
  '.......~~~.....', // 8
  '.......~~~.....', // 9
  '#.......~~~....', // 10
  '........~~~....', // 11
  '.........~~~...', // 12
  '.........~~~..#', // 13
  '.........~~~...', // 14
]);

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
          // Foret : alternance arbre / rocher. Cascade : que des rochers.
          const seed = (c + 1) * 113 + (r + 1) * 271 + wallIdx * 31;
          const useTree = map.style === 'forest' && (wallIdx % 3) !== 0;
          const model = useTree ? buildTree(seed) : buildRock(seed);
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
    // Plan principal eau, dans un degrade bleu.
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2b8aab,
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
    const hash = ((c * 73) ^ (r * 137)) % 1000;
    foam.position.set(c + ((hash % 7) - 3) * 0.04, -0.02, r + ((hash % 5) - 2) * 0.04);
    water.add(foam);
    return water;
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
