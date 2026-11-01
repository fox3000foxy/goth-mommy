import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Uniform crossover: each gene comes from either parent, picked by
 * coin flip. Fits all gene types.
 *
 * @returns A {@link Crossover}.
 * @example
 * new GothMommy(seed, 20, score, { crossover: uniform() });
 */
export const uniform =
	() =>
	(a: HyperParams, b: HyperParams, _space?: Space): HyperParams => {
		const child = { ...a };
		for (const key of Object.keys(b)) {
			if (!(key in a) || Math.random() < 0.5) child[key] = b[key]!;
		}
		return child;
	};
