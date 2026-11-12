// Fiche d entrainement : presente la classe choisie (role, facon de
// jouer, sorts regroupes par type) et les commandes de base.
import { DEFS } from './Fighter.js';
import { SPELLS, spellEffectLines } from './Spells.js';
import { SPELL_GROUPS, spellGroup } from './Hud.js';

const TIPS = {
  iop: 'Guerrier de melee. Bondis au contact, renforce-toi (Concentration, Precipitation) puis enchaine les coups d epee. Fragile a distance : ne laisse pas l ennemi te fuir.',
  osamodas: 'Invocateur. Tes creatures font le travail : le Tofu harcele, le Bouftou tacle, le Craqueleur encaisse, le Dragounet tire de loin. Designe une Proie au Fouet pour que toute la meute la vise, et soigne ou dope tes invocations.',
  roublard: 'Artificier. Pose des bombes pres des ennemis, deplace-les, puis fais-les exploser en chaine. Plus une bombe attend, plus elle fait mal. Attention : les explosions touchent aussi tes allies.',
  xelor: 'Mage du temps. Tu retires des PA aux ennemis pour les empecher d agir et tu te teleportes. Peu de degats bruts, mais un ennemi sans PA ne fait rien.',
  ecaflip: 'Joueur de hasard. Des coups puissants mais incertains, un chaton pour t epauler et des bonds pour rester mobile. Tente ta chance au bon moment.',
  pandawa: 'Lutteur. Tu portes et lances allies ou ennemis, tu encaisses bien et tu affaiblis les resistances adverses. Ideal pour replacer le combat a ton avantage.',
  eniripsa: 'Soigneur. Tu gardes l equipe en vie et renforces tes allies ; tes mots blessent aussi a distance. Reste derriere et soigne avant qu il ne soit trop tard.',
};

export function showTutorial(classId) {
  const def = DEFS[classId];
  if (!def) return;
  const old = document.getElementById('tutorial-overlay');
  if (old) old.remove();
  const groups = {};
  for (const id of def.spellIds) {
    const sp = SPELLS[id];
    if (!sp) continue;
    (groups[spellGroup(sp)] = groups[spellGroup(sp)] || []).push(sp);
  }
  const touch = document.body.classList.contains('touch-ui');
  const spellsHtml = Object.keys(SPELL_GROUPS).filter(g => groups[g]).map(g => `
    <div class="tu-group" style="--sg:${SPELL_GROUPS[g].color}">
      <div class="tu-gl">${SPELL_GROUPS[g].label}</div>
      ${groups[g].map(sp => `<div class="tu-spell"><b>${sp.name}</b> <span>${sp.apCost} PA</span><br>${spellEffectLines(sp).slice(0, 2).join(' - ') || sp.desc}</div>`).join('')}
    </div>`).join('');
  const el = document.createElement('div');
  el.id = 'tutorial-overlay';
  el.innerHTML = `
    <div class="tu-card">
      <div class="tu-title">Entrainement : ${def.name} <span>${def.role}</span></div>
      <div class="tu-tip">${TIPS[classId] || ''}</div>
      <div class="tu-h">Comment jouer</div>
      <ul class="tu-list">
        <li>Place ton heros sur une case bleue puis valide avec <b>PRET</b>.</li>
        <li>${touch ? 'Touche' : 'Clique'} une case verte pour te deplacer (cout en <b>PM</b>).</li>
        <li>Choisis un sort dans la barre (cout en <b>PA</b>), ${touch ? 'touche une case pour viser puis retouche-la pour lancer' : 'puis clique la case visee'}.</li>
        <li>${touch ? 'Appui long' : 'Survol'} sur un sort : son detail complet. <b>Fin de tour</b> passe la main.</li>
        <li>Coller un ennemi le <b>tacle</b> : il perd des PM s il veut s eloigner.</li>
      </ul>
      <div class="tu-h">Tes sorts</div>
      <div class="tu-spells">${spellsHtml}</div>
      <button class="tu-go" type="button">C EST PARTI</button>
    </div>`;
  document.body.appendChild(el);
  el.querySelector('.tu-go').addEventListener('click', () => el.remove());
}
