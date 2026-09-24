# Dofus 3D — Proto

Proto Three.js du jeu Dofus Battle en 3D. **Version 1 minimale** : on
choisit un personnage, on l'ancre sur une grille 15x15 iso 3D, on tape une
case pour s'y deplacer (BFS pathfinding + animation).

Pas de combat ni d'ennemis pour l instant : on valide le rendu, le ciblage
et le pathfinding avant d'ajouter le reste.

## Lancer le jeu

Servi par GitHub Pages :

```
https://equinox23.github.io/MyNewRepository/dofus-3d/
```

En local :

```bash
cd dofus-3d && python3 -m http.server 8080
# puis http://localhost:8080/
```

(Modules ES, donc obligatoirement par HTTP, pas file://)

## Jouer hors ligne / installer l application

Le jeu est une **PWA** : aucune dependance externe (Three.js et les
polices sont dans `vendor/`), et un service worker (`sw.js`) met tout le
jeu en cache a la premiere visite.

- **Telephone** : ouvrir le jeu une fois avec internet, puis menu du
  navigateur -> *Ajouter a l ecran d accueil* (Safari : bouton Partager).
  L icone Dofus 3D lance ensuite le jeu en plein ecran, meme en mode avion.
- **PC** (Chrome / Edge) : icone *Installer* dans la barre d adresse.
- Les mises a jour arrivent automatiquement a la visite suivante en ligne.

**Apres chaque modification du jeu**, regenerer la liste des fichiers en
cache (sinon les joueurs garderaient l ancienne version) :

```bash
node dofus-3d/tools/build-sw.mjs
```

## Controles

- **Clic ou tap** sur une case = se deplacer (le perso fait son chemin).
- **Roulette souris** ou **pinch 2 doigts** = zoom in/out.
- Le perso ne peut pas marcher sur les cases marquees comme murs (cube
  marron) : le pathfinding contourne automatiquement.

## Style graphique facon Dofus

- **Vue isometrique orthographique** (azimut 45 deg, camera a 30 deg de
  l horizon) : les cases apparaissent en losanges 2:1 comme dans Dofus.
- **Cel-shading + contours** (`src/Toon.js`) : tous les modeles passent en
  `MeshToonMaterial` (3 paliers de lumiere) avec un contour sombre par
  coque inversee, pour un rendu "dessin anime / Flash".
- **Sol peint a la main** (`src/GroundPainter.js`) : texture generee sur
  canvas (taches de couleur, coups de pinceau d herbe, fleurs, terre) avec
  le quadrillage de combat integre (cases alternees + liseres).
- **Vegetation d Amakna** : arbres ronds et touffus, buissons, fleurs,
  souches, champignons (`src/models/tree.js`, `src/models/foliage.js`).
  Le decor autour du plateau est fusionne en quelques meshes
  (`bakeStatic`) pour rester fluide sur mobile.
- **Cases de portee facon Dofus** : vert pour le deplacement, bleu pour la
  portee des sorts, case survolee illuminee.
- **Cercles d equipe** bleu (allies) / rouge (ennemis) sous les persos.
- **Interface bois sombre + dore** (`src/dofus-theme.css`), titres orange,
  logo "Luckiest Guy", menu par-dessus la foret 3D qui tourne.
- **Ambiance lumineuse par carte** : soleil dore, clair de lune au
  cimetiere, lumiere verdatre au marais...

## Progression (niveaux, sorts, paliers)

- **Niveaux 1 a 20** par heros, sauvegardes dans le navigateur
  (`src/Leveling.js`). L XP vient des monstres vaincus : plus ils sont
  haut niveau, plus ils rapportent (un monstre bien plus faible que le
  heros rapporte peu). En multi, l XP est partagee avec un bonus de groupe.
- A chaque niveau : PV +7%, degats +6%, +1 PA au niveau 10, +1 PM au 16,
  et **1 point de sort** (2 aux niveaux 5, 10, 15, 20).
- **8 sorts par classe**, debloques aux niveaux 1, 1, 1, 1, 2, 4, 6, 9.
- **3 niveaux de puissance par sort** : 1 -> 2 coute 1 point, 2 -> 3 coute
  2 points. Niv. 2 : x1.25 et +1 portee ; niv. 3 : x1.55, recharge -1,
  effets secondaires renforces. Ecran **Grimoire** du menu pour
  ameliorer ses sorts (et rendre les points si besoin).
- **Monstres par paliers** : chaque combat a 10 paliers (monstres niveau
  1, 3, 5... 19 : plus de PV et de degats). Battre un palier debloque le
  suivant ; le menu conseille le palier adapte au niveau du heros.

## Classes et monstres

- Classes (8 sorts chacune) : Iop, Osamodas (dont Invocation de Bouftou),
  Roublard, Xelor, Ecaflip, Pandawa, Eniripsa.
- **Bestiaire** (`src/Bestiary.js`) : 9 familles de 3 a 4 monstres a
  niveau FIXE (Bouftou 1 ... Minotoror 20), chacune sur sa carte. Le palier
  choisi (1 a 10) fixe le nombre et la composition du groupe, pas la force
  des monstres (palier 1 = 3 sbires ... palier 10 = plusieurs royaux).
  Les variantes (Boufton Noir, Chef de Guerre, Tofu Malefique, Kwaks...)
  sont dans `models/variants.js`.

## Combat facon Dofus

- **Phase de placement** : avant le combat, cases de depart bleues (toi)
  et rouges (adversaire). Clique une case bleue pour y placer ton heros
  (clic sur un heros = le selectionner), puis **PRET** ou Espace.
- **Animations des membres** (`src/Rig.js`) : les pieces de chaque modele
  sont rattachees a des pivots (hanches, epaules, cou) -> marche jambe
  apres jambe, bras qui balancent, coup d arme arme puis abattu, bras
  leves au lancement d un sort, recul a l impact.
- **Heros sculptes** (`src/models/humanoid.js`) : les 7 classes partagent
  une base anatomique (bassin, torse en V par lathe, cuisses/genoux/tibias,
  bras a coude articule, mains, bottes, crane a machoire) sur laquelle
  chaque classe ajoute sa silhouette : plastron et spalieres de l Iop,
  manteau a pans du Roublard, robe evasee et chapeau du Xelor, tete feline
  de l Ecaflip, kimono du Pandawa, jupe corolle et ailes de l Eniripsa,
  cornes et queue de l Osamodas. L ecran de selection et le Grimoire
  affichent des portraits en buste rendus depuis ces modeles 3D.
- **Elements et resistances** (`src/Elements.js`) : chaque sort offensif a
  un element (feu, eau, terre, air, neutre), chaque creature des
  resistances (Chafers faibles au feu, Tofus resistants a l air...).
  Coups critiques (x1.3, 5% de base, plus avec le Trefle ou l equipement).
- **Tacle et fuite** : quitter le contact d un ennemi coute des PM (et un
  peu de PA) : esquive = (fuite + 2) / (2 x (tacle adverse + 2)).
- **Etats, glyphes et pieges** (`src/States.js`) : poison, enracine,
  stabilise, invisible... affiches sur la timeline. Glyphe du Sablier
  (Xelor), nappe de spores (Champignon Royal), piege sournois (Chafer
  Royal, invisible).
- **Timeline facon Dofus** (a partir du joueur actif, separateur de tour,
  etats, survol = infos) et **apercu** : au survol d une cible, zone
  d effet en orange et degats estimes (apres resistances et boucliers),
  "KO" si la cible tombe. Sur mobile : 1er appui = apercu, 2e = lancer.
- **Boss** : Craqueleur Legendaire (enracine), Kwakwa (change d element
  chaque tour), Minotoror (charge en ligne). Modeles dans `models/bosses.js`.
- **Equipement et panoplies** (`src/Items.js`, `src/ItemArt.js`,
  `models/wearables.js`) : coiffe, cape, amulette, anneau, bottes ; 9
  panoplies (Bouftou, Wabbit, Crapaud, Tofu, Chafer, Champignon, Craqueleur,
  Kwakwa, Minotoror) avec leur niveau, leur style 3D visible sur le heros
  et leur icone. Jets fixes par (panoplie, emplacement, rarete). Bonus a
  2 / 3 / 4 / 5 objets, independants de la rarete, et un effet unique a 5
  objets (Toison, Envol, Os durs, Spores, Fureur...). Butin rare : 10%
  par monstre (legendaire 0,5%). Inventaire trie par panoplie, avec
  comparatif ligne par ligne (objet et total du heros).
- **Mode Aventure** (`src/Adventure.js`) : 9 donjons (un par famille) de 4
  salles aux monstres de niveau fixe, PV conserves entre les salles, boss
  final et coffre.
- **Effets propres a chaque sort** (`VFX.signature`) : roue de la fortune,
  piece de Pile ou Face, cadran d horloge du Xelor, vague du Pandawa,
  tonneau qui roule (Karcham), souffle de feu, plumes, griffures,
  tourbillon de vent, spores, bulles, eclats de roche...

## Stack technique

- **Three.js 0.160** embarque dans `vendor/three/` (import map).
  Aucune dependance npm, aucun build step : juste des fichiers statiques.
- **Geometrie procedurale** : tout est fait avec des primitives Three.js
  (`BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `ConeGeometry`,
  `TorusGeometry`, `PlaneGeometry`). Aucun modele externe.
- **Ombres temps reel** PCF soft shadow map + ACES tone mapping pour le
  rendu.
- **Raycasting** pour le ciblage : conversion (clientX, clientY) -> case
  via `THREE.Raycaster.setFromCamera`. Precision pixel-perfect, marche
  pour souris ET tactile.
- **BFS** pour le pathfinding (porte du jeu 2D).

## Architecture

```
dofus-3d/
  index.html          page d entree, import map Three.js, HUD textuel
  src/
    main.js           bootstrap + boucle de rendu + gestion input
    Scene3D.js        scene + camera iso + lumieres + zoom
    Map3D.js          grille 15x15 + sous-sol + murs cubes + pierres
    Character3D.js    personnage Iop low-poly (corps, casque, cape, epee)
    Picker.js         raycasting + anneau jaune au survol
    Path.js           BFS pathfinding (orthogonal 4-voisins)
```

## Idees pour la suite

1. **Equipe joueur 3v3** : 3 personnages, ordre d initiative, switch
   d acteur, points de mouvement.
2. **Ennemis et combat** : creatures 3D procedurales (Bouftou, Tofu,
   Craqueleur, Scara avec versions royales), barres de vie au-dessus.
3. **Sorts en 3D** : portee visualisee par anneaux/dome, projectiles 3D,
   particules d impact.
4. **Decor** : herbe / sol texture, ciel, arbres, decorations.
5. **Modeles plus pousses** : packs Kenney (Mini Characters / Mini
   Dungeon) en glTF si on veut un rendu plus pousse.
6. **Sons** : marche, sorts, KO.
