import type { Space } from "./space.js";

/** Un individu : un jeu d'hyperparamètres. */
export interface HyperParams {
	[key: string]: number | boolean | string;
}
export type Population = HyperParams[];

/** Un score PLUS GRAND = un individu MEILLEUR. */
export type Score = number[];
export interface ScoringFunction {
	(population: Population): Score;
}

/** Choisit `k` indices de parents (avec remise) à partir des scores. */
export type Selector = (scores: Score, k: number) => number[];

/** Renvoie une copie mutée de l'individu. Ne modifie jamais l'original. */
export type Mutator = (individual: HyperParams, space: Space) => HyperParams;

/** Construit la population de départ à partir d'un individu de référence. */
export type Initializer = (
	seed: HyperParams,
	size: number,
	space: Space,
) => Population;

/** Combine deux parents en un enfant. Ne modifie jamais les parents. */
export type Crossover = (
	a: HyperParams,
	b: HyperParams,
	space: Space,
) => HyperParams;
