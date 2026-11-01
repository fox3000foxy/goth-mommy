import type { Selector } from "../types.js";

/**
 * Tournament selection: for each parent, draw `size` individuals at random
 * and keep the best. Accepts negative scores, unlike
 * roulette.
 *
 * @param size - Tournament size. Controls selection pressure:
 * 1 = uniform draw, larger = favors the best more.
 * Default: 3.
 * @returns A {@link Selector}.
 * @example
 * new GothMommy(seed, 20, score, { selector: tournament(5) });
 */
export const tournament =
	(size = 3): Selector =>
	(scores, k) =>
		Array.from({ length: k }, () => {
			let best = Math.floor(Math.random() * scores.length);
			for (let i = 1; i < size; i++) {
				const challenger = Math.floor(Math.random() * scores.length);
				if (scores[challenger]! > scores[best]!) best = challenger;
			}
			return best;
		});
