import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";

/** Chaque gène vient d'un des deux parents, tiré à pile ou face. */
export const uniform =
	() =>
	(a: HyperParams, b: HyperParams, _space?: Space): HyperParams => {
		const child = { ...a };
		for (const key of Object.keys(b)) {
			if (!(key in a) || Math.random() < 0.5) child[key] = b[key]!;
		}
		return child;
	};
