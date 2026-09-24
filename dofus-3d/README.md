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

## Classes et monstres

- Classes : Iop, Osamodas, Roublard, Xelor, Ecaflip, Pandawa, **Eniripsa**
  (fee soigneuse : Mot Blessant, Mot Soignant, Mot de Frayeur, Mot
  Stimulant, Mot de Reconstitution).
- Combats : Bouftous, Crapauds, Chafers, Tofus, Champignons, **Wabbits**
  (Terrier des Wabbits : 3 Wabbits + le Wa Wabbit, foret).

## Combat facon Dofus

- **Phase de placement** : avant le combat, cases de depart bleues (toi)
  et rouges (adversaire). Clique une case bleue pour y placer ton heros
  (clic sur un heros = le selectionner), puis **PRET** ou Espace.
- **Animations des membres** (`src/Rig.js`) : les pieces de chaque modele
  sont rattachees a des pivots (hanches, epaules, cou) -> marche jambe
  apres jambe, bras qui balancent, coup d arme arme puis abattu, bras
  leves au lancement d un sort, recul a l impact.
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
