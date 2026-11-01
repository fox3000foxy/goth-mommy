import type { Selector } from "../types.js";

/**
 * Pour chaque parent : tire `size` individus au hasard et garde le meilleur.
 * `size` règle la pression de sélection (1 = tirage uniforme). Accepte les
 * scores négatifs, contrairement à la roulette.
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
