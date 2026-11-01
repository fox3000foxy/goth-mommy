import type { Permutation } from "./crossover.js";

/**
 * Renvoie une copie mutée de la permutation, toujours valide. Ne modifie
 * jamais l'original.
 *
 * @param individual - La permutation à muter.
 */
export type PermutationMutator = (individual: Permutation) => Permutation;

/** Deux positions distinctes i < j, ou `null` si la permutation est trop courte. */
const twoPositions = (n: number): [number, number] | null => {
	if (n < 2) return null;
	const i = Math.floor(Math.random() * n);
	let j = Math.floor(Math.random() * (n - 1));
	if (j >= i) j++;
	return i < j ? [i, j] : [j, i];
};

/**
 * Mutation par échange : intervertit deux gènes choisis au hasard.
 *
 * @returns Un {@link PermutationMutator}.
 */
export const swap = (): PermutationMutator => (individual) => {
	const copy = [...individual];
	const pair = twoPositions(copy.length);
	if (pair) [copy[pair[0]], copy[pair[1]]] = [copy[pair[1]]!, copy[pair[0]]!];
	return copy;
};

/**
 * Mutation par inversion : inverse l'ordre d'un segment choisi au hasard
 * (le « 2-opt » du voyageur de commerce).
 *
 * @returns Un {@link PermutationMutator}.
 */
export const inversion = (): PermutationMutator => (individual) => {
	const copy = [...individual];
	const pair = twoPositions(copy.length);
	if (pair) {
		const [i, j] = pair;
		const reversed = copy.slice(i, j + 1).reverse();
		copy.splice(i, reversed.length, ...reversed);
	}
	return copy;
};
