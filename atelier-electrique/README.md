# ⚡ L'Atelier Électrique

Jeu pédagogique de **réparation d'appareils électriques**. Le joueur reçoit un
appareil en panne, le diagnostique avec un multimètre, remplace la pièce
défectueuse et valide par un test fonctionnel. Objectif : comprendre **à quoi
sert chaque pièce** et comment on la teste.

Jouer : ouvrir `index.html` (aucune dépendance, aucun build) ou la page GitHub
Pages `…/atelier-electrique/`.

## Ce que le jeu simule

- Un **vrai simulateur de circuit** (analyse nodale) : tensions, courants et
  résistances sont calculés à partir des composants et de leurs pannes, pas
  scriptés. Le 230 V~ est traité en valeurs efficaces avec des charges
  résistives.
- Un **multimètre** : V~, V=, Ω, continuité. Mesurer en Ω sous tension est
  compté comme une erreur de sécurité.
- Des **pannes tirées au sort** parmi plusieurs scénarios par appareil, dont des
  doubles pannes (ex. résistance en court-circuit → fusible grillé : remplacer
  seulement le fusible le fait regriller au test).
- Un **modèle thermique** simple : les résistances chauffent, les thermostats
  coupent, les fusibles thermiques déclenchent en cas de surchauffe (par exemple
  si le moteur du sèche-cheveux ne ventile plus).
- Des **fusibles qui fondent** si le courant dépasse leur calibre (un fusible
  de rechange trop faible grille, trop fort est signalé comme dangereux).
- Un **stock de pièces** avec prix : remplacer une pièce saine coûte des points.
- Une **encyclopédie** : rôle, méthode de test, pannes fréquentes et formule
  pour chaque composant, plus une fiche sur le multimètre.

## Appareils

| # | Appareil | Notions |
|---|----------|---------|
| 1 | Lampe de chevet | circuit série, tension qui « disparaît » à l'élément ouvert |
| 2 | Grille-pain | résistances en parallèle, fusible, calibre, cause racine |
| 3 | Bouilloire | thermostat, fusible thermique, voyant en parallèle |
| 4 | Sèche-cheveux | commutateur cumulatif, refroidissement par le moteur |
| 5 | Ventilateur | moteur asynchrone, condensateur de démarrage |
| 6 | Lampe de poche | courant continu, pile usée, contact oxydé, LED |
| 7 | Lave-linge (simplifié) | sécurité de porte, programmateur, branches parallèles |

## Structure

```
atelier-electrique/
├── index.html          page unique
├── css/style.css
└── js/
    ├── sim.js          analyse nodale (résistances, sources, fils, mesure de R)
    ├── components.js   catalogue des composants : symbole, comportement, pannes, fiche
    ├── levels.js       appareils (schéma, fils, scénarios de panne, tests) + stock de pièces
    └── game.js         état de la partie, boucle de simulation, multimètre, interface
```

## Ajouter un appareil

Dans `levels.js`, ajouter une entrée avec ses `comps` (position, paramètres),
ses `wires` (un fil relie toujours deux bornes `"id.pin"`, avec des points de
passage `[x, y]` optionnels pour le dessin), ses `scenarios` et ses `tests`.
Les composants disponibles sont ceux de `components.js` ; un nouveau type se
définit par ses bornes, sa fonction `prims` (fils / résistances / sources) et
ses pannes.
