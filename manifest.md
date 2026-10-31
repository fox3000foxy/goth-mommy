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
### 1. Binary encoding :
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

**b. Gray encoding :**
This one is represented like before, but the gray encoding is used to reduce the Hamming distance between adjacent values.

*Convertion binary to gray*:
The first Gray bit is identical to the binary bit, and each subsequent bit corresponds to the result of the XOR operation between that bit and the previous bit.
For the formula :
$$
\[g_{0}=b_{0}\]

\[g_{i}=b_{i-1}\oplus b_{i}\]
$$

Where $\oplus$ is the XOR operation

*Advantages*:
- Only a single bit changes between two consecutive Gray codes.
- Can reduce certain transition effects in binary representations.
- Suitable for certain discrete numerical variables.
*Disadvantages*:
- Requires additional decoding.
- Does not guarantee better convergence.
- Classical genetic operators do not necessarily benefit from the neighborhood property.

c. Binary-coded decimal encoding :
This encoding 
     
  2. Encodage numérique
  - Integer encoding (entier)
  - Real-valued encoding (réel)
  - Floating-point encoding (virgule flottante)
  - Fixed-point encoding (point fixe)
  - Mixed-integer encoding (mixte entier/réel)
  3. Encodage par permutation
  - Permutation encoding
  - Ordinal encoding
  - Ranking encoding
  4. Encodage symbolique
  - Character encoding
  - Alphabetic encoding
  - Categorical encoding
  - Symbolic encoding
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