import * as THREE from 'three';
import { MAP_SIZE } from './Map3D.js';

// Conteneur Three.js : scene, camera orbitable, lumieres, renderer.
// La camera est decrite par un etat spherique (distance, azimuth, polar)
// autour d un point cible `target`. Ca permet de la faire tourner et
// zoomer vers un point arbitraire sans accumuler d erreurs.
// Angle Dofus : azimut 45 deg, camera a 30 deg au-dessus de l horizon
// (polar 60 deg) -> cases au sol vues comme des losanges 2:1.
const DEFAULT_AZIMUTH = Math.PI / 4;
const DEFAULT_POLAR = Math.PI / 3;
const DEFAULT_DISTANCE = 22;

export class Scene3D {
  constructor() {
    this.scene = new THREE.Scene();
    // Fond chaud (visible seulement aux bords extremes du decor).
    this.scene.background = new THREE.Color(0x88b07d);
    this.scene.fog = new THREE.Fog(0x88b07d, 60, 110);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Pas de tone mapping filmique : on veut les couleurs franches et
    // saturees d une illustration Dofus, pas un rendu "photo".
    this.renderer.toneMapping = THREE.NoToneMapping;
    document.body.appendChild(this.renderer.domElement);

    // Camera ORTHOGRAPHIQUE : la vraie vue isometrique de Dofus (cases en
    // losanges 2:1, pas de perspective). `distance` pilote la taille du
    // cadre (= zoom), la camera elle-meme reste loin pour ne rien couper.
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    this.camDistance = 70;

    // Etat orbital de la camera autour de `target`.
    this.target = new THREE.Vector3((MAP_SIZE - 1) / 2, 0, (MAP_SIZE - 1) / 2);
    this.distance = DEFAULT_DISTANCE;
    this.azimuth = DEFAULT_AZIMUTH;
    this.polar = DEFAULT_POLAR;
    this.updateCamera();

    // Lumiere d illustration : ciel chaud + soleil dore rasant. Les
    // materiaux toon quantifient l eclairage en paliers francs.
    this.hemi = new THREE.HemisphereLight(0xfff4d6, 0x6b7a3a, 1.35);
    this.scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambient);

    const dir = new THREE.DirectionalLight(0xfff0d0, 1.9);
    dir.position.set(this.target.x - 9, 20, this.target.z + 6);
    dir.target.position.copy(this.target);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    const s = 13;
    dir.shadow.camera.left = -s;
    dir.shadow.camera.right = s;
    dir.shadow.camera.top = s;
    dir.shadow.camera.bottom = -s;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 60;
    dir.shadow.bias = -0.0004;
    dir.shadow.normalBias = 0.02;
    dir.shadow.radius = 3;
    this.scene.add(dir);
    this.scene.add(dir.target);
    this.sun = dir;

    // Reutilisables pour worldPointAtCursor()
    this._tmpRaycaster = new THREE.Raycaster();
    this._tmpNdc = new THREE.Vector2();
    this._groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    window.addEventListener('resize', () => this.onResize());
  }

  updateCamera() {
    const sinP = Math.sin(this.polar);
    const d = this.camDistance;
    this.camera.position.set(
      this.target.x + d * sinP * Math.sin(this.azimuth),
      this.target.y + d * Math.cos(this.polar),
      this.target.z + d * sinP * Math.cos(this.azimuth)
    );
    this.camera.lookAt(this.target);
    // Demi-hauteur du cadre : equivalente a une perspective de 34 deg a
    // `distance`, pour garder les memes reperes de zoom qu avant.
    const aspect = window.innerWidth / window.innerHeight;
    let halfH = this.distance * Math.tan(THREE.MathUtils.degToRad(17));
    // En portrait (mobile), on elargit pour que le plateau tienne en largeur.
    if (aspect < 1) halfH /= Math.max(0.55, aspect);
    this.camera.left = -halfH * aspect;
    this.camera.right = halfH * aspect;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.updateCamera();
  }

  // Zoom in/out. Si worldPoint est passe, la cible glisse partiellement
  // vers ce point (proportionnellement au facteur de zoom) pour que ce
  // point reste sous le curseur apres zoom.
  zoom(factor, worldPoint = null) {
    const newDist = THREE.MathUtils.clamp(this.distance * factor, 6, 40);
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
    if (this._snapping) return; // ignore drag pendant un snap anime
    this.azimuth += deltaAzimuth;
    this.polar = THREE.MathUtils.clamp(this.polar + deltaPolar, 0.25, 1.35);
    this.updateCamera();
  }

  // Rotation discrete par paliers de 45 degres : snap a l indice le
  // plus proche puis +/- une etape, anime en ~280ms.
  snapRotate(direction) {
    if (this._snapping) return;
    const step = Math.PI / 4; // 45 degres
    const currentIdx = Math.round(this.azimuth / step);
    const targetAz = (currentIdx + direction) * step;
    this._animateAzimuth(targetAz, 280);
  }

  _animateAzimuth(targetAz, duration) {
    this._snapping = true;
    const startAz = this.azimuth;
    const delta = targetAz - startAz;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.azimuth = startAz + delta * e;
      this.updateCamera();
      if (t < 1) requestAnimationFrame(tick);
      else {
        this.azimuth = targetAz;
        this.updateCamera();
        this._snapping = false;
      }
    };
    requestAnimationFrame(tick);
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
    this.distance = DEFAULT_DISTANCE;
    this.azimuth = DEFAULT_AZIMUTH;
    this.polar = DEFAULT_POLAR;
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
