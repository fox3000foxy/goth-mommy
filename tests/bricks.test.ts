import { describe, expect, test } from "bun:test";
import {
	GothMommy,
	arithmetic,
	gaussian,
	tournament,
	uniform,
} from "../src/index.js";

describe("tournament", () => {
	test("returns k valid indices", () => {
		const picks = tournament(3)([1, 5, -2, 0], 40);
		expect(picks).toHaveLength(40);
		for (const i of picks) expect(i).toBeGreaterThanOrEqual(0);
		for (const i of picks) expect(i).toBeLessThan(4);
	});
	test("a large tournament always picks the best, even with negative scores", () => {
		expect(new Set(tournament(200)([-5, -1, -9], 20))).toEqual(new Set([1]));
	});
	test("size 1: every individual can be picked", () => {
		expect(new Set(tournament(1)([1, 2, 3], 300)).size).toBe(3);
	});
});

describe("gaussian", () => {
	test("does not modify the original, keeps keys and types", () => {
		const original = { x: 1, flag: true };
		const out = gaussian({ sigma: 2, flipRate: 1 })(original);
		expect(original).toEqual({ x: 1, flag: true });
		expect(Object.keys(out)).toEqual(["x", "flag"]);
		expect(typeof out.x).toBe("number");
		expect(out.flag).toBe(false);
	});
	test("mean ~= 0 and std dev ~= sigma", () => {
		const m = gaussian({ sigma: 2 });
		const xs = Array.from({ length: 5000 }, () => m({ x: 0 }).x as number);
		const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
		const sd = Math.sqrt(
			xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length,
		);
		expect(Math.abs(mean)).toBeLessThan(0.15);
		expect(Math.abs(sd - 2)).toBeLessThan(0.15);
	});
});

describe("crossover", () => {
	const a = { x: 0, f: false };
	const b = { x: 10, f: true };
	test("uniform: each gene comes from one parent, parents untouched", () => {
		const seen = new Set<number>();
		for (let i = 0; i < 100; i++) {
			const c = uniform()(a, b);
			expect([0, 10]).toContain(c.x as number);
			seen.add(c.x as number);
		}
		expect(seen.size).toBe(2);
		expect(a).toEqual({ x: 0, f: false });
		expect(b).toEqual({ x: 10, f: true });
	});
	test("arithmetic: numbers stay between the parents", () => {
		for (let i = 0; i < 100; i++) {
			const c = arithmetic()(a, b);
			expect(c.x as number).toBeGreaterThanOrEqual(0);
			expect(c.x as number).toBeLessThanOrEqual(10);
			expect(typeof c.f).toBe("boolean");
		}
	});
});

describe("GothMommy with the new bricks", () => {
	const fx = (x: number) => x * x + 2 * x + 1;
	const score = (pop: { x?: number | boolean }[]) =>
		pop.map((p) => 1 / (1 + Math.abs(fx(p.x as number))));

	test("converges with tournament + arithmetic crossover + gaussian mutation", () => {
		const ga = new GothMommy({ x: 5 }, 20, score, {
			selector: tournament(3),
			crossover: arithmetic(),
			mutator: gaussian({ sigma: 0.5 }),
		});
		let best = 5;
		for (const s of ga.iterator(2000, 1 / (1 + 1e-6)))
			best = s.best.x as number;
		expect(Math.abs(best + 1)).toBeLessThan(0.01);
	});
	test("with crossover, the selector receives 2 parents per child", () => {
		let asked = -1;
		const ga = new GothMommy({ x: 0 }, 6, (p) => p.map(() => 1), {
			elitism: 1,
			crossover: uniform(),
			selector: (_s, k) => {
				asked = k;
				return Array.from({ length: k }, () => 0);
			},
		});
		[...ga.iterator(2)];
		expect(asked).toBe(10); // (6 - 1 elite) * 2
	});
	test("without crossover, a single parent per child", () => {
		let asked = -1;
		const ga = new GothMommy({ x: 0 }, 6, (p) => p.map(() => 1), {
			selector: (_s, k) => {
				asked = k;
				return Array.from({ length: k }, () => 0);
			},
		});
		[...ga.iterator(2)];
		expect(asked).toBe(5);
	});
});
