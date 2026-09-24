// Icones SVG des objets : chaque panoplie a son propre dessin pour chaque
// emplacement (forme de base aux couleurs de la panoplie + motif propre :
// laine et cornes du Bouftou, yeux du Crapaud, crane du Chafer...), sur un
// fond borde de la couleur de rarete.

const RARITY_COLOR = { commun: '#c8ccd0', rare: '#4ab0ff', epique: '#c46aff', legendaire: '#ffb02a' };

const PAL = {
  bouftou: ['#f4efe4', '#8a6a3a', '#d8c8a8'],
  wabbit: ['#f6f0ff', '#f07a1a', '#5aa832'],
  crapaud: ['#5ab84a', '#2a5a1a', '#f2e060'],
  tofu: ['#ffd23a', '#e8762a', '#fff0a0'],
  chafer: ['#e8e0c8', '#3a3430', '#8a1a1a'],
  champignon: ['#c8322a', '#f2e8d0', '#8a5a3a'],
  craqueleur: ['#9a8a78', '#7af0ff', '#5a9a32'],
  kwakwa: ['#3a3450', '#ff7a2a', '#ffc06a'],
  minotoror: ['#7a4a2a', '#e8c14a', '#f0e6c8'],
};

const O = 'stroke="#241208" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const o1 = 'stroke="#241208" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';

// Formes de base par emplacement.
function base(slot, c, a) {
  switch (slot) {
    case 'coiffe': return `<path d="M13 42 Q13 18 32 17 Q51 18 51 42 Z" fill="${c}" ${O}/><path d="M8 43 Q32 36 56 43 Q55 50 32 50 Q9 50 8 43 Z" fill="${a}" ${O}/>`;
    case 'cape': return `<path d="M21 11 L43 11 L51 53 Q32 59 13 53 Z" fill="${c}" ${O}/><path d="M21 11 Q32 19 43 11" fill="none" ${O}/><path d="M17 50 Q32 55 47 50" stroke="${a}" stroke-width="3" fill="none"/>`;
    case 'amulette': return `<path d="M17 9 Q32 36 47 9" fill="none" stroke="#241208" stroke-width="5"/><path d="M17 9 Q32 36 47 9" fill="none" stroke="${a}" stroke-width="2.5"/><circle cx="32" cy="43" r="12" fill="${c}" ${O}/>`;
    case 'anneau': return `<circle cx="32" cy="40" r="14" fill="none" stroke="#241208" stroke-width="9"/><circle cx="32" cy="40" r="14" fill="none" stroke="${a}" stroke-width="5"/><circle cx="32" cy="24" r="8" fill="${c}" ${O}/>`;
    default: return `<path d="M17 11 L31 11 L31 39 L48 43 Q53 51 45 54 L17 54 Z" fill="${c}" ${O}/><path d="M15 13 L33 13 L33 21 L15 21 Z" fill="${a}" ${O}/><path d="M17 50 L50 50" stroke="${a}" stroke-width="3"/>`;
  }
}

// Point d ancrage du motif selon l emplacement : [x, y, echelle].
const ANCHOR = { coiffe: [32, 26, 1], cape: [32, 32, 1], amulette: [32, 43, 0.8], anneau: [32, 24, 0.55], bottes: [24, 17, 0.6] };

function motif(fam, slot, p) {
  const [c, a, t] = p;
  const [x, y, s] = ANCHOR[slot] || ANCHOR.cape;
  const g = (inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
  switch (fam) {
    case 'bouftou':
      if (slot === 'coiffe') return `<path d="M14 30 q-8 -2 -6 -10 q3 -6 9 -2 q2 4 -2 5" fill="none" stroke="${a}" stroke-width="4"/><path d="M50 30 q8 -2 6 -10 q-3 -6 -9 -2 q-2 4 2 5" fill="none" stroke="${a}" stroke-width="4"/>` + g(`<circle cx="-7" cy="-4" r="6" fill="#fff" ${o1}/><circle cx="6" cy="-6" r="7" fill="#fff" ${o1}/><circle cx="0" cy="3" r="6" fill="#fff" ${o1}/>`);
      return g(`<circle cx="-7" cy="0" r="6" fill="#fff" ${o1}/><circle cx="6" cy="-3" r="7" fill="#fff" ${o1}/><circle cx="1" cy="6" r="6" fill="#fff" ${o1}/><path d="M-4 -12 q-6 2 -3 8" fill="none" stroke="${a}" stroke-width="3"/>`);
    case 'wabbit':
      if (slot === 'coiffe') return `<ellipse cx="24" cy="12" rx="5" ry="12" fill="${c}" ${o1} transform="rotate(-14 24 12)"/><ellipse cx="24" cy="12" rx="2.3" ry="8" fill="#f5a0b8" transform="rotate(-14 24 12)"/><ellipse cx="40" cy="12" rx="5" ry="12" fill="${c}" ${o1} transform="rotate(14 40 12)"/><ellipse cx="40" cy="12" rx="2.3" ry="8" fill="#f5a0b8" transform="rotate(14 40 12)"/>`;
      return g(`<path d="M-4 -8 L6 -8 L1 14 Z" fill="${a}" ${o1}/><path d="M1 -8 L-3 -15 M1 -8 L1 -16 M1 -8 L5 -15" stroke="${t}" stroke-width="2.4" stroke-linecap="round"/>`);
    case 'crapaud':
      return g(`<circle cx="-8" cy="-4" r="7" fill="#fff" ${o1}/><circle cx="8" cy="-4" r="7" fill="#fff" ${o1}/><circle cx="-7" cy="-3" r="3.5" fill="#1a1020"/><circle cx="9" cy="-3" r="3.5" fill="#1a1020"/><path d="M-9 7 Q0 13 9 7" fill="none" stroke="#241208" stroke-width="2"/><circle cx="-12" cy="8" r="2" fill="${t}"/><circle cx="12" cy="9" r="2" fill="${t}"/>`);
    case 'tofu':
      return g(`<path d="M0 8 Q-12 -4 -7 -16 Q-2 -6 0 8 Z" fill="${c}" ${o1}/><path d="M0 8 Q0 -10 5 -18 Q7 -4 0 8 Z" fill="${t}" ${o1}/><path d="M0 8 Q10 -2 13 -12 Q9 0 0 8 Z" fill="${a}" ${o1}/>`);
    case 'chafer':
      return g(`<path d="M-9 -2 Q-9 -13 0 -13 Q9 -13 9 -2 Q9 4 5 5 L5 9 L-5 9 L-5 5 Q-9 4 -9 -2 Z" fill="#f4eed8" ${o1}/><circle cx="-4" cy="-3" r="2.8" fill="${a}"/><circle cx="4" cy="-3" r="2.8" fill="${a}"/><path d="M-2 9 V6 M2 9 V6" stroke="#241208" stroke-width="1.2"/><path d="M-14 12 L14 -14" stroke="#f4eed8" stroke-width="3" opacity="0.8"/>`);
    case 'champignon':
      if (slot === 'coiffe') return `<circle cx="22" cy="28" r="4" fill="${a}"/><circle cx="33" cy="22" r="4.5" fill="${a}"/><circle cx="43" cy="31" r="3.5" fill="${a}"/><circle cx="30" cy="36" r="3" fill="${a}"/>`;
      return g(`<path d="M-12 0 Q-12 -13 0 -13 Q12 -13 12 0 Z" fill="${c}" ${o1}/><circle cx="-5" cy="-6" r="2.4" fill="${a}"/><circle cx="4" cy="-8" r="2.8" fill="${a}"/><rect x="-4" y="0" width="8" height="10" rx="2" fill="${a}" ${o1}/>`);
    case 'craqueleur':
      return g(`<path d="M-11 6 L-7 -10 L-3 6 Z" fill="${a}" ${o1}/><path d="M-3 6 L1 -16 L6 6 Z" fill="${a}" ${o1}/><path d="M5 6 L9 -7 L12 6 Z" fill="${a}" ${o1}/><path d="M-13 6 L13 6 L10 11 L-10 11 Z" fill="${c}" ${o1}/>`);
    case 'kwakwa':
      return g(`<path d="M-10 6 Q-12 -8 -6 -16 Q-4 -4 -2 6 Z" fill="${a}" ${o1}/><path d="M-3 6 Q-3 -12 3 -19 Q4 -6 3 6 Z" fill="${t}" ${o1}/><path d="M3 6 Q8 -8 13 -13 Q10 -2 9 6 Z" fill="${a}" ${o1}/>`);
    case 'minotoror':
      return g(`<path d="M-6 0 Q-16 -2 -16 -14 Q-10 -8 -4 -6" fill="${t}" ${o1}/><path d="M6 0 Q16 -2 16 -14 Q10 -8 4 -6" fill="${t}" ${o1}/><circle cx="0" cy="4" r="5" fill="none" stroke="${a}" stroke-width="3"/>`);
    default:
      return '';
  }
}

export function itemIcon(it, size = 48) {
  const p = PAL[it.family] || PAL.bouftou;
  const rc = RARITY_COLOR[it.rarity] || RARITY_COLOR.commun;
  const shine = it.rarity === 'legendaire'
    ? `<path d="M50 8 L52 13 L57 14 L52 16 L50 21 L48 16 L43 14 L48 13 Z" fill="#fff6c8"/>` : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="60" height="60" rx="10" fill="#1d2130" stroke="${rc}" stroke-width="3"/>
    <rect x="6" y="6" width="52" height="52" rx="8" fill="${rc}" opacity="0.14"/>
    ${base(it.slot, p[0], p[1])}
    ${motif(it.family, it.slot, p)}
    ${shine}
  </svg>`;
}

// Petit embleme de panoplie (en-tetes de l inventaire).
export function setEmblem(family, size = 26) {
  const p = PAL[family] || PAL.bouftou;
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 3 L57 13 L57 33 Q57 52 32 61 Q7 52 7 33 L7 13 Z" fill="${p[0]}" ${O}/>
    ${motif(family, 'cape', p)}
  </svg>`;
}
