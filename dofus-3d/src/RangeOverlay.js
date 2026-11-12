import * as THREE from 'three';

// Texture de case "facon Dofus" : remplissage uni + liseré clair et
// coins legerement arrondis. Teintee ensuite par la couleur du materiau.
let _cellTex = null;
export function cellTexture() {
  if (_cellTex) return _cellTex;
  const s = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const rr = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  rr(6, 6, s - 12, s - 12, 14);
  ctx.fill();
  // Double liseré (sombre dehors, clair dedans) : la case se detache
  // quel que soit le sol dessous.
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(70,70,70,1)';
  rr(5, 5, s - 10, s - 10, 14);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,255,255,1)';
  rr(11, 11, s - 22, s - 22, 10);
  ctx.stroke();
  _cellTex = new THREE.CanvasTexture(cv);
  _cellTex.colorSpace = THREE.SRGBColorSpace;
  return _cellTex;
}

// Couleurs des cases selon le sol dessous : le vert de deplacement se
// perd sur l herbe, le bleu de portee sur l eau... On decale donc la
// teinte pour garder le contraste (le sens reste : chaud-clair = on peut
// y aller, froid = portee du sort).
const MOVE = 0x4fb02e, RANGE = 0x3f7fe8;
const GROUND_COLORS = {
  foret:     { [MOVE]: 0xe6f24a, [RANGE]: 0x3a7cff },
  marais:    { [MOVE]: 0xf2e24a, [RANGE]: 0x58a0ff },
  cascade:   { [MOVE]: 0xe6f24a, [RANGE]: 0x3a6cf0 },
  falaise:   { [MOVE]: 0x35b83a, [RANGE]: 0x2f66e0 },
  cimetiere: { [MOVE]: 0x6ef07a, [RANGE]: 0x62b4ff },
  water:     { [MOVE]: 0xfff07a, [RANGE]: 0xc07aff },
};

// Couche de surlignage 3D : chaque case du terrain a un petit plane
// quad transparent qu on rend visible avec une couleur donnee quand
// un sort est selectionne (cases dans la portee / valides / invalides).
// On pre-alloue tous les meshes (15x15 = 225) pour eviter les alloc
// runtime.
export class RangeOverlay {
  constructor(scene, mapSize, y = 0.065) {
    this.scene = scene;
    this.mapSize = mapSize;
    this.meshes = [];
    const geom = new THREE.PlaneGeometry(0.98, 0.98);
    const tex = cellTexture();
    for (let r = 0; r < mapSize; r++) {
      const row = [];
      for (let c = 0; c < mapSize; c++) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: tex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(c, y, r);
        mesh.visible = false;
        mesh.renderOrder = y < 0.065 ? 0 : 1;
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
      const g = this.ground ? GROUND_COLORS[this.ground(t.c, t.r)] : null;
      m.material.color.setHex(g && g[color] !== undefined ? g[color] : color);
      m.material.opacity = opacity;
    }
  }
}
