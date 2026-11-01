/**
 * Knapsack: which items to pack to maximize value without exceeding
 * the capacity? One boolean gene per item (true = in the bag).
 */
import {
	GothMommy,
	type HyperParams,
	tournament,
	uniform,
} from "../src/index.js";

const items = [
	{ weight: 12, value: 4 },
	{ weight: 2, value: 2 },
	{ weight: 1, value: 1 },
	{ weight: 4, value: 10 },
	{ weight: 1, value: 2 },
	{ weight: 7, value: 7 },
	{ weight: 5, value: 8 },
	{ weight: 3, value: 5 },
	{ weight: 9, value: 9 },
	{ weight: 6, value: 3 },
	{ weight: 8, value: 11 },
	{ weight: 2, value: 3 },
];
const capacity = 25;

const totals = (bag: HyperParams) =>
	items.reduce(
		(t, item, i) =>
			bag[`item${i}`]
				? { weight: t.weight + item.weight, value: t.value + item.value }
				: t,
		{ weight: 0, value: 0 },
	);

// Bag value, with a penalty when over capacity. Always >= 0.
const score = (bag: HyperParams) => {
	const { weight, value } = totals(bag);
	return Math.max(0, value - 10 * Math.max(0, weight - capacity));
};

// Exact solution by brute force (2^12 combinations), for comparison
let optimum = 0;
for (let mask = 0; mask < 1 << items.length; mask++) {
	const bag = Object.fromEntries(
		items.map((_, i) => [`item${i}`, Boolean(mask & (1 << i))]),
	);
	optimum = Math.max(optimum, score(bag));
}

const seed = Object.fromEntries(items.map((_, i) => [`item${i}`, false]));
const ga = new GothMommy(seed, 40, (population) => population.map(score), {
	selector: tournament(3),
	crossover: uniform(),
});

let last;
for (const state of ga.iterator(300, optimum)) last = state;

const found = totals(last!.best);
console.log(`Exact optimum: value ${optimum}`);
console.log(
	`GothMommy      : value ${found.value}, weight ${found.weight}/${capacity}, in ${last!.iteration} generations`,
);
