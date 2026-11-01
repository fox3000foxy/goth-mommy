import { type Space, inferSpace, randomValue } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Scattered starting population. The first individual is exactly the seed.
 * The others are drawn in each gene's domain: uniformly if bounded,
 * else within +/-`amplitude` around the seed.
 *
 * @param amplitude - Spread of unbounded reals. Default: 10.
 * @returns An {@link Initializer}.
 */
export const spread =
	(amplitude = 10) =>
	(seed: HyperParams, size: number, space: Space = {}) => {
		const genes = { ...inferSpace(seed), ...space };
		return Array.from({ length: size }, (_, i): HyperParams => {
			if (i === 0) return { ...seed };
			const individual = { ...seed };
			for (const key of Object.keys(seed)) {
				individual[key] = randomValue(genes[key]!, seed[key]!, amplitude);
			}
			return individual;
		});
	};
