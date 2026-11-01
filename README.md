# GothMommy

Un petit algorithme génétique en TypeScript pour chercher de bons hyperparamètres. Tu fournis un point de départ, le domaine de chaque paramètre et une fonction de score, GothMommy fait évoluer une population jusqu'à trouver mieux.

Aucune dépendance. Fonctionne avec Bun, ou avec Node (ESM).

## Démarrage rapide

```typescript
import { GothMommy, type HyperParams } from "goth-mommy";

// Trouver x tel que x² + 2x + 1 = 0 (racine double en x = -1)
const fx = (x: number) => x * x + 2 * x + 1;

// Plus grand = meilleur : vaut 1 quand fx(x) = 0, tend vers 0 sinon
const score = (population: HyperParams[]) =>
	population.map((ind) => 1 / (1 + Math.abs(fx(ind.x as number))));

const ga = new GothMommy({ x: 5 }, 20, score);

for (const state of ga.iterator(2000, 1 / (1 + 1e-8))) {
	console.log(state.iteration, state.bestScore, state.best);
}
```

L'exemple complet du dépôt se lance avec `bun run example`.

## Encodages : le `space`

Chaque hyperparamètre a un **domaine** qui décide comment il est initialisé, muté et croisé. Tu les déclares dans l'option `space` :

```typescript
import { GothMommy, bool, choice, int, real } from "goth-mommy";

const seed = { lr: 0.01, layers: 4, activation: "relu", batchNorm: true };

const ga = new GothMommy(seed, 30, score, {
	space: {
		lr: real(1e-5, 1),                         // réel borné
		layers: int(1, 8),                         // entier
		activation: choice(["relu", "tanh", "gelu"]), // catégorie
		batchNorm: bool(),                         // booléen
	},
});
```

| Domaine | Valeur | Initialisation | Mutation |
|---|---|---|---|
| `real(min?, max?)` | nombre | uniforme dans `[min, max]` si borné, sinon `±amplitude` autour de la graine | bruit, puis ramené dans les bornes |
| `int(min, max)` | entier | entier uniforme | bruit arrondi, **toujours au moins ±1** |
| `bool()` | booléen | pile ou face | inversion avec probabilité `flipRate` |
| `choice([...])` | une valeur de la liste | tirage uniforme | autre valeur de la liste avec probabilité `flipRate` |

Sans `space`, les domaines sont déduits de la graine : un nombre est un réel non borné, un booléen est un `bool()`, et une chaîne est une constante (jamais modifiée). La graine doit respecter son domaine, sinon le constructeur lève une erreur.

## Les briques

GothMommy assemble des briques interchangeables, chacune étant une simple fonction. Tout est exporté depuis le paquet.

| Brique | Option | Disponibles (défaut en gras) |
|---|---|---|
| Sélection | `selector` | **`proportional()`** (roulette, scores ≥ 0), `tournament(size = 3)` (accepte les scores négatifs) |
| Croisement | `crossover` | aucun par défaut, `uniform()`, `arithmetic()` |
| Mutation | `mutator` | **`perturb({ strength, flipRate })`** (bruit uniforme multi-échelle), `gaussian({ sigma, flipRate })` |
| Initialisation | `initializer` | **`spread(amplitude = 10)`** |

```typescript
import { GothMommy, arithmetic, gaussian, tournament } from "goth-mommy";

new GothMommy(seed, 20, score, {
	selector: tournament(3),
	crossover: arithmetic(),
	mutator: gaussian({ sigma: 0.5 }),
});
```

Sans `crossover`, chaque enfant vient d'un seul parent (sélection + mutation). Avec un `crossover`, le sélecteur choisit deux parents par enfant.

### Écrire sa propre brique

Ce sont les contrats de `types.ts`. Une brique ne doit jamais modifier ses arguments.

```typescript
type Selector    = (scores: number[], k: number) => number[];                        // k indices de parents
type Mutator     = (individual: HyperParams, space: Space) => HyperParams;
type Crossover   = (a: HyperParams, b: HyperParams, space: Space) => HyperParams;
type Initializer = (seed: HyperParams, size: number, space: Space) => HyperParams[];
```

## API

### `new GothMommy(hyperparams?, populationSize?, scoringFunction?, options?)`

| Paramètre | Défaut | Rôle |
|---|---|---|
| `hyperparams` | `{}` | Individu de départ (la graine). |
| `populationSize` | `10` | Nombre d'individus par génération. |
| `scoringFunction` | scores à 0 | Reçoit toute la population, renvoie un score par individu (même ordre). |
| `options` | `{}` | Voir ci-dessous. |

| Option | Défaut | Rôle |
|---|---|---|
| `space` | déduit de la graine | Domaine de chaque hyperparamètre. |
| `mutationRate` | `0.5` | Probabilité qu'un enfant soit muté (0 à 1). |
| `crossoverRate` | `0.7` | Probabilité de croiser deux parents (sans effet sans `crossover`). |
| `elitism` | `1` | Nombre de meilleurs individus copiés tels quels. |
| `selector`, `crossover`, `mutator`, `initializer` | voir les briques | |

### `iterator(maxIterations?, threshold?)`

Générateur qui produit un état par génération. Il s'arrête quand le meilleur score atteint `threshold` ou après `maxIterations` (défauts : `1000` et `Infinity`).

Chaque état contient `population`, `scores`, `iteration`, `bestScore` et `best` (le meilleur individu).

## Écrire une bonne fonction de score

C'est la partie la plus importante :

- **Plus grand = meilleur.** Pour minimiser une erreur, transforme-la, par exemple `1 / (1 + erreur)`.
- **Scores ≥ 0 avec `proportional()`**, car la sélection est proportionnelle au score. Avec `tournament()`, les scores négatifs sont acceptés.
- **Choisis un seuil réaliste** pour `threshold`, lié à la précision voulue plutôt qu'une valeur arbitraire.
- La fonction est appelée **une seule fois par génération**, avec toute la population.

## Comment ça marche

À chaque génération :

1. **Évaluation** : la fonction de score est appelée une fois.
2. **Élitisme** : les `elitism` meilleurs individus passent tels quels.
3. **Sélection** : le `selector` choisit les parents des places restantes.
4. **Croisement** (si configuré) : deux parents donnent un enfant, avec probabilité `crossoverRate`.
5. **Mutation** : chaque enfant est muté avec probabilité `mutationRate`, en respectant le domaine de chaque gène.

La population initiale contient la graine telle quelle, et des individus tirés dans les domaines des gènes pour les autres.

## Développement

```bash
bun install
bun test          # tests
bun run check     # lint + format (Biome)
bun run typecheck
```

## Limites

- Seuls les nombres, booléens et chaînes de **premier niveau** sont supportés : pas d'objets imbriqués.
- Pas encore d'encodage par permutation (TSP, ordonnancement), ni d'encodages binaire ou Gray.
- Les valeurs d'un `choice` sont comparées avec `===` : pas d'objets dans les listes.
- Un algorithme génétique ne garantit pas de trouver l'optimum global. Si le résultat stagne, augmente `populationSize` ou `mutationRate`, ou essaie `tournament()`.

## Licence

MIT
