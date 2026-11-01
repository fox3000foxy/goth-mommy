import type { Space } from "../space.js";
import type { HyperParams } from "../types.js";
import { mutateGenes } from "./genes.js";

export interface GaussianOptions {
	/** Écart-type du bruit. */
	sigma?: number;
	/** Probabilité d'inverser un booléen ou de changer un choix. */
	flipRate?: number;
}

/** Loi normale centrée réduite (Box-Muller). */
const randn = (): number =>
	Math.sqrt(-2 * Math.log(1 - Math.random())) *
	Math.cos(2 * Math.PI * Math.random());

/** Bruit gaussien N(0, sigma²). Respecte le domaine de chaque gène. */
export const gaussian =
	({ sigma = 1, flipRate = 0.1 }: GaussianOptions = {}) =>
	(individual: HyperParams, space: Space = {}): HyperParams =>
		mutateGenes(individual, space, () => sigma * randn(), flipRate);
