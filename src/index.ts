import { spread } from "./initialization/spread.js";
import { perturb } from "./mutation/perturb.js";
import { proportional } from "./selection/proportional.js";
import type {
	HyperParams,
	Initializer,
	Mutator,
	Population,
	Score,
	ScoringFunction,
	Selector,
} from "./types.js";

export type * from "./types.js";
export { spread } from "./initialization/spread.js";
export { perturb, type PerturbOptions } from "./mutation/perturb.js";
export { proportional } from "./selection/proportional.js";

export interface GothMommyOptions {
	/** Probabilité qu'un enfant soit muté (0..1). Défaut : 0.5. */
	mutationRate?: number;
	/** Nombre de meilleurs individus copiés tels quels. Défaut : 1. */
	elitism?: number;
	selector?: Selector;
	mutator?: Mutator;
	initializer?: Initializer;
}

export class GothMommy {
	private population: Population;
	private selector: Selector;
	private mutator: Mutator;
	private mutationRate: number;
	private elitism: number;

	constructor(
		hyperparams: HyperParams = {},
		populationSize: number = 10,
		private scoringFunction: ScoringFunction = (population) =>
			population.map(() => 0),
		options: GothMommyOptions = {},
	) {
		this.selector = options.selector ?? proportional();
		this.mutator = options.mutator ?? perturb();
		this.mutationRate = options.mutationRate ?? 0.5;
		this.elitism = Math.min(options.elitism ?? 1, populationSize);
		this.population = (options.initializer ?? spread())(
			hyperparams,
			populationSize,
		);
	}

	private nextPopulation(scores: Score): Population {
		const ranked = scores
			.map((score, i) => [score, i] as const)
			.sort((a, b) => b[0] - a[0]);
		// élitisme : les meilleurs survivent tels quels
		const next: Population = ranked
			.slice(0, this.elitism)
			.map(([, i]) => ({ ...this.population[i]! }));
		const parents = this.selector(scores, this.population.length - next.length);
		for (const index of parents) {
			const parent = this.population[index]!;
			next.push(
				Math.random() < this.mutationRate
					? this.mutator(parent)
					: { ...parent },
			);
		}
		return next;
	}

	/** S'arrête quand le meilleur score brut atteint `threshold`, ou après `maxIterations`. */
	*iterator(maxIterations: number = 1000, threshold: number = Infinity) {
		for (let i = 0; i < maxIterations; i++) {
			const scores = this.scoringFunction(this.population);
			const bestScore = Math.max(...scores);
			const best = this.population[scores.indexOf(bestScore)]!;
			yield {
				population: this.population,
				scores,
				iteration: i,
				bestScore,
				best,
			};
			if (bestScore >= threshold) return;
			this.population = this.nextPopulation(scores);
		}
	}
}
