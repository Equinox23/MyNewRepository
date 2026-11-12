// Fiche d entrainement : presente la classe choisie (role, facon de
// jouer, sorts regroupes par type) et les commandes de base.
import { DEFS } from './Fighter.js';
import { SPELLS, spellEffectLines } from './Spells.js';
import { SPELL_GROUPS, spellGroup } from './Hud.js';

const TIPS = {
  iop: 'Guerrier de melee. Chaque Pression, Bond ou Intimidation te donne 1 Puissance (max 5) : depense-la d un coup avec Epee Divine, ou garde-la pour une Colere de Iop devastatrice. Precipitation t offre le tour d explosion. Ta faiblesse : presque rien a distance, ne laisse pas l ennemi te fuir.',
  osamodas: 'Invocateur. Tes creatures font le travail : le Tofu harcele, le Bouftou tacle, le Craqueleur encaisse, le Dragounet tire de loin. Designe une Proie au Fouet pour que toute la meute la vise, et soigne ou dope tes invocations. Ta faiblesse : peu mobile, ne te laisse pas coincer au contact.',
  roublard: 'Artificier. Pose des bombes : deux bombes alignees tendent un mur de feu entre elles, et plus elles explosent en chaine, plus le combo fait mal (+25% par bombe). Amene les ennemis dedans avec Pulsar (pousse) et Aimantation (attire vers une bombe). Ta faiblesse : il te faut un tour de preparation, et les explosions touchent aussi tes allies.',
  xelor: 'Mage du temps. Tu retires des PA aux ennemis (jusqu a 60% par tour) pour les empecher d agir. Teleportation echange ta place avec un ennemi et Rembobinage le renvoie a sa case de depart : il passe en Telefrag, et ton prochain sort sur lui frappe +50% et te rend 2 PA. Ta faiblesse : peu de degats bruts et peu de PV.',
  ecaflip: 'Joueur de hasard. Pile ou Face et Tout ou Rien sont des paris : perdus, ils te donnent de la Veine (+10% de reussite par point, max 5) ; gagnes, la Veine retombe a zero. Quand la chance te boude, depense ta Veine dans un Rekop d autant plus violent. Ta faiblesse : aucune defense et des tours tres inegaux.',
  pandawa: 'Lutteur. A jeun, tu places le combat : Karcham attrape un combattant adjacent, Chamrak le lance (degats a l atterrissage), Vulnerabilite fait subir +20% de degats. Picole te rend Saoul : tu frappes plus fort, tu encaisses mieux et tu craches ton Souffle Alcoolise, mais tu ne peux plus porter ; Lait de Bambou te dessaoule. Ta faiblesse : lent et presque sans attaque a distance.',
  eniripsa: 'Soigneuse. Tes mots offensifs chargent ta Ferveur (max 4), qui renforce ton prochain soin de 20% par point : attaque d abord, soigne ensuite. Mot Vampirique marque un ennemi : tous ceux qui le frappent recuperent des PV. Ta faiblesse : tres fragile, ton seul recours au contact est Mot de Frayeur.',
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
