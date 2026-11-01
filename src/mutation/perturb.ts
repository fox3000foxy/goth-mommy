import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";
import { mutateGenes } from "./genes.js";

/** Options of {@link perturb}. */
export interface PerturbOptions {
	/** Maximum noise amplitude (+/-strength). */
	strength?: number;
	/** Probability of flipping a boolean or changing a choice. */
	flipRate?: number;
}

/**
 * Multi-scale uniform noise mutation (from +/-strength down to
 * +/-strength/1000, to refine near the optimum). Respects the
 * domain of each gene.
 *
 * @param options - See {@link PerturbOptions}.
 * @returns A {@link Mutator}.
 * @example
 * new GothMommy(seed, 20, score, { mutator: perturb({ strength: 2 }) });
 */
export const perturb =
	({ strength = 1, flipRate = 0.1 }: PerturbOptions = {}) =>
	(individual: HyperParams, space: Space = {}): HyperParams =>
		mutateGenes(
			individual,
			space,
			() => (Math.random() - 0.5) * 2 * strength * 10 ** (-3 * Math.random()),
			flipRate,
		);
