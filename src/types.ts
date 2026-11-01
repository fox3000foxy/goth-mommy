import type { Space } from "./space.js";

/**
 * An individual: a set of hyperparameters, by name.
 * Values can be numbers, booleans or strings; their
 * domain is declared with the `space` option of {@link GothMommy}.
 */
export interface HyperParams {
	[key: string]: number | boolean | string;
}

/** One generation of individuals. */
export type Population = HyperParams[];

/**
 * One score per individual, in the same order as the population.
 * A LARGER score = a BETTER individual.
 */
export type Score = number[];

/**
 * Score the whole population at once. Called once per generation.
 *
 * @param population - The individuals to score.
 * @returns One score per individual, in the same order. Larger = better,
 * and >= 0 with `proportional()`.
 */
export type ScoringFunction = (population: Population) => Score;

/**
 * Pick parents from scores.
 *
 * @param scores - The score of each individual in the population.
 * @param k - The number of parents to pick.
 * @returns `k` indices into the population, with replacement.
 */
export type Selector = (scores: Score, k: number) => number[];

/**
 * Return a mutated copy of the individual. Never modifies the original.
 *
 * @param individual - The individual to mutate.
 * @param space - The domain of each gene: the result must fit it.
 */
export type Mutator = (individual: HyperParams, space: Space) => HyperParams;

/**
 * Build the starting population from a reference individual.
 *
 * @param seed - The individual given to the constructor.
 * @param size - The requested population size.
 * @param space - The domain of each gene.
 */
export type Initializer = (
	seed: HyperParams,
	size: number,
	space: Space,
) => Population;

/**
 * Combine two parents into a child. Never modifies the parents.
 *
 * @param a - The first parent.
 * @param b - The second parent.
 * @param space - The domain of each gene: the child must fit it.
 */
export type Crossover = (
	a: HyperParams,
	b: HyperParams,
	space: Space,
) => HyperParams;
