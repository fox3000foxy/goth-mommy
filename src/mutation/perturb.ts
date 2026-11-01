import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";
import { mutateGenes } from "./genes.js";

/** Options de {@link perturb}. */
export interface PerturbOptions {
	/** Amplitude maximale du bruit (±strength). */
	strength?: number;
	/** Probabilité d'inverser un booléen ou de changer un choix. */
	flipRate?: number;
}

/**
 * Mutation par bruit uniforme multi-échelle (de ±strength jusqu'à
 * ±strength/1000, pour pouvoir affiner près de l'optimum). Respecte le
 * domaine de chaque gène.
 *
 * @param options - Voir {@link PerturbOptions}.
 * @returns Un {@link Mutator}.
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
