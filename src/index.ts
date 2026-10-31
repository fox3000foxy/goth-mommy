export interface HyperParams { [key: string]: number | boolean }
export type Population = HyperParams[];
/** Un score PLUS GRAND = un individu MEILLEUR. */
export type Score = number[];
export interface ScoringFunction { (population: Population): Score; }

export class GothMommy {
    private population: Population;

    constructor(
        hyperparams: HyperParams = {},
        populationSize: number = 10,
        private scoringFunction: ScoringFunction = (population: Population) => population.map(() => 0),
        private mutationRate: number = 0.5,
    ) {
        // Le premier individu est celui fourni, les autres sont dispersés autour
        this.population = Array.from({ length: populationSize }, (_, i) =>
            this.mutate(hyperparams, i === 0 ? 0 : 10),
        );
    }

    /** Copie l'individu en ajoutant un bruit de ±strength aux nombres (multi-échelle pour affiner). */
    private mutate(individual: HyperParams, strength: number): HyperParams {
        const copy = { ...individual };
        for (const key of Object.keys(copy)) {
            if (typeof copy[key] === "number") {
                const scale = strength * Math.pow(10, -3 * Math.random());
                copy[key] = (copy[key] as number) + (Math.random() - 0.5) * 2 * scale;
            }
            if (typeof copy[key] === "boolean") {
                if (Math.random() < 0.1) copy[key] = !copy[key];
            }
        }
        return copy;
    }

    /** Tirage proportionnel au score (roulette). */
    private selectIndex(scores: Score): number {
        const total = scores.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < scores.length; i++) {
            r -= scores[i]!;
            if (r < 0) return i;
        }
        return scores.length - 1;
    }

    private nextPopulation(scores: Score): Population {
        const best = this.population[scores.indexOf(Math.max(...scores))]!;
        const next: Population = [{ ...best }]; // élitisme : le meilleur survit
        while (next.length < this.population.length) {
            const parent = this.population[this.selectIndex(scores)]!;
            next.push(Math.random() < this.mutationRate ? this.mutate(parent, 1) : { ...parent });
        }
        return next;
    }

    /** S'arrête quand le meilleur score brut atteint `threshold`, ou après `maxIterations`. */
    *iterator(maxIterations: number = 1000, threshold: number = Infinity) {
        for (let i = 0; i < maxIterations; i++) {
            const scores = this.scoringFunction(this.population);
            const bestScore = Math.max(...scores);
            const best = this.population[scores.indexOf(bestScore)]!;
            yield { population: this.population, scores, iteration: i, bestScore, best };
            if (bestScore >= threshold) return;
            this.population = this.nextPopulation(scores);
        }
    }
}