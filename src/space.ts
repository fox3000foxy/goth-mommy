import type { HyperParams } from "./types.js";

/** Real number, optionally bounded. See {@link real}. */
export interface RealGene {
	/** Discriminator: always `"real"`. */
	type: "real";
	/** Lower bound (`-Infinity` if unbounded). */
	min: number;
	/** Upper bound (`Infinity` if unbounded). */
	max: number;
}

/** Integer in a range. See {@link int}. */
export interface IntGene {
	/** Discriminator: always `"int"`. */
	type: "int";
	/** Smallest allowed value. */
	min: number;
	/** Largest allowed value. */
	max: number;
}

/** Boolean. See {@link bool}. */
export interface BoolGene {
	/** Discriminator: always `"bool"`. */
	type: "bool";
}

/** One value from a list. See {@link choice}. */
export interface ChoiceGene {
	/** Discriminator: always `"choice"`. */
	type: "choice";
	/** The possible values, compared with `===`. */
	values: readonly (number | boolean | string)[];
}

/** Domain of a gene: controls how it is initialized, mutated and crossed over. */
export type Gene = RealGene | IntGene | BoolGene | ChoiceGene;

/** One domain per hyperparameter. */
export type Space = Record<string, Gene>;

/**
 * Real gene, bounded or not.
 *
 * @param min - Lower bound. Default: `-Infinity`.
 * @param max - Upper bound. Default: `Infinity`.
 * @example
 * real(1e-5, 1) // learning rate
 */
export const real = (min = -Infinity, max = Infinity): Gene => ({
	type: "real",
	min,
	max,
});
/**
 * Integer gene in `[min, max]`. On mutation, it always moves by at least +/-1.
 *
 * @param min - Smallest allowed value.
 * @param max - Largest allowed value.
 * @example
 * int(1, 8) // number of layers
 */
export const int = (min: number, max: number): Gene => ({
	type: "int",
	min,
	max,
});
/**
 * Boolean gene.
 *
 * @example
 * bool() // batch normalization yes/no
 */
export const bool = (): Gene => ({ type: "bool" });

/**
 * Categorical gene: one value from a list (strings, numbers, booleans).
 *
 * @param values - The possible values, compared with `===`.
 * @example
 * choice(["relu", "tanh", "gelu"])
 */
export const choice = (
	values: readonly (number | boolean | string)[],
): Gene => ({
	type: "choice",
	values,
});

/**
 * Domains inferred from an individual when nothing is declared:
 * number -> unbounded real, boolean -> bool, string -> constant.
 */
export const inferSpace = (individual: HyperParams): Space => {
	const space: Space = {};
	for (const [key, value] of Object.entries(individual)) {
		space[key] =
			typeof value === "number"
				? real()
				: typeof value === "boolean"
					? bool()
					: choice([value]);
	}
	return space;
};

const clamp = (v: number, min: number, max: number) =>
	Math.min(max, Math.max(min, v));

/** Clamp a value to its domain (bounds, integer rounding). */
export const fit = (gene: Gene, value: number): number =>
	gene.type === "int"
		? clamp(Math.round(value), gene.min, gene.max)
		: gene.type === "real"
			? clamp(value, gene.min, gene.max)
			: value;

/** Nonzero integer closest to the noise: an integer gene must always move. */
export const intStep = (noise: number): number =>
	Math.round(noise) || (Math.random() < 0.5 ? -1 : 1);

const randomInt = (min: number, max: number) =>
	min + Math.floor(Math.random() * (max - min + 1));

/** Draw a value in the domain; `around`/`amplitude` apply to unbounded reals. */
export const randomValue = (
	gene: Gene,
	around: number | boolean | string,
	amplitude: number,
): number | boolean | string => {
	switch (gene.type) {
		case "bool":
			return Math.random() < 0.5;
		case "choice":
			return gene.values[Math.floor(Math.random() * gene.values.length)]!;
		case "int":
			return randomInt(gene.min, gene.max);
		case "real":
			return Number.isFinite(gene.min) && Number.isFinite(gene.max)
				? gene.min + Math.random() * (gene.max - gene.min)
				: fit(gene, (around as number) + (Math.random() - 0.5) * 2 * amplitude);
	}
};

/** Check that the seed individual fits its domain. */
export const validateSeed = (seed: HyperParams, space: Space): void => {
	for (const [key, gene] of Object.entries(space)) {
		if (!(key in seed))
			throw new Error(`"${key}" is in the space but missing from hyperparams`);
		const v = seed[key]!;
		const ok =
			gene.type === "bool"
				? typeof v === "boolean"
				: gene.type === "choice"
					? gene.values.includes(v)
					: typeof v === "number" && fit(gene, v) === v;
		if (!ok)
			throw new Error(
				`"${key}" = ${String(v)} is outside its domain (${gene.type})`,
			);
	}
};
