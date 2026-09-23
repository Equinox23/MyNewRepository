import * as THREE from 'three';
import { cellTexture } from './RangeOverlay.js';

// Raycasting case-par-case + visuels de survol (anneau jaune sur la case
// pointee). Marche pour souris ET tactile : on lui passe directement les
// coordonnees clientX / clientY.
export class Picker {
  constructor(scene3d, map3d) {
    this.scene3d = scene3d;
    this.map3d = map3d;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;

    // Survol facon Dofus : la case pointee s illumine (remplissage clair
    // + liseré), plutot qu un anneau.
    const tex = cellTexture();
    const cellGeom = new THREE.PlaneGeometry(1.0, 1.0);
    this.hoverFill = new THREE.Mesh(cellGeom, new THREE.MeshBasicMaterial({
      color: 0xfff6c8, map: tex, transparent: true, opacity: 0.85, depthWrite: false,
    }));
    this.hoverFill.rotation.x = -Math.PI / 2;
    this.hoverFill.renderOrder = 4;
    this.hoverFill.visible = false;
    this.scene3d.scene.add(this.hoverFill);
    // Contour fin supplementaire (garde la lisibilite sur les cases colorees).
    const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.94, 0.94));
    this.hoverRing = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false,
    }));
    this.hoverRing.rotation.x = -Math.PI / 2;
    this.hoverRing.renderOrder = 5;
    this.hoverRing.visible = false;
    this.scene3d.scene.add(this.hoverRing);
  }

  // Renvoie { c, r, isWall } ou null.
  pick(clientX, clientY) {
    const canvas = this.scene3d.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    this.pointer.x = (x / rect.width) * 2 - 1;
    this.pointer.y = -(y / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.scene3d.camera);

    const intersects = this.raycaster.intersectObjects(this.map3d.tileGroup.children, false);
    for (const it of intersects) {
      const ud = it.object.userData;
      if (ud && typeof ud.c === 'number') {
        return { c: ud.c, r: ud.r, isWall: !!ud.isWall };
      }
    }
    return null;
  }

  setHover(c, r, isWall = false) {
    if (c === null) {
      this.hoverRing.visible = false;
      this.hoverFill.visible = false;
      this.hovered = null;
      return;
    }
    this.hoverRing.visible = true;
    this.hoverFill.visible = true;
    // Place au-dessus du sol pour eviter le z-fighting avec les tuiles.
    const y = 0.075;
    this.hoverRing.position.set(c, y + 0.002, r);
    this.hoverFill.position.set(c, y, r);
    // Couleur rouge si on survole un mur (case incible).
    this.hoverRing.material.color.setHex(isWall ? 0xff6a5a : 0xffffff);
    this.hoverFill.material.color.setHex(isWall ? 0xe74c3c : 0xfff6c8);
    this.hovered = { c, r, isWall };
  }
}
