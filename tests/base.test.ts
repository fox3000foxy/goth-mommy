import { describe, expect, test } from "bun:test";
import { GothMommy, perturb, proportional, spread } from "../src/index.js";

describe("proportional", () => {
	test("returns k valid indices", () => {
		const picks = proportional()([1, 2, 3], 50);
		expect(picks).toHaveLength(50);
		for (const i of picks) expect(i).toBeGreaterThanOrEqual(0);
		for (const i of picks) expect(i).toBeLessThan(3);
	});
	test("only picks the individual with a non-zero score", () => {
		expect(new Set(proportional()([0, 0, 1], 100))).toEqual(new Set([2]));
	});
	test("uniform draw when all scores are zero", () => {
		const picks = proportional()([0, 0, 0], 300);
		expect(new Set(picks).size).toBe(3);
	});
});

describe("perturb", () => {
	test("does not modify the original and keeps keys and types", () => {
		const original = { x: 1, flag: true };
		const out = perturb({ strength: 5, flipRate: 1 })(original);
		expect(original).toEqual({ x: 1, flag: true });
		expect(Object.keys(out)).toEqual(["x", "flag"]);
		expect(typeof out.x).toBe("number");
		expect(out.flag).toBe(false);
		expect(Math.abs((out.x as number) - 1)).toBeLessThanOrEqual(5);
	});
});

describe("spread", () => {
	test("the first individual is the seed, the others are scattered", () => {
		const pop = spread(10)({ x: 5 }, 20);
		expect(pop).toHaveLength(20);
		expect(pop[0]).toEqual({ x: 5 });
		expect(pop.some((p) => p.x !== 5)).toBe(true);
	});
});

describe("GothMommy", () => {
	const fx = (x: number) => x * x + 2 * x + 1;
	const score = (pop: { x?: number | boolean }[]) =>
		pop.map((p) => 1 / (1 + Math.abs(fx(p.x as number))));

	test("converges to x = -1", () => {
		const ga = new GothMommy({ x: 5 }, 20, score);
		let last: { best: { x?: number | boolean } } | undefined;
		for (const s of ga.iterator(2000, 1 / (1 + 1e-6))) last = s;
		expect(Math.abs((last!.best.x as number) + 1)).toBeLessThan(0.01);
	});
	test("calls the score function only once per iteration", () => {
		let calls = 0;
		const ga = new GothMommy({ x: 0 }, 5, (pop) => {
			calls++;
			return pop.map(() => 0.5);
		});
		const states = [...ga.iterator(7)];
		expect(states).toHaveLength(7);
		expect(calls).toBe(7);
	});
	test("the best never regresses (elitism)", () => {
		const ga = new GothMommy({ x: 5 }, 10, score);
		let previous = 0;
		for (const s of ga.iterator(100)) {
			expect(s.bestScore).toBeGreaterThanOrEqual(previous);
			previous = s.bestScore;
		}
	});
	test("accepts custom bricks", () => {
		const ga = new GothMommy({ x: 1 }, 4, (pop) => pop.map(() => 1), {
			selector: (_scores, k) => Array.from({ length: k }, () => 0),
			mutator: (ind) => ({ ...ind, x: 42 }),
			mutationRate: 1,
		});
		const [first, second] = [...ga.iterator(2)];
		expect(first!.iteration).toBe(0);
		expect(second!.population.slice(1).every((p) => p.x === 42)).toBe(true);
	});
});
