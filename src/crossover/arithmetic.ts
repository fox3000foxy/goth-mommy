import { type Space, fit, inferSpace } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Réels et entiers : combinaison convexe `α·a + (1-α)·b` (α aléatoire),
 * arrondie et bornée selon le domaine. Bool et choix : pris chez un parent.
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
