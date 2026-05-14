import * as THREE from 'three';

export const MAP_SIZE = 15;
export const TILE_SIZE = 1;

// 0 = sol, 1 = mur
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
    this.buildBase();
    this.buildTiles();
  }

  buildBase() {
    // Sous-sol sombre : les espaces entre cases laissent voir une fine
    // ligne noire = limites de cases bien marquees.
    const baseGeom = new THREE.PlaneGeometry(MAP_SIZE + 4, MAP_SIZE + 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0a1018, roughness: 1 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.set((MAP_SIZE - 1) / 2, -0.06, (MAP_SIZE - 1) / 2);
    base.receiveShadow = true;
    this.scene.add(base);
  }

  buildTiles() {
    const tileW = 0.94;
    const tileH = 0.1;
    const tileGeom = new THREE.BoxGeometry(tileW, tileH, tileW);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x9eb5d0, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x5d7396, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.9, flatShading: true });

    for (let r = 0; r < MAP_SIZE; r++) {
      const row = [];
      for (let c = 0; c < MAP_SIZE; c++) {
        const isWall = MAP_DATA[r][c] === 1;
        const mat = (c + r) % 2 === 0 ? lightMat : darkMat;
        const tile = new THREE.Mesh(tileGeom, mat);
        tile.position.set(c, 0, r);
        tile.receiveShadow = true;
        tile.userData = { c, r, isWall };
        this.tileGroup.add(tile);
        row.push(tile);

        if (isWall) {
          const wallGeom = new THREE.BoxGeometry(0.9, 1.0, 0.9);
          const wall = new THREE.Mesh(wallGeom, wallMat);
          wall.position.set(c, 0.55, r);
          wall.castShadow = true;
          wall.receiveShadow = true;
          wall.userData = { c, r, isWall: true };
          this.tileGroup.add(wall);
          // Petite pierre sur le mur pour rompre la silhouette
          const stoneGeom = new THREE.DodecahedronGeometry(0.18, 0);
          const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.95, flatShading: true });
          const stone = new THREE.Mesh(stoneGeom, stoneMat);
          stone.position.set(c + 0.15, 1.18, r - 0.1);
          stone.castShadow = true;
          this.tileGroup.add(stone);
          this.walls.push(wall);
        }
      }
      this.tiles.push(row);
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
