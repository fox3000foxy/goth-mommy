import { type Space, inferSpace, randomValue } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Le premier individu est exactement la graine. Les autres sont tirés dans le
 * domaine de chaque gène : uniformément s'il est borné, sinon à ±amplitude
 * autour de la graine.
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
