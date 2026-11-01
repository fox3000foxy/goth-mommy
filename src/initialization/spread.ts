import { perturb } from "../mutation/perturb.js";
import type { Initializer } from "../types.js";

/**
 * Le premier individu est exactement la graine, les autres sont dispersés
 * autour (±amplitude sur les nombres).
 */
export const spread =
	(amplitude = 10): Initializer =>
	(seed, size) => {
		const mutate = perturb({ strength: amplitude });
		return Array.from({ length: size }, (_, i) =>
			i === 0 ? { ...seed } : mutate(seed),
		);
	};
