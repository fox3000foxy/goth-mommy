// Example usage
import { type HyperParams, type Population, type ScoringFunction, GothMommy } from ".";

const hyperparams: HyperParams = {
    x: 5
};

// finding regressive best parameters to match x² + 2x + 1 = 0
const scoringFunction: ScoringFunction = (population: Population) => { 
    const fx = (x: number) => x * x + 2 * x + 1; // This is the function we want to minimize
    const scores: number[] = population.map(individual => {
        const x = individual.x as number; // Assuming x is a number in the hyperparameters
        const score = -Math.abs(fx(x)); // We want to minimize the absolute value of fx(x)
        return score; // Return the negative score for maximization
    });
    return scores;
}

const gothMommy = new GothMommy(hyperparams, 10, scoringFunction);

for(const state of gothMommy.iterator()) {
    console.log(state);
}