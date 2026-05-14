import * as THREE from 'three';

// Couche de surlignage 3D : chaque case du terrain a un petit plane
// quad transparent qu on rend visible avec une couleur donnee quand
// un sort est selectionne (cases dans la portee / valides / invalides).
// On pre-alloue tous les meshes (15x15 = 225) pour eviter les alloc
// runtime.
export class RangeOverlay {
  constructor(scene, mapSize) {
    this.scene = scene;
    this.mapSize = mapSize;
    this.meshes = [];
    const geom = new THREE.PlaneGeometry(0.92, 0.92);
    for (let r = 0; r < mapSize; r++) {
      const row = [];
      for (let c = 0; c < mapSize; c++) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(c, 0.065, r);
        mesh.visible = false;
        scene.add(mesh);
        row.push(mesh);
      }
      this.meshes.push(row);
    }
  }

  clear() {
    for (const row of this.meshes) {
      for (const m of row) {
        m.visible = false;
      }
    }
  }

  // tiles : tableau [{ c, r }]. color : hex int. opacity : 0..1.
  paint(tiles, color, opacity = 0.32) {
    for (const t of tiles) {
      const m = this.meshes[t.r] && this.meshes[t.r][t.c];
      if (!m) continue;
      m.visible = true;
      m.material.color.setHex(color);
      m.material.opacity = opacity;
    }
  }
}
