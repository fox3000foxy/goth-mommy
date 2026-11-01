import type { Crossover } from "../types.js";

/** Chaque gène vient d'un des deux parents, tiré à pile ou face. */
export const uniform = (): Crossover => (a, b) => {
	const child = { ...a };
	for (const key of Object.keys(b)) {
		if (!(key in a) || Math.random() < 0.5) child[key] = b[key]!;
	}
	return child;
};
