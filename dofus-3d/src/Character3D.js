import * as THREE from 'three';

// Personnage low-poly procedural facon Iop : corps cylindrique, tete sphere,
// casque demi-sphere avec liseré dore, bras, cape derriere.
// Construit comme un Group : on deplace le group sur la grille.
export class Character3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.build();
    this.c = 7;
    this.r = 7;
    this.facing = 0; // angle radian (autour de Y)
    this.group.position.set(this.c, 0, this.r);
    this.idleOffset = Math.random() * Math.PI * 2;
  }

  build() {
    // Couleurs
    const armorColor = 0xc0392b;
    const skinColor = 0xf4d3a5;
    const beltColor = 0x5a3a1a;
    const goldColor = 0xf1c40f;
    const capeColor = 0x7c1f17;
    const pantsColor = 0x3a2a14;
    const bootColor = 0x1a0d05;

    // Bottes
    const bootGeom = new THREE.BoxGeometry(0.18, 0.1, 0.24);
    const bootMat = new THREE.MeshStandardMaterial({ color: bootColor, roughness: 0.9 });
    const lBoot = new THREE.Mesh(bootGeom, bootMat);
    lBoot.position.set(-0.12, 0.05, 0.04);
    lBoot.castShadow = true;
    const rBoot = new THREE.Mesh(bootGeom, bootMat);
    rBoot.position.set(0.12, 0.05, 0.04);
    rBoot.castShadow = true;
    this.group.add(lBoot, rBoot);

    // Pantalon (deux jambes en cylindres tres courts)
    const legGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10);
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
    const lLeg = new THREE.Mesh(legGeom, legMat);
    lLeg.position.set(-0.12, 0.21, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeom, legMat);
    rLeg.position.set(0.12, 0.21, 0);
    rLeg.castShadow = true;
    this.group.add(lLeg, rLeg);

    // Torse (cylindre tronconique : large epaules, taille fine)
    const torsoGeom = new THREE.CylinderGeometry(0.30, 0.22, 0.42, 14);
    const torsoMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.55 });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = 0.55;
    torso.castShadow = true;
    this.group.add(torso);

    // Ceinture doree
    const beltGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 14);
    const beltMat = new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.8 });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.y = 0.36;
    this.group.add(belt);
    const buckleGeom = new THREE.BoxGeometry(0.12, 0.08, 0.04);
    const buckleMat = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.3, metalness: 0.6 });
    const buckle = new THREE.Mesh(buckleGeom, buckleMat);
    buckle.position.set(0, 0.36, 0.30);
    this.group.add(buckle);

    // Insigne / etoile doree sur le torse
    const starGeom = new THREE.ConeGeometry(0.10, 0.04, 5);
    const starMat = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.5 });
    const star = new THREE.Mesh(starGeom, starMat);
    star.position.set(0, 0.58, 0.28);
    star.rotation.x = Math.PI / 2;
    star.rotation.z = Math.PI;
    this.group.add(star);

    // Bras
    const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.40, 10);
    const armMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.55 });
    const lArm = new THREE.Mesh(armGeom, armMat);
    lArm.position.set(-0.34, 0.55, 0);
    lArm.castShadow = true;
    const rArm = new THREE.Mesh(armGeom, armMat);
    rArm.position.set(0.34, 0.55, 0);
    rArm.castShadow = true;
    this.group.add(lArm, rArm);

    // Mains
    const handGeom = new THREE.SphereGeometry(0.09, 10, 8);
    const handMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const lHand = new THREE.Mesh(handGeom, handMat);
    lHand.position.set(-0.34, 0.36, 0);
    lHand.castShadow = true;
    const rHand = new THREE.Mesh(handGeom, handMat);
    rHand.position.set(0.34, 0.36, 0);
    rHand.castShadow = true;
    this.group.add(lHand, rHand);

    // Cape derriere (plane simple)
    const capeGeom = new THREE.PlaneGeometry(0.58, 0.66);
    const capeMat = new THREE.MeshStandardMaterial({
      color: capeColor, side: THREE.DoubleSide, roughness: 0.75,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, 0.55, -0.24);
    cape.rotation.x = 0.1;
    cape.castShadow = true;
    this.group.add(cape);

    // Tete (sphere skin)
    const headGeom = new THREE.SphereGeometry(0.24, 18, 14);
    const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 0.95;
    head.castShadow = true;
    this.group.add(head);

    // Casque (demi-sphere superieure rouge)
    const helmGeom = new THREE.SphereGeometry(0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const helmMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.5 });
    const helm = new THREE.Mesh(helmGeom, helmMat);
    helm.position.y = 0.95;
    helm.castShadow = true;
    this.group.add(helm);

    // Liseré dore autour du casque
    const stripeGeom = new THREE.TorusGeometry(0.24, 0.022, 8, 24);
    const stripeMat = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.55 });
    const stripe = new THREE.Mesh(stripeGeom, stripeMat);
    stripe.position.y = 0.91;
    stripe.rotation.x = Math.PI / 2;
    this.group.add(stripe);

    // Plume / pointe sur le casque
    const featherGeom = new THREE.ConeGeometry(0.05, 0.18, 8);
    const featherMat = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.5, metalness: 0.4 });
    const feather = new THREE.Mesh(featherGeom, featherMat);
    feather.position.set(0, 1.22, 0);
    feather.rotation.z = 0.2;
    feather.castShadow = true;
    this.group.add(feather);

    // Yeux (deux petites spheres noires)
    const eyeGeom = new THREE.SphereGeometry(0.025, 8, 6);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const lEye = new THREE.Mesh(eyeGeom, eyeMat);
    lEye.position.set(-0.07, 0.96, 0.22);
    const rEye = new THREE.Mesh(eyeGeom, eyeMat);
    rEye.position.set(0.07, 0.96, 0.22);
    this.group.add(lEye, rEye);

    // Epee posee sur l epaule
    const swordGroup = new THREE.Group();
    const bladeGeom = new THREE.BoxGeometry(0.06, 0.7, 0.015);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xdde3e8, roughness: 0.35, metalness: 0.7 });
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.y = 0.5;
    blade.castShadow = true;
    swordGroup.add(blade);
    const guardGeom = new THREE.BoxGeometry(0.18, 0.04, 0.05);
    const guardMat = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.6 });
    const guard = new THREE.Mesh(guardGeom, guardMat);
    guard.position.y = 0.15;
    swordGroup.add(guard);
    const handleGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.y = 0.08;
    swordGroup.add(handle);
    const pommelGeom = new THREE.SphereGeometry(0.04, 10, 8);
    const pommel = new THREE.Mesh(pommelGeom, guardMat);
    pommel.position.y = 0.02;
    swordGroup.add(pommel);
    swordGroup.position.set(0.32, 0.72, -0.05);
    swordGroup.rotation.z = -0.25;
    this.group.add(swordGroup);
  }

  update(dt, time) {
    // Idle subtile : oscillation verticale
    this.group.position.y = Math.sin(time * 1.6 + this.idleOffset) * 0.035;
  }

  setTile(c, r) {
    this.c = c;
    this.r = r;
    this.group.position.set(c, this.group.position.y, r);
  }

  // Tween vers une case adjacente (1 cran) avec ease in-out + rotation
  // pour faire face a la direction. Retourne une promesse resolue
  // quand l animation est finie.
  moveTo(c, r, duration = 200) {
    return new Promise(resolve => {
      const sx = this.group.position.x;
      const sz = this.group.position.z;
      const dx = c - sx;
      const dz = r - sz;
      this.c = c;
      this.r = r;
      if (Math.abs(dx) + Math.abs(dz) > 0.001) {
        this.facing = Math.atan2(dx, dz);
        this.group.rotation.y = this.facing;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        this.group.position.x = sx + dx * e;
        this.group.position.z = sz + dz * e;
        if (t < 1) requestAnimationFrame(step);
        else {
          this.group.position.x = c;
          this.group.position.z = r;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }
}
