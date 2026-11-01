import {
	type HyperParams,
	type Population,
	type ScoringFunction,
	GothMommy,
} from "../src/index.js";

const hyperparams: HyperParams = {
	x: 5,
};

// Find x such that x^2 + 2x + 1 = 0 (double root at x = -1)
const fx = (x: number) => x * x + 2 * x + 1;

// A LARGER score = a BETTER individual.
// 1 when fx(x) = 0, decaying toward 0 as x moves away from the root.
const scoringFunction: ScoringFunction = (population: Population) =>
	population.map(
		(individual) => 1 / (1 + Math.abs(fx(individual.x as number))),
	);

const gothMommy = new GothMommy(hyperparams, 20, scoringFunction);

// Stop when fx(x) < 1e-8, or after 2000 iterations
const threshold = 1 / (1 + 1e-8);

let last: { iteration: number; best: HyperParams } | undefined;
for (const state of gothMommy.iterator(2000, threshold)) {
	last = state;
	if (state.iteration % 10 === 0) {
		console.log(
			`Iteration ${state.iteration}: best score = ${state.bestScore.toFixed(8)}, ` +
				`x = ${(state.best.x as number).toFixed(6)}`,
		);
	}
}

if (last) {
	const x = last.best.x as number;
	console.log(`\nDone at iteration ${last.iteration}`);
	console.log(`Best parameters: ${JSON.stringify(last.best)}`);
	console.log(`fx(x) = ${fx(x)}  (expected: ~0, with x ~= -1)`);
}
