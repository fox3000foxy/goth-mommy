import { Engine } from "./engine.js";
import { spread } from "./initialization/spread.js";
import { perturb } from "./mutation/perturb.js";
import { proportional } from "./selection/proportional.js";
import { type Space, inferSpace, validateSeed } from "./space.js";
import type {
	Crossover,
	HyperParams,
	Initializer,
	Mutator,
	ScoringFunction,
	Selector,
} from "./types.js";

export type * from "./types.js";
export type { GenerationState } from "./engine.js";
export {
	type BoolGene,
	type ChoiceGene,
	type Gene,
	type IntGene,
	type RealGene,
	type Space,
	bool,
	choice,
	int,
	real,
} from "./space.js";
export { arithmetic } from "./crossover/arithmetic.js";
export { uniform } from "./crossover/uniform.js";
export { spread } from "./initialization/spread.js";
export { gaussian, type GaussianOptions } from "./mutation/gaussian.js";
export { perturb, type PerturbOptions } from "./mutation/perturb.js";
export { proportional } from "./selection/proportional.js";
export { tournament } from "./selection/tournament.js";
export {
	GothMommyPermutation,
	type Permutation,
	type PermutationCrossover,
	type PermutationMutator,
	type PermutationOptions,
	type PermutationScoringFunction,
	inversion,
	ox,
	pmx,
	swap,
} from "./permutation/index.js";

/** Options de {@link GothMommy}. Toutes sont facultatives. */
export interface GothMommyOptions {
	/**
	 * Domaine de chaque hyperparamètre (`real`, `int`, `bool`, `choice`).
	 * Les clés absentes sont déduites de la graine (nombre → réel, booléen → bool,
	 * chaîne → constante).
	 */
	space?: Space;
	/** Probabilité qu'un enfant soit muté (0..1). Défaut : 0.5. */
	mutationRate?: number;
	/** Nombre de meilleurs individus copiés tels quels. Défaut : 1. */
	elitism?: number;
	/** Probabilité de croiser deux parents (0..1). Défaut : 0.7. Sans effet sans `crossover`. */
	crossoverRate?: number;
	/** Absent par défaut : pas de croisement, un seul parent par enfant. */
	crossover?: Crossover;
	/** Choix des parents. Défaut : `proportional()`. */
	selector?: Selector;
	/** Mutation d'un individu. Défaut : `perturb()`. */
	mutator?: Mutator;
	/** Construction de la population de départ. Défaut : `spread()`. */
	initializer?: Initializer;
}

/**
 * Algorithme génétique pour chercher de bons hyperparamètres.
 *
 * Tu fournis un individu de départ, le domaine de chaque paramètre et une
 * fonction de score (plus grand = meilleur) ; la population évolue génération
 * après génération.
 *
 * @example
 * ```ts
 * // Trouver x tel que x² + 2x + 1 = 0 (racine double en x = -1)
 * const score = (population: HyperParams[]) =>
 *   population.map((p) => 1 / (1 + Math.abs((p.x as number) ** 2 + 2 * (p.x as number) + 1)));
 *
 * const ga = new GothMommy({ x: 5 }, 20, score);
 * for (const state of ga.iterator(2000, 0.999999)) {
 *   console.log(state.iteration, state.best);
 * }
 * ```
 */
export class GothMommy {
	private engine: Engine<HyperParams>;

	/**
	 * @param hyperparams - L'individu de départ (la graine). Il doit respecter
	 * son domaine, sinon le constructeur lève une erreur.
	 * @param populationSize - Nombre d'individus par génération. Défaut : 10.
	 * @param scoringFunction - Évalue la population. Défaut : des scores à 0.
	 * @param options - Domaines, taux et briques. Voir {@link GothMommyOptions}.
	 * @throws Si un gène du `space` manque dans `hyperparams` ou en sort.
	 */
	constructor(
		hyperparams: HyperParams = {},
		populationSize: number = 10,
		scoringFunction: ScoringFunction = (population) => population.map(() => 0),
		options: GothMommyOptions = {},
	) {
		const space = { ...inferSpace(hyperparams), ...options.space };
		validateSeed(hyperparams, space);
		const mutator = options.mutator ?? perturb();
		const { crossover } = options;
		this.engine = new Engine(
			(options.initializer ?? spread())(hyperparams, populationSize, space),
			{
				scoring: scoringFunction,
				selector: options.selector ?? proportional(),
				clone: (individual) => ({ ...individual }),
				mutate: (individual) => mutator(individual, space),
				crossover: crossover && ((a, b) => crossover(a, b, space)),
				mutationRate: options.mutationRate ?? 0.5,
				crossoverRate: options.crossoverRate ?? 0.7,
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
