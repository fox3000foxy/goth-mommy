# GothMommy

Un petit algorithme génétique en TypeScript pour chercher de bons hyperparamètres. Tu fournis un point de départ et une fonction de score, GothMommy fait évoluer une population jusqu'à trouver mieux.

Aucune dépendance. Fonctionne avec Bun, ou avec Node 18+ via `tsx`.

## Démarrage rapide

```typescript
import { type HyperParams, type Population, type ScoringFunction, GothMommy } from ".";

const hyperparams: HyperParams = { x: 5 };

// Trouver x tel que x² + 2x + 1 = 0 (racine double en x = -1)
const fx = (x: number) => x * x + 2 * x + 1;

// Plus grand = meilleur : vaut 1 quand fx(x) = 0, tend vers 0 sinon
const scoringFunction: ScoringFunction = (population: Population) =>
    population.map(ind => 1 / (1 + Math.abs(fx(ind.x as number))));

const gothMommy = new GothMommy(hyperparams, 20, scoringFunction);

for (const state of gothMommy.iterator(2000, 1 / (1 + 1e-8))) {
    console.log(state.iteration, state.bestScore, state.best);
}
```

Pour lancer l'exemple fourni :

```bash
bun example.ts
# ou
npx tsx example.ts
```

## API

### `new GothMommy(hyperparams?, populationSize?, scoringFunction?, mutationRate?)`

| Paramètre | Défaut | Rôle |
|---|---|---|
| `hyperparams` | `{}` | Individu de départ. Ses valeurs numériques sont les paramètres à optimiser. |
| `populationSize` | `10` | Nombre d'individus par génération. |
| `scoringFunction` | scores à 0 | Reçoit toute la population, renvoie un score par individu (même ordre). |
| `mutationRate` | `0.5` | Probabilité qu'un enfant soit muté (entre 0 et 1). |

### `iterator(maxIterations?, threshold?)`

Générateur qui produit un état par génération, et s'arrête quand le meilleur score atteint `threshold` ou après `maxIterations` (défaut : `1000`, `Infinity`).

Chaque état contient :

- `population` : les individus de la génération
- `scores` : leurs scores
- `iteration` : numéro de la génération
- `bestScore` : le meilleur score
- `best` : le meilleur individu

## Écrire une bonne fonction de score

C'est la partie la plus importante :

- **Plus grand = meilleur.** Si tu veux minimiser une erreur, transforme-la, par exemple `1 / (1 + erreur)`.
- **Les scores doivent être positifs ou nuls**, car la sélection est proportionnelle au score.
- **Choisis un seuil réaliste** pour `threshold`, en lien avec la précision voulue plutôt qu'une valeur arbitraire.

## Comment ça marche

1. **Population initiale** : le premier individu est exactement `hyperparams`, les autres sont dispersés autour (±10 sur chaque nombre).
2. **Évaluation** : la fonction de score est appelée une fois par génération.
3. **Élitisme** : le meilleur individu passe tel quel à la génération suivante.
4. **Sélection** : les autres places sont tirées par roulette, proportionnellement au score.
5. **Mutation** : chaque enfant a `mutationRate` chances d'être muté. Le bruit est de ±1, avec une échelle aléatoire (jusqu'à 1000 fois plus petite) pour affiner près de l'optimum.

## Limites

- Seuls les **nombres de premier niveau** sont mutés. Les chaînes, booléens et objets imbriqués sont copiés tels quels.
- Pas de croisement entre individus : l'évolution repose sur la sélection et la mutation.
- Les copies sont superficielles (`{ ...individu }`) : évite de modifier des objets imbriqués dans ta fonction de score.
- Un algorithme génétique ne garantit pas de trouver l'optimum global. Si le résultat stagne, augmente `populationSize` ou `mutationRate`.