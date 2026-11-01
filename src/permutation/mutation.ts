import type { Permutation } from "./crossover.js";

/**
 * Return a mutated copy of the permutation, always valid. Never
 * modifies the original.
 *
 * @param individual - The permutation to mutate.
 */
export type PermutationMutator = (individual: Permutation) => Permutation;

/** Two distinct positions i < j, or `null` if the permutation is too short. */
const twoPositions = (n: number): [number, number] | null => {
	if (n < 2) return null;
	const i = Math.floor(Math.random() * n);
	let j = Math.floor(Math.random() * (n - 1));
	if (j >= i) j++;
	return i < j ? [i, j] : [j, i];
};

/**
 * Swap mutation: swap two randomly picked genes.
 *
 * @returns A {@link PermutationMutator}.
 */
export const swap = (): PermutationMutator => (individual) => {
	const copy = [...individual];
	const pair = twoPositions(copy.length);
	if (pair) [copy[pair[0]], copy[pair[1]]] = [copy[pair[1]]!, copy[pair[0]]!];
	return copy;
};

/**
 * Inversion mutation: reverse the order of a randomly picked segment
 * (the "2-opt" of the traveling salesman).
 *
 * @returns A {@link PermutationMutator}.
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
