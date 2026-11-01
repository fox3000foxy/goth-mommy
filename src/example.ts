import {
	type HyperParams,
	type Population,
	type ScoringFunction,
	GothMommy,
} from "./index.js";

const hyperparams: HyperParams = {
	x: 5,
};

// Trouver x tel que x² + 2x + 1 = 0  (racine double en x = -1)
const fx = (x: number) => x * x + 2 * x + 1;

// Un score PLUS GRAND = un individu MEILLEUR.
// 1 quand fx(x) = 0, et tend vers 0 quand x s'éloigne de la racine.
const scoringFunction: ScoringFunction = (population: Population) =>
	population.map(
		(individual) => 1 / (1 + Math.abs(fx(individual.x as number))),
	);

const gothMommy = new GothMommy(hyperparams, 20, scoringFunction);

// Arrêt quand fx(x) < 1e-8, ou après 2000 itérations
const threshold = 1 / (1 + 1e-8);

let last: { iteration: number; best: HyperParams } | undefined;
for (const state of gothMommy.iterator(2000, threshold)) {
	last = state;
	if (state.iteration % 10 === 0) {
		console.log(
			`Iteration ${state.iteration}: meilleur score = ${state.bestScore.toFixed(8)}, ` +
				`x = ${(state.best.x as number).toFixed(6)}`,
		);
	}
}

if (last) {
	const x = last.best.x as number;
	console.log(`\nTerminé à l'itération ${last.iteration}`);
	console.log(`Meilleurs paramètres : ${JSON.stringify(last.best)}`);
	console.log(`fx(x) = ${fx(x)}  (attendu : ~0, avec x ≈ -1)`);
}
