import { Engine } from "../engine.js";
import { tournament } from "../selection/tournament.js";
import type { Score, Selector } from "../types.js";
import {
	type Permutation,
	type PermutationCrossover,
	ox,
} from "./crossover.js";
import { type PermutationMutator, swap } from "./mutation.js";

export {
	type Permutation,
	type PermutationCrossover,
	ox,
	pmx,
} from "./crossover.js";
export { type PermutationMutator, inversion, swap } from "./mutation.js";

/**
 * Score the whole population at once, once per generation.
 *
 * @param population - The permutations to score.
 * @returns One score per permutation, in the same order. Larger = better.
 */
export type PermutationScoringFunction = (population: Permutation[]) => Score;

/** Options of {@link GothMommyPermutation}. All are optional. */
export interface PermutationOptions {
	/** Probability that a child is mutated (0..1). Default: 0.5. */
	mutationRate?: number;
	/** Probability of crossing two parents (0..1). Default: 0.9. Set 0 to disable. */
	crossoverRate?: number;
	/** Number of best individuals copied as is. Default: 1. */
	elitism?: number;
	/** Default: `tournament(3)`. */
	selector?: Selector;
	/** Default: `ox()`. */
	crossover?: PermutationCrossover;
	/** Default: `swap()`. */
	mutator?: PermutationMutator;
}

const shuffled = (size: number): Permutation => {
	const p = Array.from({ length: size }, (_, i) => i);
	for (let i = size - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[p[i], p[j]] = [p[j]!, p[i]!];
	}
	return p;
};

/**
 * Genetic algorithm for ordering problems (TSP, scheduling...).
 * An individual is a permutation of the integers `0..size-1`: map
 * these integers to your cities, tasks, etc.
 *
 * @example
 * ```ts
 * // Shortest tour: score = inverse of the tour length
 * const ga = new GothMommyPermutation(cities.length, 50, (population) =>
 *   population.map((tour) => 1 / tourLength(tour)),
 *   { crossover: pmx(), mutator: inversion() },
 * );
 * for (const state of ga.iterator(200)) console.log(state.best);
 * ```
 */
export class GothMommyPermutation {
	private engine: Engine<Permutation>;

	/**
	 * @param size - Number of items to order (integer >= 1).
	 * @param populationSize - Number of permutations per generation. Default: 10.
	 * @param scoringFunction - Score the population. Default: zero scores.
	 * @param options - Rates and parts. See {@link PermutationOptions}.
	 * @throws If `size` is not an integer >= 1.
	 */
	constructor(
		size: number,
		populationSize: number = 10,
		scoringFunction: PermutationScoringFunction = (population) =>
			population.map(() => 0),
		options: PermutationOptions = {},
	) {
		if (!Number.isInteger(size) || size < 1) {
			throw new Error("size must be an integer >= 1");
		}
		this.engine = new Engine(
			Array.from({ length: populationSize }, () => shuffled(size)),
			{
				scoring: scoringFunction,
				selector: options.selector ?? tournament(3),
				clone: (individual) => [...individual],
				mutate: options.mutator ?? swap(),
				crossover: options.crossover ?? ox(),
				mutationRate: options.mutationRate ?? 0.5,
				crossoverRate: options.crossoverRate ?? 0.9,
				elitism: options.elitism ?? 1,
			},
		);
	}

	/**
	 * Evolve the population, one generation per iteration.
	 *
	 * @param maxIterations - Guard against infinite loops. Default: 1000.
	 * @param threshold - Stop when the best raw score reaches it.
	 * Default: `Infinity` (never).
	 * @returns One state per generation: population, scores, best individual.
	 */
	iterator(maxIterations?: number, threshold?: number) {
		return this.engine.iterator(maxIterations, threshold);
	}
}
