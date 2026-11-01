import { Engine } from "./engine.js";
import { spread } from "./initialization/spread.js";
import { perturb } from "./mutation/perturb.js";
import { proportional } from "./selection/proportional.js";
import { type Space, inferSpace, validateSeed } from "./space.js";
import type {
	Crossover,
	HyperParams,
	Initializer,
	Mutator,
	ScoringFunction,
	Selector,
} from "./types.js";

export type * from "./types.js";
export type { GenerationState } from "./engine.js";
export {
	type BoolGene,
	type ChoiceGene,
	type Gene,
	type IntGene,
	type RealGene,
	type Space,
	bool,
	choice,
	int,
	real,
} from "./space.js";
export { arithmetic } from "./crossover/arithmetic.js";
export { uniform } from "./crossover/uniform.js";
export { spread } from "./initialization/spread.js";
export { gaussian, type GaussianOptions } from "./mutation/gaussian.js";
export { perturb, type PerturbOptions } from "./mutation/perturb.js";
export { proportional } from "./selection/proportional.js";
export { tournament } from "./selection/tournament.js";
export {
	GothMommyPermutation,
	type Permutation,
	type PermutationCrossover,
	type PermutationMutator,
	type PermutationOptions,
	type PermutationScoringFunction,
	inversion,
	ox,
	pmx,
	swap,
} from "./permutation/index.js";

/** Options of {@link GothMommy}. All are optional. */
export interface GothMommyOptions {
	/**
	 * Domain of each hyperparameter (`real`, `int`, `bool`, `choice`).
	 * Missing keys are inferred from the seed (number -> real, boolean -> bool,
	 * string -> constant).
	 */
	space?: Space;
	/** Probability that a child is mutated (0..1). Default: 0.5. */
	mutationRate?: number;
	/** Number of best individuals copied as is. Default: 1. */
	elitism?: number;
	/** Probability of crossing two parents (0..1). Default: 0.7. No effect without `crossover`. */
	crossoverRate?: number;
	/** Absent by default: no crossover, one parent per child. */
	crossover?: Crossover;
	/** Parent selection. Default: `proportional()`. */
	selector?: Selector;
	/** Mutation of an individual. Default: `perturb()`. */
	mutator?: Mutator;
	/** Starting population builder. Default: `spread()`. */
	initializer?: Initializer;
}

/**
 * Genetic algorithm for finding good hyperparameters.
 *
 * You provide a starting individual, the domain of each parameter and a
 * score function (larger = better); the population evolves generation
 * after generation.
 *
 * @example
 * ```ts
 * // Find x such that x^2 + 2x + 1 = 0 (double root at x = -1)
 * const score = (population: HyperParams[]) =>
 *   population.map((p) => 1 / (1 + Math.abs((p.x as number) ** 2 + 2 * (p.x as number) + 1)));
 *
 * const ga = new GothMommy({ x: 5 }, 20, score);
 * for (const state of ga.iterator(2000, 0.999999)) {
 *   console.log(state.iteration, state.best);
 * }
 * ```
 */
export class GothMommy {
	private engine: Engine<HyperParams>;

	/**
	 * @param hyperparams - The starting individual (the seed). It must fit
	 * its domain, else the constructor throws.
	 * @param populationSize - Number of individuals per generation. Default: 10.
	 * @param scoringFunction - Score the population. Default: zero scores.
	 * @param options - Domains, rates and parts. See {@link GothMommyOptions}.
	 * @throws If a `space` gene is missing from `hyperparams` or out of range.
	 */
	constructor(
		hyperparams: HyperParams = {},
		populationSize: number = 10,
		scoringFunction: ScoringFunction = (population) => population.map(() => 0),
		options: GothMommyOptions = {},
	) {
		const space = { ...inferSpace(hyperparams), ...options.space };
		validateSeed(hyperparams, space);
		const mutator = options.mutator ?? perturb();
		const { crossover } = options;
		this.engine = new Engine(
			(options.initializer ?? spread())(hyperparams, populationSize, space),
			{
				scoring: scoringFunction,
				selector: options.selector ?? proportional(),
				clone: (individual) => ({ ...individual }),
				mutate: (individual) => mutator(individual, space),
				crossover: crossover && ((a, b) => crossover(a, b, space)),
				mutationRate: options.mutationRate ?? 0.5,
				crossoverRate: options.crossoverRate ?? 0.7,
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
