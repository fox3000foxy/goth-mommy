import type { Crossover } from "../types.js";

/**
 * Nombres : combinaison convexe `α·a + (1-α)·b` avec α tiré au hasard.
 * Booléens : pris chez l'un des deux parents.
 */
export const arithmetic = (): Crossover => (a, b) => {
	const child = { ...a };
	const alpha = Math.random();
	for (const key of Object.keys(b)) {
		const x = a[key];
		const y = b[key]!;
		if (typeof x === "number" && typeof y === "number") {
			child[key] = alpha * x + (1 - alpha) * y;
		} else if (!(key in a) || Math.random() < 0.5) {
			child[key] = y;
		}
	}
	return child;
};
