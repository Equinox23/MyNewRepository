import { spellElement, ELEMENTS } from './SpellIcons.js';

// ===========================================================================
// Elements de degats et resistances (facon Dofus).
//  - Chaque sort offensif a un element : feu, eau, terre, air ou neutre.
//  - Chaque combattant a une resistance (en %) par element : positive, il
//    encaisse moins ; negative, il est vulnerable.
//  - Les poisons / spores comptent comme du neutre, les bombes comme du feu.
// ===========================================================================

export const DAMAGE_ELEMENTS = ['feu', 'eau', 'terre', 'air', 'neutre'];

export const ELEMENT_LABEL = {
  feu: 'Feu', eau: 'Eau', terre: 'Terre', air: 'Air', neutre: 'Neutre',
};

// Couleurs CSS (texte / pastilles).
export const ELEMENT_CSS = {
  feu: '#ff8a3a', eau: '#5ab8ff', terre: '#d8a060', air: '#8ae04a', neutre: '#d8dce0',
};

// Element oppose (utilise par le Kwakwa quand il change d element).
export const OPPOSITE = { feu: 'eau', eau: 'feu', terre: 'air', air: 'terre', neutre: 'neutre' };

// Element de degats d un sort (les elements "non offensifs" du registre
// des icones sont ramenes a un element de degats).
export function damageElementOf(spell, caster) {
  if (spell && spell.dynamicElement && caster && caster.currentElement) return caster.currentElement;
  const el = spellElement(spell);
  if (DAMAGE_ELEMENTS.includes(el)) return el;
  return 'neutre';
}

export function elementHex(el) {
  return (ELEMENTS[el] || ELEMENTS.neutre).hex;
}

// Petite pastille SVG d element (pour les infobulles et la timeline).
export function elementIcon(el, size = 14) {
  const c = ELEMENT_CSS[el] || '#ccc';
  const paths = {
    feu: `<path d="M8 1.5 C10 4 12 5.5 12 9 A4 4 0 0 1 4 9 C4 7 5 6 6 5 C6 7 7 7.5 7.5 7.5 C7.5 5 7 3.5 8 1.5 Z" fill="${c}" stroke="#2a1206" stroke-width="1"/>`,
    eau: `<path d="M8 1.5 C10 5 12.5 7 12.5 10 A4.5 4.5 0 0 1 3.5 10 C3.5 7 6 5 8 1.5 Z" fill="${c}" stroke="#0a1a3a" stroke-width="1"/>`,
    terre: `<path d="M2.5 12 L4.5 6 L8 3.5 L12 6 L13.5 12 Z" fill="${c}" stroke="#2a1606" stroke-width="1"/><path d="M6 8 L8 6.5 L10 8" stroke="#2a1606" stroke-width="0.8" fill="none"/>`,
    air: `<path d="M2 6 H10 A2 2 0 1 0 8 4 M2 9 H12 A2 2 0 1 1 10 11 M3 12 H7" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    neutre: `<path d="M8 2 L9.6 6.2 L14 6.4 L10.6 9.2 L11.8 13.5 L8 11 L4.2 13.5 L5.4 9.2 L2 6.4 L6.4 6.2 Z" fill="${c}" stroke="#2a2c30" stroke-width="1"/>`,
  };
  return `<svg class="el-ico" width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">${paths[el] || paths.neutre}</svg>`;
}
