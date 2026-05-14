import * as THREE from 'three';
import { MAP_SIZE } from './Map3D.js';

// Conteneur Three.js : scene, camera, lumieres, renderer.
// Camera perspective tiltee facon iso tactique.
export class Scene3D {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x141a26);
    this.scene.fog = new THREE.Fog(0x141a26, 28, 60);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    document.body.appendChild(this.renderer.domElement);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 100);
    this.target = new THREE.Vector3((MAP_SIZE - 1) / 2, 0, (MAP_SIZE - 1) / 2);
    // Vue iso : eleve, decalee diagonale (azimut 45 deg, tilt ~30 deg).
    this.camera.position.set(this.target.x + 13, 16, this.target.z + 16);
    this.camera.lookAt(this.target);

    // Lumieres
    const ambient = new THREE.AmbientLight(0xbecfe8, 0.45);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xb4d4ff, 0x7a5a3a, 0.35);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff0d8, 1.1);
    dir.position.set(this.target.x + 8, 22, this.target.z + 4);
    dir.target.position.copy(this.target);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    const s = 14;
    dir.shadow.camera.left = -s;
    dir.shadow.camera.right = s;
    dir.shadow.camera.top = s;
    dir.shadow.camera.bottom = -s;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 60;
    dir.shadow.bias = -0.0002;
    this.scene.add(dir);
    this.scene.add(dir.target);

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // Zoom in/out en deplaçant la camera sur la droite focale vers/depuis la
  // cible. factor < 1 = zoom in (camera se rapproche).
  zoom(factor) {
    const offset = this.camera.position.clone().sub(this.target);
    const newDist = offset.length() * factor;
    if (newDist < 8 || newDist > 45) return;
    offset.setLength(newDist);
    this.camera.position.copy(this.target).add(offset);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
