import type { Selector } from "../types.js";

/**
 * Roulette selection: probability proportional to the score.
 * Scores must be >= 0. If their sum is zero, pick uniformly.
 *
 * @returns A {@link Selector}.
 * @example
 * new GothMommy(seed, 20, score, { selector: proportional() });
 */
export const proportional = (): Selector => (scores, k) => {
	const total = scores.reduce((a, b) => a + b, 0);
	const pick = (): number => {
		if (!(total > 0)) return Math.floor(Math.random() * scores.length);
		let r = Math.random() * total;
		for (let i = 0; i < scores.length; i++) {
			r -= scores[i]!;
			if (r < 0) return i;
		}
		return scores.length - 1; // rounding errors
	};
	return Array.from({ length: k }, pick);
};
