export type Permutation = number[];
export type PermutationCrossover = (
	a: Permutation,
	b: Permutation,
) => Permutation;

/** Deux bornes aléatoires i <= j dans [0, n). */
const randomSegment = (n: number): [number, number] => {
	const x = Math.floor(Math.random() * n);
	const y = Math.floor(Math.random() * n);
	return x <= y ? [x, y] : [y, x];
};

/**
 * Order crossover (OX) : le segment [i, j] vient de `a`, le reste est rempli
 * avec les gènes de `b`, dans l'ordre où ils apparaissent après j.
 * Préserve l'ordre relatif : adapté aux problèmes de séquence (TSP).
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
 * Partially mapped crossover (PMX) : le segment [i, j] vient de `a`, les
 * autres positions gardent le gène de `b`, ou son image par la
 * correspondance du segment si ce gène est déjà pris. Préserve les positions.
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
