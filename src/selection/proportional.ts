import type { Selector } from "../types.js";

/**
 * Roulette : probabilité proportionnelle au score.
 * Les scores doivent être >= 0. Si leur somme est nulle, tirage uniforme.
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
		return scores.length - 1; // erreurs d'arrondi
	};
	return Array.from({ length: k }, pick);
};
