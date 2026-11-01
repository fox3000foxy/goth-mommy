import { spread } from "./initialization/spread.js";
import { perturb } from "./mutation/perturb.js";
import { proportional } from "./selection/proportional.js";
import type {
	Crossover,
	HyperParams,
	Initializer,
	Mutator,
	Population,
	Score,
	ScoringFunction,
	Selector,
} from "./types.js";

export type * from "./types.js";
export { arithmetic } from "./crossover/arithmetic.js";
export { uniform } from "./crossover/uniform.js";
export { spread } from "./initialization/spread.js";
export { gaussian, type GaussianOptions } from "./mutation/gaussian.js";
export { perturb, type PerturbOptions } from "./mutation/perturb.js";
export { proportional } from "./selection/proportional.js";
export { tournament } from "./selection/tournament.js";

export interface GothMommyOptions {
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
	private population: Population;
	private selector: Selector;
	private mutator: Mutator;
	private crossover: Crossover | undefined;
	private crossoverRate: number;
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
		this.crossover = options.crossover;
		this.crossoverRate = options.crossoverRate ?? 0.7;
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
		const count = this.population.length - next.length;
		// avec croisement : deux parents par enfant
		const parents = this.selector(scores, this.crossover ? count * 2 : count);
		for (let c = 0; c < count; c++) {
			const a = this.population[parents[this.crossover ? 2 * c : c]!]!;
			let child = { ...a };
			if (this.crossover && Math.random() < this.crossoverRate) {
				child = this.crossover(a, this.population[parents[2 * c + 1]!]!);
			}
			next.push(
				Math.random() < this.mutationRate ? this.mutator(child) : child,
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
