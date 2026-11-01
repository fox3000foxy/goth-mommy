import type { Space } from "./space.js";

/**
 * Un individu : un jeu d'hyperparamètres, par nom.
 * Les valeurs peuvent être des nombres, des booléens ou des chaînes ; leur
 * domaine se déclare avec l'option `space` de {@link GothMommy}.
 */
export interface HyperParams {
	[key: string]: number | boolean | string;
}

/** Une génération d'individus. */
export type Population = HyperParams[];

/**
 * Un score par individu, dans le même ordre que la population.
 * Un score PLUS GRAND = un individu MEILLEUR.
 */
export type Score = number[];

/**
 * Évalue toute la population d'un coup. Appelée une seule fois par génération.
 *
 * @param population - Les individus à évaluer.
 * @returns Un score par individu, dans le même ordre. Plus grand = meilleur,
 * et >= 0 avec `proportional()`.
 */
export type ScoringFunction = (population: Population) => Score;

/**
 * Choisit des parents à partir des scores.
 *
 * @param scores - Le score de chaque individu de la population.
 * @param k - Le nombre de parents à choisir.
 * @returns `k` indices dans la population, avec remise.
 */
export type Selector = (scores: Score, k: number) => number[];

/**
 * Renvoie une copie mutée de l'individu. Ne modifie jamais l'original.
 *
 * @param individual - L'individu à muter.
 * @param space - Le domaine de chaque gène : le résultat doit le respecter.
 */
export type Mutator = (individual: HyperParams, space: Space) => HyperParams;

/**
 * Construit la population de départ à partir d'un individu de référence.
 *
 * @param seed - L'individu fourni au constructeur.
 * @param size - La taille de population demandée.
 * @param space - Le domaine de chaque gène.
 */
export type Initializer = (
	seed: HyperParams,
	size: number,
	space: Space,
) => Population;

/**
 * Combine deux parents en un enfant. Ne modifie jamais les parents.
 *
 * @param a - Le premier parent.
 * @param b - Le second parent.
 * @param space - Le domaine de chaque gène : l'enfant doit le respecter.
 */
export type Crossover = (
	a: HyperParams,
	b: HyperParams,
	space: Space,
) => HyperParams;
