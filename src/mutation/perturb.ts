import type { Mutator } from "../types.js";

export interface PerturbOptions {
	/** Amplitude maximale du bruit sur les nombres (±strength). */
	strength?: number;
	/** Probabilité d'inverser un booléen. */
	flipRate?: number;
}

/**
 * Bruit uniforme multi-échelle sur les nombres (de ±strength jusqu'à
 * ±strength/1000, pour pouvoir affiner près de l'optimum) et inversion
 * aléatoire des booléens.
 */
export const perturb =
	({ strength = 1, flipRate = 0.1 }: PerturbOptions = {}): Mutator =>
	(individual) => {
		const copy = { ...individual };
		for (const key of Object.keys(copy)) {
			const value = copy[key]!;
			if (typeof value === "number") {
				const scale = strength * 10 ** (-3 * Math.random());
				copy[key] = value + (Math.random() - 0.5) * 2 * scale;
			} else if (Math.random() < flipRate) {
				copy[key] = !value;
			}
		}
		return copy;
	};
