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
export type { EngineConfig, GenerationState } from "./engine.js";
export {
	type Gene,
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
	selector?: Selector;
	mutator?: Mutator;
	initializer?: Initializer;
}

export class GothMommy {
	private engine: Engine<HyperParams>;

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

	/** S'arrête quand le meilleur score brut atteint `threshold`, ou après `maxIterations`. */
	iterator(maxIterations?: number, threshold?: number) {
		return this.engine.iterator(maxIterations, threshold);
	}
}
