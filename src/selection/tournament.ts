import type { Selector } from "../types.js";

/**
 * Sélection par tournoi : pour chaque parent, tire `size` individus au hasard
 * et garde le meilleur. Accepte les scores négatifs, contrairement à la
 * roulette.
 *
 * @param size - Taille du tournoi. Règle la pression de sélection :
 * 1 = tirage uniforme, plus grand = on favorise davantage les meilleurs.
 * Défaut : 3.
 * @returns Un {@link Selector}.
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
