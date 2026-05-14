// Helpers plein ecran. Phaser propose this.scale.toggleFullscreen() qui
// fonctionne sur desktop et iPad. Sur iPhone, l API plein ecran n est pas
// autorisee sur les elements non-video, donc on detecte ce cas et on
// affiche un overlay qui explique la procedure "Sur l ecran d accueil".

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  if (window.navigator && window.navigator.standalone === true) return true;
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function fullscreenSupported(scene) {
  return !!(scene.scale && scene.scale.fullscreen && scene.scale.fullscreen.available);
}

export function toggleFullscreen(scene) {
  if (scene.scale.isFullscreen) {
    scene.scale.stopFullscreen();
    return;
  }
  if (!fullscreenSupported(scene)) {
    showHomeScreenHint(scene);
    return;
  }
  try {
    scene.scale.startFullscreen();
  } catch (e) {
    showHomeScreenHint(scene);
  }
}

export function showHomeScreenHint(scene) {
  if (scene._fsHint) { scene._fsHint.destroy(); scene._fsHint = null; return; }
  const W = 600, H = 320;
  const cx = scene.scale.width / 2;
  const cy = scene.scale.height / 2;
  const cont = scene.add.container(cx, cy).setDepth(999999);
  const dim = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.65)
    .setOrigin(0.5).setInteractive();
  const bg = scene.add.rectangle(0, 0, W, H, 0x14182a)
    .setStrokeStyle(3, 0xf1c40f).setOrigin(0.5);
  const title = scene.add.text(0, -120, 'Plein ecran iPhone', {
    fontFamily: 'Trebuchet MS', fontSize: '24px', color: '#f1c40f', fontStyle: 'bold',
  }).setOrigin(0.5);
  const body = scene.add.text(0, -20,
    "Safari sur iPhone interdit le plein ecran natif.\n\n" +
    "Pour cacher la barre de Safari :\n" +
    "1. Tape sur le bouton Partager (carre avec une fleche, en bas)\n" +
    "2. Choisis 'Sur l ecran d accueil'\n" +
    "3. Lance le jeu depuis l icone de ton ecran d accueil", {
    fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffffff',
    align: 'center', wordWrap: { width: W - 40 }, lineSpacing: 5,
  }).setOrigin(0.5);
  const okBg = scene.add.rectangle(0, 110, 140, 44, 0x27ae60)
    .setStrokeStyle(2, 0x111111).setInteractive();
  const okT = scene.add.text(0, 110, 'OK', {
    fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
  }).setOrigin(0.5);

  cont.add([dim, bg, title, body, okBg, okT]);
  // En CombatScene, le hint doit etre visible par la uiCam et ignore par
  // la mainCam. addUi est defini cote scene si dispo.
  if (typeof scene.addUi === 'function') scene.addUi(cont);

  const close = () => { cont.destroy(); scene._fsHint = null; };
  okBg.on('pointerdown', close);
  dim.on('pointerdown', close);
  scene._fsHint = cont;
}
