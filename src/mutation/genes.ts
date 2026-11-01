import { type Space, fit, inferSpace, intStep } from "../space.js";
import type { HyperParams } from "../types.js";

/**
 * Mutation commune à tous les mutateurs : `noise()` fournit le bruit des
 * réels (et des entiers, arrondis), `flipRate` règle les bool et les choix.
 */
export const mutateGenes = (
	individual: HyperParams,
	space: Space,
	noise: () => number,
	flipRate: number,
): HyperParams => {
	const genes = { ...inferSpace(individual), ...space };
	const copy = { ...individual };
	for (const key of Object.keys(copy)) {
		const gene = genes[key]!;
		const value = copy[key]!;
		if (gene.type === "real") {
			copy[key] = fit(gene, (value as number) + noise());
		} else if (gene.type === "int") {
			copy[key] = fit(gene, (value as number) + intStep(noise()));
		} else if (Math.random() < flipRate) {
			if (gene.type === "bool") copy[key] = !value;
			else if (gene.values.length > 1) {
				const others = gene.values.filter((v) => v !== value);
				copy[key] = others[Math.floor(Math.random() * others.length)]!;
			}
		}
	}
	return copy;
};
