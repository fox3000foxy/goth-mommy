import { describe, expect, test } from "bun:test";
import {
	GothMommyPermutation,
	inversion,
	ox,
	pmx,
	swap,
	tournament,
} from "../src/index.js";

const isPermutation = (p: number[], n: number) =>
	p.length === n && new Set(p).size === n && p.every((g) => g >= 0 && g < n);

const randomPerm = (n: number) =>
	Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);

describe("permutation operators", () => {
	for (const [name, cross] of [
		["ox", ox()],
		["pmx", pmx()],
	] as const) {
		test(`${name}: the child is always a valid permutation`, () => {
			for (let t = 0; t < 500; t++) {
				const n = 1 + Math.floor(Math.random() * 15);
				const a = randomPerm(n);
				const b = randomPerm(n);
				const [ca, cb] = [[...a], [...b]];
				expect(isPermutation(cross(a, b), n)).toBe(true);
				expect(a).toEqual(ca);
				expect(b).toEqual(cb);
			}
		});
	}
	test("ox and pmx: crossing two identical parents returns that parent", () => {
		const p = [3, 1, 4, 0, 2, 5];
		for (let t = 0; t < 50; t++) {
			expect(ox()(p, p)).toEqual(p);
			expect(pmx()(p, p)).toEqual(p);
		}
	});
	for (const [name, mutate] of [
		["swap", swap()],
		["inversion", inversion()],
	] as const) {
		test(`${name}: stays a permutation, does not modify the original`, () => {
			for (let t = 0; t < 300; t++) {
				const n = 1 + Math.floor(Math.random() * 12);
				const p = randomPerm(n);
				const copy = [...p];
				expect(isPermutation(mutate(p), n)).toBe(true);
				expect(p).toEqual(copy);
			}
		});
	}
	test("swap changes exactly two positions", () => {
		const p = [0, 1, 2, 3, 4, 5];
		const out = swap()(p);
		expect(out.filter((g, i) => g !== p[i])).toHaveLength(2);
	});
	test("inversion reverses a contiguous segment", () => {
		const out = inversion()([0, 1, 2, 3, 4, 5, 6, 7]);
		const first = out.findIndex((g, i) => g !== i);
		const last =
			out.length -
			1 -
			[...out].reverse().findIndex((g, i) => g !== out.length - 1 - i);
		expect(out.slice(first, last + 1)).toEqual(
			[0, 1, 2, 3, 4, 5, 6, 7].slice(first, last + 1).reverse(),
		);
	});
});

describe("GothMommyPermutation", () => {
	// cost = sum of distances to the ideal position; the solution is the identity
	const cost = (p: number[]) => p.reduce((s, g, i) => s + Math.abs(g - i), 0);
	const score = (pop: number[][]) => pop.map((p) => 1 / (1 + cost(p)));

	test("the initial population is made of valid permutations", () => {
		const ga = new GothMommyPermutation(9, 25, score);
		const [first] = [...ga.iterator(1)];
		expect(first!.population).toHaveLength(25);
		expect(first!.population.every((p) => isPermutation(p, 9))).toBe(true);
	});
	test("finds the optimal order with ox + swap", () => {
		const ga = new GothMommyPermutation(10, 60, score);
		let best: number[] = [];
		for (const s of ga.iterator(3000, 1)) best = s.best;
		expect(best).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});
	test("finds the optimal order with pmx + inversion", () => {
		const ga = new GothMommyPermutation(10, 60, score, {
			crossover: pmx(),
			mutator: inversion(),
			selector: tournament(4),
		});
		let best: number[] = [];
		for (const s of ga.iterator(3000, 1)) best = s.best;
		expect(cost(best)).toBeLessThanOrEqual(2);
	});
	test("all generations remain valid permutations", () => {
		const ga = new GothMommyPermutation(8, 20, score);
		for (const s of ga.iterator(40)) {
			expect(s.population.every((p) => isPermutation(p, 8))).toBe(true);
		}
	});
	test("rejects an invalid size", () => {
		expect(() => new GothMommyPermutation(0)).toThrow();
		expect(() => new GothMommyPermutation(2.5)).toThrow();
	});
});
