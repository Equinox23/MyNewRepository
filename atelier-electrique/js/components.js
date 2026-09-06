/* =====================================================================
 * components.js — Catalogue des composants
 * Chaque type définit :
 *   pins   : liste de bornes {id, x, y} en coordonnées locales (le composant
 *            est dessiné dans une boîte d'environ 80x50 centrée en 0,0)
 *   prims  : fonction (inst) -> primitives électriques (voir sim.js)
 *   faults : pannes possibles { code: {label, hint, visible, inspect} }
 *   draw   : symbole SVG (chaîne) en coordonnées locales
 *   control: action utilisateur (interrupteur, commutateur, porte...)
 *   fiche  : contenu pédagogique
 * ===================================================================== */
const R_WIRE = 0.001;   // résistance d'un contact/fil fermé
const R_FUSE = 0.02;

function pRes(P, V) { return (V * V) / P; }
function fmtOhm(r) {
  if (!isFinite(r)) return '∞ (OL)';
  if (r >= 1e6) return (r / 1e6).toFixed(2) + ' MΩ';
  if (r >= 1e3) return (r / 1e3).toFixed(r >= 1e4 ? 1 : 2) + ' kΩ';
  if (r >= 100) return r.toFixed(0) + ' Ω';
  if (r >= 10) return r.toFixed(1) + ' Ω';
  return r.toFixed(2) + ' Ω';
}

const TYPES = {
  /* ---------------- ALIMENTATIONS ---------------- */
  prise: {
    name: 'Prise murale (secteur 230 V~)',
    short: 'Prise murale',
    icon: '🔌',
    fixed: true, // non remplaçable
    pins: [{ id: 'L', x: 40, y: -30 }, { id: 'N', x: 40, y: 30 }],
    prims: (inst) => inst.state.plugged ? [{ kind: 'V', a: 'L', b: 'N', value: inst.params.V }] : [],
    faults: {},
    draw: (inst) => `
      <rect x="-40" y="-42" width="60" height="84" rx="8" class="sym-body"/>
      <circle cx="-10" cy="-14" r="6" class="sym-hole"/>
      <circle cx="-10" cy="14" r="6" class="sym-hole"/>
      <circle cx="-10" cy="0" r="16" fill="none" class="sym-thin"/>
      <line x1="20" y1="-30" x2="40" y2="-30" class="sym"/>
      <line x1="20" y1="30" x2="40" y2="30" class="sym"/>
      <text x="28" y="-36" class="sym-pin">L</text>
      <text x="28" y="24" class="sym-pin">N</text>
      <text x="-10" y="-52" class="sym-label">${inst.state.plugged ? '230 V~' : 'hors tension'}</text>`,
    control: {
      label: (s) => (s.plugged ? '🔌 Débrancher' : '⚡ Brancher'),
      toggle: (s) => { s.plugged = !s.plugged; },
    },
    fiche: {
      role: "C'est la source d'énergie de l'appareil : le réseau fournit une tension alternative de 230 V (valeur efficace) à 50 Hz entre la <b>phase (L)</b> et le <b>neutre (N)</b>.",
      test: "Multimètre en <b>V~</b> : entre L et N on doit lire environ 230 V. Toujours débrancher l'appareil avant de mesurer des résistances ou de toucher aux pièces !",
      pannes: 'Prise défectueuse, disjoncteur déclenché. Dans ce jeu la prise murale fonctionne toujours.',
    },
  },

  pile: {
    name: 'Pile / batterie',
    short: 'Pile',
    icon: '🔋',
    pins: [{ id: 'P', x: 0, y: -40 }, { id: 'M', x: 0, y: 40 }],
    prims: (inst) => {
      if (!inst.state.plugged) return [];
      const v = inst.fault === 'vide' ? inst.params.V * 0.6 : inst.params.V;
      // source idéale + résistance interne (élevée pour une pile usée)
      return [{ kind: 'V', a: 'int', b: 'M', value: v }, { kind: 'R', a: 'int', b: 'P', value: inst.fault === 'vide' ? 60 : 0.3 }];
    },
    control: {
      label: (s) => (s.plugged ? 'Retirer la pile' : 'Mettre la pile'),
      toggle: (s) => { s.plugged = !s.plugged; },
    },
    faults: {
      vide: { label: 'Pile déchargée', visible: 0.2, inspect: 'La date de péremption est dépassée.', hint: 'Une pile usée donne une tension très inférieure à sa valeur nominale.' },
    },
    draw: (inst) => `
      <line x1="0" y1="-40" x2="0" y2="-14" class="sym"/>
      <line x1="-18" y1="-14" x2="18" y2="-14" class="sym"/>
      <line x1="-8" y1="-6" x2="8" y2="-6" class="sym"/>
      <line x1="-18" y1="4" x2="18" y2="4" class="sym"/>
      <line x1="-8" y1="12" x2="8" y2="12" class="sym"/>
      <line x1="0" y1="12" x2="0" y2="40" class="sym"/>
      <text x="26" y="-16" class="sym-pin">+</text>
      <text x="26" y="16" class="sym-pin">−</text>
      <text x="0" y="-48" class="sym-label">${inst.state.plugged ? inst.params.V + ' V=' : 'retirée'}</text>`,
    fiche: {
      role: "Source de tension <b>continue</b> (DC). Une pile transforme une réaction chimique en énergie électrique. La borne + est le pôle positif.",
      test: "Multimètre en <b>V=</b> (DC) : une pile neuve donne sa tension nominale ou un peu plus (ex. 4,5 V). Sous 80 % de la valeur, elle est usée. Attention à la polarité : le fil rouge sur +, le noir sur −.",
      pannes: 'Pile déchargée, oxydation des contacts, fuite d\'électrolyte.',
    },
  },

  /* ---------------- LIAISONS ---------------- */
  cordon: {
    name: "Cordon d'alimentation (2 conducteurs)",
    short: 'Cordon',
    icon: '➰',
    pins: [{ id: 'L1', x: -40, y: -30 }, { id: 'N1', x: -40, y: 30 }, { id: 'L2', x: 40, y: -30 }, { id: 'N2', x: 40, y: 30 }],
    prims: (inst) => {
      const out = [];
      if (inst.fault !== 'coupeL') out.push({ kind: 'wire', a: 'L1', b: 'L2' });
      if (inst.fault !== 'coupeN') out.push({ kind: 'wire', a: 'N1', b: 'N2' });
      return out;
    },
    faults: {
      coupeL: { label: 'Conducteur de phase coupé', visible: 0.35, inspect: 'La gaine est pincée et craquelée près de la fiche.', hint: 'Un conducteur coupé dans le cordon : la continuité est perdue sur un des deux fils.' },
      coupeN: { label: 'Conducteur de neutre coupé', visible: 0.35, inspect: 'Le cordon a été écrasé : un pli suspect est visible.', hint: 'Le cordon peut être coupé à l\'intérieur sans dégât visible.' },
    },
    draw: () => `
      <path d="M-40,-30 C -20,-30 -20,-24 0,-24 S 20,-30 40,-30" class="sym cord"/>
      <path d="M-40,30 C -20,30 -20,24 0,24 S 20,30 40,30" class="sym cord"/>
      <rect x="-30" y="-36" width="60" height="72" rx="10" class="sym-ghost"/>`,
    fiche: {
      role: "Relie l'appareil à la prise. Il contient deux conducteurs (phase et neutre), parfois trois avec la terre. C'est une pièce très sollicitée mécaniquement.",
      test: "Appareil <b>débranché</b>, multimètre en <b>Ω</b> ou continuité : chaque conducteur doit afficher ≈ 0 Ω d'un bout à l'autre. Plier le cordon pendant la mesure révèle les coupures intermittentes.",
      pannes: 'Conducteur coupé à la sortie de la fiche ou de l\'appareil (usure, pincement), gaine abîmée.',
    },
  },

  connexion: {
    name: 'Connexion / cosse',
    short: 'Cosse',
    icon: '🔗',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => {
      if (inst.fault === 'coupee') return [];
      if (inst.fault === 'oxydee') return [{ kind: 'R', a: 'a', b: 'b', value: inst.params.Rox || 400 }];
      return [{ kind: 'wire', a: 'a', b: 'b' }];
    },
    faults: {
      coupee: { label: 'Cosse débranchée / fil dessoudé', visible: 0.7, inspect: 'La cosse est sortie de son logement.', hint: 'Une connexion ouverte coupe le circuit exactement comme un interrupteur ouvert.' },
      oxydee: { label: 'Contact oxydé (résistif)', visible: 0.5, inspect: 'Le contact est verdâtre, oxydé.', hint: 'Un contact oxydé ajoute une résistance parasite : la tension arrive, mais affaiblie.' },
    },
    draw: () => `
      <line x1="-40" y1="0" x2="-14" y2="0" class="sym"/>
      <rect x="-14" y="-7" width="28" height="14" rx="3" class="sym-body"/>
      <line x1="14" y1="0" x2="40" y2="0" class="sym"/>`,
    fiche: {
      role: "Point de raccordement entre deux fils ou entre un fil et un composant (cosse, domino, soudure). Un bon contact doit avoir une résistance quasi nulle.",
      test: "Hors tension, en <b>Ω</b> : ≈ 0 Ω entre les deux côtés. Sous tension, la <b>chute de tension</b> aux bornes d'un bon contact est nulle ; quelques volts trahissent un contact résistif.",
      pannes: 'Cosse desserrée, fil cassé, oxydation (vert-de-gris), soudure sèche.',
    },
  },

  /* ---------------- PROTECTIONS ---------------- */
  fusible: {
    name: 'Fusible',
    short: 'Fusible',
    icon: '🧯',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => (inst.fault === 'grille' || inst.state.blown) ? [] : [{ kind: 'R', a: 'a', b: 'b', value: R_FUSE }],
    faults: {
      grille: { label: 'Fusible grillé', visible: 0.6, inspect: 'Le filament est visiblement coupé et la verrine noircie.', hint: 'Un fusible grillé se teste à l\'ohmmètre : ∞ au lieu de 0 Ω. Cherchez aussi POURQUOI il a grillé.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-26" y2="0" class="sym"/>
      <rect x="-26" y="-9" width="52" height="18" rx="3" class="sym-body"/>
      ${(inst.fault === 'grille' || inst.state.blown) && inst.state.revealed ? '<path d="M-20,0 L-6,0 L0,-6" class="sym"/><path d="M8,4 L26,0" class="sym"/>' : '<line x1="-26" y1="0" x2="26" y2="0" class="sym"/>'}
      <line x1="26" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="-16" class="sym-label">${inst.params.I} A</text>`,
    fiche: {
      role: "Protège l'appareil et l'installation : si le courant dépasse son <b>calibre</b> (ex. 5 A), le fil intérieur fond et coupe le circuit. C'est un composant sacrificiel.",
      test: "Hors tension, en <b>Ω</b> : un fusible bon fait ≈ 0 Ω ; grillé, il indique ∞ (OL). Sous tension, en V~ : 0 V à ses bornes s'il est bon, la pleine tension s'il est grillé (et que le reste du circuit est fermé).",
      pannes: "Grillé suite à une surcharge ou un court-circuit en aval. <b>Remplacer toujours par le même calibre</b> : trop faible, il grille aussitôt ; trop fort, il ne protège plus.",
    },
  },

  thermofusible: {
    name: 'Fusible thermique',
    short: 'Fus. thermique',
    icon: '🌡️',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => (inst.fault === 'grille' || inst.state.blown) ? [] : [{ kind: 'wire', a: 'a', b: 'b' }],
    faults: {
      grille: { label: 'Fusible thermique déclenché', visible: 0.15, inspect: 'Le petit cylindre semble intact.', hint: 'Il coupe définitivement au-delà d\'une température : ∞ à l\'ohmmètre.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <rect x="-20" y="-8" width="40" height="16" rx="8" class="sym-body"/>
      <text x="0" y="4" class="sym-tiny">${inst.params.T}°C</text>
      <line x1="20" y1="0" x2="40" y2="0" class="sym"/>`,
    fiche: {
      role: "Sécurité ultime contre la surchauffe : placé près de la résistance, il s'ouvre <b>définitivement</b> si la température dépasse sa valeur (ex. 130 °C). Il n'agit que si le thermostat a échoué.",
      test: "Hors tension, en <b>Ω</b> : ≈ 0 Ω s'il est bon, ∞ s'il a déclenché. S'il a déclenché, chercher la cause (thermostat bloqué, moteur de ventilation en panne).",
      pannes: 'Déclenché à cause d\'une surchauffe. À remplacer par un modèle de même température.',
    },
  },

  /* ---------------- COMMANDES ---------------- */
  interrupteur: {
    name: 'Interrupteur',
    short: 'Interrupteur',
    icon: '🔘',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    isClosed: (inst) => inst.fault === 'colle' ? true : inst.fault === 'ouvert' ? false : !!inst.state.on,
    prims: (inst) => TYPES.interrupteur.isClosed(inst) ? [{ kind: 'wire', a: 'a', b: 'b' }] : [],
    faults: {
      ouvert: { label: 'Contact usé (reste ouvert)', visible: 0.2, inspect: 'Le bouton semble normal.', hint: 'Un interrupteur fermé doit faire 0 Ω. S\'il reste ∞ en position marche, ses contacts sont morts.' },
      colle: { label: 'Contacts soudés (reste fermé)', visible: 0.25, inspect: 'Le plastique autour du bouton est un peu fondu.', hint: 'Des contacts soudés laissent passer le courant même en position arrêt.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <circle cx="-20" cy="0" r="3" class="sym-dot"/>
      <circle cx="20" cy="0" r="3" class="sym-dot"/>
      ${inst.state.on ? '<line x1="-20" y1="0" x2="20" y2="0" class="sym"/>' : '<line x1="-20" y1="0" x2="18" y2="-16" class="sym"/>'}
      <line x1="20" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="24" class="sym-label">${inst.state.on ? 'ON' : 'OFF'}</text>`,
    control: {
      label: (s) => (s.on ? 'Éteindre (OFF)' : 'Allumer (ON)'),
      toggle: (s) => { s.on = !s.on; },
    },
    fiche: {
      role: "Ouvre ou ferme le circuit à la demande de l'utilisateur. Fermé, il laisse passer le courant (≈ 0 Ω) ; ouvert, il coupe (∞).",
      test: "Hors tension, en <b>Ω</b> : 0 Ω en position ON, ∞ en position OFF. Sous tension : 0 V à ses bornes quand il est fermé et que le courant passe, ≈ 230 V quand il est ouvert.",
      pannes: 'Contacts usés ou brûlés (reste ouvert), contacts soudés (reste fermé), mécanisme cassé.',
    },
  },

  porte: {
    name: 'Sécurité de porte (verrou)',
    short: 'Sécurité porte',
    icon: '🚪',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => (inst.fault === 'hs' ? false : inst.fault === 'colle' ? true : !!inst.state.on) ? [{ kind: 'wire', a: 'a', b: 'b' }] : [],
    faults: {
      hs: { label: 'Micro-contact de porte cassé', visible: 0.3, inspect: 'Le crochet de porte est un peu tordu.', hint: 'La sécurité de porte est un interrupteur : porte fermée, elle doit faire 0 Ω.' },
      colle: { label: 'Contact collé (porte toujours vue fermée)', visible: 0.1, inspect: 'Rien de visible.', hint: 'Dangereux : la machine pourrait tourner porte ouverte.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <circle cx="-20" cy="0" r="3" class="sym-dot"/>
      <circle cx="20" cy="0" r="3" class="sym-dot"/>
      ${inst.state.on ? '<line x1="-20" y1="0" x2="20" y2="0" class="sym"/>' : '<line x1="-20" y1="0" x2="18" y2="-16" class="sym"/>'}
      <path d="M-6,-30 h12 v-10 h-12 z" class="sym-thin"/>
      <line x1="0" y1="-30" x2="0" y2="-12" class="sym-thin"/>
      <line x1="20" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="24" class="sym-label">${inst.state.on ? 'porte fermée' : 'porte ouverte'}</text>`,
    control: {
      label: (s) => (s.on ? 'Ouvrir la porte' : 'Fermer la porte'),
      toggle: (s) => { s.on = !s.on; },
    },
    fiche: {
      role: "Interrupteur de sécurité actionné par la porte : il empêche le fonctionnement porte ouverte (lave-linge, micro-ondes, sèche-linge). Il est en série avec tout le reste.",
      test: "Comme un interrupteur : porte fermée → 0 Ω ; porte ouverte → ∞. Sous tension, si la machine est « morte », vérifier si 230 V arrivent avant et après lui.",
      pannes: 'Micro-contact cassé, crochet de porte usé, bobine de verrou grillée.',
    },
  },

  commutateur: {
    name: 'Commutateur (0 / 1 / 2)',
    short: 'Commutateur',
    icon: '🎚️',
    pins: [{ id: 'c', x: -40, y: 0 }, { id: 'p1', x: 40, y: -20 }, { id: 'p2', x: 40, y: 20 }],
    prims: (inst) => {
      const pos = inst.state.pos;
      const out = [];
      // contacts cumulatifs (params.cumul) : la position 2 alimente aussi la sortie 1
      const p1on = pos === 1 || (pos === 2 && inst.params.cumul);
      if (p1on && inst.fault !== 'p1hs') out.push({ kind: 'wire', a: 'c', b: 'p1' });
      if (pos === 2 && inst.fault !== 'p2hs') out.push({ kind: 'wire', a: 'c', b: 'p2' });
      return out;
    },
    faults: {
      p1hs: { label: 'Contact position 1 usé', visible: 0.2, inspect: 'Le curseur a du jeu.', hint: 'Testez chaque position : commun ↔ sortie doit faire 0 Ω dans la position correspondante.' },
      p2hs: { label: 'Contact position 2 usé', visible: 0.2, inspect: 'Le curseur a du jeu.', hint: 'Testez chaque position : commun ↔ sortie doit faire 0 Ω dans la position correspondante.' },
    },
    draw: (inst) => {
      const pos = inst.state.pos;
      let arm = pos === 1 ? '<line x1="-20" y1="0" x2="20" y2="-20" class="sym"/>' : pos === 2 ? '<line x1="-20" y1="0" x2="20" y2="20" class="sym"/>' : '<line x1="-20" y1="0" x2="18" y2="-32" class="sym"/>';
      if (pos === 2 && inst.params.cumul) arm += '<line x1="-20" y1="0" x2="20" y2="-20" class="sym"/>';
      return `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <circle cx="-20" cy="0" r="3" class="sym-dot"/>
      <circle cx="20" cy="-20" r="3" class="sym-dot"/>
      <circle cx="20" cy="20" r="3" class="sym-dot"/>
      ${arm}
      <line x1="20" y1="-20" x2="40" y2="-20" class="sym"/>
      <line x1="20" y1="20" x2="40" y2="20" class="sym"/>
      <text x="30" y="-26" class="sym-pin">1</text>
      <text x="30" y="34" class="sym-pin">2</text>
      <text x="0" y="40" class="sym-label">pos. ${pos}</text>`;
    },
    control: {
      label: (s) => `Position → ${(s.pos + 1) % 3}`,
      toggle: (s) => { s.pos = (s.pos + 1) % 3; },
    },
    fiche: {
      role: "Interrupteur à plusieurs positions : il aiguille le courant du <b>commun (c)</b> vers la sortie 1 ou la sortie 2 (vitesses, puissances…). En position 0 rien ne passe. Certains modèles sont <b>cumulatifs</b> : la position 2 alimente les sorties 1 et 2 (sèche-cheveux : moteur, puis moteur + chauffe).",
      test: "Hors tension, en <b>Ω</b> entre c et chaque sortie, en changeant la position : 0 Ω pour la sortie sélectionnée, ∞ pour les autres.",
      pannes: 'Une position ne fonctionne plus (contact usé), curseur cassé.',
    },
  },

  thermostat: {
    name: 'Thermostat (bilame)',
    short: 'Thermostat',
    icon: '♨️',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => {
      const closed = inst.fault === 'ouvert' ? false : inst.fault === 'colle' ? true : !inst.state.tripped;
      return closed ? [{ kind: 'wire', a: 'a', b: 'b' }] : [];
    },
    faults: {
      ouvert: { label: 'Bilame cassé (reste ouvert)', visible: 0.15, inspect: 'Aucune trace suspecte.', hint: 'À froid, un thermostat doit être fermé (0 Ω). S\'il est ∞ à température ambiante, il est mort.' },
      colle: { label: 'Contacts soudés (ne coupe plus)', visible: 0.3, inspect: 'Le boîtier est légèrement bruni.', hint: 'Un thermostat qui ne coupe plus laisse la résistance chauffer sans limite : la sécurité thermique finit par déclencher.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <circle cx="-20" cy="0" r="3" class="sym-dot"/>
      <circle cx="20" cy="0" r="3" class="sym-dot"/>
      ${inst.state.tripped && inst.fault !== 'colle' ? '<line x1="-20" y1="0" x2="18" y2="-16" class="sym"/>' : '<line x1="-20" y1="0" x2="20" y2="0" class="sym"/>'}
      <line x1="0" y1="-24" x2="0" y2="-12" class="sym-thin"/>
      <path d="M-8,-24 h16" class="sym-thin"/>
      <text x="0" y="-30" class="sym-tiny">t° ${inst.params.T}°C</text>
      <line x1="20" y1="0" x2="40" y2="0" class="sym"/>`,
    fiche: {
      role: "Interrupteur automatique commandé par la température : un <b>bilame</b> (deux métaux qui se dilatent différemment) ouvre le contact quand il fait trop chaud et le referme en refroidissant. Il régule la chauffe.",
      test: "À froid, hors tension, en <b>Ω</b> : 0 Ω (fermé). Observer sous tension : il doit couper puis rétablir la chauffe de manière cyclique.",
      pannes: 'Reste ouvert (plus de chauffe), contacts soudés (chauffe sans arrêt → surchauffe), dérèglé.',
    },
  },

  /* ---------------- RÉCEPTEURS ---------------- */
  lampe: {
    name: 'Ampoule à incandescence',
    short: 'Ampoule',
    icon: '💡',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => inst.fault === 'grillee' ? [] : [{ kind: 'R', a: 'a', b: 'b', value: pRes(inst.params.P, inst.params.V), tag: 'load' }],
    faults: {
      grillee: { label: 'Filament grillé', visible: 0.6, inspect: 'À travers le verre, le filament est visiblement cassé.', hint: 'Un filament grillé = circuit ouvert = ∞ à l\'ohmmètre.' },
    },
    output: { kind: 'light', label: 'Lumière' },
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-16" y2="0" class="sym"/>
      <circle cx="0" cy="0" r="16" class="sym-body ${lvl > 0.05 ? 'lit' : ''}" style="${lvl > 0.05 ? `fill:rgba(255,210,80,${0.25 + 0.7 * lvl});filter:drop-shadow(0 0 ${8 * lvl}px #ffd54a)` : ''}"/>
      <line x1="-11" y1="-11" x2="11" y2="11" class="sym"/>
      <line x1="-11" y1="11" x2="11" y2="-11" class="sym"/>
      <line x1="16" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="30" class="sym-label">${inst.params.P} W</text>`;
    },
    fiche: {
      role: "Transforme l'énergie électrique en lumière (et beaucoup de chaleur) en chauffant un filament de tungstène. Sa puissance (ex. 60 W) indique la consommation à la tension nominale.",
      test: "Hors tension, en <b>Ω</b> : quelques dizaines à centaines d'ohms (à froid, c'est moins que la valeur calculée V²/P car la résistance monte avec la température). ∞ = filament coupé.",
      pannes: 'Filament grillé (fin de vie, choc). Vérifier aussi le serrage dans la douille.',
      formule: 'R ≈ V² / P → 230² / 60 ≈ 880 Ω (à chaud)',
    },
  },

  led: {
    name: 'LED (diode électroluminescente)',
    short: 'LED',
    icon: '🔆',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    // Approximation linéaire : la LED est vue comme une résistance équivalente.
    prims: (inst) => inst.fault === 'grillee' ? [] : [{ kind: 'R', a: 'a', b: 'b', value: inst.params.R || 100, tag: 'load' }],
    faults: {
      grillee: { label: 'LED grillée', visible: 0.3, inspect: 'Une minuscule tache sombre dans le boîtier.', hint: 'Une LED grillée ne conduit plus : ∞ à l\'ohmmètre dans les deux sens.' },
    },
    output: { kind: 'light', label: 'Lumière' },
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-12" y2="0" class="sym"/>
      <path d="M-12,-12 L12,0 L-12,12 Z" class="sym-body" style="${lvl > 0.05 ? `fill:rgba(120,255,140,${0.3 + 0.7 * lvl});filter:drop-shadow(0 0 ${8 * lvl}px #7dff8d)` : ''}"/>
      <line x1="12" y1="-12" x2="12" y2="12" class="sym"/>
      <path d="M-2,-14 l8,-8 M4,-12 l8,-8" class="sym-thin"/>
      <line x1="12" y1="0" x2="40" y2="0" class="sym"/>`;
    },
    fiche: {
      role: "Composant semi-conducteur qui émet de la lumière quand un courant la traverse <b>dans le bon sens</b> (de l'anode vers la cathode). Elle a besoin d'une résistance en série pour limiter le courant.",
      test: "Le mode <b>diode</b> ou <b>Ω</b> d'un multimètre fait parfois briller faiblement la LED dans un sens et affiche ∞ dans l'autre. Ici on la modélise simplement comme une résistance.",
      pannes: 'Grillée par surintensité (résistance en série manquante), montée à l\'envers.',
    },
  },

  voyant: {
    name: 'Voyant néon',
    short: 'Voyant',
    icon: '🔴',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => inst.fault === 'grille' ? [] : [{ kind: 'R', a: 'a', b: 'b', value: inst.params.R || 220000, tag: 'load' }],
    faults: {
      grille: { label: 'Néon grillé', visible: 0.4, inspect: 'Le petit tube est noirci.', hint: 'Le voyant n\'a aucune influence sur le reste : il est en parallèle. S\'il ne s\'allume pas mais que l\'appareil marche, seul le voyant est en cause.' },
    },
    output: { kind: 'light', label: 'Voyant' },
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-30" y2="0" class="sym"/>
      <rect x="-30" y="-4" width="12" height="8" class="sym-body"/>
      <line x1="-18" y1="0" x2="-10" y2="0" class="sym"/>
      <circle cx="0" cy="0" r="10" class="sym-body" style="${lvl > 0.05 ? `fill:rgba(255,120,80,${0.3 + 0.7 * lvl});filter:drop-shadow(0 0 6px #ff7050)` : ''}"/>
      <line x1="-5" y1="-4" x2="-5" y2="4" class="sym-thin"/>
      <line x1="5" y1="-4" x2="5" y2="4" class="sym-thin"/>
      <line x1="10" y1="0" x2="40" y2="0" class="sym"/>`;
    },
    fiche: {
      role: "Indique que l'appareil est sous tension. Un tube néon en série avec une grosse résistance (≈ 220 kΩ) : il consomme très peu et est branché <b>en parallèle</b> de la charge.",
      test: "Hors tension, en <b>Ω</b> : on lit surtout la résistance série (≈ 220 kΩ). S'il ne s'allume pas alors que le reste fonctionne, seul le voyant est en défaut.",
      pannes: 'Tube usé (ne s\'allume plus). Panne sans conséquence sur le fonctionnement.',
    },
  },

  resistance: {
    name: 'Résistance chauffante',
    short: 'Résistance',
    icon: '🔥',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => {
      if (inst.fault === 'coupee') return [];
      let R = pRes(inst.params.P, inst.params.V);
      if (inst.fault === 'cc') R = R / 25; // court-circuit partiel : courant x25
      return [{ kind: 'R', a: 'a', b: 'b', value: R, tag: 'load' }];
    },
    faults: {
      coupee: { label: 'Résistance coupée', visible: 0.3, inspect: 'Le corps de chauffe présente une boursouflure.', hint: 'Une résistance coupée est ∞ à l\'ohmmètre. Sous tension on mesure pourtant 230 V à ses bornes : la tension arrive mais aucun courant ne circule.' },
      cc: { label: 'Résistance en court-circuit (isolant percé)', visible: 0.5, inspect: 'Trace noire de brûlure sur le corps de chauffe.', hint: 'Une résistance en court-circuit tire un courant énorme : le fusible saute aussitôt. Vérifier sa valeur à l\'ohmmètre (elle doit valoir ≈ V²/P).' },
    },
    output: { kind: 'heat', label: 'Chaleur' },
    thermal: true,
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-28" y2="0" class="sym"/>
      <rect x="-28" y="-9" width="56" height="18" class="sym-body" style="${lvl > 0.05 ? `fill:rgba(255,${Math.round(140 - 100 * lvl)},40,${0.3 + 0.6 * lvl})` : ''}"/>
      <line x1="28" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="-16" class="sym-label">${inst.params.P} W</text>
      ${inst.state.T > 40 ? `<text x="0" y="26" class="sym-tiny">${Math.round(inst.state.T)} °C</text>` : ''}`;
    },
    fiche: {
      role: "Transforme l'électricité en chaleur par <b>effet Joule</b> : un fil résistif (nichrome) chauffe quand le courant le traverse. C'est le composant le plus gourmand d'un appareil.",
      test: "Hors tension, en <b>Ω</b> : la valeur attendue vaut V²/P (ex. 230²/2000 ≈ 26 Ω). ∞ = coupée ; beaucoup trop faible = court-circuit interne.",
      pannes: 'Coupée (vieillissement, calcaire sur une bouilloire), isolant percé (court-circuit à la masse ou entre spires).',
      formule: 'R = V² / P   et   I = P / V   (2000 W → 26 Ω, 8,7 A)',
    },
  },

  resistor: {
    name: 'Résistance (limitation de courant)',
    short: 'Résistance',
    icon: '〰️',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => inst.fault === 'coupee' ? [] : [{ kind: 'R', a: 'a', b: 'b', value: inst.params.R }],
    faults: {
      coupee: { label: 'Résistance coupée', visible: 0.5, inspect: 'La résistance est noircie, craquelée.', hint: 'Une résistance coupée = ∞ à l\'ohmmètre : plus rien ne passe.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-22" y2="0" class="sym"/>
      <rect x="-22" y="-8" width="44" height="16" class="sym-body"/>
      <line x1="22" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="-14" class="sym-label">${fmtOhm(inst.params.R)}</text>`,
    fiche: {
      role: "Limite le courant dans un circuit. Dans une lampe à LED elle protège la LED : sans elle, la LED grillerait en quelques secondes. Loi d'Ohm : <b>U = R × I</b>.",
      test: "Hors tension, en <b>Ω</b> : la valeur lue doit correspondre au marquage (anneaux de couleur ou inscription), à quelques % près.",
      pannes: 'Coupée (surchauffe), valeur dérivée.',
      formule: 'I = (U_pile − U_led) / R → (4,5 − 2,2) / 100 Ω ≈ 23 mA',
    },
  },

  resistor: {
    name: 'Résistance (limitation de courant)',
    short: 'Résistance',
    icon: '〰️',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => inst.fault === 'coupee' ? [] : [{ kind: 'R', a: 'a', b: 'b', value: inst.params.R }],
    faults: {
      coupee: { label: 'Résistance coupée', visible: 0.5, inspect: 'La résistance est noircie, craquelée.', hint: 'Une résistance coupée = ∞ à l\'ohmmètre : plus rien ne passe.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-22" y2="0" class="sym"/>
      <rect x="-22" y="-8" width="44" height="16" class="sym-body"/>
      <line x1="22" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="-14" class="sym-label">${fmtOhm(inst.params.R)}</text>`,
    fiche: {
      role: "Limite le courant dans un circuit. Dans une lampe à LED elle protège la LED : sans elle, la LED grillerait en quelques secondes. Loi d'Ohm : <b>U = R × I</b>.",
      test: "Hors tension, en <b>Ω</b> : la valeur lue doit correspondre au marquage (anneaux de couleur ou inscription), à quelques % près.",
      pannes: 'Coupée (surchauffe), valeur dérivée.',
      formule: 'I = (U_pile − U_led) / R → (4,5 − 2,2) / 100 Ω ≈ 23 mA',
    },
  },

  moteur: {
    name: 'Moteur universel',
    short: 'Moteur',
    icon: '🌀',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => {
      if (inst.fault === 'coupe') return [];
      let R = pRes(inst.params.P, inst.params.V);
      if (inst.fault === 'cc') R = R / 30;
      if (inst.fault === 'bloque') R = R / 4; // rotor bloqué : fort courant
      return [{ kind: 'R', a: 'a', b: 'b', value: R, tag: 'load' }];
    },
    faults: {
      coupe: { label: 'Bobinage coupé', visible: 0.2, inspect: 'Le moteur tourne librement à la main.', hint: 'Un bobinage coupé se mesure ∞ à l\'ohmmètre. Un moteur sain a une résistance de quelques dizaines à centaines d\'ohms.' },
      cc: { label: 'Bobinage en court-circuit', visible: 0.6, inspect: 'Odeur de brûlé, vernis noirci sur les bobines.', hint: 'Bobinage grillé : résistance anormalement basse, le fusible saute.' },
      bloque: { label: 'Rotor bloqué (mécanique)', visible: 0.8, inspect: "L'axe est bloqué : un corps étranger coince l'hélice.", hint: 'Électriquement le moteur paraît bon, mais bloqué il consomme trop et chauffe.' },
    },
    output: { kind: 'spin', label: 'Rotation' },
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-18" y2="0" class="sym"/>
      <circle cx="0" cy="0" r="18" class="sym-body ${lvl > 0.1 ? 'spinning' : ''}"/>
      <text x="0" y="6" class="sym-M">M</text>
      <line x1="18" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="32" class="sym-label">${inst.params.P} W</text>`;
    },
    fiche: {
      role: "Transforme l'électricité en mouvement grâce au champ magnétique créé par ses bobinages. Le moteur universel (balais + collecteur) équipe aspirateurs, perceuses, sèche-cheveux.",
      test: "Hors tension, en <b>Ω</b> : quelques dizaines à centaines d'ohms entre les deux fils. ∞ = bobinage ou balais coupés ; presque 0 = court-circuit. Vérifier aussi qu'il tourne librement à la main.",
      pannes: 'Balais usés (charbons), bobinage coupé ou grillé, rotor bloqué, roulements grippés.',
    },
  },

  moteur_async: {
    name: 'Moteur asynchrone (2 enroulements)',
    short: 'Moteur async.',
    icon: '🌀',
    pins: [{ id: 'com', x: -40, y: 0 }, { id: 'P', x: 40, y: -20 }, { id: 'A', x: 40, y: 20 }],
    prims: (inst) => {
      const out = [];
      const Rp = pRes(inst.params.P, inst.params.V);
      if (inst.fault !== 'coupeP') out.push({ kind: 'R', a: 'com', b: 'P', value: Rp, tag: 'main' });
      if (inst.fault !== 'coupeA') out.push({ kind: 'R', a: 'com', b: 'A', value: Rp * 1.6, tag: 'aux' });
      return out;
    },
    faults: {
      coupeP: { label: 'Enroulement principal coupé', visible: 0.15, inspect: 'Rien de visible.', hint: 'Mesurer com ↔ P : ∞ signifie que l\'enroulement principal est coupé.' },
      coupeA: { label: 'Enroulement auxiliaire coupé', visible: 0.15, inspect: 'Rien de visible.', hint: 'Sans enroulement auxiliaire, le moteur ronronne mais ne démarre pas.' },
    },
    output: { kind: 'spin', label: 'Rotation' },
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <circle cx="0" cy="0" r="20" class="sym-body ${lvl > 0.1 ? 'spinning' : ''}"/>
      <text x="0" y="6" class="sym-M">M~</text>
      <line x1="14" y1="-14" x2="40" y2="-20" class="sym"/>
      <line x1="14" y1="14" x2="40" y2="20" class="sym"/>
      <text x="32" y="-26" class="sym-pin">P</text>
      <text x="32" y="34" class="sym-pin">A</text>
      <text x="0" y="36" class="sym-label">${inst.params.P} W</text>`;
    },
    fiche: {
      role: "Moteur silencieux et sans balais (ventilateurs, pompes). Il possède un <b>enroulement principal (P)</b> et un <b>enroulement auxiliaire (A)</b> alimenté à travers un condensateur, qui crée le déphasage nécessaire pour démarrer.",
      test: "Hors tension, en <b>Ω</b> : com ↔ P et com ↔ A donnent chacun quelques centaines d'ohms (l'auxiliaire est souvent un peu plus résistif). ∞ = enroulement coupé.",
      pannes: 'Enroulement coupé, condensateur de démarrage HS (le moteur ronronne sans tourner), roulements grippés.',
    },
  },

  condensateur: {
    name: 'Condensateur de démarrage',
    short: 'Condensateur',
    icon: '⚡',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    // En alternatif 50 Hz un condensateur se comporte comme une impédance
    // Xc = 1/(2πfC). On l'approxime ici par une résistance de même valeur.
    prims: (inst) => {
      if (inst.fault === 'hs') return [];
      if (inst.fault === 'cc') return [{ kind: 'wire', a: 'a', b: 'b' }];
      const Xc = 1 / (2 * Math.PI * 50 * inst.params.C * 1e-6);
      return [{ kind: 'R', a: 'a', b: 'b', value: Xc, tag: 'cap' }];
    },
    faults: {
      hs: { label: 'Condensateur HS (ouvert / desséché)', visible: 0.45, inspect: 'Le boîtier est gonflé sur le dessus.', hint: 'Sans condensateur, l\'enroulement auxiliaire n\'est plus alimenté : le moteur vibre mais ne tourne pas.' },
      cc: { label: 'Condensateur en court-circuit', visible: 0.3, inspect: 'Une trace de coulure au pied du condensateur.', hint: 'Un condensateur en court-circuit alimente l\'auxiliaire en direct : surintensité.' },
    },
    draw: (inst) => `
      <line x1="-40" y1="0" x2="-5" y2="0" class="sym"/>
      <line x1="-5" y1="-14" x2="-5" y2="14" class="sym"/>
      <line x1="5" y1="-14" x2="5" y2="14" class="sym"/>
      <line x1="5" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="-20" class="sym-label">${inst.params.C} µF</text>`,
    fiche: {
      role: "Stocke une charge électrique et déphase le courant. Dans un moteur asynchrone il alimente l'enroulement auxiliaire pour donner le « coup de pouce » au démarrage. Sa capacité s'exprime en <b>microfarads (µF)</b>.",
      test: "Hors tension, <b>après l'avoir déchargé</b> (court-circuiter ses bornes avec un tournevis isolé). En Ω, l'aiguille monte progressivement (charge). Idéalement un capacimètre : ±10 % de la valeur marquée. Ici on le voit comme une impédance de quelques centaines d'ohms.",
      pannes: 'Desséché / capacité effondrée (boîtier gonflé), court-circuit. Panne très fréquente des ventilateurs et pompes.',
    },
  },

  electrovanne: {
    name: 'Électrovanne',
    short: 'Électrovanne',
    icon: '🚰',
    pins: [{ id: 'a', x: -40, y: 0 }, { id: 'b', x: 40, y: 0 }],
    prims: (inst) => inst.fault === 'coupee' ? [] : [{ kind: 'R', a: 'a', b: 'b', value: inst.params.R || 4000, tag: 'load' }],
    faults: {
      coupee: { label: 'Bobine coupée', visible: 0.1, inspect: 'Rien de visible.', hint: 'Une bobine d\'électrovanne fait normalement quelques kΩ. ∞ = coupée : la vanne ne s\'ouvre plus.' },
    },
    output: { kind: 'valve', label: 'Arrivée d\'eau' },
    draw: (inst) => {
      const lvl = inst.out || 0;
      return `
      <line x1="-40" y1="0" x2="-20" y2="0" class="sym"/>
      <rect x="-20" y="-10" width="40" height="20" class="sym-body" style="${lvl > 0.5 ? 'fill:rgba(80,160,255,.6)' : ''}"/>
      <path d="M-12,-10 v-8 M12,-10 v-8 M-12,-18 h24" class="sym-thin"/>
      <path d="M-6,-24 l6,-6 l6,6 z" class="sym-thin"/>
      <line x1="20" y1="0" x2="40" y2="0" class="sym"/>
      <text x="0" y="24" class="sym-tiny">${lvl > 0.5 ? 'ouverte' : 'fermée'}</text>`;
    },
    fiche: {
      role: "Robinet commandé électriquement : une bobine (électro-aimant) tire un noyau qui ouvre le passage de l'eau tant qu'elle est alimentée.",
      test: "Hors tension, en <b>Ω</b> : la bobine fait typiquement 3 à 5 kΩ. ∞ = coupée. Sous tension : 230 V à ses bornes quand elle doit s'ouvrir.",
      pannes: 'Bobine coupée, membrane entartrée (bloquée mécaniquement), filtre bouché.',
    },
  },
};

/* Fiche générale sur le multimètre, affichée dans l'encyclopédie */
const FICHE_MULTIMETRE = {
  name: 'Le multimètre',
  icon: '📟',
  sections: [
    ['V~ — Voltmètre alternatif', "Mesure une tension entre deux points <b>sous tension</b>. Le multimètre se branche <b>en parallèle</b>. 230 V entre L et N = le courant arrive. 0 V aux bornes d'un composant fermé = normal ; 230 V aux bornes d'un composant en série = il est <b>ouvert</b> (le courant est bloqué là)."],
    ['V= — Voltmètre continu', "Même chose pour le courant continu (piles, LED). Le fil rouge sur le + : une valeur négative signifie que les fils sont inversés."],
    ['Ω — Ohmmètre', "Mesure la résistance d'un composant <b>hors tension, appareil débranché</b>. 0 Ω = fil ou contact fermé, ∞ (OL) = coupé. Mesurer en Ω sous tension abîme le multimètre !"],
    ['Continuité 🔊', "Un ohmmètre qui bipe quand la résistance est faible (< 50 Ω). Idéal pour vérifier cordons, fusibles, interrupteurs."],
    ['Méthode de dépannage', "1) Observer les symptômes et inspecter. 2) Brancher, mesurer les tensions du début vers la fin du circuit : là où les 230 V « disparaissent » se trouve le coupable (ou juste avant). 3) Débrancher, confirmer à l'ohmmètre. 4) Remplacer, tester, et se demander <b>pourquoi</b> la pièce a lâché."],
  ],
};
