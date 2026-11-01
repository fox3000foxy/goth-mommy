/**
 * Mixed-type hyperparameters: real, integer, category, boolean.
 *
 * The "model" is a fake loss function with a known optimum:
 * learningRate = 0.03, layers = 5, activation = "gelu", batchNorm = true, dropout = 0.2.
 */
import {
	GothMommy,
	type HyperParams,
	arithmetic,
	bool,
	choice,
	int,
	real,
	tournament,
} from "../src/index.js";

const seed = {
	logLr: -1, // the learning rate is searched on a log scale: lr = 10 ** logLr
	layers: 2,
	activation: "relu",
	batchNorm: false,
	dropout: 0.5,
};

const loss = (p: HyperParams) =>
	((p.logLr as number) - Math.log10(0.03)) ** 2 +
	0.1 * ((p.layers as number) - 5) ** 2 +
	(p.activation === "gelu" ? 0 : 0.5) +
	(p.batchNorm ? 0 : 0.3) +
	10 * ((p.dropout as number) - 0.2) ** 2;

const ga = new GothMommy(
	seed,
	40,
	(population) => population.map((p) => 1 / (1 + loss(p))),
	{
		space: {
			logLr: real(-5, 0),
			layers: int(1, 10),
			activation: choice(["relu", "tanh", "gelu"]),
			batchNorm: bool(),
			dropout: real(0, 0.9),
		},
		selector: tournament(3),
		crossover: arithmetic(),
	},
);

let last;
for (const state of ga.iterator(300, 1 / (1 + 1e-4))) {
	last = state;
	if (state.iteration % 20 === 0) {
		console.log(
			`generation ${state.iteration}: loss = ${loss(state.best).toFixed(4)}`,
		);
	}
}

const best = last!.best;
console.log(`\nFound in ${last!.iteration} generations:`);
console.log({ ...best, learningRate: 10 ** (best.logLr as number) });
