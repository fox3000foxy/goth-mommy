import type { Score, Selector } from "./types.js";

export interface EngineConfig<T> {
	scoring: (population: T[]) => Score;
	selector: Selector;
	/** Copie indépendante d'un individu. */
	clone: (individual: T) => T;
	mutate: (individual: T) => T;
	/** Absent : pas de croisement, un seul parent par enfant. */
	crossover?: (a: T, b: T) => T;
	mutationRate: number;
	crossoverRate: number;
	/** Nombre de meilleurs individus copiés tels quels. */
	elitism: number;
}

export interface GenerationState<T> {
	population: T[];
	scores: Score;
	iteration: number;
	bestScore: number;
	best: T;
}

/** Boucle d'évolution commune, indépendante de la forme des individus. */
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
		// élitisme : les meilleurs survivent tels quels
		const next = ranked
			.slice(0, elitism)
			.map(([, i]) => clone(this.population[i]!));
		const count = this.population.length - next.length;
		// avec croisement : deux parents par enfant
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

	/** S'arrête quand le meilleur score brut atteint `threshold`, ou après `maxIterations`. */
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
