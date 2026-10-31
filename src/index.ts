export interface HyperParams { [key: string]: string | number | boolean | object | HyperParams; }
export type Population = HyperParams[];
/** Un score PLUS GRAND = un individu MEILLEUR. */
export type Score = number[];
export interface ScoringFunction { (population: Population): Score; }

export interface GothMommyOptions {
    /** Probabilité qu'un enfant soit muté (0..1). */
    mutationRate?: number;
    /** Amplitude maximale d'une mutation sur un nombre. */
    mutationStrength?: number;
    /** Amplitude du bruit appliqué aux nombres de la population initiale. */
    initialSpread?: number;
    /** Nombre de meilleurs individus copiés tels quels à la génération suivante. */
    elitism?: number;
}

const isPlainObject = (v: unknown): v is HyperParams =>
    typeof v === "object" && v !== null && !Array.isArray(v);

export class GothMommy {
    private scoringFunction: ScoringFunction;
    private population: Population;
    private mutationRate: number;
    private mutationStrength: number;
    private initialSpread: number;
    private elitism: number;

    constructor(
        hyperparams: HyperParams = {},
        populationSize: number = 10,
        scoringFunction: ScoringFunction = (population: Population) => population.map(() => 0),
        options: GothMommyOptions = {},
    ) {
        this.mutationRate = options.mutationRate ?? 0.5;
        this.mutationStrength = options.mutationStrength ?? 1;
        this.initialSpread = options.initialSpread ?? 10;
        this.elitism = Math.min(options.elitism ?? 1, populationSize);
        this.scoringFunction = scoringFunction;
        this.population = this.generateInitialPopulation(hyperparams, populationSize);
    }

    /** Bruit multi-échelle : de ±strength jusqu'à ±strength/1000, pour affiner près de l'optimum. */
    private noise(strength: number): number {
        return (Math.random() - 0.5) * 2 * strength * Math.pow(10, -3 * Math.random());
    }

    /** Applique `fn` à chaque nombre (récursivement) et renvoie une copie. */
    private mapNumbers(params: HyperParams, fn: (n: number) => number): HyperParams {
        const out: HyperParams = {};
        for (const key of Object.keys(params)) {
            const v = params[key]!;
            if (typeof v === "number") out[key] = fn(v);
            else if (isPlainObject(v)) out[key] = this.mapNumbers(v, fn);
            else out[key] = structuredClone(v);
        }
        return out;
    }

    private generateInitialPopulation(hyperparams: HyperParams, populationSize: number): Population {
        return Array.from({ length: populationSize }, (_, i) =>
            // le premier individu reste exactement celui fourni, les autres sont dispersés
            i === 0 ? this.mapNumbers(hyperparams, n => n) : this.mapNumbers(hyperparams, n => n + this.noise(this.initialSpread)),
        );
    }

    /** Probabilités de sélection proportionnelles au score (décalé si des scores sont négatifs). */
    private toProbabilities(scores: Score): number[] {
        const min = Math.min(...scores);
        const shifted = scores.map(s => (Number.isFinite(s) ? s - Math.min(0, min) : 0));
        const total = shifted.reduce((a, b) => a + b, 0);
        return total > 0 ? shifted.map(s => s / total) : scores.map(() => 1 / scores.length);
    }

    private selectIndex(probabilities: number[]): number {
        const r = Math.random();
        let cumulative = 0;
        for (let i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i]!;
            if (r < cumulative) return i;
        }
        return probabilities.length - 1; // erreurs d'arrondi
    }

    private generateNextPopulation(population: Population, scores: Score): Population {
        const probabilities = this.toProbabilities(scores);

        // Élitisme : les meilleurs passent tels quels
        const ranked = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]);
        const next: Population = ranked
            .slice(0, this.elitism)
            .map(([, i]) => structuredClone(population[i]!));

        while (next.length < population.length) {
            // 1) sélection d'un parent selon son score, 2) mutation éventuelle
            const parent = population[this.selectIndex(probabilities)]!;
            const child = Math.random() < this.mutationRate
                ? this.mapNumbers(parent, n => n + this.noise(this.mutationStrength))
                : structuredClone(parent);
            next.push(child);
        }
        return next;
    }

    /**
     * @param maxIterations garde-fou contre les boucles infinies
     * @param threshold     arrêt quand le meilleur score BRUT atteint cette valeur
     */
    * iterator(maxIterations: number = 1000, threshold: number = Infinity) {
        for (let i = 0; i < maxIterations; i++) {
            const scores = this.scoringFunction(this.population); // appelé une seule fois
            const bestScore = Math.max(...scores);
            const bestIndex = scores.indexOf(bestScore);
            yield {
                population: this.population,
                scores,
                iteration: i,
                bestScore,
                best: this.population[bestIndex]!,
            };
            if (bestScore >= threshold) return;
            this.population = this.generateNextPopulation(this.population, scores);
        }
    }
}