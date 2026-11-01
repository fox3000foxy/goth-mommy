import type { HyperParams } from "./types.js";

/** Domaine d'un gène : décide comment il est initialisé, muté et croisé. */
export type Gene =
	| { type: "real"; min: number; max: number }
	| { type: "int"; min: number; max: number }
	| { type: "bool" }
	| { type: "choice"; values: readonly (number | boolean | string)[] };

/** Un domaine par hyperparamètre. */
export type Space = Record<string, Gene>;

/** Nombre réel, borné ou non (`real()` = tout ℝ). */
export const real = (min = -Infinity, max = Infinity): Gene => ({
	type: "real",
	min,
	max,
});
/** Entier dans [min, max]. */
export const int = (min: number, max: number): Gene => ({
	type: "int",
	min,
	max,
});
export const bool = (): Gene => ({ type: "bool" });
/** Une valeur parmi une liste (catégories, chaînes, …). */
export const choice = (
	values: readonly (number | boolean | string)[],
): Gene => ({
	type: "choice",
	values,
});

/**
 * Domaines déduits d'un individu quand rien n'est déclaré :
 * nombre → réel non borné, booléen → bool, chaîne → constante.
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

/** Ramène une valeur dans son domaine (bornes, arrondi des entiers). */
export const fit = (gene: Gene, value: number): number =>
	gene.type === "int"
		? clamp(Math.round(value), gene.min, gene.max)
		: gene.type === "real"
			? clamp(value, gene.min, gene.max)
			: value;

/** Entier non nul le plus proche du bruit : un gène entier doit toujours bouger. */
export const intStep = (noise: number): number =>
	Math.round(noise) || (Math.random() < 0.5 ? -1 : 1);

const randomInt = (min: number, max: number) =>
	min + Math.floor(Math.random() * (max - min + 1));

/** Tire une valeur dans le domaine ; `around`/`amplitude` servent aux réels non bornés. */
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

/** Vérifie que l'individu de départ respecte son domaine. */
export const validateSeed = (seed: HyperParams, space: Space): void => {
	for (const [key, gene] of Object.entries(space)) {
		if (!(key in seed))
			throw new Error(`"${key}" est dans le space mais pas dans hyperparams`);
		const v = seed[key]!;
		const ok =
			gene.type === "bool"
				? typeof v === "boolean"
				: gene.type === "choice"
					? gene.values.includes(v)
					: typeof v === "number" && fit(gene, v) === v;
		if (!ok)
			throw new Error(
				`"${key}" = ${String(v)} est hors de son domaine (${gene.type})`,
			);
	}
};
