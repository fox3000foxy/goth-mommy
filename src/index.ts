export interface HyperParams { [key: string]: string | number | boolean | object | HyperParams; }
export type Population = HyperParams[];
export type Score = number[];
export interface ScoringFunction { (population: Population): Score; }

export class GothMommy {
    private scoringFunction: ScoringFunction;
    private population: Population;

    constructor(hyperparams: HyperParams = {}, populationSize: number = 10, scoringFunction: ScoringFunction = (population: Population) => [] as Score) {
        this.population = this.generateInitialPopulation(hyperparams, populationSize);
        this.scoringFunction = scoringFunction;
    }

    private softmax(scores: Score): number[] {
        const maxScore = Math.max(...scores);
        const expScores = scores.map(score => Math.exp(score - maxScore));
        const sumExpScores = expScores.reduce((a, b) => a + b, 0);
        return expScores.map(expScore => expScore / sumExpScores);
    }

    private generateInitialPopulation(hyperparams: HyperParams, populationSize: number): Population {
        return Array.from({ length: populationSize }, () => ({ ...hyperparams }));
    }

    private generateNextPopulation(population: Population, scores: Score): Population {
        const probabilities = Math.max(...scores) > 1 ? this.softmax(scores) : scores.map(score => score / Math.max(...scores));
        const nextPopulation: Population = [];

        for (let i = 0; i < population.length; i++) {
            // Check for mutation based on a probability threshold (e.g., 0.1 for 10% chance of mutation)
            // if (Math.random() < 0.1) {
            //     const mutatedIndividual = { ...population[i] };
            //     // Randomly mutate one of the hyperparameters
            //     const keys = Object.keys(mutatedIndividual);
            //     const randomKey = keys[Math.floor(Math.random() * keys.length)]!;
            //     if (typeof mutatedIndividual[randomKey] === 'number') {
            //         mutatedIndividual[randomKey] = (mutatedIndividual[randomKey] as number) + (Math.random() - 0.5); // Small mutation
            //     }
            //     nextPopulation.push(mutatedIndividual);
            //     continue;
            // }
            const selectedIndex = this.selectIndex(probabilities);
            nextPopulation.push({ ...population[selectedIndex] });
        }

        return nextPopulation;
    }

    private selectIndex(probabilities: number[]): number {
        const randomValue = Math.random();
        let cumulativeProbability = 0;

        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i]!;
            if (randomValue < cumulativeProbability) {
                return i;
            }
        }

        return probabilities.length - 1; // Fallback in case of rounding errors
    }

    * iterator() {
        let bestFound = false;
        let previousBestScore = 0; // is between 0 and 1, the best score is 1, the worst score is 0
        let i = 0;
        while (!bestFound) {
            yield { population: this.population, scores: this.scoringFunction(this.population), iteration: i };
            const scores = this.softmax(this.scoringFunction(this.population));
            const bestScore = Math.max(...scores);
            const nextPopulation = this.generateNextPopulation(this.population, scores);
            this.population = nextPopulation;
            if (scores.length > 0 && previousBestScore < bestScore) { previousBestScore = bestScore; }
            if (bestScore > 0.98) { bestFound = true; }
            i++;
        }
    }
}