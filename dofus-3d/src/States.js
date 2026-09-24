import { ELEMENT_LABEL, ELEMENT_CSS } from './Elements.js';

// Etats visibles d un combattant (timeline, infobulle) calcules a partir
// de ses buffs : poison, enracine, stabilise, invisible, bouclier, bonus
// ou malus de PA / PM, degats, critique, renvoi, element du Kwakwa.

const ICONS = {
  poison: (c) => `<path d="M8 1.5 C10.5 5 12.5 7 12.5 10 A4.5 4.5 0 0 1 3.5 10 C3.5 7 5.5 5 8 1.5 Z" fill="${c}"/><circle cx="6.5" cy="9.5" r="1.2" fill="#fff" opacity="0.7"/>`,
  rooted: (c) => `<path d="M8 2 V9 M8 9 L4 14 M8 9 L12 14 M8 11 L8 14.5 M5 5 L8 7 L11 5" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  stabilized: (c) => `<path d="M8 2 V13 M4 6 H12 M3 10 Q8 16 13 10" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="8" cy="3" r="1.6" fill="${c}"/>`,
  invisible: (c) => `<path d="M3 14 V7 Q3 2 8 2 Q13 2 13 7 V14 L11 12.5 L9.5 14 L8 12.5 L6.5 14 L5 12.5 Z" fill="${c}" opacity="0.8"/><circle cx="6.3" cy="7" r="1.1" fill="#222"/><circle cx="9.7" cy="7" r="1.1" fill="#222"/>`,
  shield: (c) => `<path d="M8 1.5 L13.5 3.8 V8 Q13.5 12.5 8 14.5 Q2.5 12.5 2.5 8 V3.8 Z" fill="${c}"/><path d="M5.5 8 L7.4 10 L10.8 6" stroke="#fff" stroke-width="1.5" fill="none"/>`,
  dmgUp: (c) => `<path d="M3 13 L11 5 M9 3 L13 3 L13 7 M3 13 L5 13 L5 11" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  paUp: (c) => `<path d="M8 1.5 L14 8 L8 14.5 L2 8 Z" fill="${c}"/><path d="M8 5 V11 M5 8 H11" stroke="#fff" stroke-width="1.6"/>`,
  paDown: (c) => `<path d="M8 1.5 L14 8 L8 14.5 L2 8 Z" fill="${c}"/><path d="M5 8 H11" stroke="#fff" stroke-width="1.8"/>`,
  pmUp: (c) => `<path d="M8 2 L14 13 H2 Z" fill="${c}"/><path d="M8 6 V11 M5.5 8.5 H10.5" stroke="#fff" stroke-width="1.5"/>`,
  pmDown: (c) => `<path d="M8 2 L14 13 H2 Z" fill="${c}"/><path d="M5.5 9 H10.5" stroke="#fff" stroke-width="1.7"/>`,
  reflect: (c) => `<circle cx="8" cy="8" r="5.5" fill="none" stroke="${c}" stroke-width="2"/><path d="M5 8 H11 M9 6 L11 8 L9 10" stroke="${c}" stroke-width="1.5" fill="none"/>`,
  crit: (c) => `<circle cx="5.5" cy="5.5" r="3" fill="${c}"/><circle cx="10.5" cy="5.5" r="3" fill="${c}"/><circle cx="5.5" cy="10.5" r="3" fill="${c}"/><circle cx="10.5" cy="10.5" r="3" fill="${c}"/>`,
  agile: (c) => `<path d="M2 11 Q6 3 14 4 M9 2 L14 4 L11 8.5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  element: (c) => `<circle cx="8" cy="8" r="5.5" fill="${c}" stroke="#222" stroke-width="1"/><circle cx="6.5" cy="6.5" r="1.8" fill="#fff" opacity="0.6"/>`,
};

export function stateIcon(key, color, size = 14) {
  const f = ICONS[key] || ICONS.element;
  return `<svg class="st-ico" width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">${f(color)}</svg>`;
}

// Liste des etats d un combattant : [{ key, label, color, turns }].
export function fighterStates(f) {
  const out = [];
  if (!f) return out;
  const turnsOf = (b) => b.permanent ? null : Math.max(0, b.duration - 1);
  const push = (key, label, color, b) => {
    const turns = b ? turnsOf(b) : null;
    const prev = out.find(o => o.key === key);
    if (prev) {
      if (turns !== null && (prev.turns === null || turns > prev.turns)) prev.turns = turns;
      return;
    }
    out.push({ key, label, color, turns });
  };
  if (f.currentElement) {
    out.push({ key: 'element', label: `Element ${ELEMENT_LABEL[f.currentElement]}`, color: ELEMENT_CSS[f.currentElement], turns: null });
  }
  for (const b of f.buffs || []) {
    if (b.permanent) continue;
    if (b.dot) push('poison', `Poison ${b.dot.min}-${b.dot.max}`, '#b46ae8', b);
    if (b.rooted) push('rooted', 'Enracine', '#c8a060', b);
    else if (b.stabilized) push('stabilized', 'Stabilise', '#d8c8a0', b);
    if (b.invisible) push('invisible', 'Invisible', '#c8d8ff', b);
    if (b.shield) push('shield', `-${Math.round(b.shield * 100)}% degats subis`, '#5ab8ff', b);
    if (b.damageMult > 0) push('dmgUp', `+${Math.round(b.damageMult * 100)}% degats`, '#ff7a3a', b);
    if (b.bonusPa > 0) push('paUp', `+${b.bonusPa} PA`, '#4a9ae8', b);
    if (b.bonusPa < 0) push('paDown', `${b.bonusPa} PA`, '#4a6fa8', b);
    if (b.bonusPm > 0) push('pmUp', `+${b.bonusPm} PM`, '#3ac06a', b);
    if (b.bonusPm < 0) push('pmDown', `${b.bonusPm} PM`, '#2a8a4a', b);
    if (b.reflect) push('reflect', `Renvoie ${Math.round(b.reflect * 100)}%`, '#b47bdd', b);
    if (b.crit) push('crit', `+${Math.round(b.crit * 100)}% critique`, '#6ad05a', b);
    if (b.fuite || b.tacle) push('agile', [b.fuite ? `+${b.fuite} fuite` : '', b.tacle ? `+${b.tacle} tacle` : ''].filter(Boolean).join(', '), '#ffcf5a', b);
  }
  if (f.pendingPaDebuff) out.push({ key: 'paDown', label: `-${f.pendingPaDebuff} PA au prochain tour`, color: '#4a6fa8', turns: 1 });
  return out;
}

export function statesHtml(f, size = 13, max = 8) {
  return fighterStates(f).slice(0, max).map(st =>
    `<span class="st" title="${st.label}${st.turns !== null ? ` (${st.turns}t)` : ''}">${stateIcon(st.key, st.color, size)}${st.turns ? `<b>${st.turns}</b>` : ''}</span>`
  ).join('');
}
