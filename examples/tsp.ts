/**
 * Voyageur de commerce : trouver le plus court circuit passant par toutes
 * les villes. Un individu est une permutation des indices de villes.
 */
import { GothMommyPermutation, inversion, ox } from "../src/index.js";

// Villes pseudo-aléatoires mais reproductibles
let seed = 42;
const random = () => (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;
const cities = Array.from({ length: 20 }, () => ({
	x: random() * 100,
	y: random() * 100,
}));

const length = (tour: number[]) =>
	tour.reduce((sum, city, i) => {
		const a = cities[city]!;
		const b = cities[tour[(i + 1) % tour.length]!]!;
		return sum + Math.hypot(b.x - a.x, b.y - a.y);
	}, 0);

const ga = new GothMommyPermutation(
	cities.length,
	100,
	(population) => population.map((tour) => 1 / length(tour)),
	{ crossover: ox(), mutator: inversion(), mutationRate: 0.4 },
);

let first;
let last;
for (const state of ga.iterator(500)) {
	first ??= state;
	last = state;
	if (state.iteration % 100 === 0) {
		console.log(
			`génération ${state.iteration}: longueur = ${length(state.best).toFixed(1)}`,
		);
	}
}

console.log(`\nCircuit initial : ${length(first!.best).toFixed(1)}`);
console.log(`Circuit final   : ${length(last!.best).toFixed(1)}`);
console.log(`Ordre des villes : ${last!.best.join(" → ")}`);
