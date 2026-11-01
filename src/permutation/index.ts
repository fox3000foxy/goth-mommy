import { Engine } from "../engine.js";
import { tournament } from "../selection/tournament.js";
import type { Score, Selector } from "../types.js";
import {
	type Permutation,
	type PermutationCrossover,
	ox,
} from "./crossover.js";
import { type PermutationMutator, swap } from "./mutation.js";

export {
	type Permutation,
	type PermutationCrossover,
	ox,
	pmx,
} from "./crossover.js";
export { type PermutationMutator, inversion, swap } from "./mutation.js";

/**
 * Évalue toute la population d'un coup, une fois par génération.
 *
 * @param population - Les permutations à évaluer.
 * @returns Un score par permutation, dans le même ordre. Plus grand = meilleur.
 */
export type PermutationScoringFunction = (population: Permutation[]) => Score;

/** Options de {@link GothMommyPermutation}. Toutes sont facultatives. */
export interface PermutationOptions {
	/** Probabilité qu'un enfant soit muté (0..1). Défaut : 0.5. */
	mutationRate?: number;
	/** Probabilité de croiser deux parents (0..1). Défaut : 0.9. Mettre 0 pour désactiver. */
	crossoverRate?: number;
	/** Nombre de meilleurs individus copiés tels quels. Défaut : 1. */
	elitism?: number;
	/** Défaut : `tournament(3)`. */
	selector?: Selector;
	/** Défaut : `ox()`. */
	crossover?: PermutationCrossover;
	/** Défaut : `swap()`. */
	mutator?: PermutationMutator;
}

const shuffled = (size: number): Permutation => {
	const p = Array.from({ length: size }, (_, i) => i);
	for (let i = size - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[p[i], p[j]] = [p[j]!, p[i]!];
	}
	return p;
};

/**
 * Algorithme génétique pour les problèmes d'ordre (TSP, ordonnancement…).
 * Un individu est une permutation des entiers `0..size-1` : à toi de faire
 * correspondre ces entiers à tes villes, tâches, etc.
 *
 * @example
 * ```ts
 * // Circuit le plus court : score = inverse de la longueur du circuit
 * const ga = new GothMommyPermutation(cities.length, 50, (population) =>
 *   population.map((tour) => 1 / tourLength(tour)),
 *   { crossover: pmx(), mutator: inversion() },
 * );
 * for (const state of ga.iterator(200)) console.log(state.best);
 * ```
 */
export class GothMommyPermutation {
	private engine: Engine<Permutation>;

	/**
	 * @param size - Nombre d'éléments à ordonner (entier >= 1).
	 * @param populationSize - Nombre de permutations par génération. Défaut : 10.
	 * @param scoringFunction - Évalue la population. Défaut : des scores à 0.
	 * @param options - Taux et briques. Voir {@link PermutationOptions}.
	 * @throws Si `size` n'est pas un entier >= 1.
	 */
	constructor(
		size: number,
		populationSize: number = 10,
		scoringFunction: PermutationScoringFunction = (population) =>
			population.map(() => 0),
		options: PermutationOptions = {},
	) {
		if (!Number.isInteger(size) || size < 1) {
			throw new Error("size doit être un entier >= 1");
		}
		this.engine = new Engine(
			Array.from({ length: populationSize }, () => shuffled(size)),
			{
				scoring: scoringFunction,
				selector: options.selector ?? tournament(3),
				clone: (individual) => [...individual],
				mutate: options.mutator ?? swap(),
				crossover: options.crossover ?? ox(),
				mutationRate: options.mutationRate ?? 0.5,
				crossoverRate: options.crossoverRate ?? 0.9,
				elitism: options.elitism ?? 1,
			},
		);
	}

	/**
	 * Fait évoluer la population, une génération par itération.
	 *
	 * @param maxIterations - Garde-fou contre les boucles infinies. Défaut : 1000.
	 * @param threshold - S'arrête quand le meilleur score brut l'atteint.
	 * Défaut : `Infinity` (jamais).
	 * @returns Un état par génération : population, scores, meilleur individu.
	 */
	iterator(maxIterations?: number, threshold?: number) {
		return this.engine.iterator(maxIterations, threshold);
	}
}
