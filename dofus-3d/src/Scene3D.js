import * as THREE from 'three';
import { MAP_SIZE } from './Map3D.js';

// Conteneur Three.js : scene, camera orbitable, lumieres, renderer.
// La camera est decrite par un etat spherique (distance, azimuth, polar)
// autour d un point cible `target`. Ca permet de la faire tourner et
// zoomer vers un point arbitraire sans accumuler d erreurs.
export class Scene3D {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x141a26);
    this.scene.fog = new THREE.Fog(0x141a26, 30, 70);

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

    // Etat orbital de la camera autour de `target`.
    this.target = new THREE.Vector3((MAP_SIZE - 1) / 2, 0, (MAP_SIZE - 1) / 2);
    this.distance = 26;
    this.azimuth = 0.683;        // ~39 deg : vue NE de Dofus
    this.polar = 0.91;           // ~52 deg du zenith
    this.updateCamera();

    // Lumieres
    this.scene.add(new THREE.AmbientLight(0xbecfe8, 0.45));
    this.scene.add(new THREE.HemisphereLight(0xb4d4ff, 0x7a5a3a, 0.35));

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

    // Reutilisables pour worldPointAtCursor()
    this._tmpRaycaster = new THREE.Raycaster();
    this._tmpNdc = new THREE.Vector2();
    this._groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    window.addEventListener('resize', () => this.onResize());
  }

  updateCamera() {
    const sinP = Math.sin(this.polar);
    this.camera.position.set(
      this.target.x + this.distance * sinP * Math.sin(this.azimuth),
      this.target.y + this.distance * Math.cos(this.polar),
      this.target.z + this.distance * sinP * Math.cos(this.azimuth)
    );
    this.camera.lookAt(this.target);
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // Zoom in/out. Si worldPoint est passe, la cible glisse partiellement
  // vers ce point (proportionnellement au facteur de zoom) pour que ce
  // point reste sous le curseur apres zoom.
  zoom(factor, worldPoint = null) {
    const newDist = THREE.MathUtils.clamp(this.distance * factor, 6, 50);
    if (newDist === this.distance) return;
    const realFactor = newDist / this.distance;
    if (worldPoint) {
      const t = 1 - realFactor; // 0 a 1, positif quand on zoome in
      this.target.x += (worldPoint.x - this.target.x) * t;
      this.target.z += (worldPoint.z - this.target.z) * t;
      this._clampTarget();
    }
    this.distance = newDist;
    this.updateCamera();
  }

  // Rotation orbitale autour de `target`. deltaAzimuth/Polar en radians.
  rotate(deltaAzimuth, deltaPolar = 0) {
    this.azimuth += deltaAzimuth;
    this.polar = THREE.MathUtils.clamp(this.polar + deltaPolar, 0.25, 1.35);
    this.updateCamera();
  }

  // Pan : deplace la cible sur le plan y=0. dx/dz en unites monde.
  pan(dx, dz) {
    this.target.x += dx;
    this.target.z += dz;
    this._clampTarget();
    this.updateCamera();
  }

  // Reset complet de la vue.
  resetCamera() {
    this.target.set((MAP_SIZE - 1) / 2, 0, (MAP_SIZE - 1) / 2);
    this.distance = 26;
    this.azimuth = 0.683;
    this.polar = 0.91;
    this.updateCamera();
  }

  _clampTarget() {
    this.target.x = THREE.MathUtils.clamp(this.target.x, -3, MAP_SIZE + 2);
    this.target.z = THREE.MathUtils.clamp(this.target.z, -3, MAP_SIZE + 2);
  }

  // Renvoie le point monde (Vector3) sur le plan y=0 sous les coords
  // ecran (clientX, clientY). Null si la ray ne touche pas le sol.
  worldPointAtCursor(clientX, clientY) {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    this._tmpNdc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    this._tmpRaycaster.setFromCamera(this._tmpNdc, this.camera);
    const point = new THREE.Vector3();
    const hit = this._tmpRaycaster.ray.intersectPlane(this._groundPlane, point);
    return hit ? point : null;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
