import { describe, expect, test } from "bun:test";
import {
	GothMommy,
	type HyperParams,
	arithmetic,
	bool,
	choice,
	gaussian,
	int,
	perturb,
	real,
	spread,
	tournament,
	uniform,
} from "../src/index.js";

const space = {
	lr: real(0, 1),
	layers: int(1, 8),
	act: choice(["relu", "tanh", "gelu"]),
	norm: bool(),
};
const seed: HyperParams = { lr: 0.5, layers: 4, act: "relu", norm: true };

const valid = (p: HyperParams) =>
	(p.lr as number) >= 0 &&
	(p.lr as number) <= 1 &&
	Number.isInteger(p.layers) &&
	(p.layers as number) >= 1 &&
	(p.layers as number) <= 8 &&
	["relu", "tanh", "gelu"].includes(p.act as string) &&
	typeof p.norm === "boolean";

describe("domaines des gènes", () => {
	test("spread : tout respecte le domaine, la graine est conservée", () => {
		const pop = spread(10)(seed, 200, space);
		expect(pop[0]).toEqual(seed);
		expect(pop.every(valid)).toBe(true);
		expect(new Set(pop.map((p) => p.act)).size).toBe(3);
		expect(new Set(pop.map((p) => p.layers)).size).toBeGreaterThan(4);
	});
	for (const [name, mutate] of [
		["perturb", perturb({ strength: 50, flipRate: 1 })],
		["gaussian", gaussian({ sigma: 50, flipRate: 1 })],
	] as const) {
		test(`${name} : reste dans le domaine, ne touche pas l'original`, () => {
			let p = { ...seed };
			for (let i = 0; i < 300; i++) {
				p = mutate(p, space);
				expect(valid(p)).toBe(true);
			}
			expect(seed).toEqual({ lr: 0.5, layers: 4, act: "relu", norm: true });
		});
		test(`${name} : un entier bouge toujours, un choix change`, () => {
			const out = mutate({ layers: 4, act: "relu" }, space);
			expect(out.layers).not.toBe(4);
			expect(out.act).not.toBe("relu");
		});
	}
	test("croisements : restent dans le domaine", () => {
		const other: HyperParams = { lr: 0.9, layers: 7, act: "tanh", norm: false };
		for (const cross of [uniform(), arithmetic()]) {
			for (let i = 0; i < 200; i++) {
				expect(valid(cross(seed, other, space))).toBe(true);
			}
		}
	});
	test("sans space : une chaîne reste constante, un nombre reste réel", () => {
		const out = perturb({ strength: 5 })({ x: 1, name: "a" });
		expect(out.name).toBe("a");
		expect(Number.isInteger(out.x)).toBe(false);
	});
});

describe("GothMommy avec space", () => {
	const score = (pop: HyperParams[]) =>
		pop.map(
			(p) =>
				1 /
				(1 +
					((p.layers as number) - 7) ** 2 +
					(p.act === "tanh" ? 0 : 3) +
					(p.norm ? 0 : 2) +
					Math.abs((p.lr as number) - 0.1)),
		);
	test("trouve layers=7, act=tanh, norm=true, lr≈0.1", () => {
		const ga = new GothMommy(seed, 30, score, {
			space,
			selector: tournament(3),
			crossover: uniform(),
		});
		let best = seed;
		for (const s of ga.iterator(500, 1 / (1 + 0.02))) best = s.best;
		expect(valid(best)).toBe(true);
		expect(best.layers).toBe(7);
		expect(best.act).toBe("tanh");
		expect(best.norm).toBe(true);
		expect(Math.abs((best.lr as number) - 0.1)).toBeLessThan(0.05);
	});
	test("refuse une graine incohérente avec le space", () => {
		expect(
			() => new GothMommy({ ...seed, layers: 99 }, 5, undefined, { space }),
		).toThrow();
		expect(
			() => new GothMommy({ ...seed, act: "swish" }, 5, undefined, { space }),
		).toThrow();
		expect(() => new GothMommy({ lr: 0.5 }, 5, undefined, { space })).toThrow();
	});
});
