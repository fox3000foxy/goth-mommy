# ALGORITHM GA :
## I. Selection
Multiple selection methods :
  1. Selection by rank
  Take the best k individuals from n population.
  2. Selection by proportional fitness
  Take k individuals from n population by a probability distribution based on their fitness.
  3. Selection by tournament
  Like football tournament, make a tournament of the population by peer, the best go to the next round, until k population is selected.
  4. Selection by random sampling
  Randomly select k individuals from n population. 
  
---

## II. Encoding
Multiple encoding methods :
### 1. Binary encoding
This encoding is suitable for problems with discrete and combinary variables.

**a. Binary encoding :**

A chromosome is represented by a binary string of 1s and 0s. Each character in the string represents a gene. The interpretation of this gene may be linked to a function that is either activated or deactivated.

*Advantages*:
  - Simple representation,
  - Easy to manipulate
  - Compatible with classical genetic operators
  - Suitable for selection and decision problems

*Disadvantages*:
  - The representation can be cumbersome for real-valued variables.
  - The binary neighborhood does not always correspond to the numerical neighborhood
  - Accuracy depends on the number of bits used.
  - Certain operations may generate values far from the parent solution.

---

**b. Gray encoding :**

This one is represented like before, but the gray encoding is used to reduce the Hamming distance between adjacent values.

*Convertion binary to gray*:

The first Gray bit is identical to the binary bit, and each subsequent bit corresponds to the result of the XOR operation between that bit and the previous bit.

For the formula :

$$g_{0}=b_{0}$$
$$g_{i}=b_{i-1}\oplus b_{i}$$

Where $\oplus$ is the XOR operation

*Advantages*:
- Only a single bit changes between two consecutive Gray codes.
- Can reduce certain transition effects in binary representations.
- Suitable for certain discrete numerical variables.
*Disadvantages*:
- Requires additional decoding.
- Does not guarantee better convergence.
- Classical genetic operators do not necessarily benefit from the neighborhood property.

---

**c. Binary-coded decimal encoding :**

Binary encoding of integers represents each integer value as a sequence of bits.

It is similar to classical binary encoding, but its purpose is explicitly to represent integer variables.

*Encoding with Signed Values*

To represent negative integers, several conventions are possible:
- Sign or magnitude
- One’s complement
- Two’s complement

Two’s complement is notably used in computer representations of signed integers.

*Advantages*
- Compact representation.
- Deterministic decoding
- Suited for integer variables
- Allows multiple parameters to be represented in a chromosome.

*Disadvantages*
- Mutations can significantly alter the numerical value
- The number of bits limits the representation range.
- Some values may be invalid for the problem.
- Encoding can be inefficient when variables have large ranges or specific constraints.

---

### 2. Number Encoding
**a. Integer encoding**

Integer encoding represents each gene using... integers.

Unlike binary encoding, the chromosome directly contains the integer values, without breaking them down into bits.

A chromosome consists of a sequence defined as follows:

$$G=[x_1,x_2,\ldots,x_n]$$

where:

$$x_i\in\mathbb{Z}$$


Mutation can be performed by:
- A random change.
- An increase or decrease in the value.
- A replacement with another valid integer value.
- A uniform mutation within the allowed interval.

Crossover can use methods adapted to integer values:
- Single-point crossover.
- Two-point crossover.
- Uniform crossover.
- Arithmetic crossover with rounding or truncation.
- Blend crossover adapted to integers.
- Specialized crossover for discrete variables.

For an arithmetic crossover, one can, for example, calculate:

$$C=\alpha P_1+(1-\alpha)P_2$$

Then convert the result to an integer:

$$C_{\text{integer}}=\text{round}(C)$$

This conversion requires special attention to the problem’s constraints.

*Advantages*
- Natural representation of discrete variables.
- Easy-to-read chromosomes.
- No binary conversion required.
- Suitable for quantity and assignment problems.

*Disadvantages*
- Standard operators may produce invalid values.
- Mutations must respect the bounds.
- Integer constraints must be preserved.
- Integer variables are not always compatible with operators designed for real-valued variables.

*Applications*
- Resource optimization.
- Production scheduling.
- Equipment sizing.
- Worker assignment.
- Combinatorial problems with quantitative variables.

---

**b. Real-valued encoding**

It is used when the variables in the problem can take fractional or continuous values. Unlike the previous method, it is not necessary to restrict each gene to an integer value.

A chromosome is represented by:

$$G=[x_1,x_2,\ldots,x_n]$$

where:

$$x_i\in\mathbb{R}$$

Each gene directly represents a numerical variable.

Variables can be:
- Coefficients.
- Ratios.
- Dimensions.
- Temperatures.
- Speeds.
- Control parameters.
- Setpoint values.

Commonly used methods include:
- Arithmetic crossover.
- BLX-α.
- SBX.
- Uniform crossover.
- Single-point crossover.
- Two-point crossover.
- Simulated arithmetic crossover.

Arithmetic and SBX methods are particularly well-suited for continuous variables.

*Advantages*
- Direct representation of continuous variables.
- No binary decoding.
- Potentially high precision.
- Compatible with numerical optimization methods.

*Disadvantages*
- Requires bound handling.
- Mutations may produce invalid values.
- Operators must be adapted to the nature of the variables.
- Excessive precision may be unnecessary for the problem.

*Applications*
- Optimization of mathematical functions.
- Parameter tuning.
- Trajectory optimization.
- Industrial control.
- Energy optimization.
- Machine learning.

---

**c. Floating-point encoding**

Floating-point encoding represents genes using floating-point numbers, typically in the IEEE 754 computer format.

A chromosome contains floating-point values:

$$G=[x_1,x_2,\ldots,x_n]$$

Each value is stored in a numerical format such as:
- `float32`: typically a 32-bit floating-point number.
- `float64`: typically a 64-bit floating-point number.

The computer representation uses, in particular:
- A sign bit.
- An exponent.
- A mantissa, also known as the significand.

Floating-point numbers do not necessarily represent all decimal values exactly.
This discrepancy stems from the binary representation of floating-point numbers.

In a genetic algorithm, this can be significant when:
- The fitness function requires a specific level of precision.
- The constraints are very strict.
- Numerical comparisons are sensitive to rounding errors.

Mutation can be performed using:
- Gaussian mutation.
- Uniform mutation.
- Polynomial mutation.
- Perturbation mutation.
- Non-uniform mutation.

Example : $[ x'=x+\epsilon ]$

with a random perturbation.

Commonly used crossover operators:
- Arithmetic crossover.
- BLX-α.
- SBX.
- Uniform crossover.
- Simulated arithmetic crossover.

*Advantages*
- Wide range of values.
- High numerical precision.
- Direct representation.
- Compatible with scientific libraries.

*Disadvantages*
- Finite precision.
- Possible rounding errors.
- Requires handling of infinite values or `NaN`.
- Requires appropriate numerical constraints.

*Uses*
- Scientific optimization.
- Numerical computation.
- Regression.
- Parameter tuning.
- Model optimization.

---

**d. Fixed-point encoding**

Fixed-point encoding represents numerical values with a predetermined fractional precision.

Unlike floating-point encoding, the position of the decimal point is fixed.

It is used, in particular, in embedded systems, controlled-precision numerical calculations, and environments where floating-point operations are computationally expensive.

A numerical scale is defined.

For example:

$$x\_{\text{real}}=\frac{x\_{\text{integer}}}{S}$$

where $\(S\)$ represents the scaling factor.

For a precision of two decimal places:

$\[ S=100 \]$

The real value 12.34 is represented by:

$\[ 12.34\times100=1234 \]$

The stored integer is therefore 1234.

Crossover operators can be:
- Single-point crossover.
- Two-point crossover.
- Uniform crossover.
- Arithmetic crossover with scaling.
- Terminal-adapted digital crossover.

The results must be converted or rounded according to the defined precision.

*Advantages*
- Deterministic fractional precision.
- Predictable representation.
- No floating-point representation required.
- Compatible with certain embedded systems.
- Explicit control of resolution.

*Disadvantages*
- Precision limited by the scale.
- Representation range limited by storage capacity.
- Risk of overflow.
- Requires conversion between the stored value and the actual value.

*Uses*
- Embedded systems.
- Industrial control.
- Fixed-precision optimization.
- Deterministic numerical calculations.
- Applications where floating-point representation is not well-suited.

---

**e. Mixed-integer encoding**

Mixed encoding represents a chromosome containing several types of numerical variables.

It allows for the combination of integer and real variables within a single individual.

It is used when the optimization problem involves both discrete and continuous decisions.

*Principle*

A chromosome can be represented by:

$G=[x_1,x_2,\ldots,x_n]$

but each gene has its own domain.

For example:

$\[ x_1\in\mathbb{Z} \]$

$\[ x_2\in\mathbb{R} \]$

$\[ x_3\in\mathbb{Z} \]$

$\[ x_4\in\mathbb{R} \]$

Therefore, not all genes are handled in the same way.

*Mutation*

The mutation must be adapted to the type of each gene.

For an integer variable:

$\[ x'\_1=x_1+\delta \]$

where:

$\[ \delta\in\mathbb{Z} \]$

For a real variable:

$\[ x'\_2=x_2+\epsilon \]$

where:

$\[ \epsilon\in\mathbb{R} \]$

Thus, a mutation can transform:

$[8,75.5,24,120.75]$

into:

$[9,76.2,24,118.4]$

Integer variables remain integers, while real variables can vary continuously.

Possible crossover methods include:
- Crossover adapted by variable type.
- Single-point crossover.
- Two-point crossover.
- Uniform crossover.
- Arithmetic crossover for real variables.
- Discrete crossover for integer variables.
- SBX for real variables.
- Custom hybrid crossover.

An operator can apply SBX to real variables and an integer crossover to discrete variables.

*Advantages*
- Natural representation of mixed-integer problems.
- Allows for the simultaneous optimization of discrete and continuous decisions.
- Avoids converting all variables to binary.
- Compatible with complex industrial problems.

*Disadvantages*
- Operators must be adapted to each variable type.
- Constraints may be more complex.
- Crossover may generate invalid combinations.
- Managing dependencies between variables sometimes requires repair.

*Applications*
- Plant sizing.
- Production optimization.
- Resource planning.
- Energy system optimization.
- Engineering problems.
- Cost optimization involving discrete and continuous decisions.

---

### 3. Permutation Encoding
**a. Permutation encoding**

Permutation encoding represents each individual as a sequence in which each element of a set appears exactly once.

It is used when the order of the elements constitutes the solution to the problem.

A chromosome is then represented as follows:

$G=[x_1,x_2,...,x_n]$

where:

$G\in S_n$

where $S_n$ denotes the set of permutations of $n$ elements.

Each element must appear exactly once.

*Genetic Operators*

Classic binary crossover operators are generally not suitable, as they can create duplicates.

Specialized operators include:
- Partially Mapped Crossover
- Order Crossover
- Cycle Crossover
- Edge Recombination Crossover
- Position-based crossover
- Order-based crossover
- Alternating-position crossover

Specialized mutations include:
- Swap mutation
- Insertion mutation
- Inversion mutation
- Scramble mutation
- Displacement mutation

*Advantages*
- Direct representation of sequences
- Natural preservation of element uniqueness
- Suited for combinatorial problems
- Allows for the representation of orders and traversals

*Disadvantages*
- Operators must preserve the validity of permutations
- Classical crossovers can generate duplicates
- The number of permutations increases rapidly with the size of the problem.

*Uses*
- TSP
- Scheduling
- Planning
- Task organization
- Routing
- Production sequences

---

*b. Ordinal encoding*

Ordinal encoding represents a permutation using a sequence of relative positions or ranks.

It allows a permutation to be transformed into an ordered numerical representation.

A classic method involves using the **Lehmer ordinal code**, also known as rank-vector representation.

Consider an ordered permutation of a set.

For each element, we count the number of smaller elements that appear after it in the permutation.

The result constitutes the ordinal code.

For a permutation:

$P=[3,1,4,5,2]$

we count the smaller elements located to the right of each position.

| Position | Element | Smaller Elements to the Right | Code |
| :------- | ------: | :---------------------------- | ---: |
|     1    |    3    | 1, 2                          |   2  |
|     2    |    1    | None                          |   0  |
|     3    |    4    | 2                             |   1  |
|     4    |    5    | 2                             |   1  |
|     5    |    2    | None                          |   0  |

The ordinal code is then: $[2,0,1,1,0]$

*Gene Region*

In Lehmer’s code: $0\leq c_i\leq n-i$

if the positions are indexed starting from $i=0$.

The region of each gene therefore depends on its position

For five elements: $C=[c_1, c_2, c_3, c_4, c_5]$

where:

$c_1\in [0,4]$

$c_2\in [0,3]$

$c_3\in [0,2]$

$c_4\in [0,1]$

$c_5=0$

This representation ensures that a valid ordinal code corresponds to a unique permutation.

*Genetic Operators*

The following can be applied:
- Shifting an ordinal digit within its allowed range
- Crossover adapted for ordinal codes
- Decoding to a permutation before applying a specialized operator
- Correcting invalid ordinal values

> [!CAUTION]
> Directly applying a uniform or arithmetic crossover without respecting the allowed ranges may result in an invalid code.

*Advantages*
- Numeric representation of a permutation
- Unique encoding for each permutation
- Allows certain numeric operations on ranks
- May facilitate certain combinatorial optimization methods

*Disadvantages*
- Gene domains depend on their position
- Classical operators may produce invalid codes
- Ordinal mutations do not always correspond to simple modifications of the permutation
- Requires decoding to interpret the solution

*Usage*
- Permutation optimization
- Ordering problems
- Numerical representations of sequences

---

*c Ranking encoding*

Ranking encoding represents individuals or elements based on their rank in a ranking.

It can be used to represent:
- A priority order
- An order of preference
- A task ranking
- A hierarchy
- A permutation
 
It is important to distinguish between two common uses:
1. The ranking of elements within the genome.
2. The ranking of individuals in a population according to their fitness.

The second use corresponds precisely to **rank-based selection**, which is a selection method and not a genome encoding.

In a ranking-based encoding, each element is assigned a position in a defined order

For example, five elements: $[A,B,C,D,E]$

can be ranked as follows:
| Element | Rank |
| :------ | ---: |
| A       | 3    |
| B       | 1    |
| C       | 5    |
| D       | 2    |
| E       | 4    |

The ranking is represented as:

$B\prec D\prec A\prec E\prec C$

where $\prec$ indicates the order of the ranking

*Genetic Operators*

For a ranking represented as a permutation, the following can be used:
- PMX
- OX
- CX
- Swap mutation
- Insertion mutation
- Inversion mutation

For a ranking used as a priority, specific operators can be employed:
- Rank modification
- Rank exchange
- Reordering
- Priority mutation

It is necessary to verify that the ranks remain unique if the problem requires a permutation

*Advantages*
- Natural representation of priorities
- Suited for ranking problems
- Can transform preferences into sequences
- Compatible with permutation operators

*Disadvantages*
- Ranks do not necessarily reflect the actual differences between values
- A difference in rank does not necessarily correspond to a difference in fitness
- Ties in ranking require a convention
- Population ranking should not be confused with genome ranking

*Uses*
- Scheduling
- Prioritization
- Task ranking
- Decision sequences
- Ranking-based selection in genetic algorithms

--- 

### 4. Symbolic Encoding
**a. Character encoding**
any character

---

**b. Alphabetic encoding**
[A-Za-z]

---

**c. Categorical encoding**
gènes avec options par catégories : gènes = catégories
---

**d. Symbolic encoding**

---

5. Encodage par chaîne et séquence
- String encoding
- Sequence encoding
- Variable-length encoding
- Fixed-length encoding
6. Encodage par arbre
- Tree encoding
- Parse-tree encoding
- Expression-tree encoding
- Genetic programming tree representation
7. Encodage par graphe
- Graph encoding
- Adjacency matrix encoding
- Adjacency list encoding
- Edge encoding
- Node encoding
- Path encoding
8. Encodage matriciel
- Matrix encoding
- Binary matrix encoding
- Real-valued matrix encoding
- Permutation matrix encoding
9. Encodage par ensemble
- Set encoding
- Subset encoding
- Multiset encoding
10. Encodage par vecteur
- Vector encoding
- Bit-vector encoding
- Real-vector encoding
- Integer-vector encoding
- Mixed-vector encoding
11. Encodage par règles
- Rule-based encoding
- Production-rule encoding
- Condition-action encoding
12. Encodage spécialisé
- Priority encoding
- Scheduling encoding
- Assignment encoding
- Route encoding
- TSP encoding
- Job-shop encoding
- Resource-allocation encoding
- Partition encoding
- Boolean-function encoding
- Neural-network encoding
- Weight encoding
- Architecture encoding
- Hyperparameter encoding
13. Encodage indirect / génératif
- Indirect encoding
- Developmental encoding
- Generative encoding
- Grammar-based encoding
- L-system encoding
- Cellular encoding
- Compositional pattern-producing network (CPPN) encoding
- HyperNEAT encoding
14. Encodage hybride
- Hybrid encoding
- Composite encoding
- Multi-representation encoding
- Hierarchical encoding
- Modular encoding
- Nested encoding

III. Cross-over
IV. Mutation 
V. Fitness
VI. Initialise the population