import type { Score, Selector } from "./types.js";

/** Evolution engine settings (internal). */
export interface EngineConfig<T> {
	scoring: (population: T[]) => Score;
	selector: Selector;
	/** Independent copy of an individual. */
	clone: (individual: T) => T;
	mutate: (individual: T) => T;
	/** Absent: no crossover, one parent per child. */
	crossover?: (a: T, b: T) => T;
	mutationRate: number;
	crossoverRate: number;
	/** Number of best individuals copied as is. */
	elitism: number;
}

/** What the `iterator` yields at each generation. */
export interface GenerationState<T> {
	/** The individuals of this generation. */
	population: T[];
	/** Their scores, in the same order. */
	scores: Score;
	/** The generation number, starting from 0. */
	iteration: number;
	/** The best score of the generation. */
	bestScore: number;
	/** The individual that got `bestScore`. */
	best: T;
}

/** Shared evolution loop, independent of the individual shape. */
export class Engine<T> {
	constructor(
		private population: T[],
		private config: EngineConfig<T>,
	) {}

	private nextPopulation(scores: Score): T[] {
		const { selector, clone, mutate, crossover } = this.config;
		const ranked = scores
			.map((score, i) => [score, i] as const)
			.sort((a, b) => b[0] - a[0]);
		const elitism = Math.min(this.config.elitism, this.population.length);
		// elitism: the best survive as is
		const next = ranked
			.slice(0, elitism)
			.map(([, i]) => clone(this.population[i]!));
		const count = this.population.length - next.length;
		// with crossover: two parents per child
		const parents = selector(scores, crossover ? count * 2 : count);
		for (let c = 0; c < count; c++) {
			const a = this.population[parents[crossover ? 2 * c : c]!]!;
			let child = clone(a);
			if (crossover && Math.random() < this.config.crossoverRate) {
				child = crossover(a, this.population[parents[2 * c + 1]!]!);
			}
			next.push(
				Math.random() < this.config.mutationRate ? mutate(child) : child,
			);
		}
		return next;
	}

	/** Stop when the best raw score reaches `threshold`, or after `maxIterations`. */
	*iterator(
		maxIterations: number = 1000,
		threshold: number = Infinity,
	): Generator<GenerationState<T>> {
		for (let i = 0; i < maxIterations; i++) {
			const scores = this.config.scoring(this.population);
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
