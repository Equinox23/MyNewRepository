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

## Controles

- **Clic ou tap** sur une case = se deplacer (le perso fait son chemin).
- **Roulette souris** ou **pinch 2 doigts** = zoom in/out.
- Le perso ne peut pas marcher sur les cases marquees comme murs (cube
  marron) : le pathfinding contourne automatiquement.

## Stack technique

- **Three.js 0.160** charge en module ES depuis jsDelivr (import map).
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
