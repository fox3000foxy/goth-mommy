import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";
import { mutateGenes } from "./genes.js";

/** Options of {@link gaussian}. */
export interface GaussianOptions {
	/** Noise standard deviation. */
	sigma?: number;
	/** Probability of flipping a boolean or changing a choice. */
	flipRate?: number;
}

/** Standard normal distribution (Box-Muller). */
const randn = (): number =>
	Math.sqrt(-2 * Math.log(1 - Math.random())) *
	Math.cos(2 * Math.PI * Math.random());

/**
 * Gaussian noise mutation N(0, sigma^2). Respects the domain of each gene.
 *
 * @param options - See {@link GaussianOptions}.
 * @returns A {@link Mutator}.
 * @example
 * new GothMommy(seed, 20, score, { mutator: gaussian({ sigma: 0.5 }) });
 */
export const gaussian =
	({ sigma = 1, flipRate = 0.1 }: GaussianOptions = {}) =>
	(individual: HyperParams, space: Space = {}): HyperParams =>
		mutateGenes(individual, space, () => sigma * randn(), flipRate);
