# GothMommy

A small genetic algorithm library in TypeScript. Two classes: `GothMommy` for searching good hyperparameters (numbers, integers, booleans, categories) and `GothMommyPermutation` for ordering problems (TSP, scheduling). You provide a starting point, or a size, plus a scoring function: the population evolves until it finds something better.

Zero dependencies. Works with Bun, or with Node (ESM).

## Quick start

```typescript
import { GothMommy, type HyperParams } from "goth-mommy";

// Find x such that x^2 + 2x + 1 = 0 (double root at x = -1)
const fx = (x: number) => x * x + 2 * x + 1;

// Higher is better: equals 1 when fx(x) = 0, tends to 0 otherwise
const score = (population: HyperParams[]) =>
	population.map((ind) => 1 / (1 + Math.abs(fx(ind.x as number))));

const ga = new GothMommy({ x: 5 }, 20, score);

for (const state of ga.iterator(2000, 1 / (1 + 1e-8))) {
	console.log(state.iteration, state.bestScore, state.best);
}
```

Repo examples live in `examples/`: `bun run example` runs the first one, `bun run examples` runs all of them.

| File | What it shows |
|---|---|
| `basic.ts` | The quick start above |
| `mixed-space.ts` | Real, integer, category and boolean in one individual, with a learning rate searched on a log scale |
| `knapsack.ts` | Knapsack: one boolean gene per item, compared against the exact brute-force solution |
| `tsp.ts` | Traveling salesman over 20 cities with `GothMommyPermutation` |
| `custom-brick.ts` | Writing a custom selector (truncation) and a custom mutator |

## Encodings: the `space`

Each hyperparameter has a **domain** that controls how it is initialized, mutated and crossed over. Declare them in the `space` option:

```typescript
import { GothMommy, bool, choice, int, real } from "goth-mommy";

const seed = { lr: 0.01, layers: 4, activation: "relu", batchNorm: true };

const ga = new GothMommy(seed, 30, score, {
	space: {
		lr: real(1e-5, 1),                         // bounded real
		layers: int(1, 8),                         // integer
		activation: choice(["relu", "tanh", "gelu"]), // category
		batchNorm: bool(),                         // boolean
	},
});
```

| Domain | Value | Initialization | Mutation |
|---|---|---|---|
| `real(min?, max?)` | number | uniform in `[min, max]` if bounded, else `+/-amplitude` around the seed | noise, then clamped to bounds |
| `int(min, max)` | integer | uniform integer | rounded noise, **always at least +/-1** |
| `bool()` | boolean | coin flip | flip with probability `flipRate` |
| `choice([...])` | one value from the list | uniform draw | another value from the list with probability `flipRate` |

Without `space`, domains are inferred from the seed: a number is an unbounded real, a boolean is a `bool()`, and a string is a constant (never mutated). The seed must satisfy its domain, otherwise the constructor throws an error.

## The bricks

GothMommy combines interchangeable bricks, each a plain function. Everything is exported from the package.

| Brick | Option | Available (default in bold) |
|---|---|---|
| Selection | `selector` | **`proportional()`** (roulette, scores >= 0), `tournament(size = 3)` (accepts negative scores) |
| Crossover | `crossover` | none by default, `uniform()`, `arithmetic()` |
| Mutation | `mutator` | **`perturb({ strength, flipRate })`** (multi-scale uniform noise), `gaussian({ sigma, flipRate })` |
| Initialization | `initializer` | **`spread(amplitude = 10)`** |

```typescript
import { GothMommy, arithmetic, gaussian, tournament } from "goth-mommy";

new GothMommy(seed, 20, score, {
	selector: tournament(3),
	crossover: arithmetic(),
	mutator: gaussian({ sigma: 0.5 }),
});
```

Without `crossover`, each child comes from a single parent (selection + mutation). With a `crossover`, the selector picks two parents per child.

### Writing your own brick

These are the contracts from `types.ts`. A brick must never mutate its arguments.

```typescript
type Selector    = (scores: number[], k: number) => number[];                        // k parent indices
type Mutator     = (individual: HyperParams, space: Space) => HyperParams;
type Crossover   = (a: HyperParams, b: HyperParams, space: Space) => HyperParams;
type Initializer = (seed: HyperParams, size: number, space: Space) => HyperParams[];
```

## Ordering problems: `GothMommyPermutation`

When the solution is an **order** (city tour, task sequence), an individual is a permutation of the integers `0..size-1`. You map them to your cities or tasks. Classic operators (segment crossover, swap mutation) would create duplicates: this class has its own, which always keep a valid permutation.

```typescript
import { GothMommyPermutation, inversion, pmx } from "goth-mommy";

const cities = [[0, 0], [3, 1], [6, 0], [6, 4], [3, 5], [0, 4]] as const;

// closed tour length
const length = (tour: number[]) =>
	tour.reduce((sum, city, i) => {
		const [x1, y1] = cities[city]!;
		const [x2, y2] = cities[tour[(i + 1) % tour.length]!]!;
		return sum + Math.hypot(x2 - x1, y2 - y1);
	}, 0);

const score = (population: number[][]) =>
	population.map((tour) => 1 / (1 + length(tour)));

const ga = new GothMommyPermutation(cities.length, 50, score, {
	crossover: pmx(),
	mutator: inversion(),
});

let last;
for (const state of ga.iterator(200)) last = state;
console.log(last.best, length(last.best)); // [5, 0, 1, 2, 3, 4] 20.65
```

`new GothMommyPermutation(size, populationSize?, scoringFunction?, options?)` has the same `iterator` as `GothMommy`. Its options: `mutationRate` (0.5), `crossoverRate` (0.9, set 0 to disable), `elitism` (1), `selector`, and the two bricks below.

| Brick | Option | Available (default in bold) |
|---|---|---|
| Crossover | `crossover` | **`ox()`** (keeps relative order), `pmx()` (keeps positions) |
| Mutation | `mutator` | **`swap()`** (swaps two genes), `inversion()` (reverses a segment, the TSP "2-opt") |
| Selection | `selector` | **`tournament(3)`**, `proportional()` |

A permutation crossover has contract `(a: number[], b: number[]) => number[]`, a mutation `(p: number[]) => number[]`.

## API

### `new GothMommy(hyperparams?, populationSize?, scoringFunction?, options?)`

| Parameter | Default | Role |
|---|---|---|
| `hyperparams` | `{}` | Starting individual (the seed). |
| `populationSize` | `10` | Individuals per generation. |
| `scoringFunction` | zero scores | Receives the whole population, returns one score per individual (same order). |
| `options` | `{}` | See below. |

| Option | Default | Role |
|---|---|---|
| `space` | inferred from seed | Domain of each hyperparameter. |
| `mutationRate` | `0.5` | Probability that a child is mutated (0 to 1). |
| `crossoverRate` | `0.7` | Probability of crossing two parents (no effect without `crossover`). |
| `elitism` | `1` | Number of best individuals copied as-is. |
| `selector`, `crossover`, `mutator`, `initializer` | see bricks | |

### `iterator(maxIterations?, threshold?)`

Generator yielding one state per generation. It stops when the best score reaches `threshold` or after `maxIterations` (defaults: `1000` and `Infinity`).

Each state holds `population`, `scores`, `iteration`, `bestScore` and `best` (the best individual).

## Writing a good scoring function

This is the most important part:

- **Higher is better.** To minimize an error, transform it, e.g. `1 / (1 + error)`.
- **Scores >= 0 with `proportional()`**, since selection is proportional to score. With `tournament()`, negative scores are accepted.
- **Pick a realistic threshold** for `threshold`, tied to the wanted precision rather than an arbitrary value.
- The function is called **once per generation**, with the whole population.

## How it works

Each generation:

1. **Evaluation**: the scoring function is called once.
2. **Elitism**: the `elitism` best individuals pass through as-is.
3. **Selection**: the `selector` picks the parents of the remaining slots.
4. **Crossover** (if configured): two parents produce one child, with probability `crossoverRate`.
5. **Mutation**: each child is mutated with probability `mutationRate`, respecting each gene domain.

The initial population holds the seed as-is, plus individuals drawn from the gene domains for the rest.

## API reference

Each function, type and option is documented with TSDoc, and the HTML reference is generated with [TypeDoc](https://typedoc.org):

```bash
bun run docs      # generates docs/ (open docs/index.html)
```

## Development

```bash
bun install
bun test          # tests
bun run check     # lint + format (Biome)
bun run typecheck
```

## Limits

- Only **top-level** numbers, booleans and strings are supported: no nested objects.
- No binary or Gray encodings yet, no constrained permutation (time windows, etc.).
- `choice` values are compared with `===`: no objects in the lists.
- A genetic algorithm does not guarantee the global optimum. If results stall, raise `populationSize` or `mutationRate`, or try `tournament()`.

## License

MIT
