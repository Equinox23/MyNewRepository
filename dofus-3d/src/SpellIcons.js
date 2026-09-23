// Icones de sorts "peintes" facon Dofus : vignette carree a coins arrondis,
// fond en degrade radial de la couleur de l element du sort (feu, eau,
// terre, air, neutre...), illustration coloree avec degrades, contour
// sombre et reflets. Tout est en SVG inline (aucune image externe).

// Element de chaque sort : couleur du fond de l icone, du glyphe de
// lancement et des effets d impact.
export const ELEMENTS = {
  feu:    { light: '#ffcf6a', mid: '#e8622a', dark: '#6a1a08', hex: 0xff7a2a },
  eau:    { light: '#bfeaff', mid: '#3a9ae0', dark: '#0c2c6a', hex: 0x4ab0ff },
  terre:  { light: '#f0d49a', mid: '#a8743a', dark: '#3a2208', hex: 0xd89a4a },
  air:    { light: '#e2ffb0', mid: '#62b83a', dark: '#1a4a0a', hex: 0x8ae04a },
  neutre: { light: '#f0f0ea', mid: '#9aa0a8', dark: '#2c3036', hex: 0xd8dce0 },
  soin:   { light: '#ffd4ea', mid: '#e8589a', dark: '#5a0a2c', hex: 0xff7ab8 },
  boost:  { light: '#fff2a8', mid: '#e8a81a', dark: '#5a3404', hex: 0xffd040 },
  poison: { light: '#ecc8ff', mid: '#9a4ad0', dark: '#2c0a4a', hex: 0xb46ae8 },
  invoc:  { light: '#f4dcb8', mid: '#9a6a3a', dark: '#3a2010', hex: 0xd8a060 },
};

export const SPELL_ELEMENT = {
  pression: 'terre', bond: 'air', epeeDivine: 'feu', concentration: 'boost', precipitation: 'boost',
  poserBombe: 'feu', entourloupe: 'air', detonationManuelle: 'feu', bouclierBombe: 'boost', pulsar: 'feu',
  invocationCraqueleur: 'invoc', piqureMotivante: 'boost', protectionCraqueleur: 'terre', soinInvocation: 'soin',
  invocationDragounet: 'invoc', dragoflamme: 'feu', dragosoin: 'soin',
  morsureBouftou: 'terre', morsureRoyale: 'terre', soinAnimal: 'soin',
  frappeCraqueleur: 'terre', lancerRocher: 'terre', crachat: 'eau', crachatEmpoisonne: 'poison', peauDure: 'terre',
  horloge: 'eau', ralentissement: 'eau', devouement: 'boost', aiguille: 'feu', momification: 'boost',
  griffeFeline: 'terre', pileOuFace: 'eau', roueChance: 'boost', bondDuFelin: 'air', invocationChaton: 'invoc',
  coupDeGriffe: 'terre',
  picole: 'boost', tirPandatak: 'terre', karcham: 'terre', vaguePandawa: 'eau', laitDeBambou: 'soin',
  coupDeLance: 'neutre', coupDeLanceRoyal: 'neutre', invisibilite: 'air',
  coupDeBec: 'air', bourrasque: 'air', sporeToxique: 'poison', nuageDeSpores: 'poison',
};

export function spellElement(spell) {
  const id = typeof spell === 'string' ? spell : spell && spell.id;
  return SPELL_ELEMENT[id] || (spell && spell.category === 'heal' ? 'soin' : spell && spell.category === 'boost' ? 'boost' : 'neutre');
}

export function spellElementColor(spell) {
  return ELEMENTS[spellElement(spell)].hex;
}

// Contour commun des illustrations.
const O = 'stroke="#241208" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';

// Degrades reutilisables (prefixes par icone pour eviter les collisions).
function defs(p) {
  const lg = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${p}${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, a, b) => `<radialGradient id="${p}${id}" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  return [
    lg('steel', '#ffffff', '#8a9aac', 1, 0),
    lg('gold', '#fff2a0', '#c8820a'),
    lg('wood', '#c88a4a', '#6a3a14'),
    lg('fire', '#fff4a0', '#ff4a10'),
    lg('water', '#d8f4ff', '#2a7ad8'),
    lg('leaf', '#c8f07a', '#3a8a1a'),
    lg('rock', '#c8baa4', '#6a5a48'),
    lg('pink', '#ffc8e0', '#d8307a'),
    lg('purple', '#e8c0ff', '#6a1aa8'),
    lg('red', '#ff8a6a', '#a81a0a'),
    lg('white', '#ffffff', '#c8ccd8'),
    rg('bomb', '#6a6a7a', '#101018'),
    rg('ball', '#ffffff', '#b8c0d0'),
  ].join('');
}

// Cadre + fond d element autour de l illustration.
function frame(el, p, art) {
  const E = ELEMENTS[el] || ELEMENTS.neutre;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${p}bg" cx="0.5" cy="0.42" r="0.72">
      <stop offset="0" stop-color="${E.light}"/>
      <stop offset="0.55" stop-color="${E.mid}"/>
      <stop offset="1" stop-color="${E.dark}"/>
    </radialGradient>
    <linearGradient id="${p}shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    ${defs(p)}
  </defs>
  <rect x="1.5" y="1.5" width="61" height="61" rx="10" fill="url(#${p}bg)" stroke="#1a0e04" stroke-width="3"/>
  <g opacity="0.22" fill="#fff">
    <circle cx="14" cy="50" r="1.6"/><circle cx="52" cy="14" r="1.2"/><circle cx="50" cy="48" r="1"/><circle cx="12" cy="16" r="1"/>
  </g>
  ${art}
  <rect x="4" y="4" width="56" height="26" rx="8" fill="url(#${p}shine)"/>
  <rect x="3.5" y="3.5" width="57" height="57" rx="8.5" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1.2"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// Illustrations (viewBox 64x64). `p` = prefixe des degrades.
// ---------------------------------------------------------------------------
const ART = {
  sword: (p) => `
    <g transform="rotate(-40 32 32)">
      <path d="M29 6 L35 6 L36 40 L28 40 Z" fill="url(#${p}steel)" ${O}/>
      <path d="M29 6 L32 1 L35 6 Z" fill="#fff" ${O}/>
      <line x1="32" y1="8" x2="32" y2="38" stroke="#fff" stroke-width="1.4" opacity="0.8"/>
      <rect x="20" y="39" width="24" height="6" rx="3" fill="url(#${p}gold)" ${O}/>
      <rect x="29" y="45" width="6" height="11" rx="2" fill="url(#${p}wood)" ${O}/>
      <circle cx="32" cy="59" r="3.5" fill="url(#${p}gold)" ${O}/>
    </g>
    <g stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.9">
      <line x1="46" y1="12" x2="52" y2="8"/><line x1="50" y1="20" x2="58" y2="19"/><line x1="42" y1="8" x2="44" y2="3"/>
    </g>`,
  holySword: (p) => `
    <g stroke="#fff6c0" stroke-width="2" opacity="0.8">
      <line x1="32" y1="30" x2="8" y2="12"/><line x1="32" y1="30" x2="56" y2="12"/><line x1="32" y1="30" x2="6" y2="32"/><line x1="32" y1="30" x2="58" y2="32"/>
    </g>
    <circle cx="32" cy="28" r="14" fill="#fff4b0" opacity="0.45"/>
    <path d="M28 8 L36 8 L37 42 L27 42 Z" fill="url(#${p}fire)" ${O}/>
    <path d="M28 8 L32 2 L36 8 Z" fill="#fff" ${O}/>
    <line x1="32" y1="10" x2="32" y2="40" stroke="#fff" stroke-width="2"/>
    <path d="M18 41 Q32 37 46 41 L44 47 Q32 44 20 47 Z" fill="url(#${p}gold)" ${O}/>
    <rect x="29" y="47" width="6" height="10" rx="2" fill="url(#${p}red)" ${O}/>
    <circle cx="32" cy="59" r="3.2" fill="url(#${p}gold)" ${O}/>`,
  jump: (p) => `
    <path d="M8 52 Q20 10 50 18" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 4" opacity="0.9"/>
    <ellipse cx="14" cy="54" rx="10" ry="4" fill="#fff" opacity="0.35"/>
    <g transform="translate(34 10) rotate(18)">
      <path d="M4 4 L16 4 L17 20 L26 24 Q28 30 22 30 L2 30 Z" fill="url(#${p}leaf)" ${O}/>
      <path d="M2 26 L24 26" stroke="#241208" stroke-width="2"/>
      <path d="M-6 8 Q-2 2 4 6 M-8 16 Q-2 10 3 14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    </g>`,
  fist: (p) => `
    <circle cx="32" cy="34" r="20" fill="#fff4b0" opacity="0.35"/>
    <path d="M18 26 Q18 18 26 18 L42 18 Q48 18 48 26 L48 40 Q48 48 40 48 L26 48 Q18 48 18 40 Z" fill="url(#${p}red)" ${O}/>
    <path d="M26 18 L26 30 M34 18 L34 30 M42 19 L42 30" stroke="#241208" stroke-width="2"/>
    <path d="M18 30 Q24 34 30 32" fill="none" stroke="#241208" stroke-width="2"/>
    <rect x="22" y="48" width="22" height="9" rx="3" fill="url(#${p}gold)" ${O}/>
    <path d="M22 22 Q24 20 28 21" stroke="#fff" stroke-width="2" fill="none" opacity="0.7"/>
    <g fill="#fff"><path d="M10 12 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/><path d="M53 10 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z"/></g>`,
  haste: (p) => `
    <path d="M36 4 L16 36 L30 36 L24 60 L48 24 L33 24 Z" fill="url(#${p}gold)" ${O}/>
    <path d="M34 9 L22 32" stroke="#fff" stroke-width="2" opacity="0.8"/>
    <g stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0.85">
      <line x1="6" y1="20" x2="16" y2="20"/><line x1="4" y1="30" x2="12" y2="30"/><line x1="48" y1="42" x2="58" y2="42"/><line x1="50" y1="52" x2="58" y2="52"/>
    </g>`,
  bomb: (p) => `
    <circle cx="28" cy="38" r="18" fill="url(#${p}bomb)" ${O}/>
    <rect x="24" y="16" width="10" height="7" rx="2" fill="#5a5a66" ${O}/>
    <path d="M30 16 Q34 6 44 10" fill="none" stroke="#6a4a2a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="46" cy="10" r="6" fill="url(#${p}fire)"/>
    <path d="M46 2 l1.5 5 5 1.5 -5 1.5 -1.5 5 -1.5 -5 -5 -1.5 5 -1.5z" fill="#fff"/>
    <ellipse cx="21" cy="31" rx="5" ry="3.5" fill="#fff" opacity="0.55" transform="rotate(-30 21 31)"/>
    <path d="M14 44 Q22 52 34 52" fill="none" stroke="#fff" stroke-width="1.4" opacity="0.25"/>`,
  bombSwap: (p) => `
    <circle cx="20" cy="22" r="11" fill="url(#${p}bomb)" ${O}/>
    <path d="M20 11 Q22 5 28 6" fill="none" stroke="#6a4a2a" stroke-width="2.4"/>
    <circle cx="29" cy="6" r="3" fill="url(#${p}fire)"/>
    <ellipse cx="16" cy="18" rx="3" ry="2" fill="#fff" opacity="0.5"/>
    <circle cx="44" cy="44" r="12" fill="url(#${p}leaf)" ${O}/>
    <circle cx="40" cy="41" r="2" fill="#241208"/><circle cx="48" cy="41" r="2" fill="#241208"/>
    <path d="M40 48 Q44 51 48 48" fill="none" stroke="#241208" stroke-width="2"/>
    <path d="M34 12 Q52 12 52 28" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M47 26 L52 33 L57 26 Z" fill="#fff" ${O}/>
    <path d="M30 54 Q12 54 12 38" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M7 40 L12 33 L17 40 Z" fill="#fff" ${O}/>`,
  explosion: (p) => `
    <path d="M32 3 L37 20 L54 10 L45 26 L61 32 L45 38 L54 54 L37 44 L32 61 L27 44 L10 54 L19 38 L3 32 L19 26 L10 10 L27 20 Z" fill="url(#${p}fire)" ${O}/>
    <path d="M32 16 L35 27 L46 24 L38 32 L46 40 L35 37 L32 48 L29 37 L18 40 L26 32 L18 24 L29 27 Z" fill="#fff6c0"/>
    <circle cx="32" cy="32" r="5" fill="#fff"/>
    <g fill="url(#${p}bomb)" ${O}><path d="M8 6 l6 2 -2 6z"/><path d="M52 50 l6 1 -3 6z"/><path d="M54 8 l4 5 -6 1z"/></g>`,
  shield: (p) => `
    <path d="M32 5 L52 12 L52 30 Q52 48 32 59 Q12 48 12 30 L12 12 Z" fill="url(#${p}gold)" ${O}/>
    <path d="M32 11 L46 16 L46 30 Q46 44 32 52 Q18 44 18 30 L18 16 Z" fill="url(#${p}water)" ${O}/>
    <path d="M32 18 L36 28 L46 29 L38 35 L41 45 L32 39 L23 45 L26 35 L18 29 L28 28 Z" fill="url(#${p}gold)" ${O}/>
    <path d="M20 16 Q26 13 32 12" stroke="#fff" stroke-width="2" fill="none" opacity="0.8"/>`,
  stoneShield: (p) => `
    <path d="M32 5 L52 12 L52 30 Q52 48 32 59 Q12 48 12 30 L12 12 Z" fill="url(#${p}rock)" ${O}/>
    <path d="M20 20 L30 26 L26 36 L36 42 M40 16 L36 26 L44 32 M30 50 L32 42" fill="none" stroke="#3a2a1a" stroke-width="2"/>
    <path d="M18 26 Q20 16 28 14" stroke="#fff" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M40 40 q6 -2 8 -8" stroke="#6ab83a" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="16" cy="44" r="4" fill="#6ab83a" ${O}/>`,
  bandage: (p) => `
    <path d="M32 5 L52 12 L52 30 Q52 48 32 59 Q12 48 12 30 L12 12 Z" fill="url(#${p}white)" ${O}/>
    <g stroke="#b8a888" stroke-width="2.2" fill="none">
      <path d="M12 18 L52 26"/><path d="M12 28 L52 20"/><path d="M13 38 L50 32"/><path d="M16 44 L48 46"/>
    </g>
    <circle cx="26" cy="30" r="4" fill="#3ad0ff" ${O}/><circle cx="38" cy="30" r="4" fill="#3ad0ff" ${O}/>
    <circle cx="25" cy="29" r="1.4" fill="#fff"/><circle cx="37" cy="29" r="1.4" fill="#fff"/>`,
  pulsar: (p) => `
    <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" stroke-width="2" opacity="0.4"/>
    <circle cx="32" cy="32" r="19" fill="none" stroke="#fff6c0" stroke-width="3" opacity="0.7"/>
    <circle cx="32" cy="32" r="12" fill="url(#${p}bomb)" ${O}/>
    <circle cx="32" cy="32" r="5" fill="url(#${p}fire)"/>
    <ellipse cx="28" cy="27" rx="3" ry="2" fill="#fff" opacity="0.55"/>
    <g fill="#fff"><path d="M54 8 L58 4 L58 10 Z"/><path d="M10 54 L6 58 L12 58 Z"/><path d="M54 56 L58 60 L52 60 Z"/><path d="M8 8 L4 4 L4 10 Z"/></g>`,
  needle: (p) => `
    <g transform="rotate(35 32 32)">
      <rect x="27" y="14" width="10" height="26" rx="2" fill="url(#${p}white)" ${O}/>
      <rect x="28.5" y="24" width="7" height="14" fill="url(#${p}leaf)"/>
      <rect x="23" y="10" width="18" height="5" rx="2" fill="url(#${p}steel)" ${O}/>
      <rect x="30" y="3" width="4" height="8" fill="url(#${p}steel)" ${O}/>
      <path d="M30 40 L34 40 L32 58 Z" fill="url(#${p}steel)" ${O}/>
    </g>
    <g fill="#fff" ${O} stroke-width="1.6"><path d="M8 34 L14 26 L20 34 Z"/><path d="M44 50 L50 42 L56 50 Z"/></g>`,
  heart: (p) => `
    <path d="M32 56 C6 38 8 14 22 12 C28 11 31 15 32 19 C33 15 36 11 42 12 C56 14 58 38 32 56 Z" fill="url(#${p}pink)" ${O}/>
    <rect x="28" y="22" width="8" height="22" rx="2" fill="#fff"/>
    <rect x="21" y="29" width="22" height="8" rx="2" fill="#fff"/>
    <ellipse cx="20" cy="22" rx="4" ry="6" fill="#fff" opacity="0.5" transform="rotate(30 20 22)"/>
    <g fill="#fff"><path d="M52 8 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z"/></g>`,
  dragonHeart: (p) => `
    <path d="M32 56 C6 38 8 14 22 12 C28 11 31 15 32 19 C33 15 36 11 42 12 C56 14 58 38 32 56 Z" fill="url(#${p}pink)" ${O}/>
    <path d="M40 18 Q54 6 58 14 Q50 14 50 22 Q44 22 40 18 Z" fill="url(#${p}red)" ${O}/>
    <path d="M24 18 Q10 6 6 14 Q14 14 14 22 Q20 22 24 18 Z" fill="url(#${p}red)" ${O}/>
    <rect x="28" y="24" width="8" height="20" rx="2" fill="#fff"/>
    <rect x="22" y="30" width="20" height="8" rx="2" fill="#fff"/>`,
  flame: (p) => `
    <path d="M32 60 C14 58 10 40 20 28 C22 36 26 36 26 30 C26 20 32 12 36 4 C38 16 50 22 52 38 C54 52 44 60 32 60 Z" fill="url(#${p}fire)" ${O}/>
    <path d="M32 56 C24 54 22 44 28 38 C28 42 32 42 32 38 C32 32 36 28 38 24 C40 32 46 38 44 46 C42 54 38 56 32 56 Z" fill="#fff6a0"/>
    <path d="M22 34 Q20 42 24 48" stroke="#fff" stroke-width="2" fill="none" opacity="0.7"/>`,
  fangs: (p, royal) => `
    <path d="M8 22 Q32 12 56 22 L56 28 Q32 20 8 28 Z" fill="url(#${p}red)" ${O}/>
    <path d="M8 44 Q32 54 56 44 L56 38 Q32 46 8 38 Z" fill="url(#${p}red)" ${O}/>
    <g fill="url(#${p}white)" ${O} stroke-width="1.8">
      <path d="M14 26 L18 40 L22 25 Z"/><path d="M26 23 L29 34 L32 22 Z"/><path d="M34 22 L37 34 L40 23 Z"/><path d="M44 25 L47 40 L50 26 Z"/>
      <path d="M19 42 L22 32 L26 43 Z"/><path d="M38 43 L42 32 L45 42 Z"/>
    </g>
    ${royal ? `<path d="M20 12 L22 2 L28 8 L32 0 L36 8 L42 2 L44 12 Z" fill="url(#${p}gold)" ${O}/><circle cx="32" cy="8" r="2" fill="#e8322a"/>` : ''}`,
  rockFist: (p) => `
    <path d="M6 54 L24 48 L32 56 L40 48 L58 54" fill="none" stroke="#3a2208" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 46 L14 60 M46 46 L52 60 M32 50 L32 62" stroke="#3a2208" stroke-width="2"/>
    <path d="M16 12 L44 8 L50 20 L48 40 L38 46 L22 46 L14 36 Z" fill="url(#${p}rock)" ${O}/>
    <path d="M22 14 L24 28 M32 12 L33 28 M41 11 L42 26" stroke="#3a2a1a" stroke-width="2"/>
    <path d="M18 20 Q20 14 28 13" stroke="#fff" stroke-width="2" fill="none" opacity="0.6"/>
    <circle cx="40" cy="36" r="3" fill="#6ab83a"/>`,
  boulder: (p) => `
    <g stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0.85" stroke-dasharray="5 4">
      <line x1="4" y1="14" x2="20" y2="22"/><line x1="2" y1="28" x2="16" y2="32"/><line x1="6" y1="42" x2="18" y2="40"/>
    </g>
    <path d="M26 16 L44 10 L58 22 L56 42 L42 54 L24 50 L18 32 Z" fill="url(#${p}rock)" ${O}/>
    <path d="M30 22 L40 28 L36 40 M46 20 L48 34" fill="none" stroke="#3a2a1a" stroke-width="2"/>
    <path d="M28 20 Q34 14 44 14" stroke="#fff" stroke-width="2" fill="none" opacity="0.6"/>`,
  spit: (p, color) => `
    <path d="M40 6 C54 24 58 34 52 44 C46 54 32 54 28 44 C24 34 32 22 40 6 Z" fill="url(#${p}${color})" ${O}/>
    <ellipse cx="38" cy="34" rx="3.5" ry="6" fill="#fff" opacity="0.6" transform="rotate(20 38 34)"/>
    <g fill="url(#${p}${color})" ${O} stroke-width="1.6"><circle cx="16" cy="44" r="5"/><circle cx="12" cy="30" r="3"/><circle cx="22" cy="56" r="3"/></g>
    <g stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 4" opacity="0.8"><line x1="6" y1="10" x2="24" y2="22"/></g>`,
  poison: (p) => `
    <path d="M32 4 C46 22 52 32 48 44 C44 56 20 56 16 44 C12 32 18 22 32 4 Z" fill="url(#${p}purple)" ${O}/>
    <circle cx="32" cy="36" r="10" fill="#fff"/>
    <circle cx="28" cy="35" r="2.6" fill="#241208"/><circle cx="36" cy="35" r="2.6" fill="#241208"/>
    <path d="M28 44 L28 48 M32 44 L32 48 M36 44 L36 48" stroke="#241208" stroke-width="2"/>
    <rect x="26" y="42" width="12" height="4" rx="1.5" fill="#fff" ${O} stroke-width="1.4"/>
    <ellipse cx="24" cy="24" rx="3" ry="5" fill="#fff" opacity="0.5" transform="rotate(25 24 24)"/>`,
  clock: (p) => `
    <circle cx="32" cy="34" r="24" fill="url(#${p}gold)" ${O}/>
    <circle cx="32" cy="34" r="18" fill="url(#${p}white)" ${O}/>
    <g stroke="#241208" stroke-width="2.4" stroke-linecap="round">
      <line x1="32" y1="18" x2="32" y2="21"/><line x1="32" y1="47" x2="32" y2="50"/><line x1="16" y1="34" x2="19" y2="34"/><line x1="45" y1="34" x2="48" y2="34"/>
    </g>
    <line x1="32" y1="34" x2="32" y2="22" stroke="#241208" stroke-width="3" stroke-linecap="round"/>
    <line x1="32" y1="34" x2="42" y2="40" stroke="#1a6ad0" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="34" r="3" fill="url(#${p}gold)" ${O} stroke-width="1.4"/>
    <rect x="27" y="4" width="10" height="7" rx="2" fill="url(#${p}gold)" ${O}/>`,
  hourglass: (p) => `
    <rect x="14" y="6" width="36" height="6" rx="2" fill="url(#${p}wood)" ${O}/>
    <rect x="14" y="52" width="36" height="6" rx="2" fill="url(#${p}wood)" ${O}/>
    <path d="M18 12 L46 12 Q46 26 34 32 Q46 38 46 52 L18 52 Q18 38 30 32 Q18 26 18 12 Z" fill="url(#${p}water)" fill-opacity="0.55" ${O}/>
    <path d="M22 16 L42 16 Q40 24 32 30 Q24 24 22 16 Z" fill="url(#${p}gold)"/>
    <path d="M32 32 L32 44" stroke="#f8d060" stroke-width="2"/>
    <path d="M22 50 Q32 40 42 50 Z" fill="url(#${p}gold)"/>
    <path d="M22 14 Q20 24 28 30" stroke="#fff" stroke-width="2" fill="none" opacity="0.7"/>`,
  clockHand: (p) => `
    <circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-width="2" opacity="0.5" stroke-dasharray="3 5"/>
    <g transform="rotate(45 32 32)">
      <path d="M32 2 L38 14 L34 14 L34 50 L30 50 L30 14 L26 14 Z" fill="url(#${p}gold)" ${O}/>
      <circle cx="32" cy="52" r="6" fill="url(#${p}gold)" ${O}/>
      <circle cx="32" cy="52" r="2" fill="#241208"/>
    </g>`,
  upArrows: (p) => `
    <circle cx="32" cy="32" r="24" fill="#fff" opacity="0.18"/>
    <path d="M32 6 L50 26 L40 26 L40 34 L24 34 L24 26 L14 26 Z" fill="url(#${p}gold)" ${O}/>
    <path d="M32 26 L48 44 L39 44 L39 56 L25 56 L25 44 L16 44 Z" fill="url(#${p}fire)" ${O}/>
    <path d="M30 12 L20 24" stroke="#fff" stroke-width="2" opacity="0.8"/>`,
  claws: (p) => `
    <g fill="url(#${p}white)" ${O}>
      <path d="M12 8 Q30 26 22 56 Q20 34 8 12 Z"/>
      <path d="M26 4 Q42 24 36 58 Q32 34 22 8 Z"/>
      <path d="M40 6 Q56 26 50 54 Q46 34 36 10 Z"/>
    </g>
    <g stroke="#e8322a" stroke-width="3" stroke-linecap="round" opacity="0.8"><path d="M20 30 L24 44"/><path d="M34 32 L36 46"/><path d="M48 30 L48 42"/></g>`,
  coin: (p) => `
    <ellipse cx="32" cy="34" rx="22" ry="22" fill="url(#${p}gold)" ${O}/>
    <ellipse cx="32" cy="34" rx="16" ry="16" fill="none" stroke="#a86a0a" stroke-width="2"/>
    <path d="M22 26 L26 20 L30 25 L34 20 L38 25 L42 20 L44 28 L22 28 Z" fill="#fff6c0" ${O} stroke-width="1.6"/>
    <circle cx="27" cy="36" r="2.4" fill="#241208"/><circle cx="37" cy="36" r="2.4" fill="#241208"/>
    <path d="M26 43 Q32 48 38 43" stroke="#241208" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M16 26 Q20 16 30 14" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.8"/>`,
  wheel: (p) => `
    <circle cx="32" cy="32" r="24" fill="url(#${p}wood)" ${O}/>
    <g stroke="#241208" stroke-width="1.6">
      <path d="M32 32 L32 10 A22 22 0 0 1 51 21 Z" fill="#e8322a"/>
      <path d="M32 32 L51 21 A22 22 0 0 1 51 43 Z" fill="#f8d040"/>
      <path d="M32 32 L51 43 A22 22 0 0 1 32 54 Z" fill="#3a9ae0"/>
      <path d="M32 32 L32 54 A22 22 0 0 1 13 43 Z" fill="#62b83a"/>
      <path d="M32 32 L13 43 A22 22 0 0 1 13 21 Z" fill="#9a4ad0"/>
      <path d="M32 32 L13 21 A22 22 0 0 1 32 10 Z" fill="#ff8a2a"/>
    </g>
    <circle cx="32" cy="32" r="5" fill="url(#${p}gold)" ${O}/>
    <path d="M28 2 L36 2 L32 10 Z" fill="url(#${p}steel)" ${O}/>`,
  paw: (p) => `
    <ellipse cx="32" cy="42" rx="14" ry="12" fill="url(#${p}pink)" ${O}/>
    <g fill="url(#${p}pink)" ${O}><ellipse cx="14" cy="28" rx="6" ry="8"/><ellipse cx="25" cy="18" rx="6" ry="8"/><ellipse cx="39" cy="18" rx="6" ry="8"/><ellipse cx="50" cy="28" rx="6" ry="8"/></g>
    <g fill="url(#${p}white)" ${O} stroke-width="1.6"><path d="M12 20 L14 12 L17 20Z"/><path d="M23 10 L25 2 L28 10Z"/><path d="M37 10 L39 2 L42 10Z"/><path d="M48 20 L50 12 L53 20Z"/></g>
    <ellipse cx="27" cy="38" rx="4" ry="3" fill="#fff" opacity="0.5"/>`,
  gourd: (p) => `
    <path d="M26 10 L38 10 L37 18 Q50 24 48 40 Q46 58 32 58 Q18 58 16 40 Q14 24 27 18 Z" fill="url(#${p}wood)" ${O}/>
    <rect x="26" y="4" width="12" height="8" rx="2" fill="url(#${p}red)" ${O}/>
    <path d="M18 34 Q32 38 46 34" fill="none" stroke="#e8c070" stroke-width="3"/>
    <ellipse cx="24" cy="30" rx="3" ry="6" fill="#fff" opacity="0.4" transform="rotate(20 24 30)"/>
    <g fill="#fff"><circle cx="50" cy="12" r="3" opacity="0.8"/><circle cx="56" cy="20" r="2" opacity="0.6"/><circle cx="46" cy="6" r="1.6" opacity="0.6"/></g>`,
  kick: (p) => `
    <g stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0.85"><line x1="6" y1="24" x2="18" y2="26"/><line x1="4" y1="34" x2="16" y2="34"/><line x1="6" y1="44" x2="18" y2="42"/></g>
    <path d="M20 22 Q20 14 30 14 L44 16 Q56 18 56 30 Q56 42 44 44 L28 46 Q20 46 20 38 Z" fill="url(#${p}white)" ${O}/>
    <ellipse cx="44" cy="30" rx="8" ry="9" fill="#2a2a32" ${O}/>
    <g fill="#2a2a32" ${O} stroke-width="1.6"><circle cx="54" cy="20" r="3.5"/><circle cx="57" cy="28" r="3.5"/><circle cx="56" cy="36" r="3.5"/></g>
    <path d="M36 50 L58 50" stroke="#fff6c0" stroke-width="3" stroke-linecap="round"/>`,
  barrel: (p) => `
    <path d="M18 8 Q10 32 18 56 L46 56 Q54 32 46 8 Z" fill="url(#${p}wood)" ${O}/>
    <path d="M13 20 Q32 24 51 20 M12 44 Q32 48 52 44" fill="none" stroke="url(#${p}steel)" stroke-width="4"/>
    <path d="M13 20 Q32 24 51 20 M12 44 Q32 48 52 44" fill="none" stroke="#241208" stroke-width="1"/>
    <path d="M26 10 Q24 32 26 54 M38 10 Q40 32 38 54" stroke="#4a2a0a" stroke-width="1.6" fill="none"/>
    <ellipse cx="32" cy="9" rx="14" ry="3.5" fill="#8a5a2a" ${O}/>
    <path d="M20 14 Q17 30 20 46" stroke="#fff" stroke-width="2" fill="none" opacity="0.5"/>`,
  wave: (p) => `
    <path d="M4 44 Q10 22 28 20 Q44 18 46 32 Q38 26 32 32 Q28 38 36 42 Q46 46 58 34 L60 60 L4 60 Z" fill="url(#${p}water)" ${O}/>
    <path d="M10 42 Q16 28 28 26" stroke="#fff" stroke-width="2.6" fill="none" opacity="0.85"/>
    <g fill="#fff"><circle cx="48" cy="22" r="3"/><circle cx="54" cy="28" r="2"/><circle cx="42" cy="14" r="2"/></g>
    <path d="M8 54 Q20 48 32 54 Q44 60 56 52" stroke="#fff" stroke-width="2" fill="none" opacity="0.6"/>`,
  bamboo: (p) => `
    <rect x="20" y="16" width="24" height="40" rx="4" fill="url(#${p}leaf)" ${O}/>
    <path d="M20 30 L44 30 M20 44 L44 44" stroke="#241208" stroke-width="2"/>
    <ellipse cx="32" cy="16" rx="12" ry="4" fill="#fffaf0" ${O}/>
    <path d="M26 10 Q30 2 36 8 Q42 2 44 10" fill="#fffaf0" ${O} stroke-width="1.6"/>
    <path d="M44 22 Q56 14 58 4 Q48 8 44 18" fill="url(#${p}leaf)" ${O} stroke-width="1.6"/>
    <path d="M24 22 L24 52" stroke="#fff" stroke-width="2" opacity="0.5"/>
    <path d="M10 32 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#fff"/>`,
  spear: (p) => `
    <g transform="rotate(45 32 32)">
      <rect x="30" y="18" width="4" height="44" rx="2" fill="url(#${p}wood)" ${O}/>
      <path d="M32 0 L40 16 L32 22 L24 16 Z" fill="url(#${p}steel)" ${O}/>
      <line x1="32" y1="3" x2="32" y2="19" stroke="#fff" stroke-width="1.4"/>
      <path d="M26 20 L38 20" stroke="#e8322a" stroke-width="4" stroke-linecap="round"/>
    </g>`,
  ghost: (p) => `
    <path d="M14 58 V28 Q14 8 32 8 Q50 8 50 28 V58 L44 52 L38 58 L32 52 L26 58 L20 52 Z" fill="url(#${p}white)" fill-opacity="0.8" ${O} stroke-dasharray="4 3"/>
    <ellipse cx="25" cy="28" rx="4" ry="6" fill="#241208"/><ellipse cx="39" cy="28" rx="4" ry="6" fill="#241208"/>
    <circle cx="26" cy="26" r="1.5" fill="#fff"/><circle cx="40" cy="26" r="1.5" fill="#fff"/>
    <ellipse cx="32" cy="42" rx="4" ry="3" fill="#241208"/>`,
  beak: (p) => `
    <path d="M10 28 Q24 10 44 18 L60 30 L42 36 Q24 44 10 28 Z" fill="url(#${p}gold)" ${O}/>
    <path d="M44 18 L60 30 L42 30 Z" fill="url(#${p}fire)" ${O}/>
    <circle cx="28" cy="24" r="4" fill="#241208"/><circle cx="29" cy="23" r="1.4" fill="#fff"/>
    <path d="M8 48 Q20 38 34 44 Q24 50 14 58 Z" fill="url(#${p}white)" ${O} stroke-width="1.8"/>
    <path d="M14 56 L28 44" stroke="#b8b8c8" stroke-width="1.4"/>`,
  wind: (p) => `
    <g fill="none" stroke-linecap="round">
      <path d="M6 22 H40 Q50 22 50 14 Q50 6 42 6 Q36 6 36 12" stroke="#241208" stroke-width="7"/>
      <path d="M6 22 H40 Q50 22 50 14 Q50 6 42 6 Q36 6 36 12" stroke="#fff" stroke-width="4"/>
      <path d="M4 34 H50 Q60 34 60 44 Q60 54 50 54 Q42 54 42 46" stroke="#241208" stroke-width="7"/>
      <path d="M4 34 H50 Q60 34 60 44 Q60 54 50 54 Q42 54 42 46" stroke="#e8ffd0" stroke-width="4"/>
      <path d="M10 46 H30" stroke="#241208" stroke-width="6"/>
      <path d="M10 46 H30" stroke="#fff" stroke-width="3"/>
    </g>
    <path d="M18 10 Q26 4 30 12 Q22 12 18 10 Z" fill="url(#${p}white)" ${O} stroke-width="1.4"/>`,
  spore: (p, cloud) => `
    ${cloud ? `<path d="M10 40 Q4 30 14 26 Q14 14 28 16 Q34 6 46 14 Q58 14 56 28 Q62 38 50 42 Z" fill="url(#${p}purple)" fill-opacity="0.75" ${O}/>` : ''}
    <path d="M${cloud ? '22 50' : '14 36'} Q${cloud ? '22 36 32 36 Q42 36 42 50' : '14 16 32 16 Q50 16 50 36'} Z" fill="url(#${p}red)" ${O}/>
    <rect x="${cloud ? 28 : 26}" y="${cloud ? 50 : 36}" width="${cloud ? 8 : 12}" height="${cloud ? 8 : 16}" rx="3" fill="url(#${p}white)" ${O}/>
    <g fill="#fff"><circle cx="${cloud ? 28 : 24}" cy="${cloud ? 42 : 24}" r="${cloud ? 2 : 3}"/><circle cx="${cloud ? 36 : 38}" cy="${cloud ? 40 : 22}" r="${cloud ? 1.6 : 2.4}"/><circle cx="${cloud ? 32 : 32}" cy="${cloud ? 46 : 30}" r="${cloud ? 1.4 : 2}"/></g>
    <g fill="#d8a8ff" ${O} stroke-width="1.2"><circle cx="12" cy="${cloud ? 54 : 12}" r="3"/><circle cx="52" cy="${cloud ? 54 : 10}" r="2.5"/><circle cx="54" cy="${cloud ? 8 : 44}" r="2"/><circle cx="8" cy="${cloud ? 12 : 48}" r="2.4"/></g>`,
};

// Sort -> illustration.
const SPELL_ART = {
  pression: (p) => ART.sword(p),
  bond: (p) => ART.jump(p),
  epeeDivine: (p) => ART.holySword(p),
  concentration: (p) => ART.fist(p),
  precipitation: (p) => ART.haste(p),
  poserBombe: (p) => ART.bomb(p),
  entourloupe: (p) => ART.bombSwap(p),
  detonationManuelle: (p) => ART.explosion(p),
  bouclierBombe: (p) => ART.shield(p),
  pulsar: (p) => ART.pulsar(p),
  piqureMotivante: (p) => ART.needle(p),
  protectionCraqueleur: (p) => ART.stoneShield(p),
  soinInvocation: (p) => ART.heart(p),
  dragoflamme: (p) => ART.flame(p),
  dragosoin: (p) => ART.dragonHeart(p),
  morsureBouftou: (p) => ART.fangs(p, false),
  morsureRoyale: (p) => ART.fangs(p, true),
  soinAnimal: (p) => ART.heart(p),
  frappeCraqueleur: (p) => ART.rockFist(p),
  lancerRocher: (p) => ART.boulder(p),
  crachat: (p) => ART.spit(p, 'water'),
  crachatEmpoisonne: (p) => ART.poison(p),
  peauDure: (p) => ART.stoneShield(p),
  horloge: (p) => ART.clock(p),
  ralentissement: (p) => ART.hourglass(p),
  devouement: (p) => ART.upArrows(p),
  aiguille: (p) => ART.clockHand(p),
  momification: (p) => ART.bandage(p),
  griffeFeline: (p) => ART.claws(p),
  pileOuFace: (p) => ART.coin(p),
  roueChance: (p) => ART.wheel(p),
  bondDuFelin: (p) => ART.jump(p),
  coupDeGriffe: (p) => ART.paw(p),
  picole: (p) => ART.gourd(p),
  tirPandatak: (p) => ART.kick(p),
  karcham: (p) => ART.barrel(p),
  vaguePandawa: (p) => ART.wave(p),
  laitDeBambou: (p) => ART.bamboo(p),
  coupDeLance: (p) => ART.spear(p),
  coupDeLanceRoyal: (p) => ART.spear(p),
  invisibilite: (p) => ART.ghost(p),
  coupDeBec: (p) => ART.beak(p),
  bourrasque: (p) => ART.wind(p),
  sporeToxique: (p) => ART.spore(p, false),
  nuageDeSpores: (p) => ART.spore(p, true),
};

// Renvoie l icone peinte d un sort (null si aucune illustration dediee,
// ex. les invocations qui utilisent le portrait 3D de la creature).
export function paintedSpellIcon(spell) {
  const art = SPELL_ART[spell.id];
  if (!art) return null;
  const p = 'si_' + spell.id + '_';
  return frame(spellElement(spell), p, art(p));
}

// Cadre seul (fond d element) pour habiller les portraits d invocation.
export function spellIconFrame(spell, innerHtml = '') {
  const p = 'sf_' + spell.id + '_';
  return frame(spellElement(spell), p, innerHtml);
}
