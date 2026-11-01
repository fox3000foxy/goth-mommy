import { type Space, fit, inferSpace } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Arithmetic crossover. Reals and integers: convex combination
 * `alpha*a + (1-alpha)*b` (random alpha), rounded and clamped to the domain.
 * Booleans and choices: taken from either parent.
 *
 * @returns A {@link Crossover}.
 * @example
 * new GothMommy(seed, 20, score, { crossover: arithmetic() });
 */
export const arithmetic =
	() =>
	(a: HyperParams, b: HyperParams, space: Space = {}): HyperParams => {
		const genes = { ...inferSpace(a), ...space };
		const child = { ...a };
		const alpha = Math.random();
		for (const key of Object.keys(b)) {
			const x = a[key];
			const y = b[key]!;
			const gene = genes[key];
			if (
				gene &&
				(gene.type === "real" || gene.type === "int") &&
				typeof x === "number" &&
				typeof y === "number"
			) {
				child[key] = fit(gene, alpha * x + (1 - alpha) * y);
			} else if (!(key in a) || Math.random() < 0.5) {
				child[key] = y;
			}
		}
		return child;
	};
