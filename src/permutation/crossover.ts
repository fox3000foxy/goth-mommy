/**
 * An order: a permutation of the integers `0..n-1`, each exactly once.
 * Map them to your cities, tasks, etc.
 */
export type Permutation = number[];

/**
 * Combine two permutations into a valid permutation. Never modifies the
 * parents.
 *
 * @param a - The first parent.
 * @param b - The second parent, of the same length.
 */
export type PermutationCrossover = (
	a: Permutation,
	b: Permutation,
) => Permutation;

/** Two random bounds i <= j in [0, n). */
const randomSegment = (n: number): [number, number] => {
	const x = Math.floor(Math.random() * n);
	const y = Math.floor(Math.random() * n);
	return x <= y ? [x, y] : [y, x];
};

/**
 * Order crossover (OX): the segment [i, j] comes from `a`, the rest is filled
 * with the genes of `b`, in the order they appear after j.
 * Preserves relative order: suited to sequence problems (TSP).
 *
 * @returns A {@link PermutationCrossover}.
 */
export const ox = (): PermutationCrossover => (a, b) => {
	const n = a.length;
	const [i, j] = randomSegment(n);
	const child = new Array<number>(n).fill(-1);
	const used = new Set<number>();
	for (let k = i; k <= j; k++) {
		child[k] = a[k]!;
		used.add(a[k]!);
	}
	let pos = (j + 1) % n;
	for (let t = 0; t < n; t++) {
		const gene = b[(j + 1 + t) % n]!;
		if (!used.has(gene)) {
			child[pos] = gene;
			pos = (pos + 1) % n;
		}
	}
	return child;
};

/**
 * Partially mapped crossover (PMX): the segment [i, j] comes from `a`, the
 * other positions keep the gene of `b`, or its image through the
 * segment mapping if that gene is already taken. Preserves positions.
 *
 * @returns A {@link PermutationCrossover}.
 */
export const pmx = (): PermutationCrossover => (a, b) => {
	const n = a.length;
	const [i, j] = randomSegment(n);
	const mapping = new Map<number, number>();
	for (let k = i; k <= j; k++) mapping.set(a[k]!, b[k]!);
	return b.map((gene, k) => {
		if (k >= i && k <= j) return a[k]!;
		let g = gene;
		while (mapping.has(g)) g = mapping.get(g)!;
		return g;
	});
};
