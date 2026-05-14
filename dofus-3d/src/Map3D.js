import * as THREE from 'three';
import { buildTree } from './models/tree.js';
import { buildRock } from './models/rock.js';

export const MAP_SIZE = 15;
export const TILE_SIZE = 1;

// 0 = sol (herbe), 1 = mur (arbre ou rocher)
const MAP_DATA = (() => {
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

export class Map3D {
  constructor(scene) {
    this.scene = scene;
    this.tiles = [];
    this.walls = [];
    this.tileGroup = new THREE.Group();
    this.scene.add(this.tileGroup);
    this.buildGround();
    this.buildTiles();
    this.buildBackgroundForest();
  }

  // Vaste plan vert sombre qui s etend au-dela de la grille : remplit
  // la zone exterieure au plateau (plus de cadre noir vide autour).
  buildGround() {
    const baseGeom = new THREE.PlaneGeometry(100, 100);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x244018, roughness: 1,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.set((MAP_SIZE - 1) / 2, -0.06, (MAP_SIZE - 1) / 2);
    base.receiveShadow = true;
    this.scene.add(base);
  }

  buildTiles() {
    const tileW = 0.96;
    const tileH = 0.1;
    const tileGeom = new THREE.BoxGeometry(tileW, tileH, tileW);

    // Plusieurs nuances d herbe pour varier ; deterministe par case.
    const grassColors = [0x6a9540, 0x5a8838, 0x4a7a30, 0x5d8e3a, 0x4f7d31];
    const grassMats = grassColors.map(c =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })
    );
    const wallTileMat = new THREE.MeshStandardMaterial({
      color: 0x3a2818, roughness: 0.95,
    });

    let wallIdx = 0;
    for (let r = 0; r < MAP_SIZE; r++) {
      const row = [];
      for (let c = 0; c < MAP_SIZE; c++) {
        const isWall = MAP_DATA[r][c] === 1;
        const hash = ((c * 2654435761) ^ (r * 2246822519)) >>> 0;
        const mat = isWall ? wallTileMat : grassMats[hash % grassMats.length];
        const tile = new THREE.Mesh(tileGeom, mat);
        tile.position.set(c, 0, r);
        tile.receiveShadow = true;
        tile.userData = { c, r, isWall };
        this.tileGroup.add(tile);
        row.push(tile);

        if (isWall) {
          // Alternance tree/rock + variations procedurales.
          const isTree = (wallIdx % 3) !== 0;
          const seed = (c + 1) * 113 + (r + 1) * 271 + wallIdx * 31;
          const model = isTree ? buildTree(seed) : buildRock(seed);
          model.position.set(c, 0.05, r);
          const s = 0.85 + ((seed % 100) / 100) * 0.35;
          model.scale.setScalar(s);
          model.rotation.y = (seed % 360) * Math.PI / 180;
          this.tileGroup.add(model);
          this.walls.push(model);
          wallIdx++;
        }
      }
      this.tiles.push(row);
    }
  }

  // Bordure d arbres autour du plateau : remplit le hors-jeu pour
  // qu on ait l impression d etre dans une vraie clairiere de foret.
  buildBackgroundForest() {
    const rngBase = mulberry32(424242);
    const center = (MAP_SIZE - 1) / 2;
    const minDist = MAP_SIZE / 2 + 1.5; // exclure la zone jouable
    const maxDist = MAP_SIZE / 2 + 14;  // limite outer du bois

    let placed = 0;
    let attempts = 0;
    while (placed < 130 && attempts < 800) {
      attempts++;
      const angle = rngBase() * Math.PI * 2;
      const dist = minDist + rngBase() * (maxDist - minDist);
      const x = center + Math.cos(angle) * dist;
      const z = center + Math.sin(angle) * dist;
      // Petit jitter
      const jx = x + (rngBase() - 0.5) * 1.5;
      const jz = z + (rngBase() - 0.5) * 1.5;

      // Empeche les chevauchements brut (carre 0.8 autour de la souche)
      // -- en pratique on accepte un peu d entrelacement (foret dense).
      const seed = Math.floor(rngBase() * 1e7);
      const tree = buildTree(seed);
      tree.position.set(jx, 0, jz);
      const s = 0.9 + rngBase() * 0.9;
      tree.scale.setScalar(s);
      tree.rotation.y = rngBase() * Math.PI * 2;
      // Les arbres lointains ne projettent pas d ombre (perf), mais
      // recoivent l ombrage ambient.
      tree.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
      this.scene.add(tree);
      placed++;
    }
  }

  inBounds(c, r) {
    return c >= 0 && c < MAP_SIZE && r >= 0 && r < MAP_SIZE;
  }

  isWall(c, r) {
    if (!this.inBounds(c, r)) return true;
    return MAP_DATA[r][c] === 1;
  }

  getTileMesh(c, r) {
    if (!this.inBounds(c, r)) return null;
    return this.tiles[r][c];
  }

  getData() {
    return MAP_DATA;
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
