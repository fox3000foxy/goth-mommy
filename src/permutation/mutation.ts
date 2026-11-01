import type { Permutation } from "./crossover.js";

export type PermutationMutator = (individual: Permutation) => Permutation;

/** Deux positions distinctes i < j, ou `null` si la permutation est trop courte. */
const twoPositions = (n: number): [number, number] | null => {
	if (n < 2) return null;
	const i = Math.floor(Math.random() * n);
	let j = Math.floor(Math.random() * (n - 1));
	if (j >= i) j++;
	return i < j ? [i, j] : [j, i];
};

/** Échange deux gènes. */
export const swap = (): PermutationMutator => (individual) => {
	const copy = [...individual];
	const pair = twoPositions(copy.length);
	if (pair) [copy[pair[0]], copy[pair[1]]] = [copy[pair[1]]!, copy[pair[0]]!];
	return copy;
};

/** Inverse l'ordre d'un segment (le « 2-opt » du TSP). */
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
