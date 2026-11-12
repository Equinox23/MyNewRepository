// ===========================================================================
// Carte du monde (mode Aventure) : chaque region abrite une famille de
// monstres, avec sa tranche de niveaux, ses rencontres (du groupe de
// sbires au repaire des chefs) et son donjon. Le joueur compose son
// equipe puis choisit librement ou aller combattre.
// But du jeu : vaincre les gardiens des 9 donjons.
// ===========================================================================

import { MONSTER_FAMILIES, COMBAT_FAMILY } from './Bestiary.js';
import { DUNGEONS, dungeonClears, dungeonUnlocked } from './Adventure.js';
import { DEFS } from './Fighter.js';
import { getHero } from './Leveling.js';
import { getBestTier } from './Progress.js';

// Position des regions sur la carte, en % : [paysage x, y, portrait x, y].
const ZONES = [
  { combatId: 'bouftou', name: 'Prairie des Bouftous', pos: [12, 70, 24, 90], color: '#7dbb4a' },
  { combatId: 'wabbit', name: 'Terrier des Wabbits', pos: [25, 38, 66, 81], color: '#a9d05c' },
  { combatId: 'crapaud', name: 'Mare aux Crapauds', pos: [39, 72, 28, 69], color: '#4fb39a' },
  { combatId: 'tofu', name: 'Falaises des Tofus', pos: [49, 28, 72, 59], color: '#d9b76a' },
  { combatId: 'chafer', name: 'Cimetiere des Chafers', pos: [61, 62, 28, 48], color: '#8f86a8' },
  { combatId: 'champignon', name: 'Marais des Champignons', pos: [73, 84, 70, 38], color: '#5f8f7a' },
  { combatId: 'craqueleurLegendaire', name: 'Monts des Craqueleurs', pos: [77, 34, 27, 27], color: '#b08a62' },
  { combatId: 'kwakwa', name: 'Canopee des Kwaks', pos: [89, 60, 71, 18], color: '#58b86a' },
  { combatId: 'minotoror', name: 'Labyrinthe du Minotoror', pos: [90, 16, 46, 7], color: '#b0584a' },
];
for (const z of ZONES) {
  z.family = COMBAT_FAMILY[z.combatId];
  z.members = MONSTER_FAMILIES[z.family].members;
  z.dungeon = DUNGEONS.find(d => d.family === z.family);
  z.dungeonIndex = DUNGEONS.indexOf(z.dungeon);
  z.minLevel = DEFS[z.members[0]].level;
  z.maxLevel = DEFS[z.members[3]].level;
}
export const WORLD_ZONES = ZONES;

export function dungeonsCleared() {
  return DUNGEONS.filter(d => dungeonClears(d.id) > 0).length;
}

function diffInfo(diff) {
  if (diff <= -3) return { label: 'Facile', color: '#8fd0ff' };
  if (diff <= 1) return { label: 'Adapte', color: '#9ad85a' };
  if (diff <= 4) return { label: 'Difficile', color: '#ffcf5a' };
  return { label: 'Tres dur', color: '#ff6a5a' };
}

function mapSvg(portrait) {
  const P = (z) => portrait ? [z.pos[2], z.pos[3]] : [z.pos[0], z.pos[1]];
  const rx = portrait ? 21 : 12, ry = portrait ? 10 : 19;
  const land = ZONES.map(z => { const [x, y] = P(z); return `<ellipse cx="${x}" cy="${y}" rx="${rx * 1.25}" ry="${ry * 1.25}"/>`; }).join('');
  const patches = ZONES.map(z => { const [x, y] = P(z); return `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.72}" ry="${ry * 0.72}" fill="${z.color}" opacity="0.85"/>`; }).join('');
  const pts = ZONES.map(z => P(z).join(',')).join(' ');
  return `<svg class="wm-bg" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wmSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7fa8"/><stop offset="1" stop-color="#1b4f78"/></linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#wmSea)"/>
    <g fill="#8fd3e8" opacity="0.35" transform="translate(0.6,0.9)">${land.replace(/rx="([\d.]+)" ry="([\d.]+)"/g, (m, a, b) => `rx="${a * 1.08}" ry="${b * 1.08}"`)}</g>
    <g fill="#e8d59a">${land}</g>
    <g fill="#8cc457">${land.replace(/rx="([\d.]+)" ry="([\d.]+)"/g, (m, a, b) => `rx="${a * 0.9}" ry="${b * 0.9}"`)}</g>
    ${patches}
    <polyline points="${pts}" fill="none" stroke="#f6e7b4" stroke-width="0.9" stroke-dasharray="1.6 1.6" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:3px" opacity="0.9"/>
  </svg>`;
}

// Affiche la carte dans le menu. `menu` fournit : stageEl, subEl, stepsEl,
// selection, tierOptions(), heroLevelForTiers(), onStart, audio.
export function renderWorld(menu, h) {
  const sel = menu.worldSel || (menu.worldSel = { zone: null, kind: null, tier: 1 });
  const team = menu.selection.classIds;
  const lv = team.length ? menu.heroLevelForTiers() : 1;
  const portrait = window.innerHeight > window.innerWidth;
  const cleared = dungeonsCleared();
  menu.subEl.innerHTML = `Objectif : vaincre les gardiens des 9 donjons <span class="menu-prog">${cleared} / ${DUNGEONS.length}</span>`;
  menu.stepsEl.innerHTML = '';

  const teamHtml = h.classOptions.map(o => {
    const on = team.includes(o.id);
    return `<button class="wm-hero${on ? ' on' : ''}" data-id="${o.id}" title="${o.name}">
      ${h.classIcon(o)}<span class="wm-lv">${getHero(o.id).level}</span></button>`;
  }).join('');

  const nodes = ZONES.map((z, i) => {
    const d = diffInfo(z.minLevel - lv);
    const done = dungeonClears(z.dungeon.id) > 0;
    const x = portrait ? z.pos[2] : z.pos[0], y = portrait ? z.pos[3] : z.pos[1];
    return `<button class="wm-node${sel.zone === i ? ' sel' : ''}" data-zone="${i}" style="left:${x}%;top:${y}%;--ring:${d.color}">
      <span class="wm-face">${h.monsterIcon(z.members[0])}</span>
      ${done ? '<span class="wm-done">&#10003;</span>' : ''}
      <span class="wm-name">${z.name.replace(/^.* (des|aux|du) /, '')}</span>
      <span class="wm-range">Niv. ${z.minLevel}-${z.maxLevel}</span>
    </button>`;
  }).join('');

  let panel = '<div class="wm-hint">Compose ton equipe (1 a 3 heros), puis touche une region de la carte.</div>';
  if (sel.zone !== null) {
    const z = ZONES[sel.zone];
    menu.selection.combatId = z.combatId;
    const tiers = team.length ? menu.tierOptions() : [];
    const best = getBestTier(z.combatId);
    const dOpen = dungeonUnlocked(z.dungeonIndex);
    const dd = diffInfo(z.dungeon.level - lv);
    const tierBtns = tiers.map((t, i) => {
      const n = i + 1;
      const cls = [n <= best ? 'won' : '', !t.available ? 'locked' : '', sel.kind === 'tier' && sel.tier === n ? 'sel' : '', t.recommended ? 'rec' : ''].join(' ');
      return `<button class="wm-tier ${cls}" data-tier="${n}" ${t.available ? '' : 'disabled'}>${n}</button>`;
    }).join('');
    let detail = '';
    if (sel.kind === 'tier' && tiers[sel.tier - 1]) {
      const t = tiers[sel.tier - 1];
      detail = `<div class="wm-detail"><div class="wm-faces">${t.faces.map(id => h.monsterIcon(id)).join('')}</div><div><b>Rencontre ${sel.tier}</b><br>${t.desc}</div></div>`;
    } else if (sel.kind === 'dungeon') {
      detail = `<div class="wm-detail"><div class="wm-faces">${h.monsterIcon(z.dungeon.boss)}</div><div><b>${z.dungeon.name}</b><br>${z.dungeon.rooms.length} salles sans soin complet, boss ${DEFS[z.dungeon.boss].name} niv. ${z.dungeon.level} <span style="color:${dd.color}">(${dd.label})</span>. Un coffre attend au bout. ${z.dungeon.desc}</div></div>`;
    }
    panel = `
      <div class="wm-ptitle">${z.name} <span>Niv. ${z.minLevel} a ${z.maxLevel}</span></div>
      <div class="wm-evo">${z.members.filter((m, i, a) => a.indexOf(m) === i).map(id => `<span class="wm-evo-i">${h.monsterIcon(id)}<i>${DEFS[id].name}<br>niv. ${DEFS[id].level}</i></span>`).join('<span class="wm-arrow">&#9654;</span>')}</div>
      <div class="wm-row"><span class="wm-rl">Rencontres</span><div class="wm-tiers">${tierBtns || '<i>Choisis au moins un heros</i>'}</div></div>
      <div class="wm-row"><button class="wm-dungeon${sel.kind === 'dungeon' ? ' sel' : ''}" ${dOpen && team.length ? '' : 'disabled'}>
        ${dOpen ? `Donjon : ${DEFS[z.dungeon.boss].name}${dungeonClears(z.dungeon.id) ? ' (vaincu)' : ''}` : 'Donjon verrouille : termine le donjon precedent'}</button></div>
      ${detail}`;
  }

  menu.stageEl.innerHTML = `
    <div class="wm-team"><span class="wm-tl">Equipe</span>${teamHtml}</div>
    <div class="wm-wrap">
      <div class="wm-map">${mapSvg(portrait)}${nodes}</div>
      <div class="wm-panel">${panel}</div>
    </div>`;

  const click = (selr, fn) => menu.stageEl.querySelectorAll(selr).forEach(b => b.addEventListener('click', () => { menu.audio && menu.audio.sfx('uiSelect'); fn(b); renderWorld(menu, h); }));
  click('.wm-hero', (b) => {
    const id = b.dataset.id, i = team.indexOf(id);
    if (i >= 0) team.splice(i, 1);
    else if (team.length < 3) team.push(id);
    sel.kind = null;
  });
  click('.wm-node', (b) => { sel.zone = +b.dataset.zone; sel.kind = null; });
  click('.wm-tier', (b) => { sel.kind = 'tier'; sel.tier = +b.dataset.tier; });
  click('.wm-dungeon', () => { sel.kind = 'dungeon'; });

  menu.backBtn.style.visibility = 'visible';
  menu.grimoireBtn.style.display = '';
  const ready = team.length > 0 && sel.zone !== null && sel.kind;
  menu.nextBtn.style.display = ready ? '' : 'none';
  menu.nextBtn.textContent = sel.kind === 'dungeon' ? 'ENTRER' : 'COMBATTRE';
  menu.nextBtn.classList.add('fight');
  menu.nextBtn.classList.remove('primary');
}

// Lance le combat choisi sur la carte.
export function startFromWorld(menu) {
  const sel = menu.worldSel;
  if (!sel || sel.zone === null || !sel.kind || !menu.selection.classIds.length) return false;
  const z = ZONES[sel.zone];
  if (sel.kind === 'dungeon') {
    menu.onStart({ playerClasses: menu.selection.classIds.slice(), adventure: { dungeonId: z.dungeon.id } });
  } else {
    menu.onStart({ playerClasses: menu.selection.classIds.slice(), combatId: z.combatId, tier: sel.tier });
  }
  return true;
}
