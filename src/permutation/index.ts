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

export type PermutationScoringFunction = (population: Permutation[]) => Score;

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
 */
export class GothMommyPermutation {
	private engine: Engine<Permutation>;

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

	/** S'arrête quand le meilleur score brut atteint `threshold`, ou après `maxIterations`. */
	iterator(maxIterations?: number, threshold?: number) {
		return this.engine.iterator(maxIterations, threshold);
	}
}
