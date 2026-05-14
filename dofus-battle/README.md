# Dofus Battle

Mini-clone du combat tactique facon Dofus, ecrit en Phaser 3 (vanilla, sans
build step). 3v3 joueur contre IA, sur grille isometrique 15x15.

## Lancer le jeu

Le projet utilise des modules ES, donc il doit etre servi par HTTP (pas de
file://). Depuis le dossier `dofus-battle/` :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080/
```

ou avec node :

```bash
npx serve .
```

### Sur iPhone / iPad (via GitHub Pages)

Le jeu est responsive et tactile. Pour le publier en ligne :

1. Sur GitHub, va dans **Settings -> Pages**.
2. **Source** : "Deploy from a branch".
3. **Branch** : `claude/dofus-battle-game-WozFS` (ou la branche qui contient
   ce code), **dossier** : `/ (root)`. Sauvegarde.
4. Apres ~1 minute, l URL est :
   `https://<ton-user>.github.io/<ton-repo>/dofus-battle/`
   (la racine du repo redirige automatiquement vers `/dofus-battle/`).
5. Ouvre l URL dans **Safari** sur iPhone, **mode paysage**, et c est jouable.

### Sur iPhone via Wi-Fi local

Si tu prefereres rester sans publication :

```bash
cd dofus-battle && python3 -m http.server 8080
# puis sur l iPhone, dans Safari : http://<ip-locale-de-ton-ordi>:8080/
```

(Trouve ton IP avec `ifconfig` / `ip addr`. iPhone et ordi doivent etre
sur le meme Wi-Fi.)

## Comment jouer

1. Au menu, choisis 3 personnages (clic sur les cartes), une carte, et une
   composition ennemie (re-tirable au hasard).
2. En combat :
   - **Clic gauche** sur une case verte = se deplacer (path + cout PM).
   - **Clic** sur un sort en bas, puis sur une case = lancer le sort.
   - **Clic droit** ou **ECHAP** ou bouton "ANNULER" = annuler la selection.
   - **ESPACE** ou bouton "FIN DE TOUR" = passer son tour.
   - **Tactile** (iPhone/iPad) : 1er tap = previsualiser (chemin ou zone),
     2e tap sur la meme case = confirmer. Bouton "ANNULER" pour revenir.
3. Le bandeau du haut montre l'ordre d'initiative ; le combattant actif est
   entoure en jaune.
4. La premiere equipe a perdre tous ses combattants perd la partie.

## Mecaniques

- **PA / PM / PV** : points d'action, points de mouvement et points de vie,
  remis a leur max au debut de chaque tour.
- **Portee, ligne de vue, alignement** : verifies avant chaque cast (la case
  visee passe en rouge si invalide).
- **Effets de sorts** :
  - degats (avec multiplicateur de buff),
  - soins,
  - poussee / collision (5 degats si la cible bute),
  - teleportation (Bond du Iop),
  - pieges invisibles (Sram) qui se declenchent au passage,
  - DoT (Poison Paralysant du Sadida),
  - vol de vie (Mot Drainant de l'Eniripsa),
  - buffs de degats / armure / esquive / PA bonus.

## Classes (5)

| Classe    | Role           | PV | PA | PM | Specialite                              |
|-----------|----------------|----|----|----|-----------------------------------------|
| Iop       | Guerrier melee | 95 | 7  | 3  | Bond, gros degats au CAC                |
| Cra       | Archer         | 75 | 7  | 4  | Tirs longue portee, fleche soigneuse    |
| Eniripsa  | Soigneur       | 70 | 8  | 3  | Soins, buff PA, vol de vie              |
| Sram      | Assassin       | 80 | 7  | 4  | Pieges, invisibilite, coup mortel       |
| Sadida    | Druide         | 85 | 7  | 3  | Poisons, ronce zone, armure             |

Chaque classe possede 4 sorts (voir `src/data/spells.js`).

## Cartes (3)

- **Arene** : couloir central avec un mur vertical et 4 piliers.
- **Foret** : 4 bosquets dans les coins + un arbre central.
- **Couloir** : 2 grands murs horizontaux avec 3 ouvertures.

## Architecture

```
dofus-battle/
  index.html              page d'entree, charge Phaser via CDN
  src/
    main.js               config Phaser
    scenes/
      MenuScene.js        choix d'equipe, carte, ennemis
      CombatScene.js      rendu + interactions + boucle de tour
      EndScene.js         victoire / defaite
    systems/
      Grid.js             iso, BFS, line of sight, zones
      Fighter.js          entite combattant (PV/PA/PM/buffs/dots)
      TurnManager.js      ordre d'initiative, detection de fin
      Combat.js           application des effets de sorts
      AI.js               planification de tour ennemi
    data/
      classes.js          5 classes
      spells.js           20 sorts
      maps.js             3 cartes avec obstacles
```

## Idees d'extension

- Skins et animations sprites (au lieu des cercles colores).
- Sons (sorts, KO, fin de tour).
- Mode hot-seat 2 joueurs / online.
- Equipement / niveaux / arbre de sorts.
- Plus de classes (Xelor, Feca, Ecaflip...) et de cartes.
