import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Croisement uniforme : chaque gène vient d'un des deux parents, tiré à pile
 * ou face. Convient à tous les types de gènes.
 *
 * @returns Un {@link Crossover}.
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
