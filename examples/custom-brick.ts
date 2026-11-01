/**
 * Write your own bricks: a truncation selector and a mutator
 * that only touches one gene at a time. Just match the `Selector`
 * and `Mutator` types.
 */
import {
	GothMommy,
	type Mutator,
	type Selector,
	uniform,
} from "../src/index.js";

/** Only keeps the `fraction` best individuals as possible parents. */
const truncation =
	(fraction = 0.5): Selector =>
	(scores, k) => {
		const ranked = scores
			.map((score, i) => [score, i] as const)
			.sort((a, b) => b[0] - a[0])
			.map(([, i]) => i);
		const pool = ranked.slice(
			0,
			Math.max(1, Math.ceil(ranked.length * fraction)),
		);
		return Array.from(
			{ length: k },
			() => pool[Math.floor(Math.random() * pool.length)]!,
		);
	};

/** Mutates a single numeric gene, picked at random. Does not modify the original. */
const oneGene =
	(step = 0.5): Mutator =>
	(individual) => {
		const keys = Object.keys(individual);
		const key = keys[Math.floor(Math.random() * keys.length)]!;
		return {
			...individual,
			[key]: (individual[key] as number) + (Math.random() - 0.5) * 2 * step,
		};
	};

// Minimize the distance to the point (1, -2, 3)
const target = { x: 1, y: -2, z: 3 };
const distance = (p: Record<string, number | boolean | string>) =>
	Math.hypot(
		(p.x as number) - target.x,
		(p.y as number) - target.y,
		(p.z as number) - target.z,
	);

const ga = new GothMommy(
	{ x: 0, y: 0, z: 0 },
	30,
	(population) => population.map((p) => 1 / (1 + distance(p))),
	{ selector: truncation(0.4), mutator: oneGene(0.5), crossover: uniform() },
);

let last;
for (const state of ga.iterator(1000, 1 / (1 + 1e-3))) last = state;
console.log(`Found in ${last!.iteration} generations:`, last!.best);
