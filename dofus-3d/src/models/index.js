import * as THREE from 'three';
import { buildIop } from './iop.js';
import { buildBouftou } from './bouftou.js';
import { buildBouftouRoyal } from './bouftouRoyal.js';
import { buildOsamodas } from './osamodas.js';
import { buildCraqueleur } from './craqueleur.js';
import { buildCrapaud } from './crapaud.js';
import { buildCrapaudChef } from './crapaudChef.js';
import { buildRoublard } from './roublard.js';
import { buildBombeRoublard } from './bombeRoublard.js';
import { buildDragounetRouge } from './dragounetRouge.js';
import { buildChatonBlanc } from './chatonBlanc.js';
import { buildPandawa } from './pandawa.js';
import { buildEniripsa } from './eniripsa.js';
import { buildWabbit, buildWaWabbit } from './wabbit.js';
import { buildXelor } from './xelor.js';
import { buildEcaflip } from './ecaflip.js';
import { buildChafer } from './chafer.js';
import { buildChaferRoyal } from './chaferRoyal.js';
import { buildTofu } from './tofu.js';
import { buildTofuRoyal } from './tofuRoyal.js';
import { buildChampignon } from './champignon.js';
import { buildChampignonRoyal } from './champignonRoyal.js';
import { buildCraqueleurLegendaire, buildCraqueleurSauvage, buildKwakwa, buildMinotoror } from './bosses.js';
import { VARIANTS, buildVariant } from './variants.js';
export { VARIANTS };

// Registre unique des modeles (combat, portraits, timeline).
export const BUILDERS = {
  iop: buildIop,
  osamodas: buildOsamodas,
  roublard: buildRoublard,
  xelor: buildXelor,
  ecaflip: buildEcaflip,
  pandawa: buildPandawa,
  eniripsa: buildEniripsa,
  bouftou: buildBouftou,
  bouftouRoyal: buildBouftouRoyal,
  bouftouInvoc: () => { const g = new THREE.Group(); const b = buildBouftou(); b.scale.setScalar(0.85); g.add(b); return g; },
  craqueleur: buildCraqueleur,
  crapaud: buildCrapaud,
  crapaudChef: buildCrapaudChef,
  bombeRoublard: buildBombeRoublard,
  dragounetRouge: buildDragounetRouge,
  chatonBlanc: buildChatonBlanc,
  wabbit: buildWabbit,
  waWabbit: buildWaWabbit,
  chafer: buildChafer,
  chaferRoyal: buildChaferRoyal,
  tofu: buildTofu,
  tofuRoyal: buildTofuRoyal,
  champignon: buildChampignon,
  champignonRoyal: buildChampignonRoyal,
  craqueleurSauvage: buildCraqueleurSauvage,
  craqueleurLegendaire: buildCraqueleurLegendaire,
  kwakwa: buildKwakwa,
  minotoror: buildMinotoror,
};
for (const id of Object.keys(VARIANTS)) BUILDERS[id] = () => buildVariant(id);
