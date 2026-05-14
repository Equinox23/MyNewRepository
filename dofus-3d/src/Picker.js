import * as THREE from 'three';

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

    // Anneau jaune fluo qui suit le curseur.
    const ringGeom = new THREE.TorusGeometry(0.45, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.95 });
    this.hoverRing = new THREE.Mesh(ringGeom, ringMat);
    this.hoverRing.rotation.x = Math.PI / 2;
    this.hoverRing.visible = false;
    this.scene3d.scene.add(this.hoverRing);

    // Disque transparent jaune (rempli) pour mieux voir la case sur la
    // surface inclinee, en plus du contour.
    const fillGeom = new THREE.CircleGeometry(0.42, 32);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.22 });
    this.hoverFill = new THREE.Mesh(fillGeom, fillMat);
    this.hoverFill.rotation.x = -Math.PI / 2;
    this.hoverFill.visible = false;
    this.scene3d.scene.add(this.hoverFill);
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
    const y = isWall ? 1.07 : 0.07;
    this.hoverRing.position.set(c, y, r);
    this.hoverFill.position.set(c, y - 0.005, r);
    // Couleur rouge si on survole un mur (case incible).
    const col = isWall ? 0xe74c3c : 0xf1c40f;
    this.hoverRing.material.color.setHex(col);
    this.hoverFill.material.color.setHex(col);
    this.hovered = { c, r, isWall };
  }
}
