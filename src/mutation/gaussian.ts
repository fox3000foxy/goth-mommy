import type { Mutator } from "../types.js";

export interface GaussianOptions {
	/** Écart-type du bruit sur les nombres. */
	sigma?: number;
	/** Probabilité d'inverser un booléen. */
	flipRate?: number;
}

/** Loi normale centrée réduite (Box-Muller). */
const randn = (): number =>
	Math.sqrt(-2 * Math.log(1 - Math.random())) *
	Math.cos(2 * Math.PI * Math.random());

/** Bruit gaussien N(0, sigma²) sur les nombres, inversion aléatoire des booléens. */
export const gaussian =
	({ sigma = 1, flipRate = 0.1 }: GaussianOptions = {}): Mutator =>
	(individual) => {
		const copy = { ...individual };
		for (const key of Object.keys(copy)) {
			const value = copy[key]!;
			if (typeof value === "number") copy[key] = value + sigma * randn();
			else if (Math.random() < flipRate) copy[key] = !value;
		}
		return copy;
	};
