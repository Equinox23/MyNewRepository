// Service worker genere par tools/build-sw.mjs -- ne pas editer a la main.
// Met tout le jeu en cache a la premiere visite : ensuite il se lance
// meme sans connexion. A chaque nouvelle version (empreinte VERSION),
// le nouveau cache remplace l ancien.
const VERSION = 'ac2440ac89';
const CACHE = 'dofus3d-' + VERSION;
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/Adventure.js",
  "./src/Audio.js",
  "./src/Avatars.js",
  "./src/Character3D.js",
  "./src/Elements.js",
  "./src/Fighter.js",
  "./src/Game.js",
  "./src/GroundPainter.js",
  "./src/HpBar3D.js",
  "./src/Hud.js",
  "./src/ItemArt.js",
  "./src/Items.js",
  "./src/Leveling.js",
  "./src/Map3D.js",
  "./src/Menu.js",
  "./src/Path.js",
  "./src/Picker.js",
  "./src/Progress.js",
  "./src/RangeOverlay.js",
  "./src/Rig.js",
  "./src/Scene3D.js",
  "./src/SpellIcons.js",
  "./src/Spells.js",
  "./src/States.js",
  "./src/Toon.js",
  "./src/TurnManager.js",
  "./src/VFX.js",
  "./src/dofus-theme.css",
  "./src/main.js",
  "./src/models/bombeRoublard.js",
  "./src/models/bosses.js",
  "./src/models/bouftou.js",
  "./src/models/bouftouRoyal.js",
  "./src/models/chafer.js",
  "./src/models/chaferRoyal.js",
  "./src/models/champignon.js",
  "./src/models/champignonRoyal.js",
  "./src/models/chatonBlanc.js",
  "./src/models/crapaud.js",
  "./src/models/crapaudChef.js",
  "./src/models/craqueleur.js",
  "./src/models/dragounetRouge.js",
  "./src/models/ecaflip.js",
  "./src/models/eniripsa.js",
  "./src/models/foliage.js",
  "./src/models/humanoid.js",
  "./src/models/index.js",
  "./src/models/iop.js",
  "./src/models/kit.js",
  "./src/models/osamodas.js",
  "./src/models/pandawa.js",
  "./src/models/rock.js",
  "./src/models/roublard.js",
  "./src/models/tofu.js",
  "./src/models/tofuRoyal.js",
  "./src/models/tree.js",
  "./src/models/wabbit.js",
  "./src/models/wearables.js",
  "./src/models/xelor.js",
  "./vendor/fonts/Fredoka-latin-11adc6.woff2",
  "./vendor/fonts/Fredoka-latin-ext-4667f6.woff2",
  "./vendor/fonts/LuckiestGuy-latin-8b6e91.woff2",
  "./vendor/fonts/LuckiestGuy-latin-ext-6e0134.woff2",
  "./vendor/fonts/fonts.css",
  "./vendor/three/addons/geometries/RoundedBoxGeometry.js",
  "./vendor/three/addons/utils/BufferGeometryUtils.js",
  "./vendor/three/three.module.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('dofus3d-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache d abord (demarrage instantane et hors ligne), puis reseau en
// secours pour ce qui ne serait pas encore en cache.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    })
  );
});
